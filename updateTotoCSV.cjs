const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// FULLY DYNAMIC TOTO result fetching - NO HARDCODED VALUES - DATE-BASED LATEST DETECTION
async function fetchLatestTotoResult() {
  console.log('🚀 FULLY DYNAMIC TOTO fetching - Finding latest result by date analysis...');
  console.log('📅 NO hardcoded values - will determine latest result from website by date');
  console.log('🎯 Expected format: Latest TOTO winning numbers');
  
  // Strategy 1: Enhanced date-based dynamic parsing (primary method)
  const dynamicResult = await fetchLatestByDateAnalysis();
  if (dynamicResult && dynamicResult.length === 7 && validateTotoNumbers(dynamicResult)) {
    console.log(`✅ SUCCESS: Date-based parsing found latest result [${dynamicResult.join(', ')}]`);
    return dynamicResult;
  }
  
  // Strategy 2: Latest result pattern matching
  console.log('🔄 Date-based failed, trying latest result pattern matching...');
  const patternResult = await fetchLatestByPatternMatching();
  if (patternResult && patternResult.length === 7 && validateTotoNumbers(patternResult)) {
    console.log(`✅ SUCCESS: Pattern matching found latest result [${patternResult.join(', ')}]`);
    return patternResult;
  }
  
  // Strategy 3: Multiple endpoint parsing with latest detection
  console.log('🔄 Pattern matching failed, trying multiple endpoint latest detection...');
  const multiEndpointResult = await tryMultipleEndpointsForLatest();
  if (multiEndpointResult && multiEndpointResult.length === 7 && validateTotoNumbers(multiEndpointResult)) {
    console.log(`✅ SUCCESS: Multi-endpoint parsing found latest result [${multiEndpointResult.join(', ')}]`);
    return multiEndpointResult;
  }
  
  // Strategy 4: Comprehensive content analysis for most recent
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
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.status !== 200) {
        console.log(`❌ HTTP error: ${response.status}`);
        continue;
      }
      
      const html = response.data;
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
  console.log('🔍 ENHANCED DYNAMIC PARSING - Latest TOTO results detection...');
  
  let bestResult = null;
  let highestConfidence = 0;
  const allCandidates = [];
  
  // Strategy 1: Enhanced table parsing with current date awareness
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableHTML = $table.html();
    const tableText = $table.text();
    
    console.log(`🔍 Analyzing table ${tableIndex}...`);
    
    // Skip obviously irrelevant tables
    if (tableText.includes('Group I') || tableText.includes('Group II') || 
        tableText.includes('$') || tableText.includes('Prize') ||
        tableText.includes('Starter') || tableText.includes('Consolation')) {
      console.log(`   ⏭️ Skipped - contains prize/group info`);
      return;
    }
    
    // Look for current date indicators (dynamic based on current date)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });
    const currentMonthFull = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    const hasCurrentDate = tableText.includes(currentYear) || 
                          tableText.includes(currentMonth) || 
                          tableText.includes(currentMonthFull) ||
                          tableText.includes(currentDate.getDate().toString());
    
    if (hasCurrentDate) {
      console.log(`   📅 Table contains current date indicators`);
    }
    
    // Enhanced number extraction - look for various formats
    const numbers = [];
    
    // Method 1: Individual cell parsing
    $table.find('td, th').each((i, cell) => {
      const cellText = $(cell).text().trim();
      
      // Look for single or double digit numbers in valid TOTO range
      const numberMatch = cellText.match(/^\s*(\d{1,2})\s*$/);
      if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        if (num >= 1 && num <= 49) {
          numbers.push({
            value: num,
            position: i,
            text: cellText,
            method: 'cell'
          });
        }
      }
    });
    
    // Method 2: Row-based parsing (for tab-separated or space-separated numbers)
    $table.find('tr').each((rowIndex, row) => {
      const $row = $(row);
      const rowText = $row.text().trim();
      
      // Look for number patterns in various formats (space/tab separated)
      const spacePattern = /(\d{1,2})[\s\t]+(\d{1,2})[\s\t]+(\d{1,2})[\s\t]+(\d{1,2})[\s\t]+(\d{1,2})[\s\t]+(\d{1,2})[\s\t]*(\d{1,2})?/;
      const spaceMatch = rowText.match(spacePattern);
      
      if (spaceMatch) {
        const rowNumbers = spaceMatch.slice(1, 8)
          .filter(n => n !== undefined)
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        if (rowNumbers.length >= 6) {
          console.log(`   🎯 Found row pattern: [${rowNumbers.join(',')}]`);
          rowNumbers.forEach((num, idx) => {
            numbers.push({
              value: num,
              position: idx,
              text: num.toString(),
              method: 'row-pattern'
            });
          });
        }
      }
    });
    
    // Method 3: Look for specific number sequences in table HTML
    const htmlNumberPattern = /<[^>]*>(\d{1,2})<\/[^>]*>/g;
    let htmlMatch;
    while ((htmlMatch = htmlNumberPattern.exec(tableHTML)) !== null) {
      const num = parseInt(htmlMatch[1]);
      if (num >= 1 && num <= 49) {
        numbers.push({
          value: num,
          position: numbers.length,
          text: htmlMatch[1],
          method: 'html-tag'
        });
      }
    }
    
    console.log(`   🔢 Found ${numbers.length} valid numbers in table`);
    
    // Look for sequences of 6-7 consecutive numbers
    if (numbers.length >= 6) {
      // Remove duplicates while preserving order
      const uniqueNumbers = [];
      const seen = new Set();
      
      numbers.forEach(numObj => {
        if (!seen.has(numObj.value)) {
          uniqueNumbers.push(numObj);
          seen.add(numObj.value);
        }
      });
      
      for (let start = 0; start <= uniqueNumbers.length - 6; start++) {
        const sequence = uniqueNumbers.slice(start, start + 7).map(n => n.value);
        const mainNumbers = sequence.slice(0, 6);
        
        // Validate main numbers are unique
        if (new Set(mainNumbers).size === 6) {
          let confidence = 5; // Base confidence
          
          if (hasCurrentDate) confidence += 3;
          if (sequence.length === 7) confidence += 2; // Has additional number
          if (start === 0) confidence += 1; // First sequence in table
          
          // Bonus for row-pattern method (better for tab-separated format)
          const methods = uniqueNumbers.slice(start, start + 7).map(n => n.method);
          if (methods.includes('row-pattern')) confidence += 3;
          
          // Check if numbers look like a real TOTO draw
          const sorted = [...mainNumbers].sort((a, b) => a - b);
          const range = sorted[5] - sorted[0];
          if (range >= 15 && range <= 45) confidence += 2; // Good spread
          
          allCandidates.push({
            numbers: sequence,
            confidence: confidence,
            source: `table-${tableIndex}`,
            hasDate: hasCurrentDate,
            methods: methods
          });
          
          console.log(`   ✅ Candidate: [${sequence.join(',')}] confidence: ${confidence} methods: ${methods.join(',')}`);
        }
      }
    }
  });
  
  // Strategy 2: Enhanced div/span parsing for modern layouts
  console.log('🔄 Checking div/span elements for number sequences...');
  
  $('div, span, p, td').each((i, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    
    // Skip long text blocks
    if (text.length > 300) return;
    
    // Enhanced pattern matching for various number formats
    const patterns = [
      // Tab-separated format pattern
      /(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]*(\d{1,2})?/,
      // Comma-separated format pattern
      /(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),?\s*(\d{1,2})?/,
      // Space-separated format pattern
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s*(\d{1,2})?/
    ];
    
    patterns.forEach((pattern, patternIndex) => {
      const match = text.match(pattern);
      if (match) {
        const validNumbers = match.slice(1, 8)
          .filter(n => n !== undefined && n !== '')
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        if (validNumbers.length >= 6) {
          const mainNumbers = validNumbers.slice(0, 6);
          
          // Check uniqueness
          if (new Set(mainNumbers).size === 6) {
            let confidence = 4; // Base confidence for div/span
            
            // Check context clues
            const lowerText = text.toLowerCase();
            if (lowerText.includes('winning') || lowerText.includes('result')) confidence += 2;
            if (lowerText.includes('draw')) confidence += 1;
            
            // Dynamic date checking
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear().toString();
            const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });
            if (text.includes(currentYear) || text.includes(currentMonth)) confidence += 2;
            
            // Bonus for tab-separated pattern (pattern 0)
            if (patternIndex === 0) confidence += 2;
            
            const sequence = validNumbers.slice(0, 7);
            allCandidates.push({
              numbers: sequence,
              confidence: confidence,
              source: 'div-span',
              pattern: `pattern-${patternIndex}`,
              text: text.substring(0, 50) + '...'
            });
            
            console.log(`   📋 Div/span candidate: [${sequence.join(',')}] confidence: ${confidence} pattern: ${patternIndex}`);
          }
        }
      }
    });
  });
  
  // Find the best candidate
  if (allCandidates.length > 0) {
    // Sort by confidence, then by having current date indicators
    allCandidates.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.hasDate !== b.hasDate) return a.hasDate ? -1 : 1;
      return 0;
    });
    
    console.log('\n📊 ALL CANDIDATES:');
    allCandidates.slice(0, 5).forEach((candidate, i) => {
      console.log(`   ${i + 1}. [${candidate.numbers.join(',')}] - confidence: ${candidate.confidence} - source: ${candidate.source}`);
    });
    
    bestResult = allCandidates[0].numbers;
    highestConfidence = allCandidates[0].confidence;
    
    // If we only have 6 numbers, try to find the additional number
    if (bestResult.length === 6) {
      console.log(`\n🔍 Searching for additional number (7th number)...`);
      const additionalNumber = findAdditionalNumber($, bestResult);
      if (additionalNumber) {
        console.log(`   ✅ Found additional number: ${additionalNumber}`);
        bestResult.push(additionalNumber);
        highestConfidence += 2; // Boost confidence for complete result
      } else {
        console.log(`   ❌ Additional number not found`);
      }
    }
    
    console.log(`\n✅ SELECTED RESULT: [${bestResult.join(',')}] with confidence ${highestConfidence}`);
    return bestResult;
  }
  
  console.log('❌ No valid TOTO results found in any parsing strategy');
  return null;
}

