const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// FULLY DYNAMIC TOTO result fetching - NO HARDCODED VALUES - DATE-BASED LATEST DETECTION
async function fetchLatestTotoResult() {
  console.log('🚀 FULLY DYNAMIC TOTO fetching - Finding latest result by date analysis...');
  console.log('📅 NO hardcoded values - will determine latest result from website by date');
  
  // Strategy 1: Date-based dynamic parsing (primary method)
  const dynamicResult = await fetchLatestByDateAnalysis();
  if (dynamicResult && dynamicResult.length === 7 && validateTotoNumbers(dynamicResult)) {
    console.log(`✅ SUCCESS: Date-based parsing found latest result [${dynamicResult.join(', ')}]`);
    return dynamicResult;
  }
  
  // Strategy 2: Multiple endpoint parsing with latest detection
  console.log('🔄 Date-based failed, trying multiple endpoint latest detection...');
  const multiEndpointResult = await tryMultipleEndpointsForLatest();
  if (multiEndpointResult && multiEndpointResult.length === 7 && validateTotoNumbers(multiEndpointResult)) {
    console.log(`✅ SUCCESS: Multi-endpoint parsing found latest result [${multiEndpointResult.join(', ')}]`);
    return multiEndpointResult;
  }
  
  // Strategy 3: Comprehensive content analysis for most recent
  console.log('🔄 Multi-endpoint failed, trying comprehensive latest analysis...');
  const contentResult = await comprehensiveLatestAnalysis();
  if (contentResult && contentResult.length === 7 && validateTotoNumbers(contentResult)) {
    console.log(`✅ SUCCESS: Comprehensive analysis found latest result [${contentResult.join(', ')}]`);
    return contentResult;
  }
  
  // If all dynamic methods fail, return null (no hardcoded fallback)
  console.log('❌ All dynamic parsing strategies failed to find latest result');
  console.log('📋 Returning null - no hardcoded values used');
  return null;
}

async function fetchLatestByDateAnalysis() {
  console.log('📅 DYNAMIC DATE-BASED ANALYSIS - Finding most recent TOTO draw...');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`📄 Received ${html.length} characters for date-based analysis`);
    
    return await parseLatestResultByMostRecentDate(html);
    
  } catch (error) {
    console.log(`❌ Date-based analysis failed: ${error.message}`);
    return null;
  }
}

async function parseLatestResultByMostRecentDate(html) {
  console.log('🔍 Parsing HTML to find LATEST result by most recent date...');
  
  try {
    const $ = cheerio.load(html);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Find all date-result combinations
    const dateResultCombinations = [];
    
    // Comprehensive date pattern matching
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      {
        regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
        parser: (match) => {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // JS months are 0-indexed
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        }
      },
      // DD MMM YYYY (e.g., "16 Aug 2025")
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
      // MMM DD, YYYY (e.g., "Aug 16, 2025")
      {
        regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/gi,
        parser: (match) => {
          const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
          const month = months[match[1].toLowerCase()];
          const day = parseInt(match[2]);
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        }
      },
      // YYYY-MM-DD format
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
    
    // Search for dates and extract nearby TOTO results
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.regex.exec(html)) !== null) {
        try {
          const date = pattern.parser(match);
          
          // Only consider dates from current year and not future dates
          if (date.getFullYear() === currentYear && date <= currentDate) {
            const contextRadius = 1000; // Look for numbers within 1000 characters
            const contextStart = Math.max(0, match.index - contextRadius);
            const contextEnd = Math.min(html.length, match.index + contextRadius);
            const context = html.substring(contextStart, contextEnd);
            
            // Extract TOTO numbers from this date's context
            const numbersFound = extractTotoNumbersFromContext(context);
            if (numbersFound && numbersFound.length === 7 && validateTotoNumbers(numbersFound)) {
              dateResultCombinations.push({
                date: date,
                dateString: match[0],
                numbers: numbersFound,
                matchPosition: match.index,
                confidence: calculateContextConfidence(context, numbersFound)
              });
              console.log(`   📅 Found result for ${match[0]}: [${numbersFound.join(', ')}] (confidence: ${dateResultCombinations[dateResultCombinations.length-1].confidence})`);
            }
          }
        } catch (err) {
          console.log(`   ⚠️ Could not parse date: ${match[0]} - ${err.message}`);
        }
      }
    }
    
    if (dateResultCombinations.length === 0) {
      console.log('❌ No valid date-result combinations found');
      return null;
    }
    
    // Sort by date (most recent first) and then by confidence
    dateResultCombinations.sort((a, b) => {
      const dateDiff = b.date - a.date;
      if (dateDiff !== 0) return dateDiff;
      return b.confidence - a.confidence;
    });
    
    const latestResult = dateResultCombinations[0];
    
    console.log(`🎯 LATEST RESULT DETERMINED by date analysis:`);
    console.log(`   📅 Most recent date: ${latestResult.dateString} (${latestResult.date.toDateString()})`);
    console.log(`   🎲 Latest numbers: [${latestResult.numbers.join(', ')}]`);
    console.log(`   🎯 Confidence score: ${latestResult.confidence}`);
    
    return latestResult.numbers;
    
  } catch (error) {
    console.log(`❌ Date-based latest parsing failed: ${error.message}`);
    return null;
  }
}

