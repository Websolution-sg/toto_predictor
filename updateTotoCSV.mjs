/**
 * updateTotoCSV.mjs
 * Fetches the latest Singapore TOTO results from Singapore Pools
 * and prepends any new draws to totoResult.csv.
 *
 * CSV format: D-MMM-YY,n1,n2,n3,n4,n5,n6,additionalNum
 * Example:    2-Apr-26,1,7,8,23,30,33,47
 *
 * Uses:
 *   - Built-in fetch (Node.js 18+)
 *   - cheerio (already in dependencies)
 */

import { load } from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CSV_FILE = join(__dirname, 'totoResult.csv');

// Singapore Pools TOTO past results page (shows the last ~20 draws)
const TOTO_URL = 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx';

const MONTHS = {
  january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
  may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
  september: 'Sept', october: 'Oct', november: 'Nov', december: 'Dec',
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
  jun: 'Jun', jul: 'Jul', aug: 'Aug',
  sep: 'Sept', sept: 'Sept', oct: 'Oct', nov: 'Nov', dec: 'Dec',
};

/**
 * Format a date to match the CSV date format: D-MMM-YY
 * e.g. "2 April 2026" → "2-Apr-26"
 *      "Monday, 2 April 2026" → "2-Apr-26"
 */
function formatDate(rawDate) {
  // Strip day-of-week prefix like "Monday, "
  const cleaned = rawDate.replace(/^[A-Za-z]+,\s*/, '').trim();

  // Try to match "D Month YYYY" or "D Month YY"
  const match = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthKey = match[2].toLowerCase();
  const yearFull = match[3];
  const year2 = yearFull.length === 4 ? yearFull.slice(-2) : yearFull;

  const monthAbbr = MONTHS[monthKey];
  if (!monthAbbr) return null;

  return `${day}-${monthAbbr}-${year2}`;
}

/**
 * Fetch the Singapore Pools TOTO results page HTML.
 */
async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/124.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }
  return response.text();
}

/**
 * Parse TOTO draw results out of the Singapore Pools results page.
 * Returns an array of { csvLine, dateKey } objects.
 *
 * csvLine  — the formatted line ready to write to the CSV
 * dateKey  — the date string in CSV format (D-MMM-YY) for deduplication
 */
function parseResults(html) {
  const $ = load(html);
  const results = [];

  // Singapore Pools results page structure (as of 2025-2026):
  // Each draw block is a <div class="tableWrap"> or similar wrapper.
  // The draw date is in an <h2> or a <td> inside the table header row.
  // Winning numbers are in <td> elements marked with class "win-num" or
  // inside a <ul class="toto-ball"> list.
  //
  // We try several selectors to stay robust against minor HTML changes.

  // ── Strategy 1: look for draw-date + number cells in a structured table ──
  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    rows.each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 8) return; // need at least: date + 6 winning numbers + additional

      // First cell may be the draw date
      const dateText = $(cells[0]).text().trim();
      const dateKey = formatDate(dateText);
      if (!dateKey) return;

      const nums = [];
      for (let i = 1; i <= 6; i++) {
        const n = parseInt($(cells[i]).text().trim(), 10);
        if (isNaN(n) || n < 1 || n > 49) return;
        nums.push(n);
      }
      const add = parseInt($(cells[7]).text().trim(), 10);
      if (isNaN(add) || add < 1 || add > 49) return;

      results.push({ csvLine: `${dateKey},${nums.join(',')},${add}`, dateKey });
    });
  });

  if (results.length > 0) return results;

  // ── Strategy 2: find draw blocks identified by a date heading ──
  // Singapore Pools sometimes wraps each draw in a section/div with a
  // heading showing the draw date.
  $('[class*="draw"], [class*="result"], [class*="toto"]').each((_, block) => {
    const text = $(block).text();

    // Extract date — look for patterns like "2 April 2026"
    const dateMatch = text.match(
      /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
    );
    if (!dateMatch) return;

    const dateKey = formatDate(`${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`);
    if (!dateKey) return;

    // Extract all numbers 1-49 from the block
    const numMatches = [...text.matchAll(/\b([1-9]|[1-3][0-9]|4[0-9])\b/g)].map(
      (m) => parseInt(m[1], 10)
    );
    // We expect exactly 7 unique numbers (6 winning + 1 additional)
    const unique = [...new Set(numMatches)];
    if (unique.length < 7) return;

    const winning = unique.slice(0, 6).sort((a, b) => a - b);
    const additional = unique[6];
    results.push({
      csvLine: `${dateKey},${winning.join(',')},${additional}`,
      dateKey,
    });
  });

  return results;
}

/**
 * Read the existing CSV and return a Set of date keys already present.
 */
function readExistingDates() {
  try {
    const content = readFileSync(CSV_FILE, 'utf8');
    const dates = new Set();
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed) dates.add(trimmed.split(',')[0]);
    }
    return dates;
  } catch {
    return new Set();
  }
}

/**
 * Main entry point.
 */
async function main() {
  console.log('🎯 Fetching Singapore Pools TOTO results...');

  let html;
  try {
    html = await fetchPage(TOTO_URL);
  } catch (err) {
    console.error(`❌ Failed to fetch results page: ${err.message}`);
    process.exit(1);
  }

  const fetched = parseResults(html);
  console.log(`📊 Parsed ${fetched.length} draw(s) from results page.`);

  if (fetched.length === 0) {
    console.log('⚠️  No draw results found in the page. The site structure may have changed.');
    console.log('📋 Exiting without modifying CSV.');
    process.exit(0);
  }

  const existingDates = readExistingDates();
  const newResults = fetched.filter((r) => !existingDates.has(r.dateKey));

  if (newResults.length === 0) {
    console.log('📋 No new results to add — CSV is already up to date.');
    process.exit(0);
  }

  console.log(`✅ Found ${newResults.length} new draw(s): ${newResults.map((r) => r.dateKey).join(', ')}`);

  // Prepend new results (most recent first) to the CSV
  const existingContent = readFileSync(CSV_FILE, 'utf8');
  const newLines = newResults.map((r) => r.csvLine).join('\n');
  const updated = newLines + '\n' + existingContent;
  writeFileSync(CSV_FILE, updated, 'utf8');

  console.log('💾 totoResult.csv updated successfully.');
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
