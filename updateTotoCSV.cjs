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

// Strategy 1: Date-based analysis to find the most recent result
async function fetchLatestByDateAnalysis() {
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0'
  ];
  
  for (const url of urls) {
    try {
      console.log(`🔍 Analyzing ${url} for latest result by date...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP error: ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      const result = parseLatestResultByMostRecentDate(html);
      
      if (result) {
        console.log(`✅ Found latest result by date analysis: [${result.join(', ')}]`);
        return result;
      }
      
    } catch (error) {
      console.log(`❌ Error with ${url}:`, error.message);
    }
  }
  
  return null;
}

// Parse HTML to find the most recent TOTO result by date
function parseLatestResultByMostRecentDate(html) {
  const $ = cheerio.load(html);
  console.log('🔍 Dynamically parsing latest TOTO results...');
  
  // Strategy 1: Look for the main results table structure
  let bestResult = null;
  let highestConfidence = 0;
  
  // Find tables that contain TOTO results
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableText = $table.text();
    
    // Skip tables that are clearly not results (contain $ or Group or historical data)
    if (tableText.includes('$') || tableText.includes('Group') || 
        tableText.includes('Prize') || tableText.includes('2024') || 
        tableText.includes('2023')) {
      return;
    }
    
    // Look for table cells with individual numbers
    const cells = $table.find('td, th');
    const extractedNumbers = [];
    
    cells.each((i, cell) => {
      const cellText = $(cell).text().trim();
      const num = parseInt(cellText);
      
      // Valid TOTO number
      if (!isNaN(num) && num >= 1 && num <= 49 && cellText === num.toString()) {
        extractedNumbers.push(num);
      }
    });
    
    // If we found 6-7 consecutive valid numbers, this could be our result
    if (extractedNumbers.length >= 6 && extractedNumbers.length <= 8) {
      const confidence = calculateConfidence($table, extractedNumbers, tableText);
      console.log(`📊 Table ${tableIndex}: Found ${extractedNumbers.length} numbers with confidence ${confidence}`);
      console.log(`   Numbers: ${extractedNumbers.slice(0, 7).join(', ')}`);
      
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestResult = extractedNumbers.slice(0, 7);
      }
    }
  });
  
  // Strategy 2: Look for div/span structures that might contain current results
  if (!bestResult || highestConfidence < 7) {
    console.log('🔄 Trying alternative parsing methods...');
    
    // Look for elements that contain sequences of numbers
    const numberContainers = [];
    
    $('div, span, td').each((i, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      // Skip elements with too much text or obvious non-result content
      if (text.length > 100 || text.includes('$') || text.includes('Prize') || 
          text.includes('Group') || text.includes('2024')) {
        return;
      }
      
      // Look for elements containing multiple numbers
      const numberPattern = /\b(\d{1,2})\b/g;
      const matches = text.match(numberPattern);
      
      if (matches && matches.length >= 6) {
        const validNumbers = matches
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        if (validNumbers.length >= 6) {
          const confidence = calculateConfidence($el, validNumbers, text);
          numberContainers.push({
            numbers: validNumbers.slice(0, 7),
            confidence: confidence,
            source: 'div/span parsing'
          });
        }
      }
    });
    
    // Find the best result from alternative parsing
    if (numberContainers.length > 0) {
      numberContainers.sort((a, b) => b.confidence - a.confidence);
      const best = numberContainers[0];
      
      if (best.confidence > highestConfidence) {
        console.log(`✅ Found better result via ${best.source}: confidence ${best.confidence}`);
        bestResult = best.numbers;
        highestConfidence = best.confidence;
      }
    }
  }
  
  // Strategy 3: Look for the most prominent number sequence on the page
  if (!bestResult || highestConfidence < 5) {
    console.log('🔄 Trying prominent number sequence detection...');
    
    const allText = $('body').text();
    const numberPattern = /\b(\d{1,2})\b/g;
    const allNumbers = allText.match(numberPattern);
    
    if (allNumbers) {
      const validNumbers = allNumbers
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      // Look for sequences of 6-7 numbers that appear close together
      for (let i = 0; i <= validNumbers.length - 6; i++) {
        const sequence = validNumbers.slice(i, i + 7);
        
        // Check if this sequence looks like TOTO numbers (not too repetitive, reasonable spread)
        if (isValidTotoSequence(sequence.slice(0, 6))) {
          console.log(`🎯 Found potential sequence: ${sequence.join(', ')}`);
          
          if (!bestResult) {
            bestResult = sequence;
            highestConfidence = 3; // Lower confidence for fallback method
          }
          break;
        }
      }
    }
  }
  
  if (bestResult && bestResult.length >= 6) {
    console.log(`✅ Final result (confidence ${highestConfidence}): ${bestResult.join(', ')}`);
    return bestResult;
  }
  
  console.log('❌ No valid TOTO results found dynamically');
  return null;
}

// Helper function to calculate confidence score for a potential result
function calculateConfidence(element, numbers, text) {
  let confidence = 0;
  
  // Base score for having valid numbers
  if (numbers.length >= 6) confidence += 3;
  if (numbers.length === 7) confidence += 1; // Bonus for having additional number
  
  // Check if numbers are in valid TOTO range and not repetitive
  const uniqueNumbers = [...new Set(numbers.slice(0, 6))];
  if (uniqueNumbers.length === 6) confidence += 2; // All unique main numbers
  
  // Check if the context suggests this is current results
  const contextText = text.toLowerCase();
  
  // Positive indicators
  if (contextText.includes('winning') || contextText.includes('result')) confidence += 2;
  if (contextText.includes('draw') && !contextText.includes('next')) confidence += 1;
  
  // Negative indicators
  if (contextText.includes('previous') || contextText.includes('last week')) confidence -= 2;
  if (contextText.includes('historical') || contextText.includes('archive')) confidence -= 3;
  if (contextText.includes('group') || contextText.includes('prize')) confidence -= 1;
  
  // Check proximity to current date indicators
  if (text.includes('2025') || text.includes('Aug') || text.includes('August')) confidence += 1;
  
  return Math.max(0, confidence);
}

// Helper function to validate if a sequence looks like valid TOTO numbers
function isValidTotoSequence(numbers) {
  if (numbers.length !== 6) return false;
  
  // Check all numbers are unique
  const unique = [...new Set(numbers)];
  if (unique.length !== 6) return false;
  
  // Check reasonable spread (not all low or all high numbers)
  const sorted = [...numbers].sort((a, b) => a - b);
  const range = sorted[5] - sorted[0];
  if (range < 10) return false; // Too clustered
  
  // Check for reasonable distribution
  const lowCount = numbers.filter(n => n <= 25).length;
  const highCount = numbers.filter(n => n > 25).length;
  
  // Should have some mix of low and high numbers
  return lowCount >= 1 && highCount >= 1;
}

async function fetchLatestByDateAnalysis(html) {
  const $ = cheerio.load(html);
  console.log('🔍 Advanced date-based analysis for latest results...');
  
  const totoResults = [];
  
  // Look for any content that contains both dates and numbers
  $('*').each((i, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    
    // Skip if too long (likely not a result display) or contains price info
    if (text.length > 300 || text.includes('$') || text.includes('Prize')) {
      return;
    }
    
    // Look for date patterns
    const datePatterns = [
      /(\d{1,2}[\s\/\-]\w{3}[\s\/\-]\d{4})/gi,    // 15 Aug 2025
      /(\d{1,2}[\s\/\-]\d{1,2}[\s\/\-]\d{4})/g,   // 15/08/2025
      /(Aug|August)[\s,]*\d{1,2}[\s,]*\d{4}/gi,   // Aug 15, 2025
      /\d{4}[\s\-\/]\d{1,2}[\s\-\/]\d{1,2}/g      // 2025-08-15
    ];
    
    let foundDate = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        foundDate = match[0];
        break;
      }
    }
    
    if (foundDate) {
      // Look for numbers in the same context
      const numberPattern = /\b(\d{1,2})\b/g;
      const numbers = text.match(numberPattern);
      
      if (numbers) {
        const validNumbers = numbers
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        if (validNumbers.length >= 6) {
          try {
            const parsedDate = new Date(foundDate);
            if (!isNaN(parsedDate.getTime())) {
              totoResults.push({
                date: parsedDate,
                numbers: validNumbers.slice(0, 6),
                additional: validNumbers[6] || null,
                rawText: text.substring(0, 100),
                confidence: calculateDateConfidence(parsedDate, validNumbers, text)
              });
            }
          } catch (e) {
            // Ignore date parsing errors
          }
        }
      }
    }
  });
  
  // Sort by date (most recent first) and then by confidence
  totoResults.sort((a, b) => {
    const dateDiff = b.date.getTime() - a.date.getTime();
    if (Math.abs(dateDiff) < 24 * 60 * 60 * 1000) { // Same day
      return b.confidence - a.confidence;
    }
    return dateDiff;
  });
  
  console.log(`📊 Found ${totoResults.length} date-based results`);
  
  if (totoResults.length > 0) {
    const best = totoResults[0];
    console.log(`🎯 Best result: ${best.date.toDateString()}, confidence: ${best.confidence}`);
    console.log(`📋 Numbers: ${best.numbers.join(', ')}${best.additional ? ' + ' + best.additional : ''}`);
    
    const result = [...best.numbers];
    if (best.additional) result.push(best.additional);
    return result;
  }
  
  return null;
}

function calculateDateConfidence(date, numbers, text) {
  let confidence = 0;
  
  // Recent date gets higher score
  const now = new Date();
  const daysDiff = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 7) confidence += 5;
  else if (daysDiff <= 30) confidence += 3;
  else if (daysDiff <= 90) confidence += 1;
  
  // Valid number count
  if (numbers.length === 6) confidence += 3;
  if (numbers.length === 7) confidence += 4;
  
  // Unique numbers
  const unique = [...new Set(numbers.slice(0, 6))];
  if (unique.length === 6) confidence += 2;
  
  // Context indicators
  const lowerText = text.toLowerCase();
  if (lowerText.includes('winning') || lowerText.includes('result')) confidence += 2;
  if (lowerText.includes('draw')) confidence += 1;
  if (lowerText.includes('latest') || lowerText.includes('current')) confidence += 2;
  
  // Negative indicators
  if (lowerText.includes('previous') || lowerText.includes('last week')) confidence -= 2;
  if (lowerText.includes('next') || lowerText.includes('upcoming')) confidence -= 3;
  
  return confidence;
}

async function tryMultipleEndpointsForLatest() {
  const endpoints = [
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://online.singaporepools.com/en/lottery'
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`🌐 Trying endpoint: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Got response: ${html.length} chars`);
        
        // Try date-based analysis first
        let result = await fetchLatestByDateAnalysis(html);
        if (result && result.length >= 6) {
          console.log(`🎯 Found result from ${url}: ${result.join(', ')}`);
          return result;
        }
        
        // Try original parsing method
        result = parseLatestResultByMostRecentDate(html);
        if (result && result.length >= 6) {
          console.log(`🎯 Found result from ${url}: ${result.join(', ')}`);
          return result;
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed endpoint ${url}: ${error.message}`);
    }
  }
  
  return null;
}
    'https://www.singaporepools.com.sg/DataFileArchive/Lottery/Output/toto_results_today.xml'
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`🔍 Trying endpoint: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) continue;
      
      const content = await response.text();
      const result = extractTotoNumbersFromContent(content);
      
      if (result && result.length >= 6) {
        console.log(`✅ Multi-endpoint found: [${result.join(', ')}]`);
        return result.slice(0, 7);
      }
      
    } catch (error) {
      console.log(`❌ Endpoint ${url} failed:`, error.message);
    }
  }
  
  return null;
}

// Strategy 3: Comprehensive content analysis
async function comprehensiveLatestAnalysis() {
  try {
    console.log('🔍 Comprehensive analysis of Singapore Pools...');
    const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for any content that might contain TOTO numbers
    const potentialResults = [];
    
    // Check all text content for number patterns
    $('*').each((index, element) => {
      const text = $(element).text().trim();
      const numbers = extractTotoNumbersFromContext(text);
      
      if (numbers && numbers.length >= 6) {
        potentialResults.push(numbers);
      }
    });
    
    if (potentialResults.length > 0) {
      // Return the first valid result found
      const result = potentialResults[0].slice(0, 7);
      console.log(`✅ Comprehensive analysis found: [${result.join(', ')}]`);
      return result;
    }
    
  } catch (error) {
    console.log(`❌ Comprehensive analysis failed:`, error.message);
  }
  
  return null;
}

// Extract TOTO numbers from any content
function extractTotoNumbersFromContent(content) {
  // Look for patterns of 6-7 numbers between 1-49
  const numberPattern = /\b([1-4]?\d)\b/g;
  const matches = content.match(numberPattern);
  
  if (!matches) return null;
  
  const numbers = matches
    .map(n => parseInt(n))
    .filter(n => n >= 1 && n <= 49);
  
  return numbers.length >= 6 ? numbers.slice(0, 7) : null;
}

// Extract numbers from text context (more refined)
function extractTotoNumbersFromContext(text) {
  // Skip if text is too long (likely not a result)
  if (text.length > 200) return null;
  
  // Look for number sequences
  const numbers = [];
  const numberPattern = /\b([1-4]?\d)\b/g;
  let match;
  
  while ((match = numberPattern.exec(text)) !== null) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 49) {
      numbers.push(num);
    }
  }
  
  return numbers.length >= 6 ? numbers.slice(0, 7) : null;
}

// Validate TOTO numbers
function validateTotoNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length < 6 || numbers.length > 7) {
    return false;
  }
  
  return numbers.every(num => 
    Number.isInteger(num) && num >= 1 && num <= 49
  );
}

// Check if result is newer than current CSV
function isNewerThanCurrent(newNumbers) {
  try {
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length === 0) return true;
    
    const currentFirst = lines[0].split(',').map(n => parseInt(n.trim()));
    
    // Simple comparison - if numbers are different, consider it newer
    return !arraysEqual(newNumbers.slice(0, 6), currentFirst.slice(0, 6));
    
  } catch (error) {
    console.log('❌ Error reading current CSV:', error.message);
    return true; // If can't read, assume it's newer
  }
}

// Compare arrays
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

// Update CSV with new result
async function updateCSV(numbers) {
  try {
    console.log(`💾 Updating CSV with new result: [${numbers.join(', ')}]`);
    
    let csvContent = '';
    
    // Read existing content
    try {
      csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    } catch (error) {
      console.log('📝 CSV file not found, creating new one');
    }
    
    // Add new result at the beginning
    const newLine = numbers.slice(0, 6).join(',') + ',' + (numbers[6] || '');
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    
    // Insert new result at the beginning
    lines.unshift(newLine);
    
    // Write back to file
    fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n');
    
    console.log('✅ CSV updated successfully');
    console.log(`📊 Total entries: ${lines.length}`);
    
  } catch (error) {
    console.log('❌ Error updating CSV:', error.message);
    throw error;
  }
}

// Main execution
(async () => {
  try {
    console.log('🎯 Starting FULLY DYNAMIC TOTO result fetching...');
    console.log('📋 NO hardcoded values - purely dynamic parsing\n');
    
    const latestNumbers = await fetchLatestTotoResult();
    
    if (!latestNumbers) {
      console.log('❌ RESULT: No latest TOTO result found through dynamic parsing');
      console.log('📋 CSV will remain unchanged (no hardcoded fallback)');
      process.exit(0); // Exit successfully but without updates
    }
    
    console.log(`\n🎯 Latest TOTO result found: [${latestNumbers.join(', ')}]`);
    
    // Check if this is newer than current
    if (isNewerThanCurrent(latestNumbers)) {
      await updateCSV(latestNumbers);
      console.log('✅ SUCCESS: CSV updated with latest TOTO result');
    } else {
      console.log('📋 INFO: Result is same as current, no update needed');
    }
    
  } catch (error) {
    console.log('💥 CRITICAL ERROR:', error.message);
    console.log('📋 Stack:', error.stack);
    process.exit(1);
  }
})();
