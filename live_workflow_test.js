// Live workflow test to fetch latest TOTO result from Singapore Pools
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

console.log('🚀 LIVE WORKFLOW TEST - SINGAPORE POOLS FETCH');
console.log('==============================================');
console.log(`📅 Date: August 16, 2025`);
console.log(`📋 Current CSV first entry: ${fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0]}`);
console.log('');

// Enhanced parsing function (matching the main script)
function parseLatestResultByMostRecentDate(html) {
  const $ = cheerio.load(html);
  console.log('🔍 ENHANCED DYNAMIC PARSING - Latest TOTO results detection...');
  
  let bestResult = null;
  let highestConfidence = 0;
  const allCandidates = [];
  
  // Strategy 1: Enhanced table parsing with current date awareness
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableText = $table.text();
    
    console.log(`🔍 Analyzing table ${tableIndex}...`);
    
    // Skip obviously irrelevant tables
    if (tableText.includes('Group I') || tableText.includes('Group II') || 
        tableText.includes('$') || tableText.includes('Prize') ||
        tableText.includes('Starter') || tableText.includes('Consolation')) {
      console.log(`   ⏭️ Skipped - contains prize/group info`);
      return;
    }
    
    // Look for current date indicators (Aug 2025, 2025, recent dates)
    const hasCurrentDate = tableText.includes('2025') || 
                          tableText.includes('Aug') || 
                          tableText.includes('August') ||
                          tableText.includes('16');
    
    if (hasCurrentDate) {
      console.log(`   📅 Table contains current date indicators`);
    }
    
    // Extract all numbers from table cells
    const numbers = [];
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
            text: cellText
          });
        }
      }
    });
    
    console.log(`   🔢 Found ${numbers.length} valid numbers in table`);
    
    // Look for sequences of 6-7 consecutive numbers
    if (numbers.length >= 6) {
      for (let start = 0; start <= numbers.length - 6; start++) {
        const sequence = numbers.slice(start, start + 7).map(n => n.value);
        const mainNumbers = sequence.slice(0, 6);
        
        // Validate main numbers are unique
        if (new Set(mainNumbers).size === 6) {
          let confidence = 5; // Base confidence
          
          if (hasCurrentDate) confidence += 3;
          if (sequence.length === 7) confidence += 2; // Has additional number
          if (start === 0) confidence += 1; // First sequence in table
          
          // Check if numbers look like a real TOTO draw
          const sorted = [...mainNumbers].sort((a, b) => a - b);
          const range = sorted[5] - sorted[0];
          if (range >= 15 && range <= 45) confidence += 2; // Good spread
          
          allCandidates.push({
            numbers: sequence,
            confidence: confidence,
            source: `table-${tableIndex}`,
            hasDate: hasCurrentDate
          });
          
          console.log(`   ✅ Candidate: [${sequence.join(',')}] confidence: ${confidence}`);
        }
      }
    }
  });
  
  // Strategy 2: Look for div/span elements with number sequences
  console.log('🔄 Checking div/span elements for number sequences...');
  
  $('div, span, p').each((i, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    
    // Skip long text blocks
    if (text.length > 200) return;
    
    // Look for 6-7 numbers separated by spaces, commas, or tabs
    const numberPattern = /\b(\d{1,2})\b/g;
    const matches = text.match(numberPattern);
    
    if (matches && matches.length >= 6 && matches.length <= 8) {
      const validNumbers = matches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      if (validNumbers.length >= 6) {
        const mainNumbers = validNumbers.slice(0, 6);
        
        // Check uniqueness
        if (new Set(mainNumbers).size === 6) {
          let confidence = 3; // Base confidence for div/span
          
          // Check context clues
          const lowerText = text.toLowerCase();
          if (lowerText.includes('winning') || lowerText.includes('result')) confidence += 2;
          if (lowerText.includes('draw')) confidence += 1;
          if (text.includes('2025') || text.includes('Aug')) confidence += 2;
          
          const sequence = validNumbers.slice(0, 7);
          allCandidates.push({
            numbers: sequence,
            confidence: confidence,
            source: 'div-span',
            text: text.substring(0, 50) + '...'
          });
          
          console.log(`   📋 Div/span candidate: [${sequence.join(',')}] confidence: ${confidence}`);
        }
      }
    }
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
    
    console.log(`\n✅ SELECTED RESULT: [${bestResult.join(',')}] with confidence ${highestConfidence}`);
    return bestResult;
  }
  
  console.log('❌ No valid TOTO results found in any parsing strategy');
  return null;
}