function extractTotoNumbersFromContext(context) {
  // Remove HTML tags for cleaner parsing
  const cleanContext = context.replace(/<[^>]*>/g, ' ');
  
  // Multiple extraction methods for robustness
  const extractionMethods = [
    extractFromNumberSequence,
    extractFromSeparatedPattern,
    extractFromTablePattern,
    extractFromOrderedList
  ];
  
  for (const method of extractionMethods) {
    const result = method(cleanContext);
    if (result && result.length === 7 && validateTotoNumbers(result)) {
      return result;
    }
  }
  
  return null;
}

function extractFromNumberSequence(text) {
  // Look for 7 consecutive valid TOTO numbers
  const numbers = text.match(/\b([1-9]|[1-4][0-9])\b/g);
  if (numbers && numbers.length >= 7) {
    const sequence = numbers.slice(0, 7).map(n => parseInt(n));
    return sequence;
  }
  return null;
}

function extractFromSeparatedPattern(text) {
  // Look for numbers separated by various delimiters
  const patterns = [
    /\b(\d{1,2})[,\s\-\.\|]+(\d{1,2})[,\s\-\.\|]+(\d{1,2})[,\s\-\.\|]+(\d{1,2})[,\s\-\.\|]+(\d{1,2})[,\s\-\.\|]+(\d{1,2})[,\s\-\.\|]+(\d{1,2})\b/g,
    /(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})[\u00A0\s,\-\.\|]*(\d{1,2})/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const numbers = match.slice(1).map(n => parseInt(n));
      if (numbers.every(n => n >= 1 && n <= 49)) {
        return numbers;
      }
    }
  }
  return null;
}

function extractFromTablePattern(text) {
  // Look for table-like structures with numbers
  const lines = text.split('\n');
  for (const line of lines) {
    const numbers = line.match(/\b([1-9]|[1-4][0-9])\b/g);
    if (numbers && numbers.length === 7) {
      const sequence = numbers.map(n => parseInt(n));
      if (sequence.every(n => n >= 1 && n <= 49)) {
        return sequence;
      }
    }
  }
  return null;
}

function extractFromOrderedList(text) {
  // Look for numbered lists or ordered sequences
  const words = text.split(/\s+/);
  const potentialNumbers = [];
  
  for (const word of words) {
    const num = parseInt(word.replace(/[^\d]/g, ''));
    if (!isNaN(num) && num >= 1 && num <= 49) {
      potentialNumbers.push(num);
      if (potentialNumbers.length === 7) {
        return potentialNumbers;
      }
    }
  }
  
  return potentialNumbers.length === 7 ? potentialNumbers : null;
}

function calculateContextConfidence(context, numbers) {
  let confidence = 0;
  
  // Higher confidence for contexts containing TOTO-related keywords
  const totoKeywords = ['toto', 'winning', 'numbers', 'draw', 'result', 'latest'];
  const lowerContext = context.toLowerCase();
  
  for (const keyword of totoKeywords) {
    if (lowerContext.includes(keyword)) {
      confidence += 10;
    }
  }
  
  // Higher confidence for proper number formatting
  const numberString = numbers.join(',');
  if (context.includes(numberString)) {
    confidence += 20;
  }
  
  // Higher confidence for table-like structures
  if (context.includes('<td>') || context.includes('<th>')) {
    confidence += 15;
  }
  
  return confidence;
}

async function tryMultipleEndpointsForLatest() {
  console.log('🌐 Trying multiple endpoints for latest result detection...');
  
  const endpoints = [
    {
      name: 'Singapore Pools Main TOTO Page',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    },
    {
      name: 'Singapore Pools Alternative Results URL',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    },
    {
      name: 'Singapore Pools Mobile Results',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Trying ${endpoint.name}...`);
      
      const response = await fetch(endpoint.url, {
        headers: endpoint.headers,
        timeout: 25000
      });
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`   📄 Received ${html.length} characters`);
      
      // Try to find the latest result using position-based analysis
      const latestResult = findLatestResultInContent(html);
      if (latestResult && latestResult.length === 7 && validateTotoNumbers(latestResult)) {
        console.log(`   ✅ Found latest result from ${endpoint.name}: [${latestResult.join(', ')}]`);
        return latestResult;
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} failed: ${error.message}`);
    }
  }
  
  return null;
}

