import { chromium } from 'playwright';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

// ============================================================
// CONFIGURATION
// ============================================================
const OUTPUT_CSV = './data/programmes_all_universities.csv';

const UNI_CONFIG = {
  'Africa University': {
    baseUrl: 'https://africau.edu',
    programmePaths: ['/program/'],
    selector: '.program-item, .course-item, .programme-item',
    extractor: 'africa',
  },
  'Lupane State University': {
    baseUrl: 'https://lsu.ac.zw',
    programmePaths: ['/admissions/programmes?level=Undergraduate'],
    selector: 'h3, .programme-title, .course-title',
    extractor: 'lsu',
  },
  'Bulawayo Polytechnic': {
    baseUrl: 'https://bulawayopolytechnic.ac.zw',
    programmePaths: ['/course-division/'],
    selector: '.course-item, .programme-item, li',
    extractor: 'bulawayo_poly',
  },
  'Chinhoyi University of Technology': {
    baseUrl: 'https://www.cut.ac.zw',
    programmePaths: ['/welcome/program/programme-list'],
    selector: '.program-item, .course-item, tr',
    extractor: 'chinhoyi',
  },
  'Harare Polytechnic': {
    baseUrl: 'https://intracolleges.com',
    programmePaths: ['/harare-polytechnic-courses/'],
    selector: 'li, .course-item',
    extractor: 'harare_poly',
  },
  'Great Zimbabwe University': {
    baseUrl: 'https://www.gzu.ac.zw',
    programmePaths: ['/undergraduate-programmes/'],
    selector: '.programme-item, .course-item, tr',
    extractor: 'gzu',
  },
  "Women's University in Africa": {
    baseUrl: 'https://www.wua.ac.zw',
    programmePaths: ['/courses/'],
    selector: '.course-item, .programme-item, li',
    extractor: 'womens',
  },
};

// ============================================================
// EXTRACTOR FUNCTIONS (site-specific parsing)
// ============================================================
function extractAfricaUniversity(text) {
  const match = text.match(/(Bachelor|BSc|BA|BCom|BEng|LLB|Diploma|Certificate).*?(?:Honours|Degree|Programme)?/i);
  return match ? match[0].trim() : text.trim();
}

function extractLSU(text) {
  const match = text.match(/(Bachelor|BSc|BA|BCom|BEng|LLB|Diploma|Certificate).*?(?:Honours)?.*?(?:Degree)?.*?(?:in)?.*?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  return match ? match[0].trim() : text.trim();
}

function extractPolytechnic(text) {
  const match = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  return match ? match[0].trim() : text.trim();
}

function extractGZU(text) {
  const match = text.match(/(Bachelor|BSc|BA|BCom|BEng|LLB|Diploma|Certificate).*?(?:Honours)?.*?(?:Degree)?.*?(?:Programmes?)?/i);
  return match ? match[0].trim() : text.trim();
}

function extractWomens(text) {
  const match = text.match(/(Bachelor|BSc|BA|BCom|BEng|LLB|Diploma|Certificate|Higher National Diploma).*?(?:Honours)?.*?(?:Degree)?.*?(?:in)?.*?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  return match ? match[0].trim() : text.trim();
}

// ============================================================
// MAIN SCRAPER FUNCTION
// ============================================================
async function scrapeUniversity(universityName, config) {
  console.log(`\n🔄 Scraping ${universityName}...`);
  const browser = await chromium.launch({ headless: true });

  // ✅ Fix: Set user agent via context
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let allRows = [];
  let seen = new Set();

  for (const path of config.programmePaths) {
    const url = config.baseUrl + path;
    console.log(`  - Trying ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Try multiple selectors
      let items = [];
      const selectors = [config.selector, 'h3', 'h4', 'li', 'tr td:first-child', '.programme', '.course'];
      for (const sel of selectors) {
        const found = await page.$$(sel);
        if (found.length > 0) {
          items = found;
          console.log(`    Found ${items.length} items with selector "${sel}"`);
          break;
        }
      }

      if (items.length === 0) {
        console.log(`    No items found on ${url}`);
        continue;
      }

      for (const item of items) {
        const text = await item.textContent();
        if (!text) continue;

        let programme = text.trim()
          .replace(/\s+/g, ' ')
          .replace(/^[•▪◦●○■◆▪▸▹►▶]/, '')
          .trim();

        if (programme.length < 5 || /^\d+$/.test(programme)) continue;
        if (/^(home|about|contact|admissions|apply|fees|scholarships)/i.test(programme)) continue;

        let extracted = programme;
        switch (config.extractor) {
          case 'africa': extracted = extractAfricaUniversity(programme); break;
          case 'lsu': extracted = extractLSU(programme); break;
          case 'bulawayo_poly':
          case 'harare_poly': extracted = extractPolytechnic(programme); break;
          case 'gzu': extracted = extractGZU(programme); break;
          case 'womens': extracted = extractWomens(programme); break;
          default: extracted = programme;
        }

        const key = extracted.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        let level = 'undergraduate';
        if (/diploma/i.test(extracted)) level = 'diploma';
        else if (/certificate/i.test(extracted) || /cert/i.test(extracted)) level = 'certificate';

        let mode = 'full-time';
        if (/part[- ]?time/i.test(extracted)) mode = 'part-time';
        else if (/block/i.test(extracted)) mode = 'block';

        let duration = 48;
        const durMatch = extracted.match(/(\d+)\s*(?:year|yr|months|month)/i);
        if (durMatch) {
          if (/month/i.test(durMatch[0])) duration = parseInt(durMatch[1]);
          else duration = parseInt(durMatch[1]) * 12;
        }

        // Try to extract faculty
        let faculty = '';
        const parentText = await item.evaluate(el => {
          const parent = el.closest('div, section, li, tr');
          return parent ? parent.textContent : '';
        });
        const facultyMatch = parentText.match(/(?:Faculty|School|Department|Division)\s+of\s+([A-Za-z\s&]+)/i);
        if (facultyMatch) faculty = facultyMatch[1].trim();

        allRows.push({
          university: universityName,
          type: 'public',
          city: '',
          province: '',
          faculty: faculty || '',
          title: extracted,
          level: level,
          mode: mode,
          duration_months: duration,
          fees_local: 0,
          fees_international: 0,
          app_fee: 0,
          deadline: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
          min_points: 8,
          required_subjects: '',
          description: programme,
        });
      }
    } catch (err) {
      console.log(`    Error on ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`✅ ${universityName}: ${allRows.length} programmes extracted.`);
  return allRows;
}

// ============================================================
// MAIN EXECUTION
// ============================================================
(async function main() {
  console.log('🚀 Starting scraper for all universities...\n');

  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  let allData = [];

  for (const [name, config] of Object.entries(UNI_CONFIG)) {
    const data = await scrapeUniversity(name, config);
    allData = allData.concat(data);
  }

  if (allData.length === 0) {
    console.log('❌ No data scraped. Check selectors or provide manual CSV.');
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