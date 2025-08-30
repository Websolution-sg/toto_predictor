import puppeteer from 'puppeteer';
import fs from 'fs';

const CSV_FILE = 'd:/Timothy/Toto Predictor/Repository/toto_predictor/totoResult.csv';
const TOTO_URL = 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx';

function formatDateDDMMMYY(dateStr) {
  let d = dateStr.replace(/-/g, ' ').replace(/\//g, ' ');
  let parts = d.split(' ');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].length === 3 ? parts[1].toUpperCase() : parts[1].slice(0,3).toUpperCase();
    let year = parts[2].length === 4 ? parts[2].slice(2) : parts[2];
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

async function fetchLatestTotoResult() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TOTO_URL, { waitUntil: 'networkidle2' });

  // Wait for draw date and numbers to appear
  await page.waitForSelector('body');
  const result = await page.evaluate(() => {
    // Find all tables
    const tables = Array.from(document.querySelectorAll('table'));
    let drawDate = null, numbers = [], additional = null;
    for (let i = 0; i < tables.length; i++) {
      const ths = tables[i].querySelectorAll('th');
      for (const th of ths) {
        const dateMatch = th.textContent.match(/\d{1,2} \w{3} \d{4}/);
        if (dateMatch) {
          drawDate = dateMatch[0];
          // Next table: winning numbers
          if (tables[i+1]) {
            const tds = tables[i+1].querySelectorAll('td');
            numbers = Array.from(tds).map(td => parseInt(td.textContent.trim())).filter(n => !isNaN(n));
            numbers = numbers.slice(0, 6);
          }
          // Next-next table: additional number
          if (tables[i+2]) {
            const addTd = tables[i+2].querySelector('td');
            if (addTd) {
              additional = parseInt(addTd.textContent.trim());
            }
          }
          break;
        }
      }
      if (drawDate && numbers.length === 6 && additional !== null) break;
    }
    return { drawDate, numbers, additional };
  });
  await browser.close();
  if (!result.drawDate || result.numbers.length !== 6 || result.additional === null) {
    throw new Error('Failed to fetch latest TOTO result');
  }
  return {
    drawDate: formatDateDDMMMYY(result.drawDate),
    numbers: [...result.numbers, result.additional]
  };
}

function updateCSV({ drawDate, numbers }) {
  let csvContent = '';
  try {
    csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  } catch (error) {
    console.log('📝 CSV file not found, creating new one');
  }
  const newLine = `${drawDate},${numbers.slice(0, 6).join(',')},${numbers[6] || ''}`;
  const lines = csvContent.trim().split('\n').filter(line => line.trim());
  if (lines[0] && lines[0].startsWith(drawDate)) {
    console.log('No update needed, latest result already present.');
    return;
  }
  lines.unshift(newLine);
  fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n');
  console.log('✅ CSV updated successfully');
}

(async () => {
  try {
    console.log('🎯 Fetching latest TOTO result using Puppeteer...');
    const latestResult = await fetchLatestTotoResult();
    console.log(`Latest result: ${latestResult.drawDate} - [${latestResult.numbers.join(', ')}]`);
    updateCSV(latestResult);
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
})();