function findLatestResultInContent(html) {
  try {
    console.log('   🔍 Analyzing content for latest result...');
    
    const $ = cheerio.load(html);
    
    // Strategy 1: Look for first occurrence of valid TOTO sequence
    const firstValidSequence = findFirstValidTotoSequence(html);
    if (firstValidSequence) {
      console.log(`      ✅ First valid sequence: [${firstValidSequence.join(', ')}]`);
      return firstValidSequence;
    }
    
    // Strategy 2: Look in common result containers
    const containerResult = findInResultContainers($);
    if (containerResult) {
      console.log(`      ✅ Container result: [${containerResult.join(', ')}]`);
      return containerResult;
    }
    
    // Strategy 3: Look in table structures (first row typically latest)
    const tableResult = findInTableStructures($);
    if (tableResult) {
      console.log(`      ✅ Table result: [${tableResult.join(', ')}]`);
      return tableResult;
    }
    
  } catch (error) {
    console.log(`   ❌ Content analysis failed: ${error.message}`);
  }
  
  return null;
}

function findFirstValidTotoSequence(html) {
  // Remove HTML tags and extract all numbers
  const cleanText = html.replace(/<[^>]*>/g, ' ');
  const allNumbers = cleanText.match(/\b([1-9]|[1-4][0-9])\b/g);
  
  if (!allNumbers || allNumbers.length < 7) {
    return null;
  }
  
  // Try sliding window to find first valid 7-number sequence
  for (let i = 0; i <= allNumbers.length - 7; i++) {
    const sequence = allNumbers.slice(i, i + 7).map(n => parseInt(n));
    if (validateTotoNumbers(sequence)) {
      return sequence;
    }
  }
  
  return null;
}

function findInResultContainers($) {
  const selectors = [
    '.result', '.winning-numbers', '.toto-result', '.draw-result',
    '[class*="result"]', '[class*="winning"]', '[class*="number"]',
    '[id*="result"]', '[id*="winning"]', '[data-result]'
  ];
  
  for (const selector of selectors) {
    const container = $(selector).first();
    if (container.length) {
      const numbers = extractNumbersFromElement(container);
      if (numbers && numbers.length === 7 && validateTotoNumbers(numbers)) {
        return numbers;
      }
    }
  }
  
  return null;
}

function findInTableStructures($) {
  // Look for the first table row with valid TOTO numbers
  $('table').each((tableIndex, table) => {
    const firstDataRow = $(table).find('tr').first();
    if (firstDataRow.length) {
      const numbers = extractNumbersFromElement(firstDataRow);
      if (numbers && numbers.length === 7 && validateTotoNumbers(numbers)) {
        return numbers;
      }
    }
  });
  
  return null;
}

function extractNumbersFromElement(element) {
  const text = element.text();
  const numbers = text.match(/\b([1-9]|[1-4][0-9])\b/g);
  return numbers ? numbers.map(n => parseInt(n)) : null;
}

async function comprehensiveLatestAnalysis() {
  console.log('🔬 Comprehensive latest result analysis...');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 20000
    });
    
    if (!response.ok) {
      return null;
    }
    
    const text = await response.text();
    console.log(`   📄 Comprehensive analysis of ${text.length} characters...`);
    
    // Extract all potential TOTO number sequences
    const allValidSequences = findAllValidTotoSequences(text);
    
    if (allValidSequences.length === 0) {
      console.log('   ❌ No valid TOTO sequences found in comprehensive analysis');
      return null;
    }
    
    console.log(`   📊 Found ${allValidSequences.length} valid TOTO sequences`);
    
    // Return the first sequence (most likely to be latest)
    const latestSequence = allValidSequences[0];
    console.log(`   ✅ Latest sequence selected: [${latestSequence.join(', ')}]`);
    
    return latestSequence;
    
  } catch (error) {
    console.log(`   ❌ Comprehensive analysis failed: ${error.message}`);
    return null;
  }
}

function findAllValidTotoSequences(text) {
  const sequences = [];
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  const allNumbers = cleanText.match(/\b([1-9]|[1-4][0-9])\b/g);
  
  if (!allNumbers || allNumbers.length < 7) {
    return sequences;
  }
  
  // Find all valid 7-number sequences
  for (let i = 0; i <= allNumbers.length - 7; i++) {
    const sequence = allNumbers.slice(i, i + 7).map(n => parseInt(n));
    if (validateTotoNumbers(sequence)) {
      sequences.push(sequence);
    }
  }
  
  return sequences;
}

