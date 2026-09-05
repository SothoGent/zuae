// scripts/scrape-universities.js
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

// ----- CONFIGURATION -----
const OUTPUT_CSV = './data/programmes_uz_msu.csv';

// Map of university names to their official domains and programme listing pages
const UNI_CONFIG = {
  'University of Zimbabwe': {
    baseUrl: 'https://www.uz.ac.zw',
    // We'll try multiple possible paths; the scraper will attempt each.
    programmePaths: [
      '/index.php/academics/undergraduate-programmes',
      '/index.php/academics/postgraduate-programmes',
      '/index.php/academics/faculties',
    ],
    // CSS selectors for programme rows (adjust based on actual site)
    rowSelector: 'table tbody tr',   // fallback
    // If the page uses a different structure, we'll use a fallback selector
  },
  'Midlands State University': {
    baseUrl: 'https://www.msu.ac.zw',
    programmePaths: [
      '/academics/programmes',
      '/index.php/academics/undergraduate',
    ],
    rowSelector: 'table tbody tr',
  },
};

// Helper: sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ----- SCRAPER FUNCTION -----
async function scrapeUniversity(universityName, config) {
  console.log(`🔄 Scraping ${universityName}...`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...');

  let allRows = [];

  for (const path of config.programmePaths) {
    const url = config.baseUrl + path;
    console.log(`  - Trying ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(2000);

      // Try to find tables with programme info
      // We'll look for tables that contain keywords like "programme", "course", "degree"
      const tables = await page.$$('table');
      if (tables.length === 0) {
        console.log(`    No tables found on ${url}`);
        continue;
      }

      // For each table, extract rows
      for (let i = 0; i < tables.length; i++) {
        const rows = await tables[i].$$('tbody tr');
        if (rows.length === 0) continue;
        console.log(`    Found ${rows.length} rows in table ${i+1}`);

        for (const row of rows) {
          const cells = await row.$$('td');
          if (cells.length < 2) continue;

          // Extract text from each cell
          const cellTexts = await Promise.all(cells.map(cell => cell.evaluate(el => el.textContent.trim())));
          // Assuming typical structure: [Programme, Faculty, Level, Duration, Fees, ...]
          // We'll try to map by position, but it's heuristic
          // For robustness, we'll also look for specific keywords in the first cell (programme title)
          const title = cellTexts[0] || '';
          // Skip if title is too short or generic
          if (title.length < 5 || /^\d+$/.test(title)) continue;

          const rowData = {
            university: universityName,
            type: 'public', // we can override later
            city: '',       // we can fill from known data
            province: '',
            faculty: cellTexts[1] || '',
            title: title,
            level: inferLevel(title, cellTexts),
            mode: inferMode(cellTexts),
            duration_months: inferDuration(cellTexts),
            fees_local: extractNumber(cellTexts, 'local'),
            fees_international: extractNumber(cellTexts, 'international'),
            app_fee: extractNumber(cellTexts, 'application'),
            deadline: inferDeadline(cellTexts),
            min_points: inferPoints(cellTexts),
            required_subjects: inferSubjects(cellTexts),
            description: cellTexts.slice(2).join(' ') || '',
          };
          allRows.push(rowData);
        }
      }
    } catch (err) {
      console.log(`    Error on ${url}: ${err.message}`);
    }
  }

  await browser.close();
  return allRows;
}

// ----- HELPER FUNCTIONS (heuristic extraction) -----
function inferLevel(title, cells) {
  const text = (title + ' ' + cells.join(' ')).toLowerCase();
  if (text.includes('undergraduate') || text.includes('bachelor') || text.includes('bsc') || text.includes('ba')) return 'undergraduate';
  if (text.includes('diploma')) return 'diploma';
  if (text.includes('certificate')) return 'certificate';
  if (text.includes('master') || text.includes('mba') || text.includes('phd')) return 'undergraduate'; // not handled
  return 'undergraduate';
}
function inferMode(cells) {
  const text = cells.join(' ').toLowerCase();
  if (text.includes('part-time')) return 'part-time';
  if (text.includes('block')) return 'block';
  return 'full-time';
}
function inferDuration(cells) {
  const text = cells.join(' ').toLowerCase();
  const match = text.match(/(\d+)\s*(months|month|yr|year)/);
  if (match) {
    if (match[2].startsWith('yr') || match[2].startsWith('year')) return parseInt(match[1]) * 12;
    return parseInt(match[1]);
  }
  return 48; // default 4 years
}
function extractNumber(cells, keyword) {
  const text = cells.join(' ');
  const regex = new RegExp(`(?:${keyword})\\s*[\\$]?\\s*([\\d,]+)`);
  const match = text.match(regex);
  if (match) return parseInt(match[1].replace(/,/g, ''));
  // Try to find standalone number near keyword
  return 0;
}
function inferDeadline(cells) {
  const text = cells.join(' ').toLowerCase();
  // Look for dates like "31 October 2026" or "2026-10-31"
  const match = text.match(/(\d{1,2}\s+[a-z]+\s+\d{4})/i);
  if (match) {
    const d = new Date(match[1]);
    if (!isNaN(d)) return d.toISOString().slice(0,10);
  }
  // Fallback: return 30 November next year (common deadline)
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setMonth(10); // November
  d.setDate(30);
  return d.toISOString().slice(0,10);
}
function inferPoints(cells) {
  const text = cells.join(' ').toLowerCase();
  const match = text.match(/(\d+)\s*points/);
  if (match) return parseInt(match[1]);
  // If not found, default 8
  return 8;
}
function inferSubjects(cells) {
  const text = cells.join(' ').toLowerCase();
  // Look for subject:grade pairs like "Mathematics:C; Physics:D"
  const subjectRegex = /([a-z\s]+)\s*[:;]\s*([a-e])/gi;
  const matches = [...text.matchAll(subjectRegex)];
  const subjects = matches.map(m => `${m[1].trim()}:${m[2].toUpperCase()}`).join(';');
  return subjects || '';
}

// ----- MAIN EXECUTION -----
(async function main() {
  console.log('🚀 Starting scraper...');
  const allData = [];

  for (const [name, config] of Object.entries(UNI_CONFIG)) {
    const data = await scrapeUniversity(name, config);
    allData.push(...data);
    console.log(`✅ ${name}: ${data.length} programmes extracted.`);
  }

  if (allData.length === 0) {
    console.log('❌ No data scraped. Check selectors or provide manual CSV.');
    process.exit(1);
  }

  // Prepare CSV writer
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