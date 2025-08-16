// Test the enhanced dynamic TOTO fetching
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Copy the enhanced parsing function
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

async function testFetch() {
  console.log('🚀 TESTING ENHANCED TOTO FETCH');
  console.log('Expected result: 22,25,29,31,34,43,11');
  console.log('================================\n');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`✅ Fetched HTML: ${html.length} characters\n`);
    
    const result = parseLatestResultByMostRecentDate(html);
    
    if (result) {
      const resultStr = result.join(',');
      console.log(`\n🎯 FINAL RESULT: ${resultStr}`);
      
      if (resultStr === '22,25,29,31,34,43,11') {
        console.log('✅ SUCCESS! Correctly fetched the expected result!');
      } else {
        console.log('⚠️  Different result found. This might be a newer draw or parsing issue.');
        console.log('Expected: 22,25,29,31,34,43,11');
        console.log(`Actual:   ${resultStr}`);
      }
    } else {
      console.log('❌ No result found');
    }
    
  } catch (error) {
    console.log(`❌ Fetch failed: ${error.message}`);
  }
}

testFetch();
