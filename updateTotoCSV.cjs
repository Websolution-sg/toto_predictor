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
    console.log('🔍 Parsing Singapore Pools HTML with precision targeting...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // Load HTML with Cheerio for better parsing
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    // PRECISION METHOD 1: Target specific table structure patterns
    console.log('🎯 Method 1: Precision table pattern targeting...');
    
    // Look for the exact pattern we see in the webpage: | 22 | 25 | 29 | 31 | 34 | 43 | followed by | 11 |
    const precisionPatterns = [
      // Pattern 1: 6 numbers in table format followed by additional number
      /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|[\s\S]*?\|\s*(\d{1,2})\s*\|/,
      
      // Pattern 2: HTML table cells with exact structure
      /<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>[\s\S]*?<td[^>]*>\s*(\d{1,2})\s*<\/td>/i
    ];
    
    for (let i = 0; i < precisionPatterns.length; i++) {
      console.log(`   Testing precision pattern ${i + 1}...`);
      const match = html.match(precisionPatterns[i]);
      
      if (match && match.length >= 8) {
        const numbers = match.slice(1, 8).map(n => parseInt(n));
        console.log(`   Pattern ${i + 1} found: [${numbers.join(', ')}]`);
        
        // Strict validation for TOTO result
        if (numbers.length === 7 && 
            numbers.every(n => n >= 1 && n <= 49) && 
            new Set(numbers).size === 7) {
          
          // Additional validation: check if this looks like a realistic TOTO result
          const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
          const additional = numbers[6];
          
          // TOTO numbers should be reasonably distributed (not all consecutive or too clustered)
          const isRealistic = mainNumbers[5] - mainNumbers[0] >= 10; // Spread of at least 10
          
          if (isRealistic) {
            console.log(`✅ Precision pattern ${i + 1} SUCCESS: [${numbers.join(', ')}]`);
            console.log(`   Main numbers: [${mainNumbers.join(', ')}], Additional: ${additional}`);
            return numbers;
          } else {
            console.log(`   ❌ Pattern ${i + 1} unrealistic distribution`);
          }
        } else {
          console.log(`   ❌ Pattern ${i + 1} validation failed`);
        }
      }
    }
    
    // PRECISION METHOD 2: Target by content context  
    console.log('🎯 Method 2: Context-based precision targeting...');
    
    // Look for sections that contain prize information (indicates result tables)
    const prizeKeywords = ['Group 1', 'prize', '$', 'Group 2', 'Group 3'];
    let bestResultSection = '';
    let bestSectionScore = 0;
    
    // Split HTML into sections and score them
    const sections = html.split(/(?=\|[^|]*\d{1,2}[^|]*\|)/).slice(0, 10); // First 10 sections only
    
    for (let s = 0; s < sections.length; s++) {
      const section = sections[s];
      let score = 0;
      
      // Score sections based on prize-related content
      for (const keyword of prizeKeywords) {
        if (section.includes(keyword)) score += 1;
      }
      
      // Prefer sections with table structure
      if (section.includes('|') && section.includes('Group')) score += 2;
      
      if (score > bestSectionScore) {
        bestSectionScore = score;
        bestResultSection = section;
      }
    }
    
    if (bestResultSection && bestSectionScore >= 3) {
      console.log(`   Found best result section (score: ${bestSectionScore})`);
      
      // Extract first valid 7-number sequence from this section
      const sectionNumbers = [];
      const numberMatches = [...bestResultSection.matchAll(/(\d{1,2})/g)];
      
      for (const match of numberMatches) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 49) {
          sectionNumbers.push(num);
        }
      }
      
      // Look for valid 7-number sequence
      for (let i = 0; i <= sectionNumbers.length - 7; i++) {
        const sequence = sectionNumbers.slice(i, i + 7);
        if (new Set(sequence).size === 7) {
          console.log(`✅ Context-based method found: [${sequence.join(', ')}]`);
          return sequence;
        }
      }
    }
    
    
    // PRECISION METHOD 3: Ultra-conservative fallback
    console.log('🎯 Method 3: Ultra-conservative number extraction...');
    
    // Only look at the very beginning of the HTML where the latest result should be
    const topSection = html.substring(0, Math.min(html.length, 15000)); // First 15KB only
    
    // Find all valid TOTO numbers in this section
    const conservativeNumbers = [];
    const conservativePattern = /(\d{1,2})/g;
    let match;
    
    while ((match = conservativePattern.exec(topSection)) !== null) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 49) {
        conservativeNumbers.push({
          number: num,
          position: match.index
        });
      }
    }
    
    console.log(`📊 Found ${conservativeNumbers.length} valid numbers in top section`);
    
    // Look for the first occurrence of 7 unique numbers in close proximity
    if (conservativeNumbers.length >= 7) {
      for (let i = 0; i <= conservativeNumbers.length - 7; i++) {
        const cluster = conservativeNumbers.slice(i, i + 7);
        const numbers = cluster.map(item => item.number);
        
        // Check uniqueness and proximity
        if (new Set(numbers).size === 7) {
          const positionSpread = cluster[6].position - cluster[0].position;
          
          // Very strict proximity requirement (within 500 characters)
          if (positionSpread < 500) {
            console.log(`✅ Conservative method found: [${numbers.join(', ')}]`);
            console.log(`   Position spread: ${positionSpread} characters`);
            return numbers;
          }
        }
      }
    }
    
    console.log('❌ All precision parsing methods failed');
    
    // EMERGENCY FALLBACK: Look for known good patterns only
    console.log('🆘 Emergency fallback: Looking for known good result patterns...');
    
    // Check if we can find the previous known result to validate our parsing
    const knownResults = [
      [9, 24, 31, 34, 43, 44, 1],  // Previous result in CSV
      [2, 15, 28, 39, 42, 44, 5],
      [30, 32, 40, 43, 45, 49, 5]
    ];
    
    for (const knownResult of knownResults) {
      const knownPattern = knownResult.map(n => n.toString()).join('[^\\d]*');
      const regex = new RegExp(knownPattern);
      
      if (regex.test(html)) {
        console.log(`✅ Found known result pattern: [${knownResult.join(', ')}]`);
        console.log('⚠️ Returning null to avoid updating with old result');
        return null; // Don't return old results
      }
    }
    
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
