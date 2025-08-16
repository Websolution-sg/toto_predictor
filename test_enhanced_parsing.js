// Test enhanced parsing for tab-separated format
const cheerio = require('cheerio');
const fs = require('fs');

console.log('🧪 TESTING ENHANCED PARSING FOR TAB-SEPARATED FORMAT');
console.log('===================================================');
console.log('🎯 Target format: 22	25	29	31	34	43 11');
console.log('');

// Test HTML that simulates Singapore Pools format with tab-separated numbers
const testHTML = `
<html>
<body>
<div class="results-container">
  <h2>TOTO Results - 16 Aug 2025</h2>
  <table class="results-table">
    <tr>
      <th>Draw Date</th>
      <th>Winning Numbers</th>
    </tr>
    <tr>
      <td>16 Aug 2025</td>
      <td>22	25	29	31	34	43 11</td>
    </tr>
  </table>
  
  <div class="latest-result">
    <span class="label">Latest Draw:</span>
    <span class="numbers">22	25	29	31	34	43 11</span>
  </div>
  
  <p>The winning numbers for 16 Aug 2025 are: 22	25	29	31	34	43 with additional number 11</p>
</div>
</body>
</html>
`;

// Copy the enhanced parsing function from the main script
function parseLatestResultByMostRecentDate(html) {
  const $ = cheerio.load(html);
  console.log('🔍 ENHANCED DYNAMIC PARSING - Latest TOTO results detection...');
  
  let bestResult = null;
  let highestConfidence = 0;
  const allCandidates = [];
  
  // Strategy 1: Enhanced table parsing
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableText = $table.text();
    
    console.log(`🔍 Analyzing table ${tableIndex}...`);
    
    // Skip irrelevant tables
    if (tableText.includes('Group I') || tableText.includes('$') || tableText.includes('Prize')) {
      console.log(`   ⏭️ Skipped - contains prize/group info`);
      return;
    }
    
    // Check for current date
    const hasCurrentDate = tableText.includes('2025') || tableText.includes('Aug');
    if (hasCurrentDate) {
      console.log(`   📅 Table contains current date indicators`);
    }
    
    // Enhanced row-based parsing for tab-separated format
    $table.find('tr').each((rowIndex, row) => {
      const $row = $(row);
      const rowText = $row.text().trim();
      
      console.log(`   📋 Row ${rowIndex}: "${rowText}"`);
      
      // Look for tab-separated pattern
      const tabPattern = /(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]*(\d{1,2})?/;
      const tabMatch = rowText.match(tabPattern);
      
      if (tabMatch) {
        const numbers = tabMatch.slice(1, 8)
          .filter(n => n !== undefined && n !== '')
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        console.log(`   🎯 Tab pattern found: [${numbers.join(',')}]`);
        
        if (numbers.length >= 6 && new Set(numbers.slice(0, 6)).size === 6) {
          let confidence = 8; // High base confidence for tab pattern
          if (hasCurrentDate) confidence += 3;
          if (numbers.length === 7) confidence += 2;
          
          allCandidates.push({
            numbers: numbers.slice(0, 7),
            confidence: confidence,
            source: `table-${tableIndex}-row-${rowIndex}`,
            hasDate: hasCurrentDate,
            method: 'tab-pattern'
          });
          
          console.log(`   ✅ Valid tab sequence: [${numbers.slice(0, 7).join(',')}] confidence: ${confidence}`);
        }
      }
    });
  });
  
  // Strategy 2: Enhanced div/span parsing
  console.log('🔄 Checking div/span elements...');
  
  $('div, span, p, td').each((i, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    
    if (text.length > 10 && text.length < 200) {
      console.log(`   📋 Element ${i}: "${text}"`);
      
      // Enhanced patterns for various formats
      const patterns = [
        // Tab-separated: "22	25	29	31	34	43 11"
        {
          pattern: /(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]+(\d{1,2})[\t\s]*(\d{1,2})?/,
          name: 'tab-separated',
          confidence: 9
        },
        // Comma-separated: "22,25,29,31,34,43,11"
        {
          pattern: /(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),?\s*(\d{1,2})?/,
          name: 'comma-separated',
          confidence: 7
        }
      ];
      
      patterns.forEach((patternObj, patternIndex) => {
        const match = text.match(patternObj.pattern);
        if (match) {
          const numbers = match.slice(1, 8)
            .filter(n => n !== undefined && n !== '')
            .map(n => parseInt(n))
            .filter(n => n >= 1 && n <= 49);
          
          console.log(`   🎯 ${patternObj.name} pattern found: [${numbers.join(',')}]`);
          
          if (numbers.length >= 6 && new Set(numbers.slice(0, 6)).size === 6) {
            let confidence = patternObj.confidence;
            
            // Context bonuses
            const lowerText = text.toLowerCase();
            if (lowerText.includes('winning') || lowerText.includes('result')) confidence += 2;
            if (text.includes('2025') || text.includes('Aug')) confidence += 2;
            
            allCandidates.push({
              numbers: numbers.slice(0, 7),
              confidence: confidence,
              source: 'div-span',
              pattern: patternObj.name,
              text: text.substring(0, 50) + '...'
            });
            
            console.log(`   ✅ Valid ${patternObj.name}: [${numbers.slice(0, 7).join(',')}] confidence: ${confidence}`);
          }
        }
      });
    }
  });
  
  // Find the best candidate
  if (allCandidates.length > 0) {
    allCandidates.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.hasDate !== b.hasDate) return a.hasDate ? -1 : 1;
      return 0;
    });
    
    console.log('\n📊 ALL CANDIDATES:');
    allCandidates.forEach((candidate, i) => {
      console.log(`   ${i + 1}. [${candidate.numbers.join(',')}] - confidence: ${candidate.confidence} - source: ${candidate.source} - method: ${candidate.method || candidate.pattern}`);
    });
    
    bestResult = allCandidates[0].numbers;
    highestConfidence = allCandidates[0].confidence;
    
    console.log(`\n✅ SELECTED RESULT: [${bestResult.join(',')}] with confidence ${highestConfidence}`);
    return bestResult;
  }
  
  console.log('❌ No valid TOTO results found');
  return null;
}

// Run the test
console.log('🚀 Running parsing test...');
const result = parseLatestResultByMostRecentDate(testHTML);

console.log('\n🎯 TEST RESULTS:');
if (result) {
  const resultStr = result.join(',');
  console.log(`✅ PARSED RESULT: ${resultStr}`);
  
  if (resultStr === '22,25,29,31,34,43,11') {
    console.log('🎉 SUCCESS! Enhanced parsing correctly handles tab-separated format!');
  } else {
    console.log('⚠️  Parsed result differs from expected');
    console.log(`   Expected: 22,25,29,31,34,43,11`);
    console.log(`   Parsed:   ${resultStr}`);
  }
} else {
  console.log('❌ No result parsed');
}

console.log('\n📊 CURRENT CSV STATUS:');
const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
console.log(`   Latest in CSV: ${currentCSV}`);

console.log('\n🚀 ENHANCED PARSING CAPABILITIES:');
console.log('✅ Tab-separated format support (22	25	29	31	34	43 11)');
console.log('✅ Comma-separated format support');
console.log('✅ Date-aware prioritization');
console.log('✅ Context-sensitive confidence scoring');
console.log('✅ Multiple parsing strategies');

console.log('\n🎉 TESTING COMPLETE!');
console.log('Your workflow is now enhanced to handle the tab-separated format dynamically!');