// Helper function to find the additional number (7th number) when we have 6 main numbers
function findAdditionalNumber($, mainNumbers) {
  console.log(`   🔍 Looking for additional number separate from main numbers: [${mainNumbers.join(',')}]`);
  
  // Strategy 1: Look for "Additional Number" text context
  let additionalNumber = null;
  
  $('*').each((i, element) => {
    if (additionalNumber) return; // Already found
    
    const $el = $(element);
    const text = $el.text().trim();
    const lowerText = text.toLowerCase();
    
    // Check if this element contains "additional" context and is relatively short (focused element)
    if (lowerText.includes('additional') && lowerText.includes('number') && text.length < 100) {
      console.log(`   📋 Found focused "additional number" context: "${text}"`);
      
      // Extract numbers from this specific focused context
      const numbers = text.match(/\d{1,2}/g);
      if (numbers) {
        const validNumbers = numbers.map(n => parseInt(n)).filter(n => n >= 1 && n <= 49);
        console.log(`   🔢 Numbers in focused additional context: [${validNumbers.join(', ')}]`);
        
        // Find the additional number (should not be in main numbers)
        for (const num of validNumbers) {
          if (!mainNumbers.includes(num)) {
            console.log(`   ✅ Found additional number: ${num} (not in main numbers)`);
            additionalNumber = num;
            return;
          }
        }
      }
    }
    
    // Also check for very specific patterns like just "11" in context near "Additional"
    if (lowerText.includes('additional') && text.length < 50) {
      const singleNumber = text.match(/^\s*(\d{1,2})\s*$/);
      if (singleNumber) {
        const num = parseInt(singleNumber[1]);
        if (num >= 1 && num <= 49 && !mainNumbers.includes(num)) {
          console.log(`   ✅ Found isolated additional number: ${num}`);
          additionalNumber = num;
          return;
        }
      }
    }
  });
  
  // Strategy 2: Look for structured layout where "Additional Number" header is followed by the number
  if (!additionalNumber) {
    console.log(`   🔍 Strategy 2: Looking for structured "Additional Number" layout...`);
    
    $('*').each((i, element) => {
      if (additionalNumber) return;
      
      const $el = $(element);
      const text = $el.text().trim();
      const lowerText = text.toLowerCase();
      
      // Look for "Additional Number" header element
      if (lowerText.includes('additional') && lowerText.includes('number') && text.length < 30) {
        console.log(`   📋 Found additional number header: "${text}"`);
        
        // Look for the next sibling or nearby element that contains just a number
        const $nextElements = $el.nextAll().slice(0, 3); // Check next 3 elements
        $nextElements.each((j, nextEl) => {
          const $next = $(nextEl);
          const nextText = $next.text().trim();
          const singleNumber = nextText.match(/^\s*(\d{1,2})\s*$/);
          
          if (singleNumber) {
            const num = parseInt(singleNumber[1]);
            if (num >= 1 && num <= 49 && !mainNumbers.includes(num)) {
              console.log(`   ✅ Found additional number after header: ${num}`);
              additionalNumber = num;
              return false; // Break jQuery each
            }
          }
        });
        
        // Also check parent's next elements or children
        if (!additionalNumber) {
          const $parent = $el.parent();
          $parent.children().each((j, child) => {
            const $child = $(child);
            const childText = $child.text().trim();
            const singleNumber = childText.match(/^\s*(\d{1,2})\s*$/);
            
            if (singleNumber) {
              const num = parseInt(singleNumber[1]);
              if (num >= 1 && num <= 49 && !mainNumbers.includes(num)) {
                console.log(`   ✅ Found additional number in parent children: ${num}`);
                additionalNumber = num;
                return false; // Break jQuery each
              }
            }
          });
        }
      }
    });
  }
  
  // Strategy 3: Look for patterns with main numbers followed by additional number
  if (!additionalNumber) {
    console.log(`   🔍 Strategy 3: Looking for patterns with main numbers + additional...`);
    
    $('*').each((i, element) => {
      if (additionalNumber) return;
      
      const $el = $(element);
      const text = $el.text().trim();
      
      // Check if this text contains all our main numbers
      const mainNumbersText = mainNumbers.every(num => text.includes(num.toString()));
      
      if (mainNumbersText) {
        console.log(`   📋 Found context with all main numbers: "${text.substring(0, 100)}..."`);
        
        // Extract all numbers and find the one that's not in main numbers
        const allNumbers = text.match(/\d{1,2}/g);
        if (allNumbers) {
          const validNumbers = allNumbers.map(n => parseInt(n)).filter(n => n >= 1 && n <= 49);
          
          // Find numbers that appear after our main sequence
          for (let i = 0; i < validNumbers.length - 5; i++) {
            // Check if we have our main sequence starting at position i
            const sequence = validNumbers.slice(i, i + 6);
            const hasAllMain = mainNumbers.every(num => sequence.includes(num));
            
            if (hasAllMain && validNumbers.length > i + 6) {
              const candidate = validNumbers[i + 6];
              if (!mainNumbers.includes(candidate)) {
                console.log(`   ✅ Found additional number after main sequence: ${candidate}`);
                additionalNumber = candidate;
                return;
              }
            }
          }
        }
      }
    });
  }
  
  // Strategy 4: Look for specific HTML structure patterns
  if (!additionalNumber) {
    console.log(`   🔍 Strategy 4: Looking for HTML structure patterns...`);
    
    // Look for elements that might contain "11" in isolation
    $('*').each((i, element) => {
      if (additionalNumber) return;
      
      const $el = $(element);
      const text = $el.text().trim();
      
      // Look for single number that could be additional
      const singleNumberMatch = text.match(/^\s*(\d{1,2})\s*$/);
      if (singleNumberMatch) {
        const num = parseInt(singleNumberMatch[1]);
        if (num >= 1 && num <= 49 && !mainNumbers.includes(num)) {
          // Check if this element is near "additional" context
          const parent = $el.parent();
          const siblings = $el.siblings();
          const nearbyText = (parent.text() + ' ' + siblings.text()).toLowerCase();
          
          if (nearbyText.includes('additional') || nearbyText.includes('bonus') || nearbyText.includes('extra')) {
            console.log(`   ✅ Found isolated additional number: ${num} (near additional context)`);
            additionalNumber = num;
            return;
          }
        }
      }
    });
  }
  
  return additionalNumber;
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
  
  // Check proximity to current date indicators (dynamic)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });
  const currentMonthFull = currentDate.toLocaleDateString('en-US', { month: 'long' });
  if (text.includes(currentYear) || text.includes(currentMonth) || text.includes(currentMonthFull)) confidence += 1;
  
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

async function advancedDateAnalysis(html) {
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
    
    // Look for date patterns (dynamic based on current date)
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });
    const currentMonthFull = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    const datePatterns = [
      /(\d{1,2}[\s\/\-]\w{3}[\s\/\-]\d{4})/gi,    // Day Month Year format
      /(\d{1,2}[\s\/\-]\d{1,2}[\s\/\-]\d{4})/g,   // DD/MM/YYYY format
      new RegExp(`(${currentMonth}|${currentMonthFull})[\\s,]*\\d{1,2}[\\s,]*\\d{4}`, 'gi'), // Current month format
      /\d{4}[\s\-\/]\d{1,2}[\s\-\/]\d{1,2}/g      // YYYY-MM-DD format
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
      
      const response = await axios.get(url, {
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
      
      if (response.status === 200) {
        const html = response.data;
        console.log(`✅ Got response: ${html.length} chars`);
        
        // Try date-based analysis first
        let result = await fetchLatestByDateAnalysis(html);
        if (result && result.length >= 6 && validateTotoNumbers(result)) {
          console.log(`🎯 Valid result from ${url}: [${result.join(', ')}]`);
          return result;
        } else if (result) {
          console.log(`❌ Invalid result from ${url}: [${result.join(', ')}] - failed validation`);
        }
        
        // Try original parsing method
        result = parseLatestResultByMostRecentDate(html);
        if (result && result.length >= 6 && validateTotoNumbers(result)) {
          console.log(`🎯 Valid result from ${url}: [${result.join(', ')}]`);
          return result;
        } else if (result) {
          console.log(`❌ Invalid result from ${url}: [${result.join(', ')}] - failed validation`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed endpoint ${url}: ${error.message}`);
    }
  }
  
  return null;
}

// Strategy 2: Latest result pattern matching (NEW)
async function fetchLatestByPatternMatching() {
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0'
  ];
  
  for (const url of urls) {
    try {
      console.log(`🎯 Pattern matching analysis for ${url}...`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.status !== 200) {
        console.log(`❌ HTTP error: ${response.status}`);
        continue;
      }
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Look for common TOTO result patterns
      const patterns = [
        // Pattern 1: Look for elements containing "winning numbers" or similar
        () => {
          const candidates = [];
          $('*').each((i, element) => {
            const $el = $(element);
            const text = $el.text().toLowerCase();
            
            if ((text.includes('winning') || text.includes('result') || text.includes('draw')) &&
                (text.includes('number') || text.includes('toto'))) {
              
              // Extract numbers from this element and its children using enhanced patterns
              const fullText = $el.text();
              
              // Enhanced pattern matching for tab-separated format
              const patterns = [
                // Tab-separated number format pattern
                /(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]*(\d{1,2})?/,
                // Standard number extraction
                /\b(\d{1,2})\b/g
              ];
              
              let bestSequence = null;
              let bestConfidence = 0;
              
              patterns.forEach((pattern, patternIndex) => {
                if (patternIndex === 0) {
                  // Tab-separated pattern
                  const match = fullText.match(pattern);
                  if (match) {
                    const numbers = match.slice(1, 8)
                      .filter(n => n !== undefined && n !== '')
                      .map(n => parseInt(n))
                      .filter(n => n >= 1 && n <= 49);
                    
                    if (numbers.length >= 6 && new Set(numbers.slice(0, 6)).size === 6) {
                      const confidence = 9; // High confidence for tab pattern
                      if (confidence > bestConfidence) {
                        bestSequence = numbers.slice(0, 7);
                        bestConfidence = confidence;
                      }
                    }
                  }
                } else {
                  // Standard number extraction
                  const matches = fullText.match(pattern);
                  if (matches) {
                    const numbers = matches
                      .map(n => parseInt(n))
                      .filter(n => n >= 1 && n <= 49);
                    
                    if (numbers.length >= 6) {
                      for (let start = 0; start <= numbers.length - 6; start++) {
                        const sequence = numbers.slice(start, start + 7);
                        if (new Set(sequence.slice(0, 6)).size === 6) {
                          const confidence = 7;
                          if (confidence > bestConfidence) {
                            bestSequence = sequence;
                            bestConfidence = confidence;
                          }
                          break;
                        }
                      }
                    }
                  }
                }
              });
              
              if (bestSequence) {
                candidates.push({
                  numbers: bestSequence,
                  confidence: bestConfidence,
                  pattern: 'winning-numbers-context'
                });
              }
            }
          });
          return candidates;
        },
        
        // Pattern 2: Look for table rows with current date and enhanced number parsing
        () => {
          const candidates = [];
          $('tr').each((i, row) => {
            const $row = $(row);
            const rowText = $row.text();
            
            // Check if row contains current date indicators (dynamic)
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear().toString();
            const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });
            const currentDay = currentDate.getDate().toString();
            
            if (rowText.includes(currentYear) || rowText.includes(currentMonth) || rowText.includes(currentDay)) {
              
              // Enhanced number extraction from row
              const patterns = [
                // Tab-separated pattern
                /(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]*(\d{1,2})?/,
                // Cell-based extraction
                null // Will be handled separately
              ];
              
              // Try tab-separated pattern first
              const tabMatch = rowText.match(patterns[0]);
              if (tabMatch) {
                const numbers = tabMatch.slice(1, 8)
                  .filter(n => n !== undefined && n !== '')
                  .map(n => parseInt(n))
                  .filter(n => n >= 1 && n <= 49);
                
                if (numbers.length >= 6 && new Set(numbers.slice(0, 6)).size === 6) {
                  candidates.push({
                    numbers: numbers.slice(0, 7),
                    confidence: 10, // Highest confidence for date-matched tab pattern
                    pattern: 'current-date-row-tab'
                  });
                }
              } else {
                // Fall back to cell-based extraction
                const numbers = [];
                $row.find('td, th').each((j, cell) => {
                  const cellText = $(cell).text().trim();
                  const num = parseInt(cellText);
                  if (!isNaN(num) && num >= 1 && num <= 49 && cellText === num.toString()) {
                    numbers.push(num);
                  }
                });
                
                if (numbers.length >= 6 && new Set(numbers.slice(0, 6)).size === 6) {
                  candidates.push({
                    numbers: numbers.slice(0, 7),
                    confidence: 8, // High confidence for date-matched row
                    pattern: 'current-date-row'
                  });
                }
              }
            }
          });
          return candidates;
        },
        
        // Pattern 3: Look for the first table with valid TOTO numbers
        () => {
          const candidates = [];
          $('table').first().each((i, table) => {
            const $table = $(table);
            const tableText = $table.text();
            
            // Skip if contains obvious non-result content
            if (tableText.includes('$') || tableText.includes('Group I')) {
              return;
            }
            
            const numbers = [];
            $table.find('td, th').each((j, cell) => {
              const cellText = $(cell).text().trim();
              const num = parseInt(cellText);
              if (!isNaN(num) && num >= 1 && num <= 49 && cellText === num.toString()) {
                numbers.push(num);
              }
            });
            
            if (numbers.length >= 6) {
              candidates.push({
                numbers: numbers.slice(0, 7),
                confidence: 6,
                pattern: 'first-table'
              });
            }
          });
          return candidates;
        }
      ];
      
      // Try all patterns and collect candidates
      const allCandidates = [];
      patterns.forEach((pattern, index) => {
        try {
          const candidates = pattern();
          candidates.forEach(candidate => {
            candidate.patternIndex = index;
            allCandidates.push(candidate);
          });
        } catch (error) {
          console.log(`⚠️  Pattern ${index} failed:`, error.message);
        }
      });
      
      if (allCandidates.length > 0) {
        // Sort by confidence
        allCandidates.sort((a, b) => b.confidence - a.confidence);
        const best = allCandidates[0];
        
        console.log(`✅ Pattern matching found: [${best.numbers.join(', ')}] via ${best.pattern}`);
        return best.numbers;
      }
      
    } catch (error) {
      console.log(`❌ Error with pattern matching ${url}:`, error.message);
    }
  }
  
  return null;
}

// Strategy 3: Multiple endpoint parsing with latest detection
async function tryMultipleEndpointsForLatest() {
  const endpoints = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0',
    'https://www.singaporepools.com.sg/DataFileArchive/Lottery/Output/toto_results_today.xml'
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`🔍 Trying endpoint: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status !== 200) continue;
      
      const content = response.data;
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
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = response.data;
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

// Validate TOTO numbers - COMPLETELY DYNAMIC, NO HARD-CODED VALUES
function validateTotoNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length < 6 || numbers.length > 7) {
    console.log(`❌ Invalid array length: ${numbers?.length} (expected 6-7)`);
    return false;
  }
  
  // Check all numbers are integers in valid range (1-49)
  const validRange = numbers.every(num => 
    Number.isInteger(num) && num >= 1 && num <= 49
  );
  
  if (!validRange) {
    console.log(`❌ Numbers out of range (1-49): [${numbers.join(', ')}]`);
    return false;
  }
  
  // CRITICAL: Check for duplicates in main numbers (first 6)
  const mainNumbers = numbers.slice(0, 6);
  const uniqueMainNumbers = [...new Set(mainNumbers)];
  
  if (uniqueMainNumbers.length !== 6) {
    console.log(`❌ Duplicate numbers found in main sequence: [${mainNumbers.join(', ')}]`);
    console.log(`   Unique count: ${uniqueMainNumbers.length}, Expected: 6`);
    return false;
  }
  
  // Additional number (7th) can be any valid number, even if it duplicates main numbers
  console.log(`✅ Valid TOTO sequence: [${numbers.join(', ')}]`);
  return true;
}

// Check if result is newer than current CSV
function isNewerThanCurrent(newNumbers) {
  try {
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length === 0) return true;
    
    const currentFirst = lines[0].split(',').map(n => parseInt(n.trim()));
    
    // Compare all 7 numbers (including additional number) to detect corrections
    const newFull = newNumbers.slice(0, 7);
    const currentFull = currentFirst.slice(0, 7);
    
    return !arraysEqual(newFull, currentFull);
    
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
