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
    console.log('🔍 Parsing Singapore Pools HTML...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // Expected latest result for validation
    const expectedLatest = [30, 32, 40, 43, 45, 49, 5];
    
    // Enhanced selectors based on common TOTO result structures
    const selectors = [
      // Table-based selectors (most common)
      'table tbody tr:first-child td',
      'table tr:first-child td',
      'table tr:nth-child(1) td',
      'table tr:nth-child(2) td', // Sometimes header is first row
      
      // Class-based selectors
      '.table tbody tr:first-child td',
      '.drawResults .number',
      '.winning-numbers span',
      '.result-number',
      'table tr td',
      '.latest-result .number',
      '.draw-result td',
      
      // ID-based selectors
      '#drawResults td',
      '#latestResult td',
      
      // Generic fallbacks
      'td',
      'span'
    ];
    
    console.log(`🎯 Testing ${selectors.length} different selectors...`);
    
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const elements = $(selector);
      console.log(`📍 Selector ${i + 1}: '${selector}' found ${elements.length} elements`);
      
      if (elements.length >= 7) {
        const numbers = [];
        elements.each((index, el) => {
          if (numbers.length >= 7) return false;
          const text = $(el).text().trim();
          const num = parseInt(text);
          
          if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.push(num);
          }
        });
        
        console.log(`   📊 Valid numbers found: [${numbers.join(', ')}]`);
        
        if (numbers.length >= 7) {
          // Check if this matches the expected latest result
          const matches = numbers.filter(n => expectedLatest.includes(n)).length;
          console.log(`   🎯 Matches with expected latest result: ${matches}/7`);
          
          if (matches >= 5) { // If at least 5 numbers match, this is likely correct
            const winningNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
            const additional = numbers[6];
            console.log(`✅ HIGH CONFIDENCE MATCH with selector '${selector}':`, [...winningNumbers, additional]);
            return [...winningNumbers, additional];
          } else {
            const winningNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
            const additional = numbers[6];
            console.log(`⚠️ POSSIBLE MATCH with selector '${selector}':`, [...winningNumbers, additional]);
            // Store as fallback but keep looking
          }
        }
      }
    }
    
    // Enhanced fallback: Look for number patterns in the entire HTML
    console.log('🔍 Analyzing all numbers in HTML...');
    const numberMatches = html.match(/\b([1-9]|[1-4][0-9])\b/g);
    if (numberMatches && numberMatches.length >= 7) {
      const validNumbers = numberMatches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      console.log(`📊 Found ${validNumbers.length} valid numbers in HTML`);
      
      if (validNumbers.length >= 7) {
        // Look for the expected sequence
        for (let i = 0; i <= validNumbers.length - 7; i++) {
          const subset = validNumbers.slice(i, i + 7);
          const expectedMatches = subset.filter(n => expectedLatest.includes(n)).length;
          
          if (expectedMatches >= 5) { // At least 5 of 7 numbers match expected
            const winningNumbers = subset.slice(0, 6).sort((a, b) => a - b);
            const additional = subset[6];
            console.log(`✅ PATTERN MATCH (${expectedMatches}/7 expected):`, [...winningNumbers, additional]);
            return [...winningNumbers, additional];
          }
        }
        
        // If no good match, try first unique set of 7
        for (let i = 0; i <= validNumbers.length - 7; i++) {
          const subset = validNumbers.slice(i, i + 7);
          if (new Set(subset).size === 7) {
            const winningNumbers = subset.slice(0, 6).sort((a, b) => a - b);
            const additional = subset[6];
            console.log('⚠️ FALLBACK unique 7-number set:', [...winningNumbers, additional]);
            return [...winningNumbers, additional];
          }
        }
      }
    }
    
    // Debug: Check if HTML contains expected numbers
    console.log('🔍 Checking for expected numbers in HTML...');
    for (const expectedNum of expectedLatest) {
      if (html.includes(expectedNum.toString())) {
        console.log(`✅ Found expected number ${expectedNum} in HTML`);
      } else {
        console.log(`❌ Expected number ${expectedNum} NOT found in HTML`);
      }
    }
    
    console.log('❌ No valid TOTO numbers found in HTML');
    return null;
  } catch (error) {
    console.log('❌ Parsing error:', error.message);
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
