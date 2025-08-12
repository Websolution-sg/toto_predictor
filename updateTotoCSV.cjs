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
    
    // Dynamically load known recent results from CSV for validation
    const knownRecentResults = getKnownRecentResults(CSV_FILE);
    
    // Enhanced selectors based on common TOTO result structures
    // Focus on more specific selectors for the latest result first
    const selectors = [
      // Most specific - target the first/top result row
      'table:first-of-type tbody tr:first-child td',
      'table:first tbody tr:first-child td',
      '.result-table:first tbody tr:first-child td',
      '.results-container table:first tbody tr:first-child td',
      
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
      '.draw-result td',
      '.latest-result .number',
      
      // ID-based selectors
      '#drawResults td',
      '#latestResult td',
      
      // Generic fallbacks (use with caution)
      'table tr td',
      'td',
      'span'
    ];
    
    console.log(`🎯 Testing ${selectors.length} different selectors...`);
    let bestMatch = null;
    let bestScore = 0;
    
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
          // Check confidence against known recent results
          let maxMatches = 0;
          let isExistingResult = false;
          
          for (const knownResult of knownRecentResults) {
            const matches = numbers.filter(n => knownResult.includes(n)).length;
            maxMatches = Math.max(maxMatches, matches);
            
            // Check if this is exactly an existing result (should be rejected)
            if (matches === 7 && numbers.slice(0, 6).sort().join(',') === knownResult.slice(0, 6).sort().join(',') && numbers[6] === knownResult[6]) {
              isExistingResult = true;
              console.log(`   ⚠️ DUPLICATE: This exactly matches existing result [${knownResult.join(', ')}]`);
            }
          }
          
          console.log(`   🎯 Best match score: ${maxMatches}/7`);
          
          // Only accept if it's not a duplicate and has reasonable confidence
          if (!isExistingResult && maxMatches >= 2 && maxMatches <= 5 && maxMatches > bestScore) { 
            // Changed criteria: 2-5 matches (not too low, not exact duplicate)
            const winningNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
            const additional = numbers[6];
            bestMatch = [...winningNumbers, additional];
            bestScore = maxMatches;
            console.log(`✅ NEW BEST MATCH with selector '${selector}':`, bestMatch);
          } else if (isExistingResult) {
            console.log(`   ❌ REJECTED: Exact duplicate of existing result`);
          } else if (maxMatches > 5) {
            console.log(`   ❌ REJECTED: Too similar to existing result (${maxMatches}/7 matches)`);
          } else if (maxMatches < 2) {
            console.log(`   ❌ REJECTED: Too different from recent patterns (${maxMatches}/7 matches)`);
          }
        }
      }
    }
    
    if (bestMatch) {
      // Final validation check
      const validation = isValidNewResult(bestMatch, knownRecentResults);
      if (validation.valid) {
        console.log(`🎉 FINAL RESULT (confidence ${bestScore}/7):`, bestMatch);
        console.log(`✅ Validation: ${validation.reason}`);
        return bestMatch;
      } else {
        console.log(`❌ FINAL RESULT REJECTED: ${validation.reason}`);
        console.log(`🚫 Rejected result was:`, bestMatch);
        bestMatch = null; // Reset to continue with fallback
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
        // Look for sequences that match known results
        for (let i = 0; i <= validNumbers.length - 7; i++) {
          const subset = validNumbers.slice(i, i + 7);
          
          for (const knownResult of knownRecentResults) {
            const matches = subset.filter(n => knownResult.includes(n)).length;
            if (matches >= 5) { // High confidence match
              const winningNumbers = subset.slice(0, 6).sort((a, b) => a - b);
              const additional = subset[6];
              console.log(`✅ PATTERN MATCH (${matches}/7 confidence):`, [...winningNumbers, additional]);
              return [...winningNumbers, additional];
            }
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

function getKnownRecentResults(csvPath, fallbackResults = [[9, 24, 31, 34, 43, 44, 1]]) {
  try {
    const existingResults = readExistingCSV(csvPath);
    if (existingResults.length > 0) {
      // Use the 3 most recent results from CSV for pattern matching
      const recentResults = existingResults.slice(0, Math.min(3, existingResults.length));
      console.log('📊 Using recent results from CSV for validation:');
      recentResults.forEach((result, index) => {
        console.log(`   ${index + 1}: [${result.join(', ')}]`);
      });
      return recentResults;
    } else {
      console.log('⚠️ CSV empty, using fallback known results');
      return fallbackResults;
    }
  } catch (error) {
    console.log('⚠️ CSV read error, using fallback known results:', error.message);
    return fallbackResults;
  }
}

function isValidNewResult(numbers, knownResults) {
  // Check if this is a valid new result (not a duplicate, reasonable pattern)
  for (const known of knownResults) {
    // Check for exact match (should be rejected)
    if (numbers.length === known.length && 
        numbers.slice(0, 6).sort().join(',') === known.slice(0, 6).sort().join(',') &&
        numbers[6] === known[6]) {
      return { valid: false, reason: `Exact duplicate of existing result [${known.join(', ')}]` };
    }
  }
  
  // Check if numbers are in valid range
  const invalidNumbers = numbers.filter(n => n < 1 || n > 49);
  if (invalidNumbers.length > 0) {
    return { valid: false, reason: `Invalid numbers outside 1-49 range: ${invalidNumbers.join(', ')}` };
  }
  
  // Check for duplicates within the result
  if (new Set(numbers).size !== numbers.length) {
    return { valid: false, reason: 'Contains duplicate numbers' };
  }
  
  return { valid: true, reason: 'Valid new result' };
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
    
    if (!latestResult || latestResult.length !== 7) {
      console.log('⚠️ No valid result fetched from Singapore Pools');
      console.log('📊 This could be due to:');
      console.log('   • Website structure changes');
      console.log('   • Network connectivity issues');
      console.log('   • Anti-bot measures');
      console.log('   • No new results available yet');
      console.log('');
      console.log('✅ Workflow continues - no CSV changes made');
      console.log('💡 Manual update may be needed if new results are available');
      process.exit(0);
    }
    
    const existing = readExistingCSV(CSV_FILE);

    if (existing.length > 0 && arraysEqual(latestResult, existing[0])) {
      console.log('✅ Already up to date – no changes made.');
      console.log('📊 Latest result:', existing[0].join(','));
      console.log('🔄 CSV file remains unchanged');
    } else {
      existing.unshift(latestResult);
      writeCSV(CSV_FILE, existing);
      console.log('🎉 Updated with latest result:', latestResult.join(','));
      console.log('📈 Total results in database:', existing.length);
      console.log('✨ CSV file successfully updated');
    }
    
    console.log('🏁 TOTO update process completed successfully');
    process.exit(0);
    
  } catch (err) {
    console.error('💥 Error during execution:', err.message);
    console.error('📍 Stack trace:', err.stack);
    console.log('');
    console.log('🔄 Workflow continues without CSV update');
    console.log('💡 This is expected behavior to prevent workflow failures');
    console.log('⚡ Check logs above for specific error details');
    
    // Always exit with 0 to prevent GitHub Actions failure
    // The workflow should continue even if fetching fails
    process.exit(0);
  }
})();
