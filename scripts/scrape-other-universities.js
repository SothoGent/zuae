import { chromium } from 'playwright';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

const OUTPUT_CSV = './data/other_universities.csv';

// University configurations
const UNI_CONFIG = {
  'Africa University': {
    baseUrl: 'https://africau.edu',
    path: '/program/',
    selector: '.program-list li, .program-item, .course-item',
    // We'll look for specific patterns
  },
  'Bindura University of Science Education': {
    baseUrl: 'https://www.buse.ac.zw',
    path: '/academics/undergraduate-programmes/',
    selector: '.programme-item, .course-item, h3',
  },
  'Bulawayo Polytechnic': {
    baseUrl: 'https://bulawayopolytechnic.ac.zw',
    path: '/course-division/',
    selector: '.course-item, .programme-item, li',
  },
  'Chinhoyi University of Technology': {
    baseUrl: 'https://www.cut.ac.zw',
    path: '/welcome/program/programme-list',
    selector: '.program-item, .course-item, tr td:first-child',
  },
  'Great Zimbabwe University': {
    baseUrl: 'https://www.gzu.ac.zw',
    path: '/undergraduate-programmes/',
    selector: '.programme-item, .course-item, li',
  },
  'Harare Polytechnic': {
    baseUrl: 'https://intracolleges.com',
    path: '/harare-polytechnic-courses/',
    selector: 'li',
  },
  'Lupane State University': {
    baseUrl: 'https://lsu.ac.zw',
    path: '/admissions/programmes?level=Undergraduate',
    selector: 'h3, .course-title, .programme-title',
  },
  "Women's University in Africa": {
    baseUrl: 'https://www.wua.ac.zw',
    path: '/courses/',
    selector: '.course-item, .programme-item, li',
  },
};

// Keywords to filter out junk
const JUNK_KEYWORDS = [
  'privacy', 'policy', 'contact', 'about', 'home', 'admissions', 'apply',
  'fees', 'scholarships', 'bursaries', 'student loans', 'bank', 'telephone',
  'email', 'address', 'campus', 'directions', 'calendar', 'webmail', 'vacancies',
  'tenders', 'quotations', 'notice', 'registration', 'graduation', 'accommodation',
  'prospectus', 'cohort', 'intake', 'student life', 'international students'
];

function isJunk(text) {
  const lower = text.toLowerCase();
  return JUNK_KEYWORDS.some(k => lower.includes(k));
}

function cleanTitle(text) {
  return text
    .replace(/^[\d.]+[\s)]?/, '') // remove leading numbers
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeUniversity(name, config) {
  console.log(`\n🔄 Scraping ${name}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  const url = config.baseUrl + config.path;
  console.log(`  - URL: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Use the provided selector
    let items = await page.$$(config.selector);
    if (items.length === 0) {
      // Fallback selectors
      const fallbacks = ['h3', 'h4', 'li', 'tr td:first-child'];
      for (const sel of fallbacks) {
        const found = await page.$$(sel);
        if (found.length > 0) {
          items = found;
          console.log(`    Using fallback selector "${sel}"`);
          break;
        }
      }
    }

    if (items.length === 0) {
      console.log(`    No items found on ${url}`);
      await browser.close();
      return [];
    }

    console.log(`    Found ${items.length} candidate items`);

    const rows = [];
    const seen = new Set();

    for (const item of items) {
      let text = await item.textContent();
      if (!text) continue;

      text = cleanTitle(text);

      // Skip short or junk
      if (text.length < 4) continue;
      if (isJunk(text)) continue;

      // Also skip if it's just a single word or generic
      if (/^(home|about|contact|apply)$/i.test(text)) continue;

      // Deduplicate
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      // Determine level and mode
      let level = 'undergraduate';
      if (/diploma/i.test(text)) level = 'diploma';
      else if (/certificate/i.test(text) || /cert/i.test(text)) level = 'certificate';

      let mode = 'full-time';
      if (/part[- ]?time/i.test(text)) mode = 'part-time';
      else if (/block/i.test(text)) mode = 'block';

      // Try to find duration
      let duration = 48;
      const durMatch = text.match(/(\d+)\s*(?:year|yr|months|month)/i);
      if (durMatch) {
        if (/month/i.test(durMatch[0])) duration = parseInt(durMatch[1]);
        else duration = parseInt(durMatch[1]) * 12;
      }

      // Try to find faculty from context (parent element)
      let faculty = '';
      try {
        const parentText = await item.evaluate(el => {
          const parent = el.closest('div, section, li, tr');
          return parent ? parent.textContent : '';
        });
        const facultyMatch = parentText.match(/(?:Faculty|School|Department|Division)\s+of\s+([A-Za-z\s&]+)/i);
        if (facultyMatch) faculty = facultyMatch[1].trim();
      } catch (e) {}

      rows.push({
        university: name,
        type: 'public', // will be overridden for private ones
        city: '',
        province: '',
        faculty: faculty,
        title: text,
        level: level,
        mode: mode,
        duration_months: duration,
        fees_local: 0,
        fees_international: 0,
        app_fee: 0,
        deadline: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
        min_points: 8,
        required_subjects: '',
        description: text,
      });
    }

    await browser.close();
    console.log(`✅ ${name}: ${rows.length} programmes extracted.`);
    return rows;
  } catch (err) {
    console.log(`    Error: ${err.message}`);
    await browser.close();
    return [];
  }
}

(async function main() {
  console.log('🚀 Starting refined scraper for other universities...\n');

  if (!fs.existsSync('./data')) fs.mkdirSync('./data');

  let allData = [];

  for (const [name, config] of Object.entries(UNI_CONFIG)) {
    const data = await scrapeUniversity(name, config);
    // Set university type for private ones
    if (name === 'Africa University' || name === "Women's University in Africa") {
      data.forEach(row => row.type = 'private');
    }
    allData = allData.concat(data);
  }

  if (allData.length === 0) {
    console.log('❌ No data scraped. You may need to manually compile the CSV.');
    process.exit(1);
  }

  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_CSV,
    header: [
      { id: 'university', title: 'university' },
      { id: 'type', title: 'type' },
      { id: 'city', title: 'city' },
      { id: 'province', title: 'province' },
      { id: 'faculty', title: 'faculty' },
      { id: 'title', title: 'title' },
      { id: 'level', title: 'level' },
      { id: 'mode', title: 'mode' },
      { id: 'duration_months', title: 'duration_months' },
      { id: 'fees_local', title: 'fees_local' },
      { id: 'fees_international', title: 'fees_international' },
      { id: 'app_fee', title: 'app_fee' },
      { id: 'deadline', title: 'deadline' },
      { id: 'min_points', title: 'min_points' },
      { id: 'required_subjects', title: 'required_subjects' },
      { id: 'description', title: 'description' },
    ],
  });

  await csvWriter.writeRecords(allData);
  console.log(`\n✅ CSV written to ${OUTPUT_CSV}`);
  console.log(`📊 Total programmes scraped: ${allData.length}`);
})();