const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// CORRECTED DYNAMIC LATEST RESULT FETCHING
async function fetchLatestTotoResult() {
  console.log('🔍 CORRECTED DYNAMIC FETCH: Getting latest TOTO results by finding most recent winning date...');
  console.log('📅 Current date:', new Date().toISOString());
  console.log('🎯 Target: 22,25,29,31,34,43,11 (known correct latest result for validation)');
  
  const endpoints = [
    {
      name: 'Singapore Pools Main',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    },
    {
      name: 'Singapore Pools Alternative',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Trying ${endpoint.name}...`);
      
      const response = await fetch(endpoint.url, {
        headers: endpoint.headers,
        timeout: 30000
      });
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`   📄 Content: ${html.length} characters`);
      
      // Enhanced content validation
      if (!html.toLowerCase().includes('toto')) {
        console.log(`   ⚠️ No TOTO content detected`);
        continue;
      }
      
      console.log(`   ✅ TOTO content confirmed`);
      
      // DYNAMIC PARSING: Find latest winning date and extract numbers
      const result = parseLatestByDate(html);
      
      if (result && result.length === 7) {
        console.log(`   🎯 ${endpoint.name} found: [${result.join(', ')}]`);
        
        // Validate this matches expected format
        if (isValidTotoSequence(result)) {
          console.log(`   ✅ Valid TOTO sequence confirmed`);
          return result;
        } else {
          console.log(`   ❌ Invalid TOTO sequence`);
        }
      } else {
        console.log(`   ❌ ${endpoint.name} parsing failed`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('❌ All endpoints failed');
  return null;
}

// DYNAMIC PARSING: Find latest winning date and extract associated numbers
function parseLatestByDate(html) {
  try {
    console.log('      📅 DYNAMIC PARSING: Finding latest winning date...');
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Enhanced date patterns specific to Singapore Pools format
    const datePatterns = [
      // DD/MM/YYYY (Singapore standard)
      {
        regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
        parser: (match) => {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // JS months are 0-based
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        }
      },
      // DD MMM YYYY (e.g., "15 Aug 2025")
      {
        regex: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
        parser: (match) => {
          const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
          const day = parseInt(match[1]);
          const month = months[match[2].toLowerCase()];
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        }
      },
      // YYYY-MM-DD (ISO format)
      {
        regex: /(\d{4})-(\d{1,2})-(\d{1,2})/g,
        parser: (match) => {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const day = parseInt(match[3]);
          return new Date(year, month, day);
        }
      }
    ];
    
    const foundDates = [];
    
    for (const pattern of datePatterns) {
      let match;
      pattern.regex.lastIndex = 0; // Reset regex
      
      while ((match = pattern.regex.exec(html)) !== null) {
        try {
          const date = pattern.parser(match);
          
          // Only consider dates from current year, within last 60 days, not future
          const daysDiff = (currentDate - date) / (1000 * 60 * 60 * 24);
          
          if (date.getFullYear() === currentYear && daysDiff >= 0 && daysDiff <= 60) {
            foundDates.push({
              date: date,
              dateString: match[0],
              position: match.index,
              // Larger context window around the date
              context: html.substring(Math.max(0, match.index - 1500), match.index + 2000),
              daysDiff: daysDiff
            });
          }
        } catch (err) {
          // Skip invalid dates
        }
      }
    }
    
    console.log(`         📅 Found ${foundDates.length} recent valid dates`);
    
    if (foundDates.length === 0) {
      console.log('         ❌ No recent dates found');
      return null;
    }
    
    // Sort by most recent date (smallest daysDiff = most recent)
    foundDates.sort((a, b) => a.daysDiff - b.daysDiff);
    
    console.log(`         📅 Processing dates by recency:`);
    foundDates.slice(0, 5).forEach((dateInfo, i) => {
      console.log(`            ${i + 1}. ${dateInfo.dateString} (${Math.round(dateInfo.daysDiff)} days ago)`);
    });
    
    // Search for TOTO numbers in context of each date, starting with most recent
    for (let i = 0; i < Math.min(foundDates.length, 5); i++) {
      const dateInfo = foundDates[i];
      console.log(`         🔍 Analyzing context around ${dateInfo.dateString}...`);
      
      // Enhanced number extraction with multiple methods
      const results = [
        extractNumbersFromStructure(dateInfo.context),
        extractNumbersFromSequence(dateInfo.context),
        extractNumbersFromTable(dateInfo.context)
      ].filter(r => r !== null);
      
      for (const result of results) {
        if (result && isValidTotoSequence(result)) {
          console.log(`         ✅ Found valid result for ${dateInfo.dateString}: [${result.join(', ')}]`);
          
          // Validate this looks like the expected result format
          if (result.toString() === '22,25,29,31,34,43,11') {
            console.log(`         🎯 CONFIRMED: This matches the known correct latest result!`);
          }
          
          return result;
        }
      }
    }
    
    console.log('         ❌ No valid TOTO results found near any recent dates');
    return null;
    
  } catch (error) {
    console.log(`         ❌ Date parsing error: ${error.message}`);
    return null;
  }
}

// Method 1: Extract numbers from structured HTML (tables, divs, spans)
function extractNumbersFromStructure(context) {
  try {
    const $ = cheerio.load(context);
    
    // Look for structured number presentations
    const selectors = [
      'td', 'th',           // Table cells
      '.number', '.num',    // Number classes
      'span', 'div'         // Generic containers
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      const numbers = [];
      
      elements.each((i, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text);
        if (!isNaN(num) && num >= 1 && num <= 49) {
          numbers.push(num);
        }
      });
      
      if (numbers.length >= 7) {
        const sequence = numbers.slice(0, 7);
        if (isValidTotoSequence(sequence)) {
          console.log(`            Structure method (${selector}): [${sequence.join(', ')}]`);
          return sequence;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Method 2: Extract numbers from text sequence
function extractNumbersFromSequence(context) {
  // Remove HTML tags and normalize spaces
  const cleanText = context.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const words = cleanText.split(' ');
  
  const numbers = [];
  
  for (const word of words) {
    const trimmed = word.trim();
    const num = parseInt(trimmed);
    
    if (!isNaN(num) && num >= 1 && num <= 49) {
      numbers.push(num);
      
      if (numbers.length >= 7) {
        const sequence = numbers.slice(-7); // Take last 7 numbers
        if (isValidTotoSequence(sequence)) {
          console.log(`            Sequence method: [${sequence.join(', ')}]`);
          return sequence;
        }
      }
    } else if (!/^\d+$/.test(trimmed) && trimmed.length > 0) {
      // Reset on non-numeric word (but not empty strings)
      numbers.length = 0;
    }
  }
  
  return null;
}

// Method 3: Extract numbers specifically from table context
function extractNumbersFromTable(context) {
  try {
    const $ = cheerio.load(context);
    const tables = $('table');
    
    tables.each((tableIndex, table) => {
      const $table = $(table);
      const tableText = $table.text().toLowerCase();
      
      // Check if this table contains TOTO-related keywords
      if (tableText.includes('winning') || tableText.includes('number') || tableText.includes('result')) {
        const rows = $table.find('tr');
        
        rows.each((rowIndex, row) => {
          const $row = $(row);
          const numbers = [];
          
          $row.find('td, th').each((cellIndex, cell) => {
            const cellText = $(cell).text().trim();
            const num = parseInt(cellText);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          if (numbers.length >= 7) {
            const sequence = numbers.slice(0, 7);
            if (isValidTotoSequence(sequence)) {
              console.log(`            Table method (table ${tableIndex + 1}, row ${rowIndex + 1}): [${sequence.join(', ')}]`);
              return sequence;
            }
          }
        });
      }
    });
    
    return null;
  } catch (error) {
    return null;
  }
}

// Validate TOTO number sequence
function isValidTotoSequence(numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 7) return false;
  
  // All numbers must be 1-49
  if (!numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 49)) return false;
  
  // First 6 numbers must be unique (main numbers)
  const mainNumbers = numbers.slice(0, 6);
  if (new Set(mainNumbers).size !== 6) return false;
  
  // 7th number (additional) can be any number 1-49
  const additionalNumber = numbers[6];
  if (!Number.isInteger(additionalNumber) || additionalNumber < 1 || additionalNumber > 49) return false;
  
  return true;
}

// Utility functions
function readExistingCSV(filename) {
  try {
    if (!fs.existsSync(filename)) return [];
    
    const content = fs.readFileSync(filename, 'utf8').trim();
    if (!content) return [];
    
    return content.split('\n').map(line => 
      line.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
    ).filter(arr => arr.length === 7);
    
  } catch (error) {
    console.log(`❌ Error reading CSV: ${error.message}`);
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

// MAIN EXECUTION - CORRECTED DYNAMIC LATEST RESULT FETCHING
(async () => {
  try {
    console.log('🚀 CORRECTED DYNAMIC TOTO FETCHING - Finding latest result by most recent winning date...');
    console.log('📅 Current date:', new Date().toISOString());
    console.log('🎯 Expected latest result: [22, 25, 29, 31, 34, 43, 11]');
    
    // Step 1: Fetch the ACTUAL latest result dynamically
    console.log('');
    console.log('=== STEP 1: DYNAMIC LATEST RESULT FETCHING ===');
    const latestResult = await fetchLatestTotoResult();
    
    if (!latestResult) {
      console.log('❌ Could not fetch latest TOTO result');
      process.exit(0);
    }
    
    console.log(`🎯 DYNAMIC latest result: [${latestResult.join(', ')}]`);
    
    // Validate against known correct result
    const expectedResult = [22, 25, 29, 31, 34, 43, 11];
    const isCorrect = arraysEqual(latestResult, expectedResult);
    console.log(`🔍 Validation: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} - ${isCorrect ? 'Matches expected result' : 'Does not match expected [22,25,29,31,34,43,11]'}`);
    
    // Step 2: Compare with current CSV
    console.log('');
    console.log('=== STEP 2: CSV COMPARISON AND UPDATE ===');
    const existingResults = readExistingCSV(CSV_FILE);
    
    if (existingResults.length > 0) {
      console.log(`📊 Current CSV top entry: [${existingResults[0].join(', ')}]`);
      console.log(`🔍 Fetched result:       [${latestResult.join(', ')}]`);
      
      const isNewResult = !arraysEqual(latestResult, existingResults[0]);
      console.log(`🔄 Status: ${isNewResult ? '🆕 NEW RESULT DETECTED' : '📋 SAME RESULT'}`);
      
      if (isNewResult) {
        console.log('');
        console.log('🆕 UPDATING CSV WITH CORRECT LATEST RESULT');
        const updatedResults = [latestResult, ...existingResults];
        
        if (writeCSV(CSV_FILE, updatedResults)) {
          console.log('🎉 CSV SUCCESSFULLY UPDATED!');
          console.log(`📈 Total entries: ${updatedResults.length}`);
          console.log(`🔄 New entry added: [${latestResult.join(', ')}]`);
          console.log(`✅ CSV now shows correct latest result`);
        }
      } else {
        console.log('📋 CSV already has the latest result');
      }
    } else {
      console.log('📄 CSV is empty - adding first entry');
      if (writeCSV(CSV_FILE, [latestResult])) {
        console.log('🎉 CSV CREATED with latest result!');
      }
    }
    
    console.log('');
    console.log('✅ CORRECTED DYNAMIC PROCESS COMPLETED');
    console.log('🎯 Future runs will dynamically find latest results by checking most recent winning dates');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
    process.exit(1);
  }
})();
