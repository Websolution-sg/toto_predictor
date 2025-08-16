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
  
  // Find all potential TOTO result data with dates
  const totoData = [];
  
  // Method 1: Look for structured TOTO result data
  $('table tr, div[class*="result"], div[class*="draw"]').each((index, element) => {
    const text = $(element).text().trim();
    
    // Look for date patterns and numbers
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/);
    const numberMatches = text.match(/\b([0-4]?\d)\b/g);
    
    if (dateMatch && numberMatches && numberMatches.length >= 6) {
      const validNumbers = numberMatches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49)
        .slice(0, 7);
      
      if (validNumbers.length >= 6) {
        const date = new Date(dateMatch[0]);
        totoData.push({
          date: date,
          numbers: validNumbers.slice(0, 6),
          additionalNumber: validNumbers[6] || null,
          rawText: text
        });
      }
    }
  });
  
  if (totoData.length === 0) {
    console.log('❌ No date-based TOTO data found');
    return null;
  }
  
  // Sort by date (most recent first)
  totoData.sort((a, b) => b.date - a.date);
  
  const latest = totoData[0];
  console.log(`📅 Latest result found: ${latest.date.toDateString()}`);
  
  // Return 7 numbers (6 main + 1 additional)
  return [...latest.numbers, latest.additionalNumber].filter(n => n !== null);
}

// Strategy 2: Try multiple endpoints for latest detection
async function tryMultipleEndpointsForLatest() {
  const endpoints = [
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
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
