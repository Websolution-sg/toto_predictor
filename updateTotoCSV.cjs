const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// Simple TOTO result fetching and CSV updating
async function fetchLatestTotoResult() {
  console.log('🔍 Fetching latest TOTO results...');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`📄 HTML received: ${html.length} characters`);
    
    return parseDirectSingaporePools(html);
    
  } catch (error) {
    console.log('❌ Fetch error:', error.message);
    return null;
  }
}

function parseDirectSingaporePools(html) {
  try {
    console.log('🔍 Parsing Singapore Pools HTML...');
    
    // Look for table pattern: | number | number | number | number | number | number |
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`📊 Found ${matches.length} table patterns`);
    
    if (matches.length > 0) {
      // Get the first match (latest result)
      const firstMatch = matches[0];
      const mainNumbers = firstMatch.slice(1, 7).map(n => parseInt(n));
      console.log(`🎯 Main numbers: [${mainNumbers.join(', ')}]`);
      
      // Look for additional number after the main numbers
      const afterMatch = html.substring(firstMatch.index + firstMatch[0].length, firstMatch.index + firstMatch[0].length + 500);
      const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
      const additionalMatch = afterMatch.match(additionalPattern);
      
      if (additionalMatch) {
        const additional = parseInt(additionalMatch[1]);
        const fullResult = [...mainNumbers, additional];
        console.log(`✅ Complete result: [${fullResult.join(', ')}]`);
        
        // Validate
        if (fullResult.length === 7 && 
            fullResult.every(n => n >= 1 && n <= 49) && 
            new Set(fullResult).size === 7) {
          console.log('🎉 Valid TOTO result found!');
          return fullResult;
        }
      }
    }
    
    // Fallback: Look for any sequence of 7 valid unique numbers
    console.log('🔄 Trying fallback parsing...');
    const allNumbers = [];
    const numberPattern = /(\d{1,2})/g;
    let match;
    
    while ((match = numberPattern.exec(html)) !== null) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 49) {
        allNumbers.push(num);
      }
    }
    
    console.log(`Found ${allNumbers.length} valid numbers (1-49)`);
    
    // Look for first sequence of 7 unique numbers
    for (let i = 0; i <= allNumbers.length - 7; i++) {
      const sequence = allNumbers.slice(i, i + 7);
      if (new Set(sequence).size === 7) {
        console.log(`🎯 Found valid sequence: [${sequence.join(', ')}]`);
        return sequence;
      }
    }
    
    console.log('❌ No valid TOTO result found');
    return null;
    
  } catch (error) {
    console.log('❌ Error parsing:', error.message);
    return null;
  }
}

function readExistingCSV(filename) {
  try {
    if (!fs.existsSync(filename)) {
      console.log('📄 CSV file not found, will create new one');
      return [];
    }
    
    const content = fs.readFileSync(filename, 'utf8').trim();
    if (!content) {
      console.log('📄 CSV file is empty');
      return [];
    }
    
    const lines = content.split('\n');
    const results = lines.map(line => {
      return line.split(',').map(num => parseInt(num.trim())).filter(n => !isNaN(n));
    }).filter(arr => arr.length === 7);
    
    console.log(`📊 Loaded ${results.length} existing results`);
    return results;
    
  } catch (error) {
    console.log('❌ Error reading CSV:', error.message);
    return [];
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

function writeCSV(filename, results) {
  try {
    const content = results.map(row => row.join(',')).join('\n');
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`✅ CSV written with ${results.length} entries`);
    return true;
  } catch (error) {
    console.log('❌ Error writing CSV:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  try {
    console.log('🚀 Starting TOTO update process...');
    console.log('📅 Current date:', new Date().toISOString());
    
    // Step 1: Fetch latest result
    console.log('');
    console.log('=== STEP 1: FETCHING LATEST RESULT ===');
    const latestResult = await fetchLatestTotoResult();
    
    if (!latestResult) {
      console.log('❌ Could not fetch latest TOTO result');
      console.log('🔄 This may be due to network issues or website changes');
      process.exit(0);
    }
    
    console.log(`🎯 Fetched result: [${latestResult.join(', ')}]`);
    
    // Step 2: Read existing CSV
    console.log('');
    console.log('=== STEP 2: READING EXISTING CSV ===');
    const existingResults = readExistingCSV(CSV_FILE);
    
    // Step 3: Check if this is a new result
    console.log('');
    console.log('=== STEP 3: COMPARISON AND UPDATE ===');
    
    if (existingResults.length > 0) {
      console.log(`📊 Current CSV top entry: [${existingResults[0].join(', ')}]`);
      console.log(`🔍 Fetched result:       [${latestResult.join(', ')}]`);
    } else {
      console.log('📄 CSV is empty - this will be the first entry');
    }
    
    const isNewResult = existingResults.length === 0 || !arraysEqual(latestResult, existingResults[0]);
    
    if (isNewResult) {
      console.log('🆕 NEW RESULT DETECTED - UPDATING CSV');
      const updatedResults = [latestResult, ...existingResults];
      
      if (writeCSV(CSV_FILE, updatedResults)) {
        console.log('🎉 CSV SUCCESSFULLY UPDATED!');
        console.log(`📈 Total entries: ${updatedResults.length}`);
        console.log(`🔄 New entry added at top: [${latestResult.join(', ')}]`);
      } else {
        console.log('❌ FAILED TO WRITE CSV');
        process.exit(1);
      }
    } else {
      console.log('📋 NO NEW RESULTS - CSV UNCHANGED');
      console.log(`🔄 Latest result matches current top entry`);
      console.log('💡 This is normal if no new TOTO draw has occurred');
    }
    
    console.log('');
    console.log('✅ PROCESS COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
})();