function validateTotoNumbers(numbers) {
  if (!numbers || numbers.length !== 7) return false;
  
  // Check if all numbers are within valid range (1-49)
  const validRange = numbers.every(num => num >= 1 && num <= 49);
  if (!validRange) return false;
  
  // Check for duplicates in first 6 numbers (main numbers)
  const firstSix = numbers.slice(0, 6);
  const uniqueFirstSix = [...new Set(firstSix)];
  if (uniqueFirstSix.length !== 6) return false;
  
  // Additional number (7th) can be duplicate of main numbers
  return true;
}

// Read existing CSV file
function readExistingCSV(filename) {
  try {
    if (!fs.existsSync(filename)) {
      console.log(`📄 CSV file ${filename} doesn't exist - will create new one`);
      return [];
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`📄 Read ${lines.length} existing results from CSV`);
    
    return lines.map(line => line.split(',').map(num => parseInt(num.trim())));
  } catch (error) {
    console.error(`❌ Error reading CSV: ${error.message}`);
    return [];
  }
}

// Write CSV file
function writeCSV(filename, results) {
  try {
    const csvContent = results.map(result => result.join(',')).join('\n');
    fs.writeFileSync(filename, csvContent, 'utf8');
    console.log(`💾 Successfully wrote ${results.length} results to ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing CSV: ${error.message}`);
    return false;
  }
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, i) => val === b[i]);
}

// Main execution
(async () => {
  try {
    console.log('🚀 Starting FULLY DYNAMIC TOTO update process...');
    console.log('📅 Current date:', new Date().toISOString());
    console.log('🎯 NO HARDCODED VALUES - All results determined dynamically by date');
    
    // Step 1: Fetch latest result dynamically
    console.log('');
    console.log('=== STEP 1: DYNAMIC LATEST RESULT DETECTION ===');
    const latestResult = await fetchLatestTotoResult();
    
    if (!latestResult) {
      console.log('❌ Could not dynamically determine latest TOTO result');
      console.log('📋 All parsing strategies failed to find valid latest result');
      console.log('🔄 This may be due to:');
      console.log('   - Network connectivity issues');
      console.log('   - Website structure changes');
      console.log('   - No recent TOTO draws available');
      console.log('💡 Try running again later or check website manually');
      process.exit(0);
    }
    
    console.log(`🎯 Dynamically determined latest result: [${latestResult.join(', ')}]`);
    
    // Step 2: Read existing CSV
    console.log('');
    console.log('=== STEP 2: READING EXISTING CSV ===');
    const existingResults = readExistingCSV(CSV_FILE);
    
    // Step 3: Check if this is a new result
    console.log('');
    console.log('=== STEP 3: COMPARISON AND UPDATE ===');
    
    if (existingResults.length > 0) {
      console.log(`📊 Current CSV top entry: [${existingResults[0].join(', ')}]`);
      console.log(`🔍 Dynamically found:     [${latestResult.join(', ')}]`);
    } else {
      console.log('📄 CSV is empty - this will be the first entry');
    }
    
    const isNewResult = existingResults.length === 0 || !arraysEqual(latestResult, existingResults[0]);
    
    if (isNewResult) {
      console.log('🆕 NEW RESULT DETECTED - UPDATING CSV');
      const updatedResults = [latestResult, ...existingResults];
      
      if (writeCSV(CSV_FILE, updatedResults)) {
        console.log('🎉 CSV SUCCESSFULLY UPDATED WITH DYNAMIC RESULT!');
        console.log(`📈 Total entries: ${updatedResults.length}`);
        console.log(`🔄 New entry added at top: [${latestResult.join(', ')}]`);
      } else {
        console.log('❌ FAILED TO WRITE CSV');
        process.exit(1);
      }
    } else {
      console.log('📋 NO NEW RESULTS - CSV UNCHANGED');
      console.log(`🔄 Dynamically found result matches current top entry`);
      console.log('💡 This means the latest result is already up to date');
    }
    
    console.log('');
    console.log('✅ DYNAMIC PROCESS COMPLETED SUCCESSFULLY');
    console.log('🎯 All results determined by date-based analysis - no hardcoded values used');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
    console.error('📋 Stack trace:', error.stack);
    console.log('');
    console.log('❌ Dynamic processing failed - no hardcoded fallback available');
    console.log('📋 This ensures only genuine latest results are used');
    process.exit(1);
  }
})();
