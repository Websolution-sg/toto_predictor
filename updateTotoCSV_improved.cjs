const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// IMPROVED LATEST RESULT FETCHING - Focus on actual latest results
async function fetchActualLatestTotoResult() {
  console.log('🔍 IMPROVED FETCH: Getting the ACTUAL latest TOTO results...');
  console.log('📅 Current date:', new Date().toISOString());
  
  // Enhanced endpoints with better parsing
  const endpoints = [
    {
      name: 'Singapore Pools Main',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
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
      
      // Try multiple parsing methods for this endpoint
      const results = [
        parseByLatestDate(html),
        parseByTableStructure(html),
        parseByFirstValidSequence(html)
      ].filter(r => r !== null);
      
      if (results.length > 0) {
        // Show all found results for comparison
        console.log(`   🎯 Found ${results.length} potential results:`);
        results.forEach((result, i) => {
          console.log(`      ${i + 1}. [${result.join(', ')}]`);
        });
        
        // Return the first valid result (most likely to be latest)
        return results[0];
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('❌ All endpoints failed');
  return null;
}

// Method 1: Parse by finding the latest date and numbers near it
function parseByLatestDate(html) {
  try {
    console.log('      📅 Method 1: Latest date parsing...');
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Enhanced date patterns for Singapore format
    const datePatterns = [
      // DD/MM/YYYY
      {
        regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
        parser: (match) => new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
      },
      // DD MMM YYYY (16 Aug 2025)
      {
        regex: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
        parser: (match) => {
          const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
          return new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
        }
      },
      // YYYY-MM-DD
      {
        regex: /(\d{4})-(\d{1,2})-(\d{1,2})/g,
        parser: (match) => new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
      }
    ];
    
    const foundDates = [];
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.regex.exec(html)) !== null) {
        try {
          const date = pattern.parser(match);
          
          // Only consider recent dates (within last 30 days and not future)
          const daysDiff = (currentDate - date) / (1000 * 60 * 60 * 24);
          
          if (date.getFullYear() === currentYear && daysDiff >= 0 && daysDiff <= 30) {
            foundDates.push({
              date: date,
              dateString: match[0],
              position: match.index,
              context: html.substring(Math.max(0, match.index - 800), match.index + 1200)
            });
          }
        } catch (err) {
          // Skip invalid dates
        }
      }
    }
    
    if (foundDates.length === 0) {
      console.log('         ❌ No recent dates found');
      return null;
    }
    
    // Sort by most recent date
    foundDates.sort((a, b) => b.date - a.date);
    
    console.log(`         📅 Found ${foundDates.length} recent dates, latest: ${foundDates[0].dateString}`);
    
    // Look for TOTO numbers in context around the most recent date
    const latestContext = foundDates[0].context;
    const result = extractTotoSequence(latestContext);
    
    if (result) {
      console.log(`         ✅ Found result near latest date: [${result.join(', ')}]`);
      return result;
    }
    
    console.log('         ❌ No valid sequence found near latest date');
    return null;
    
  } catch (error) {
    console.log(`         ❌ Date parsing error: ${error.message}`);
    return null;
  }
}

