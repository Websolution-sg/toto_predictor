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
    console.log('🔍 Parsing Singapore Pools HTML with DATE-BASED latest result detection...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // DATE-BASED APPROACH: Find the most recent draw date and its associated result
    console.log('📅 Searching for draw dates to identify latest result...');
    
    const currentDate = new Date();
    const resultCandidates = [];
    
    // Parse all possible date formats used by Singapore Pools
    const datePatterns = [
      // Format: DD/MM/YYYY or DD-MM-YYYY
      {
        regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
        parser: (match) => new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
      },
      // Format: YYYY/MM/DD or YYYY-MM-DD
      {
        regex: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
        parser: (match) => new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
      },
      // Format: DD MMM YYYY (e.g., "16 Aug 2025")
      {
        regex: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
        parser: (match) => {
          const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
          return new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
        }
      }
    ];
    
    // Find all dates in the HTML
    const foundDates = [];
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.regex.exec(html)) !== null) {
        try {
          const date = pattern.parser(match);
          const dateStr = match[0];
          
          // Only consider dates from the current year and not future dates
          if (date.getFullYear() === currentDate.getFullYear() && date <= currentDate) {
            foundDates.push({
              date: date,
              dateString: dateStr,
              position: match.index,
              context: html.substring(Math.max(0, match.index - 200), match.index + 1000)
            });
          }
        } catch (err) {
          console.log(`   ⚠️ Could not parse date: ${match[0]}`);
        }
      }
    }
    
    console.log(`📅 Found ${foundDates.length} valid dates in current year`);
    
    // Sort dates to find the most recent
    foundDates.sort((a, b) => b.date - a.date);
    
    if (foundDates.length === 0) {
      console.log('❌ No valid dates found - cannot determine latest result');
      return null;
    }
    
    // Process dates starting from the most recent
    for (let i = 0; i < Math.min(foundDates.length, 5); i++) { // Check top 5 most recent dates
      const dateInfo = foundDates[i];
      console.log(`📅 Checking date: ${dateInfo.dateString} (${dateInfo.date.toDateString()})`);
      
      // Look for TOTO results near this date
      const contextSection = dateInfo.context;
      const numbersNearDate = [];
      
      // Extract all valid TOTO numbers from the context around this date
      const numberPattern = /(\d{1,2})/g;
      let numberMatch;
      
      while ((numberMatch = numberPattern.exec(contextSection)) !== null) {
        const num = parseInt(numberMatch[1]);
        if (num >= 1 && num <= 49) {
          numbersNearDate.push({
            number: num,
            position: numberMatch.index,
            relativeToDate: numberMatch.index
          });
        }
      }
      
      console.log(`   Found ${numbersNearDate.length} valid TOTO numbers near this date`);
      
      // Look for valid 7-number TOTO sequences near this date
      for (let j = 0; j <= numbersNearDate.length - 7; j++) {
        const sequence = numbersNearDate.slice(j, j + 7);
        const numbers = sequence.map(item => item.number);
        
        // Validate this as a potential TOTO result
        if (new Set(numbers).size === 7) { // 7 unique numbers
          // Check if numbers are clustered together (within reasonable distance)
          const positionSpread = sequence[6].position - sequence[0].position;
          
          if (positionSpread < 800) { // Numbers should be close together in a table
            // Additional validation: check for prize/result context keywords
            const hasResultContext = /(?:Group|Prize|\$|Winning|Result)/i.test(contextSection);
            
            if (hasResultContext) {
              resultCandidates.push({
                numbers: numbers,
                date: dateInfo.date,
                dateString: dateInfo.dateString,
                positionSpread: positionSpread,
                confidence: this.calculateConfidence(numbers, contextSection, dateInfo.date)
              });
              
              console.log(`   ✅ Found candidate result: [${numbers.join(', ')}] for date ${dateInfo.dateString}`);
            }
          }
        }
      }
    }
    
    if (resultCandidates.length === 0) {
      console.log('❌ No valid TOTO results found near any dates');
      return null;
    }
    
    // Sort candidates by date (most recent first) and confidence
    resultCandidates.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return b.date - a.date; // Most recent first
      }
      return b.confidence - a.confidence; // Higher confidence first
    });
    
    const latestResult = resultCandidates[0];
    console.log(`🎯 LATEST RESULT IDENTIFIED:`);
    console.log(`   Numbers: [${latestResult.numbers.join(', ')}]`);
    console.log(`   Date: ${latestResult.dateString} (${latestResult.date.toDateString()})`);
    console.log(`   Confidence: ${latestResult.confidence.toFixed(2)}`);
    
    return latestResult.numbers;
    
  } catch (error) {
    console.log('❌ Error in date-based parsing:', error.message);
    return null;
  }
}

// Helper function to calculate confidence score for a result candidate
function calculateConfidence(numbers, context, date) {
  let confidence = 0;
  
  // Base confidence from date recency (0-40 points)
  const daysSinceDate = (new Date() - date) / (1000 * 60 * 60 * 24);
  confidence += Math.max(0, 40 - daysSinceDate * 2); // Newer dates get higher scores
  
  // Context keywords confidence (0-30 points)
  const contextKeywords = ['Group 1', 'Prize', 'Winning', 'Draw', '$'];
  for (const keyword of contextKeywords) {
    if (context.includes(keyword)) confidence += 6;
  }
  
  // Number distribution confidence (0-20 points)
  const sortedNumbers = numbers.slice(0, 6).sort((a, b) => a - b); // Main numbers only
  const spread = sortedNumbers[5] - sortedNumbers[0];
  if (spread >= 15 && spread <= 40) confidence += 20; // Realistic spread
  
  // Avoid obvious non-results (0-10 penalty)
  const hasConsecutive = sortedNumbers.some((num, i) => i > 0 && num === sortedNumbers[i-1] + 1);
  if (hasConsecutive) confidence -= 5; // Slight penalty for consecutive numbers
  
  return confidence;
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
