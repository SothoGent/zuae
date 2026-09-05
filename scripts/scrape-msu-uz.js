import { chromium } from 'playwright';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

// Config
const OUTPUT_CSV = './data/programmes_uz_msu.csv';

const UNI_CONFIG = {
  'University of Zimbabwe': {
    url: 'https://www.uz.ac.zw/index.php/academics/undergraduate-programmes',
    // fallback paths
    fallbackUrls: [
      'https://www.uz.ac.zw/index.php/academics/faculties',
    ],
  },
  'Midlands State University': {
    url: 'https://www.msu.ac.zw/admissions/undergraduate-programmes/',
    fallbackUrls: [
      'https://www.msu.ac.zw/academics/programmes',
    ],
  },
};

// Helper to extract text from a node
function extractText(el) {
  return el.textContent?.trim() || '';
}

// Helper to extract numbers
function extractNumber(text) {
  const matches = text.match(/\d+/g);
  return matches ? parseInt(matches.join(''), 10) : 0;
}

// Main scraper function
async function scrapeUniversity(universityName, config) {
  console.log(`\n🔄 Scraping ${universityName}...`);
  const browser = await chromium.launch({ headless: false }); // visible for debugging
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  let allData = [];

  const urls = [config.url, ...(config.fallbackUrls || [])];
  for (const url of urls) {
    console.log(`  - Trying ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);

      // Log the page title and a snippet of HTML for debugging
      const title = await page.title();
      console.log(`    Page title: ${title}`);

      // Try to find programme elements – we'll try several selectors
      const selectors = [
        'table tbody tr',
        'ul li',
        'div.programme-item',
        'article',
        '.entry-content p',
        '.programme',
        '.course',
      ];
      let foundRows = [];
      for (const selector of selectors) {
        const rows = await page.$$(selector);
        if (rows.length > 0) {
          console.log(`    Found ${rows.length} elements with selector "${selector}"`);
          foundRows = rows;
          break;
        }
      }

      if (foundRows.length === 0) {
        console.log(`    No elements found on ${url}`);
        continue;
      }

      // Process each found element
      for (const row of foundRows) {
        // Extract text content of the row and its children
        const text = await row.evaluate(el => el.textContent.trim());
        if (text.length < 10) continue;

        // Try to extract faculty, title, etc. from the text
        // Heuristic: first line might be title, second might be faculty, etc.
        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
        let title = lines[0] || '';
        let faculty = '';
        let level = 'undergraduate';
        let mode = 'full-time';
        let durationMonths = 48;
        let feesLocal = 0;
        let feesInternational = 0;
        let appFee = 0;
        let deadline = '';
        let minPoints = 0;
        let requiredSubjects = '';
        let description = '';

        // Simple heuristics based on lines
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lower = line.toLowerCase();
          if (lower.includes('faculty') || lower.includes('school of')) {
            faculty = line;
          }
          if (lower.includes('duration')) {
            const match = line.match(/(\d+)\s*(months|month|yr|year)/i);
            if (match) {
              durationMonths = match[2].startsWith('yr') ? parseInt(match[1]) * 12 : parseInt(match[1]);
            }
          }
          if (lower.includes('fee') || lower.includes('cost')) {
            const numbers = line.match(/\d+/g);
            if (numbers) {
              const nums = numbers.map(Number);
              if (nums.length >= 2) {
                feesLocal = nums[0];
                feesInternational = nums[1] || nums[0];
              } else {
                feesLocal = nums[0];
              }
            }
          }
          if (lower.includes('point')) {
            const match = line.match(/(\d+)\s*points?/i);
            if (match) minPoints = parseInt(match[1]);
          }
          if (lower.includes('deadline') || lower.includes('closing')) {
            deadline = line;
          }
          if (lower.includes('subject') || lower.includes('required')) {
            requiredSubjects = line;
          }
          // If we haven't set title, use the first non-empty line
          if (!title && lines[i]) title = lines[i];
        }

        // If no title found, skip
        if (!title) continue;

        // Build row data
        allData.push({
          university: universityName,
          type: 'public',
          city: universityName.includes('Zimbabwe') ? 'Harare' : 'Gweru',
          province: universityName.includes('Zimbabwe') ? 'Harare' : 'Midlands',
          faculty: faculty || '',
          title: title,
          level: level,
          mode: mode,
          duration_months: durationMonths,
          fees_local: feesLocal,
          fees_international: feesInternational,
          app_fee: appFee || 30,
          deadline: deadline || '',
          min_points: minPoints || 0,
          required_subjects: requiredSubjects || '',
          description: description || '',
        });
      }

      // If we got data from this URL, break
      if (allData.length > 0) break;
    } catch (err) {
      console.log(`    Error: ${err.message}`);
    }
  }

  await browser.close();
  return allData;
}

// Main
(async () => {
  console.log('🚀 Starting scraper...');
  const allData = [];

  // Scrape each university
  for (const [name, config] of Object.entries(UNI_CONFIG)) {
    const data = await scrapeUniversity(name, config);
    allData.push(...data);
    console.log(`✅ ${name}: ${data.length} programmes extracted.`);
  }

  if (allData.length === 0) {
    console.log('❌ No data scraped. Check selectors or provide manual CSV.');
    process.exit(1);
  }

  // Write CSV
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
  console.log(`✅ CSV written to ${OUTPUT_CSV}`);
  console.log(`📊 Total programmes scraped: ${allData.length}`);
})();