const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

async function fetchLatestTotoResult() {
  console.log('🔍 Attempting to fetch latest TOTO results...');
  
  // Method 1: Try direct Singapore Pools scraping with multiple approaches
  const attempts = [
    {
      name: 'Singapore Pools Direct',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      parser: parseDirectSingaporePools
    },
    {
      name: 'Singapore Pools Mobile',
      url: 'https://m.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      parser: parseDirectSingaporePools
    }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name}...`);
      const response = await fetch(attempt.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });

      if (!response.ok) {
        console.log(`❌ ${attempt.name} failed with status: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const result = attempt.parser(html);
      
      if (result && result.length === 7) {
        console.log(`✅ Successfully fetched from ${attempt.name}:`, result);
        return result;
      }
      
    } catch (error) {
      console.log(`❌ ${attempt.name} error:`, error.message);
      continue;
    }
  }

  throw new Error('All fetch methods failed');
}

function parseDirectSingaporePools(html) {
  try {
    const $ = cheerio.load(html);
    
    // Try multiple selectors that might contain the results
    const selectors = [
      '.table tbody tr:first-child td',
      '.drawResults .number',
      '.winning-numbers span',
      '.result-number',
      'table tr td',
      '.latest-result .number'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length >= 7) {
        const numbers = [];
        elements.each((i, el) => {
          if (numbers.length >= 7) return false;
          const text = $(el).text().trim();
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.push(num);
          }
        });
        
        if (numbers.length >= 7) {
          // First 6 are winning numbers, 7th is additional
          const winningNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
          const additional = numbers[6];
          console.log(`Found numbers with selector '${selector}':`, [...winningNumbers, additional]);
          return [...winningNumbers, additional];
        }
      }
    }
    
    // Fallback: Look for number patterns in the entire HTML
    const numberMatches = html.match(/\b([1-9]|[1-4][0-9])\b/g);
    if (numberMatches && numberMatches.length >= 7) {
      const validNumbers = numberMatches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      if (validNumbers.length >= 7) {
        // Look for unique sets of 7 numbers
        for (let i = 0; i <= validNumbers.length - 7; i++) {
          const subset = validNumbers.slice(i, i + 7);
          if (new Set(subset).size === 7) {
            const winningNumbers = subset.slice(0, 6).sort((a, b) => a - b);
            const additional = subset[6];
            console.log('Found number pattern:', [...winningNumbers, additional]);
            return [...winningNumbers, additional];
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log('Parsing error:', error.message);
    return null;
  }
}

function readExistingCSV(path) {
  if (!fs.existsSync(path)) {
    console.log('📄 CSV file does not exist, will create new one');
    return [];
  }
  
  try {
    const content = fs.readFileSync(path, 'utf8').trim();
    if (!content) {
      console.log('📄 CSV file is empty');
      return [];
    }
    
    const rows = content.split('\n').map(line => line.split(',').map(Number));
    console.log(`📄 Read ${rows.length} existing results from CSV`);
    return rows;
  } catch (error) {
    console.log('❌ Error reading CSV:', error.message);
    return [];
  }
}

function writeCSV(path, rows) {
  try {
    const content = rows.map(r => r.join(',')).join('\n') + '\n';
    fs.writeFileSync(path, content, 'utf8');
    console.log(`💾 Successfully wrote ${rows.length} results to CSV`);
  } catch (error) {
    console.log('❌ Error writing CSV:', error.message);
    throw error;
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Main execution
(async () => {
  console.log('🚀 Starting TOTO result update process...');
  console.log('📅 Current date:', new Date().toISOString());
  
  try {
    const latestResult = await fetchLatestTotoResult();
    const existing = readExistingCSV(CSV_FILE);

    if (existing.length > 0 && arraysEqual(latestResult, existing[0])) {
      console.log('✅ Already up to date – no changes made.');
      console.log('📊 Latest result:', existing[0].join(','));
    } else {
      existing.unshift(latestResult);
      writeCSV(CSV_FILE, existing);
      console.log('🎉 Updated with latest result:', latestResult.join(','));
      console.log('📈 Total results in database:', existing.length);
    }
    
    process.exit(0);
    
  } catch (err) {
    console.error('💥 Error:', err.message);
    console.log('🔄 The workflow will continue without updating the CSV file.');
    
    // Don't fail the entire workflow - just log the error
    process.exit(0);
  }
})();
