const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// Enhanced TOTO result fetching with multiple endpoints and dynamic parsing
async function fetchLatestTotoResult() {
  console.log('🔍 Fetching latest TOTO results with dynamic multi-endpoint approach...');
  
  // Multiple endpoints for better reliability
  const endpoints = [
    {
      name: 'Singapore Pools Main TOTO Page',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    },
    {
      name: 'Singapore Pools Alternative URL',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    },
    {
      name: 'Singapore Pools Mobile View',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Trying ${endpoint.name}...`);
      
      const response = await fetch(endpoint.url, {
        headers: endpoint.headers,
        timeout: 30000,
        follow: 5,
        compress: true
      });
      
      if (!response.ok) {
        console.log(`❌ ${endpoint.name} returned status: ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`📄 ${endpoint.name} - HTML received: ${html.length} characters`);
      
      // Check if HTML contains TOTO-related content
      const hasTotoContent = html.toLowerCase().includes('toto') || 
                            html.includes('winning numbers') || 
                            html.includes('draw');
      
      if (!hasTotoContent) {
        console.log(`⚠️ ${endpoint.name} - No TOTO content detected`);
        continue;
      }
      
      console.log(`✅ ${endpoint.name} - TOTO content confirmed, parsing...`);
      const result = parseDirectSingaporePools(html);
      
      if (result && result.length === 7) {
        console.log(`🎉 ${endpoint.name} successfully parsed result: [${result.join(', ')}]`);
        return result;
      } else {
        console.log(`⚠️ ${endpoint.name} - Parsing failed or invalid result`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} error: ${error.message}`);
      if (error.code === 'ENOTFOUND') {
        console.log('   🌐 DNS resolution failed');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   ⏰ Request timed out');
      }
      continue;
    }
  }
  
  console.log('❌ All endpoints failed to provide valid TOTO result');
  return null;
}

function parseDirectSingaporePools(html) {
  try {
    console.log('🔍 Parsing Singapore Pools HTML with dynamic detection...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // Load HTML with Cheerio for better parsing
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    // DYNAMIC APPROACH 1: Look for any table cells with TOTO numbers
    console.log('🎯 Method 1: Dynamic table cell parsing...');
    const tableCells = [];
    
    // Find all table cells and extract valid TOTO numbers
    $('td, th').each((i, elem) => {
      const text = $(elem).text().trim();
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49) {
        tableCells.push({
          number: num,
          position: i,
          context: $(elem).parent().text().trim()
        });
      }
    });
    
    console.log(`📊 Found ${tableCells.length} valid TOTO numbers in table cells`);
    
    // Look for sequences of 6+1 pattern (main numbers + additional)
    if (tableCells.length >= 7) {
      // Try to find the first valid 7-number sequence
      for (let i = 0; i <= tableCells.length - 7; i++) {
        const sequence = tableCells.slice(i, i + 7).map(cell => cell.number);
        
        // Check if this forms a valid TOTO result (7 unique numbers)
        if (new Set(sequence).size === 7) {
          console.log(`✅ Table method found: [${sequence.join(', ')}]`);
          return sequence;
        }
      }
    }
    
    // DYNAMIC APPROACH 2: Text-based pattern matching with multiple formats
    console.log('🎯 Method 2: Dynamic text pattern parsing...');
    
    // Multiple patterns to catch different table formats
    const patterns = [
      // Pattern 1: Standard table with | separators
      /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|[\s\S]{0,300}?\|\s*(\d{1,2})\s*\|/,
      
      // Pattern 2: HTML table format
      /<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>[\s\S]{0,300}?<td[^>]*>\s*(\d{1,2})\s*<\/td>/i,
      
      // Pattern 3: Space-separated numbers in a row
      /(?:^|\n|\r)[\s]*(\d{1,2})[\s]+(\d{1,2})[\s]+(\d{1,2})[\s]+(\d{1,2})[\s]+(\d{1,2})[\s]+(\d{1,2})[\s\S]{0,100}?(\d{1,2})/m,
      
      // Pattern 4: Numbers with various separators
      /(\d{1,2})[\s,|]+(\d{1,2})[\s,|]+(\d{1,2})[\s,|]+(\d{1,2})[\s,|]+(\d{1,2})[\s,|]+(\d{1,2})[\s\S]{0,200}?[\s,|]+(\d{1,2})/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      console.log(`   Testing pattern ${i + 1}...`);
      const match = html.match(patterns[i]);
      
      if (match && match.length >= 8) {
        const numbers = match.slice(1, 8).map(n => parseInt(n));
        
        // Validate TOTO result
        if (numbers.length === 7 && 
            numbers.every(n => n >= 1 && n <= 49) && 
            new Set(numbers).size === 7) {
          console.log(`✅ Pattern ${i + 1} success: [${numbers.join(', ')}]`);
          return numbers;
        } else {
          console.log(`   ❌ Pattern ${i + 1} invalid: length=${numbers.length}, unique=${new Set(numbers).size}`);
        }
      }
    }
    
    
    // DYNAMIC APPROACH 3: Position-based number extraction with smart filtering
    console.log('🎯 Method 3: Position-based extraction...');
    const allNumbers = [];
    const numberPattern = /(\d{1,2})/g;
    let match;
    
    while ((match = numberPattern.exec(html)) !== null) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 49) {
        allNumbers.push({
          number: num,
          position: match.index,
          context: html.substring(Math.max(0, match.index - 20), match.index + 20)
        });
      }
    }
    
    console.log(`📊 Found ${allNumbers.length} valid TOTO numbers (1-49) in HTML`);
    
    // Look for clusters of 7 numbers that appear close together (likely in same table row)
    if (allNumbers.length >= 7) {
      for (let i = 0; i <= allNumbers.length - 7; i++) {
        const cluster = allNumbers.slice(i, i + 7);
        const numbers = cluster.map(item => item.number);
        
        // Check if it's a valid TOTO result (7 unique numbers)
        if (new Set(numbers).size === 7) {
          // Check if numbers are positioned close together (within 1000 characters)
          const positionSpread = cluster[6].position - cluster[0].position;
          
          if (positionSpread < 1000) {
            console.log(`✅ Position-based method found: [${numbers.join(', ')}]`);
            console.log(`   Position spread: ${positionSpread} characters`);
            return numbers;
          }
        }
      }
    }
    
    // DYNAMIC APPROACH 4: Smart content analysis
    console.log('🎯 Method 4: Smart content analysis...');
    
    // Look for recent date indicators to find the latest result section
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/g,
      /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s]+\d{1,2}[\s,]+\d{4}/gi
    ];
    
    let latestDatePosition = -1;
    const currentYear = new Date().getFullYear();
    
    for (const pattern of datePatterns) {
      let dateMatch;
      while ((dateMatch = pattern.exec(html)) !== null) {
        const dateStr = dateMatch[0];
        if (dateStr.includes(currentYear.toString())) {
          console.log(`📅 Found recent date: ${dateStr} at position ${dateMatch.index}`);
          latestDatePosition = dateMatch.index;
          break;
        }
      }
      if (latestDatePosition !== -1) break;
    }
    
    // If we found a recent date, look for numbers near it
    if (latestDatePosition !== -1) {
      const nearDateSection = html.substring(latestDatePosition, latestDatePosition + 2000);
      const nearDateNumbers = [];
      
      let nearMatch;
      const nearPattern = /(\d{1,2})/g;
      while ((nearMatch = nearPattern.exec(nearDateSection)) !== null) {
        const num = parseInt(nearMatch[1]);
        if (num >= 1 && num <= 49) {
          nearDateNumbers.push(num);
        }
      }
      
      // Look for first valid 7-number sequence near the date
      for (let i = 0; i <= nearDateNumbers.length - 7; i++) {
        const sequence = nearDateNumbers.slice(i, i + 7);
        if (new Set(sequence).size === 7) {
          console.log(`✅ Date-proximity method found: [${sequence.join(', ')}]`);
          return sequence;
        }
      }
    }
    
    console.log('❌ All dynamic parsing methods failed - no valid TOTO result found');
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
