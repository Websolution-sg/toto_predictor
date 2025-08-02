const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const CSV_FILE = 'totoResult.csv';

async function fetchLatestTotoResult() {
  const url = 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx';
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;

  const drawDateEl = document.querySelector('.table-responsive .table tbody tr:first-child td:nth-child(1)');
  const numbersEl = document.querySelector('.table-responsive .table tbody tr:first-child td:nth-child(2)');
  const additionalEl = document.querySelector('.table-responsive .table tbody tr:first-child td:nth-child(3)');

  if (!drawDateEl || !numbersEl || !additionalEl) {
    throw new Error('Failed to extract result from page.');
  }

  const winningNumbers = numbersEl.textContent.trim()
    .split(/\s+/)
    .map(n => parseInt(n))
    .sort((a, b) => a - b);

  const additional = parseInt(additionalEl.textContent.trim());

  return [...winningNumbers, additional];
}

function readExistingCSV(path) {
  if (!fs.existsSync(path)) return [];
  const content = fs.readFileSync(path, 'utf8').trim();
  return content.split('\n').map(line => line.split(',').map(Number));
}

function writeCSV(path, rows) {
  const content = rows.map(r => r.join(',')).join('\n') + '\n';
  fs.writeFileSync(path, content, 'utf8');
}

(async () => {
  try {
    const latestResult = await fetchLatestTotoResult();
    const existing = readExistingCSV(CSV_FILE);

    if (existing.length > 0 && latestResult.every((n, i) => n === existing[0][i])) {
      console.log('Already up to date – no changes made.');
    } else {
      existing.unshift(latestResult);
      writeCSV(CSV_FILE, existing);
      console.log('Updated with latest result:', latestResult.join(','));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
