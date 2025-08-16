const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// Enhanced TOTO result fetching with robust multi-endpoint and multi-strategy approach
async function fetchLatestTotoResult() {
  console.log('🔍 Fetching latest TOTO results with ENHANCED robust multi-strategy approach...');
  
  // Multiple endpoints with different strategies for maximum reliability
  const endpoints = [
    {
      name: 'Singapore Pools Main TOTO Page',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      strategy: 'date-based-primary'
    },
    {
      name: 'Singapore Pools Alternative URL',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      strategy: 'table-structure-based'
    },
    {
      name: 'Singapore Pools Mobile View',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      strategy: 'content-pattern-based'
    },
    {
      name: 'Singapore Pools Direct Results API',
      url: 'https://www.singaporepools.com.sg/api/toto/results',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json,text/plain,*/*',
        'Content-Type': 'application/json',
        'Referer': 'https://www.singaporepools.com.sg/'
      },
      strategy: 'json-api-based'
    }
  ];
  
  // Enhanced retry logic with progressive backoff
  const maxRetries = 3;
  const results = [];
  
  for (const endpoint of endpoints) {
    let retryCount = 0;
    let success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        const delay = retryCount * 2000; // Progressive delay: 0s, 2s, 4s
        if (retryCount > 0) {
          console.log(`🔄 Retry ${retryCount}/${maxRetries - 1} for ${endpoint.name} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        console.log(`🌐 Attempting ${endpoint.name} (Strategy: ${endpoint.strategy})...`);
        
        const response = await fetch(endpoint.url, {
          headers: endpoint.headers,
          timeout: 45000, // Increased timeout
          follow: 10, // More redirects allowed
          compress: true,
          agent: false // Disable agent pooling for better reliability
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        let content;
        
        if (contentType.includes('application/json')) {
          content = await response.json();
          console.log(`📦 ${endpoint.name} - JSON received:`, JSON.stringify(content).substring(0, 200) + '...');
        } else {
          content = await response.text();
          console.log(`📄 ${endpoint.name} - HTML received: ${content.length} characters`);
        }
        
        // Enhanced content validation
        const hasValidContent = endpoint.strategy === 'json-api-based' 
          ? validateJsonContent(content)
          : validateHtmlContent(content);
        
        if (!hasValidContent) {
          throw new Error('Content validation failed - no TOTO data detected');
        }
        
        console.log(`✅ ${endpoint.name} - Content validated, parsing with ${endpoint.strategy}...`);
        
        // Parse using strategy-specific method
        const result = await parseWithStrategy(content, endpoint.strategy);
        
        if (result && result.length === 7 && validateTotoNumbers(result)) {
          console.log(`🎉 ${endpoint.name} SUCCESS: [${result.join(', ')}]`);
          results.push({
            source: endpoint.name,
            strategy: endpoint.strategy,
            numbers: result,
            confidence: calculateEndpointConfidence(result, content, endpoint.strategy)
          });
          success = true;
        } else {
          throw new Error(`Parsing failed or invalid result: ${result ? result.join(',') : 'null'}`);
        }
        
      } catch (error) {
        retryCount++;
        console.log(`❌ ${endpoint.name} attempt ${retryCount} failed: ${error.message}`);
        
        if (error.code === 'ENOTFOUND') {
          console.log('   🌐 DNS resolution failed - network connectivity issue');
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          console.log('   ⏰ Request timed out - server may be slow');
        } else if (error.message.includes('HTTP 4') || error.message.includes('HTTP 5')) {
          console.log('   🚫 Server error - may be temporary');
        }
        
        if (retryCount >= maxRetries) {
          console.log(`   💀 ${endpoint.name} - All ${maxRetries} attempts failed`);
        }
      }
    }
  }
  
  // Analyze and return the best result
  if (results.length === 0) {
    console.log('❌ ALL ENDPOINTS FAILED - No valid TOTO result obtained');
    console.log('🔍 This could indicate:');
    console.log('   • Network connectivity issues');
    console.log('   • Singapore Pools website structure changes');
    console.log('   • Temporary server maintenance');
    console.log('   • Content blocking or rate limiting');
    return null;
  }
  
  // Sort results by confidence score
  results.sort((a, b) => b.confidence - a.confidence);
  
  console.log(`🎯 BEST RESULT ANALYSIS (${results.length} successful fetches):`);
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.source} (${result.strategy}): [${result.numbers.join(', ')}] - Confidence: ${result.confidence.toFixed(1)}`);
  });
  
  const bestResult = results[0];
  console.log(`🏆 SELECTED RESULT: [${bestResult.numbers.join(', ')}] from ${bestResult.source}`);
  
  // Cross-validation: if multiple results, check for consensus
  if (results.length > 1) {
    const consensusResults = results.filter(r => 
      arraysEqual(r.numbers, bestResult.numbers)
    );
    
    console.log(`🔄 Cross-validation: ${consensusResults.length}/${results.length} sources agree`);
    
    if (consensusResults.length < results.length * 0.5) {
      console.log(`⚠️ WARNING: Low consensus detected. Results may be inconsistent.`);
    }
  }
  
  return bestResult.numbers;
}

// Enhanced content validation functions
function validateHtmlContent(html) {
  const htmlLower = html.toLowerCase();
  const requiredKeywords = ['toto', 'winning', 'result', 'draw'];
  const foundKeywords = requiredKeywords.filter(keyword => htmlLower.includes(keyword));
  
  console.log(`🔍 HTML validation: Found ${foundKeywords.length}/${requiredKeywords.length} required keywords: [${foundKeywords.join(', ')}]`);
  
  // Must have at least 2 of the 4 required keywords
  const isValid = foundKeywords.length >= 2 && html.length > 1000;
  
  if (!isValid) {
    console.log(`❌ HTML validation failed: Insufficient keywords (${foundKeywords.length}/4) or content too short (${html.length} chars)`);
  }
  
  return isValid;
}

function validateJsonContent(jsonData) {
  try {
    if (!jsonData) return false;
    
    const jsonStr = JSON.stringify(jsonData).toLowerCase();
    const hasRelevantData = jsonStr.includes('toto') || 
                           jsonStr.includes('result') || 
                           jsonStr.includes('draw') ||
                           jsonStr.includes('winning');
    
    console.log(`🔍 JSON validation: Contains TOTO data: ${hasRelevantData}`);
    return hasRelevantData;
  } catch (error) {
    console.log(`❌ JSON validation error: ${error.message}`);
    return false;
  }
}

function validateTotoNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 7) {
    console.log(`❌ Number validation failed: Wrong array length (${numbers ? numbers.length : 0})`);
    return false;
  }
  
  // Check if all numbers are valid TOTO numbers (1-49)
  const validNumbers = numbers.every(num => Number.isInteger(num) && num >= 1 && num <= 49);
  if (!validNumbers) {
    console.log(`❌ Number validation failed: Invalid number range in [${numbers.join(', ')}]`);
    return false;
  }
  
  // Check for duplicates in the main 6 numbers
  const mainNumbers = numbers.slice(0, 6);
  const uniqueMainNumbers = new Set(mainNumbers);
  if (uniqueMainNumbers.size !== 6) {
    console.log(`❌ Number validation failed: Duplicate numbers in main 6: [${mainNumbers.join(', ')}]`);
    return false;
  }
  
  // Additional number (7th) can be same as main numbers
  console.log(`✅ Number validation passed: [${numbers.join(', ')}]`);
  return true;
}

// Strategy-specific parsing methods
async function parseWithStrategy(content, strategy) {
  console.log(`🔄 Parsing with strategy: ${strategy}`);
  
  switch (strategy) {
    case 'date-based-primary':
      return parseDirectSingaporePools(content);
    
    case 'table-structure-based':
      return parseTableStructure(content);
    
    case 'content-pattern-based':
      return parseContentPatterns(content);
    
    case 'json-api-based':
      return parseJsonApi(content);
    
    default:
      console.log(`⚠️ Unknown strategy: ${strategy}, falling back to date-based parsing`);
      return parseDirectSingaporePools(content);
  }
}

// Enhanced table structure parsing
function parseTableStructure(html) {
  try {
    console.log('🔍 Parsing with TABLE STRUCTURE strategy...');
    const $ = cheerio.load(html);
    
    // Look for table structures containing TOTO results
    const tables = $('table');
    console.log(`   Found ${tables.length} tables to analyze`);
    
    for (let i = 0; i < tables.length; i++) {
      const table = $(tables[i]);
      const tableText = table.text().toLowerCase();
      
      // Check if this table contains TOTO-related content
      if (tableText.includes('toto') || tableText.includes('winning') || tableText.includes('result')) {
        console.log(`   🎯 Table ${i + 1} contains TOTO content, analyzing...`);
        
        // Extract all numbers from this table
        const rows = table.find('tr');
        for (let j = 0; j < rows.length; j++) {
          const row = $(rows[j]);
          const cells = row.find('td, th');
          const numbers = [];
          
          cells.each((index, cell) => {
            const cellText = $(cell).text().trim();
            const num = parseInt(cellText);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          // Check if we found a valid 7-number sequence
          if (numbers.length >= 7) {
            const result = numbers.slice(0, 7);
            console.log(`   ✅ Found potential result in table ${i + 1}, row ${j + 1}: [${result.join(', ')}]`);
            
            if (validateTotoNumbers(result)) {
              return result;
            }
          }
        }
      }
    }
    
    console.log('   ❌ No valid results found in table structures');
    return null;
    
  } catch (error) {
    console.log(`❌ Table structure parsing error: ${error.message}`);
    return null;
  }
}

// Enhanced content pattern parsing
function parseContentPatterns(html) {
  try {
    console.log('🔍 Parsing with CONTENT PATTERN strategy...');
    
    // Look for common patterns in TOTO result presentation
    const patterns = [
      // Pattern 1: Numbers separated by spaces/commas in a line
      /(?:winning|result|numbers?)[\s\S]*?(?:(\d{1,2})\s*[,\s]\s*(\d{1,2})\s*[,\s]\s*(\d{1,2})\s*[,\s]\s*(\d{1,2})\s*[,\s]\s*(\d{1,2})\s*[,\s]\s*(\d{1,2})\s*[,\s]\s*(\d{1,2}))/gi,
      
      // Pattern 2: Numbers in spans or divs
      /<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>\s*<(?:span|div)[^>]*>(\d{1,2})<\/(?:span|div)>/gi,
      
      // Pattern 3: Numbers in a specific container class
      /<[^>]*class[^>]*(?:number|result|winning)[^>]*>[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?<\/[^>]*>/gi
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      console.log(`   🔍 Trying pattern ${i + 1}...`);
      const matches = [...html.matchAll(patterns[i])];
      
      for (const match of matches) {
        if (match.length >= 8) { // 7 numbers + full match
          const numbers = match.slice(1, 8).map(n => parseInt(n)).filter(n => !isNaN(n));
          
          if (numbers.length === 7 && validateTotoNumbers(numbers)) {
            console.log(`   ✅ Pattern ${i + 1} found valid result: [${numbers.join(', ')}]`);
            return numbers;
          }
        }
      }
    }
    
    console.log('   ❌ No valid results found with content patterns');
    return null;
    
  } catch (error) {
    console.log(`❌ Content pattern parsing error: ${error.message}`);
    return null;
  }
}

// JSON API parsing
function parseJsonApi(jsonData) {
  try {
    console.log('🔍 Parsing with JSON API strategy...');
    
    // Handle different JSON response structures
    if (Array.isArray(jsonData)) {
      console.log(`   📦 JSON is array with ${jsonData.length} items`);
      
      // Look for the most recent entry
      for (const item of jsonData) {
        if (item.numbers || item.winning_numbers || item.result) {
          const numbers = item.numbers || item.winning_numbers || item.result;
          
          if (Array.isArray(numbers) && numbers.length >= 7) {
            const result = numbers.slice(0, 7).map(n => parseInt(n));
            
            if (validateTotoNumbers(result)) {
              console.log(`   ✅ JSON API found valid result: [${result.join(', ')}]`);
              return result;
            }
          }
        }
      }
    } else if (typeof jsonData === 'object') {
      console.log('   📦 JSON is object, searching for number arrays...');
      
      // Recursively search for number arrays in the object
      const findNumbers = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (Array.isArray(value) && value.length >= 7) {
            const numbers = value.slice(0, 7).map(n => parseInt(n)).filter(n => !isNaN(n));
            
            if (numbers.length === 7 && validateTotoNumbers(numbers)) {
              console.log(`   ✅ JSON API found valid result at ${currentPath}: [${numbers.join(', ')}]`);
              return numbers;
            }
          } else if (typeof value === 'object' && value !== null) {
            const result = findNumbers(value, currentPath);
            if (result) return result;
          }
        }
        return null;
      };
      
      const result = findNumbers(jsonData);
      if (result) return result;
    }
    
    console.log('   ❌ No valid results found in JSON API response');
    return null;
    
  } catch (error) {
    console.log(`❌ JSON API parsing error: ${error.message}`);
    return null;
  }
}

// Original enhanced date-based parsing (kept as primary strategy)
function parseDirectSingaporePools(html) {
  try {
    console.log('🔍 Parsing Singapore Pools HTML with ENHANCED DATE-BASED latest result detection...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // DATE-BASED APPROACH: Find the most recent draw date and its associated result
    console.log('📅 Searching for draw dates to identify latest result...');
    
    const currentDate = new Date();
    const resultCandidates = [];
    
    // Enhanced date patterns with more comprehensive coverage
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
      },
      // Format: MMM DD, YYYY (e.g., "Aug 16, 2025")
      {
        regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/gi,
        parser: (match) => {
          const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
          return new Date(parseInt(match[3]), months[match[1].toLowerCase()], parseInt(match[2]));
        }
      }
    ];
    
    // Find all dates in the HTML with enhanced context extraction
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
              context: html.substring(Math.max(0, match.index - 500), match.index + 1500) // Larger context window
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
      console.log('❌ No valid dates found - falling back to general number search');
      return fallbackNumberSearch(html);
    }
    
    // Process dates starting from the most recent
    for (let i = 0; i < Math.min(foundDates.length, 5); i++) { // Check top 5 most recent dates
      const dateInfo = foundDates[i];
      console.log(`📅 Checking date: ${dateInfo.dateString} (${dateInfo.date.toDateString()})`);
      
      // Look for TOTO results near this date
      const contextSection = dateInfo.context;
      const numbersNearDate = [];
      
      // Enhanced number extraction with position tracking
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
        
        // Enhanced validation for TOTO results
        if (new Set(numbers.slice(0, 6)).size === 6) { // First 6 numbers must be unique
          // Check if numbers are clustered together (within reasonable distance)
          const positionSpread = sequence[6].position - sequence[0].position;
          
          if (positionSpread < 1200) { // Increased tolerance for number clustering
            // Enhanced validation: check for result context keywords
            const hasResultContext = /(?:Group|Prize|\$|Winning|Result|Draw|TOTO)/i.test(contextSection);
            const hasStructuralContext = /<(?:td|span|div|p)[^>]*>[\s\S]*?<\/(?:td|span|div|p)>/.test(contextSection);
            
            if (hasResultContext || hasStructuralContext) {
              resultCandidates.push({
                numbers: numbers,
                date: dateInfo.date,
                dateString: dateInfo.dateString,
                positionSpread: positionSpread,
                confidence: calculateConfidence(numbers, contextSection, dateInfo.date)
              });
              
              console.log(`   ✅ Found candidate result: [${numbers.join(', ')}] for date ${dateInfo.dateString} (confidence: ${calculateConfidence(numbers, contextSection, dateInfo.date).toFixed(1)})`);
            }
          }
        }
      }
    }
    
    if (resultCandidates.length === 0) {
      console.log('❌ No valid TOTO results found near any dates - trying fallback search');
      return fallbackNumberSearch(html);
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
    console.log('❌ Error in enhanced date-based parsing:', error.message);
    return fallbackNumberSearch(html);
  }
}

// Fallback number search when date-based parsing fails
function fallbackNumberSearch(html) {
  try {
    console.log('🔄 Attempting fallback number search...');
    
    // Remove HTML tags and extract clean text
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    // Look for 7 consecutive valid TOTO numbers
    const numbers = [];
    const words = cleanText.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const num = parseInt(words[i]);
      if (!isNaN(num) && num >= 1 && num <= 49) {
        numbers.push(num);
        
        if (numbers.length === 7) {
          // Check if this could be a valid TOTO result
          const mainNumbers = numbers.slice(0, 6);
          if (new Set(mainNumbers).size === 6) { // No duplicates in main numbers
            console.log(`✅ Fallback search found result: [${numbers.join(', ')}]`);
            return numbers;
          } else {
            numbers.shift(); // Remove first number and continue
          }
        }
      } else {
        numbers.length = 0; // Reset if non-number found
      }
    }
    
    console.log('❌ Fallback search failed to find valid result');
    return null;
    
  } catch (error) {
    console.log(`❌ Fallback search error: ${error.message}`);
    return null;
  }
}

// Enhanced confidence calculation
function calculateConfidence(numbers, context, date) {
  let confidence = 0;
  
  // Base confidence from date recency (0-40 points)
  const daysSinceDate = (new Date() - date) / (1000 * 60 * 60 * 24);
  confidence += Math.max(0, 40 - daysSinceDate * 2); // Newer dates get higher scores
  
  // Enhanced context keywords confidence (0-35 points)
  const contextKeywords = ['Group 1', 'Prize', 'Winning', 'Draw', '$', 'TOTO', 'Result'];
  for (const keyword of contextKeywords) {
    if (context.includes(keyword)) confidence += 5;
  }
  
  // Number distribution confidence (0-25 points)
  const sortedNumbers = numbers.slice(0, 6).sort((a, b) => a - b); // Main numbers only
  const spread = sortedNumbers[5] - sortedNumbers[0];
  if (spread >= 15 && spread <= 40) confidence += 15; // Realistic spread
  if (spread >= 20 && spread <= 35) confidence += 10; // Even better spread
  
  // Number frequency validation (0-10 points)
  const avgNumber = sortedNumbers.reduce((a, b) => a + b, 0) / 6;
  if (avgNumber >= 15 && avgNumber <= 35) confidence += 10; // Good average
  
  // Structural context confidence (0-15 points)
  if (context.includes('<td>') || context.includes('<span>')) confidence += 10; // Table/structured data
  if (context.includes('class=') || context.includes('id=')) confidence += 5; // CSS classes suggest structure
  
  // Penalty for suspicious patterns (0-15 penalty)
  const hasSequential = sortedNumbers.some((num, i) => i > 1 && num === sortedNumbers[i-1] + 1 && num === sortedNumbers[i-2] + 2);
  if (hasSequential) confidence -= 15; // Heavy penalty for 3+ sequential numbers
  
  const hasConsecutive = sortedNumbers.some((num, i) => i > 0 && num === sortedNumbers[i-1] + 1);
  if (hasConsecutive) confidence -= 5; // Light penalty for consecutive numbers
  
  return Math.max(0, confidence); // Ensure non-negative
}

// Enhanced endpoint confidence calculation
function calculateEndpointConfidence(numbers, content, strategy) {
  let confidence = 50; // Base confidence
  
  // Strategy-specific bonuses
  switch (strategy) {
    case 'date-based-primary':
      confidence += 20; // Most reliable strategy
      break;
    case 'table-structure-based':
      confidence += 15; // Good structural reliability
      break;
    case 'json-api-based':
      confidence += 25; // APIs are usually reliable
      break;
    case 'content-pattern-based':
      confidence += 10; // Pattern matching is less reliable
      break;
    default:
      confidence += 5;
  }
  
  // Content quality bonuses
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  if (contentStr.includes('Singapore Pools')) confidence += 10;
  if (contentStr.includes('official')) confidence += 5;
  if (contentStr.includes('winning')) confidence += 5;
  
  // Number quality assessment
  const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
  const spread = mainNumbers[5] - mainNumbers[0];
  if (spread >= 20 && spread <= 35) confidence += 10;
  
  return Math.min(100, confidence); // Cap at 100
}

// Utility functions
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

// Main execution with enhanced error handling
(async () => {
  try {
    console.log('🚀 Starting ENHANCED TOTO update process...');
    console.log('📅 Current date:', new Date().toISOString());
    console.log('🔧 Enhanced features: Multi-strategy parsing, Progressive retry, Cross-validation, Advanced confidence scoring');
    
    // Step 1: Fetch latest result with enhanced robustness
    console.log('');
    console.log('=== STEP 1: ENHANCED FETCHING WITH MULTI-STRATEGY APPROACH ===');
    const latestResult = await fetchLatestTotoResult();
    
    if (!latestResult) {
      console.log('❌ Could not fetch latest TOTO result after trying all strategies');
      console.log('🔄 This may be due to:');
      console.log('   • Network connectivity issues');
      console.log('   • Singapore Pools website maintenance');
      console.log('   • Content structure changes requiring code updates');
      console.log('   • Rate limiting or access restrictions');
      process.exit(0);
    }
    
    console.log(`🎯 Successfully fetched result: [${latestResult.join(', ')}]`);
    
    // Step 2: Read existing CSV
    console.log('');
    console.log('=== STEP 2: READING EXISTING CSV ===');
    const existingResults = readExistingCSV(CSV_FILE);
    
    // Step 3: Check if this is a new result
    console.log('');
    console.log('=== STEP 3: ENHANCED COMPARISON AND UPDATE ===');
    
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
        console.log('🎉 CSV SUCCESSFULLY UPDATED WITH ENHANCED VALIDATION!');
        console.log(`📈 Total entries: ${updatedResults.length}`);
        console.log(`🔄 New entry added at top: [${latestResult.join(', ')}]`);
        console.log(`🛡️ Result validated through multiple strategies and confidence scoring`);
      } else {
        console.log('❌ FAILED TO WRITE CSV');
        process.exit(1);
      }
    } else {
      console.log('📋 NO NEW RESULTS - CSV UNCHANGED');
      console.log(`🔄 Latest result matches current top entry`);
      console.log('💡 This is normal if no new TOTO draw has occurred');
      console.log('✅ Enhanced validation confirms result consistency');
    }
    
    console.log('');
    console.log('✅ ENHANCED PROCESS COMPLETED SUCCESSFULLY');
    console.log('🚀 All strategies, validations, and robustness features executed');
    
  } catch (error) {
    console.error('💥 FATAL ERROR in enhanced process:', error.message);
    console.error('📋 Stack trace:', error.stack);
    console.log('');
    console.log('🔧 Enhanced error handling suggestions:');
    console.log('   • Check network connectivity');
    console.log('   • Verify Singapore Pools website accessibility');  
    console.log('   • Review parsing strategies for website changes');
    console.log('   • Check file system permissions for CSV operations');
    process.exit(1);
  }
})();