// Pattern matching strategy
async function fetchLatestByPatternMatching(html) {
  const $ = cheerio.load(html);
  console.log('🎯 Pattern matching analysis...');
  
  const candidates = [];
  
  // Pattern 1: Look for elements containing "winning numbers" or similar
  $('*').each((i, element) => {
    const $el = $(element);
    const text = $el.text().toLowerCase();
    
    if ((text.includes('winning') || text.includes('result') || text.includes('draw')) &&
        (text.includes('number') || text.includes('toto'))) {
      
      // Extract numbers from this element and its children
      const numbers = [];
      $el.find('*').addBack().each((j, child) => {
        const childText = $(child).text().trim();
        const num = parseInt(childText);
        if (!isNaN(num) && num >= 1 && num <= 49 && childText === num.toString()) {
          numbers.push(num);
        }
      });
      
      if (numbers.length >= 6) {
        candidates.push({
          numbers: numbers.slice(0, 7),
          confidence: 7,
          pattern: 'winning-numbers-context'
        });
      }
    }
  });
  
  // Pattern 2: Look for table rows with current date
  $('tr').each((i, row) => {
    const $row = $(row);
    const rowText = $row.text();
    
    // Check if row contains current date indicators
    if (rowText.includes('2025') || rowText.includes('Aug') || rowText.includes('16')) {
      const numbers = [];
      $row.find('td, th').each((j, cell) => {
        const cellText = $(cell).text().trim();
        const num = parseInt(cellText);
        if (!isNaN(num) && num >= 1 && num <= 49 && cellText === num.toString()) {
          numbers.push(num);
        }
      });
      
      if (numbers.length >= 6) {
        candidates.push({
          numbers: numbers.slice(0, 7),
          confidence: 8, // Higher confidence for date-matched rows
          pattern: 'current-date-row'
        });
      }
    }
  });
  
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.confidence - a.confidence);
    const best = candidates[0];
    console.log(`✅ Pattern matching found: [${best.numbers.join(', ')}] via ${best.pattern}`);
    return best.numbers;
  }
  
  return null;
}

// Main test function
async function testWorkflowFetch() {
  console.log('🌐 FETCHING FROM SINGAPORE POOLS...');
  console.log('-----------------------------------');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`📄 HTML content received: ${html.length} characters`);
    
    // Check for TOTO content
    const totoIndicators = ['toto', 'TOTO', 'winning', 'result'];
    const foundIndicators = totoIndicators.filter(term => 
      html.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log(`🔍 TOTO content indicators: ${foundIndicators.join(', ')}`);
    
    if (foundIndicators.length === 0) {
      console.log('⚠️  No TOTO content detected in response');
      return null;
    }
    
    // Try primary parsing method
    console.log('\n🎯 ATTEMPTING PRIMARY PARSING...');
    let result = parseLatestResultByMostRecentDate(html);
    
    if (!result) {
      console.log('\n🔄 Primary parsing failed, trying pattern matching...');
      result = await fetchLatestByPatternMatching(html);
    }
    
    return result;
    
  } catch (error) {
    console.log(`❌ Fetch error: ${error.message}`);
    return null;
  }
}

// Execute the test
async function runTest() {
  const startTime = Date.now();
  
  console.log('⏱️  Starting workflow test...\n');
  
  const result = await testWorkflowFetch();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n🎯 FINAL RESULTS');
  console.log('================');
  console.log(`⏱️  Execution time: ${duration}ms`);
  
  if (result && result.length >= 6) {
    const resultStr = result.join(',');
    console.log(`✅ LATEST FETCH RESULT: ${resultStr}`);
    
    // Compare with current CSV
    const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
    console.log(`📋 Current CSV first: ${currentCSV}`);
    
    if (currentCSV === resultStr) {
      console.log('✅ Fetched result matches CSV - system is up to date');
    } else {
      console.log('🔄 Fetched result differs from CSV - update would occur');
      console.log(`   Would update from: ${currentCSV}`);
      console.log(`   Would update to:   ${resultStr}`);
    }
    
    // Validate the result
    const mainNumbers = result.slice(0, 6);
    const additionalNumber = result[6];
    
    const validRange = result.every(n => n >= 1 && n <= 49);
    const uniqueMain = new Set(mainNumbers).size === 6;
    
    console.log('\n📊 RESULT VALIDATION:');
    console.log(`   Numbers in range (1-49): ${validRange ? '✅' : '❌'}`);
    console.log(`   Main numbers unique: ${uniqueMain ? '✅' : '❌'}`);
    console.log(`   Format correct: ${result.length === 7 ? '✅' : '❌'}`);
    
    if (validRange && uniqueMain && result.length === 7) {
      console.log('🎉 FETCHED RESULT IS VALID TOTO FORMAT!');
    } else {
      console.log('⚠️  Fetched result has validation issues');
    }
    
  } else {
    console.log('❌ NO VALID RESULT FETCHED');
    console.log('   Possible reasons:');
    console.log('   - Singapore Pools website structure changed');
    console.log('   - Network connectivity issues');
    console.log('   - No current draw results available');
  }
  
  console.log('\n🏁 WORKFLOW TEST COMPLETE!');
}

runTest().catch(error => {
  console.error('💥 Test failed:', error);
});