// Method 2: Parse HTML table structure
function parseByTableStructure(html) {
  try {
    console.log('      📊 Method 2: Table structure parsing...');
    
    const $ = cheerio.load(html);
    const tables = $('table');
    
    console.log(`         📊 Found ${tables.length} tables`);
    
    for (let i = 0; i < tables.length; i++) {
      const table = $(tables[i]);
      const tableText = table.text().toLowerCase();
      
      // Check if this table is TOTO-related
      if (tableText.includes('toto') || tableText.includes('winning') || tableText.includes('result')) {
        console.log(`         📊 Table ${i + 1} contains TOTO content`);
        
        const rows = table.find('tr');
        
        // Check first few rows for the latest result
        for (let j = 0; j < Math.min(rows.length, 5); j++) {
          const row = $(rows[j]);
          const numbers = [];
          
          row.find('td, th').each((index, cell) => {
            const cellText = $(cell).text().trim();
            const num = parseInt(cellText);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          if (numbers.length >= 7) {
            const result = numbers.slice(0, 7);
            if (isValidTotoSequence(result)) {
              console.log(`         ✅ Found in table ${i + 1}, row ${j + 1}: [${result.join(', ')}]`);
              return result;
            }
          }
        }
      }
    }
    
    console.log('         ❌ No valid results in tables');
    return null;
    
  } catch (error) {
    console.log(`         ❌ Table parsing error: ${error.message}`);
    return null;
  }
}

// Method 3: Find first valid 7-number sequence in the entire content
function parseByFirstValidSequence(html) {
  try {
    console.log('      🔍 Method 3: First valid sequence parsing...');
    
    // Remove HTML tags and clean text
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    const result = extractTotoSequence(cleanText);
    
    if (result) {
      console.log(`         ✅ Found first valid sequence: [${result.join(', ')}]`);
      return result;
    }
    
    console.log('         ❌ No valid sequence found');
    return null;
    
  } catch (error) {
    console.log(`         ❌ Sequence parsing error: ${error.message}`);
    return null;
  }
}

// Helper function to extract TOTO sequence from text
function extractTotoSequence(text) {
  const numbers = [];
  const words = text.split(/\s+/);
  
  for (const word of words) {
    const num = parseInt(word);
    if (!isNaN(num) && num >= 1 && num <= 49) {
      numbers.push(num);
      
      // Check if we have enough numbers for a potential TOTO result
      if (numbers.length >= 7) {
        // Take the last 7 numbers and validate
        const sequence = numbers.slice(-7);
        if (isValidTotoSequence(sequence)) {
          return sequence;
        }
      }
    } else if (!/^\d+$/.test(word)) {
      // Reset on non-numeric word
      numbers.length = 0;
    }
  }
  
  return null;
}

// Validate TOTO number sequence
function isValidTotoSequence(numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 7) return false;
  
  // All numbers must be 1-49
  if (!numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 49)) return false;
  
  // First 6 numbers must be unique
  const mainNumbers = numbers.slice(0, 6);
  if (new Set(mainNumbers).size !== 6) return false;
  
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

// MAIN EXECUTION - Improved latest result fetching
(async () => {
  try {
    console.log('🚀 IMPROVED TOTO FETCHING - Getting ACTUAL latest results...');
    console.log('📅 Current date:', new Date().toISOString());
    
    // Step 1: Fetch the ACTUAL latest result
    console.log('');
    console.log('=== STEP 1: FETCHING ACTUAL LATEST RESULT ===');
    const latestResult = await fetchActualLatestTotoResult();
    
    if (!latestResult) {
      console.log('❌ Could not fetch latest TOTO result');
      process.exit(0);
    }
    
    console.log(`🎯 ACTUAL latest result: [${latestResult.join(', ')}]`);
    
    // Step 2: Compare with current CSV
    console.log('');
    console.log('=== STEP 2: COMPARISON WITH CURRENT CSV ===');
    const existingResults = readExistingCSV(CSV_FILE);
    
    if (existingResults.length > 0) {
      console.log(`📊 Current CSV top entry: [${existingResults[0].join(', ')}]`);
      console.log(`🔍 Fetched result:       [${latestResult.join(', ')}]`);
      
      const isNewResult = !arraysEqual(latestResult, existingResults[0]);
      console.log(`🔄 Comparison: ${isNewResult ? '🆕 NEW RESULT' : '📋 SAME RESULT'}`);
      
      if (isNewResult) {
        console.log('');
        console.log('🆕 NEW RESULT DETECTED - UPDATING CSV');
        const updatedResults = [latestResult, ...existingResults];
        
        if (writeCSV(CSV_FILE, updatedResults)) {
          console.log('🎉 CSV SUCCESSFULLY UPDATED!');
          console.log(`📈 Total entries: ${updatedResults.length}`);
          console.log(`🔄 New entry added: [${latestResult.join(', ')}]`);
        }
      } else {
        console.log('📋 CSV UNCHANGED - Result is the same');
      }
    } else {
      console.log('📄 CSV is empty - adding first entry');
      if (writeCSV(CSV_FILE, [latestResult])) {
        console.log('🎉 CSV CREATED with first entry!');
      }
    }
    
    console.log('');
    console.log('✅ IMPROVED PROCESS COMPLETED');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
    process.exit(1);
  }
})();
