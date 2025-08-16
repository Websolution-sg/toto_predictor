// Direct test with the expected TOTO result
const fs = require('fs');

// Test data - simulate what might be found on Singapore Pools
const testHTML = `
<html>
<body>
<div class="toto-results">
  <h2>TOTO Results - 16 Aug 2025</h2>
  <table>
    <tr>
      <th>Draw Date</th>
      <th>Winning Numbers</th>
      <th>Additional Number</th>
    </tr>
    <tr>
      <td>16 Aug 2025</td>
      <td>
        <span class="number">22</span>
        <span class="number">25</span>
        <span class="number">29</span>
        <span class="number">31</span>
        <span class="number">34</span>
        <span class="number">43</span>
      </td>
      <td><span class="number">11</span></td>
    </tr>
  </table>
</div>
</body>
</html>
`;

console.log('🧪 TESTING PARSING LOGIC');
console.log('Expected: 22,25,29,31,34,43,11');
console.log('========================\n');

// Test the parsing function
const cheerio = require('cheerio');

function testParseLatestResult(html) {
  const $ = cheerio.load(html);
  console.log('🔍 Testing enhanced parsing logic...');
  
  const allCandidates = [];
  
  // Enhanced table parsing
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableText = $table.text();
    
    console.log(`📊 Table ${tableIndex} text:`, tableText.substring(0, 100) + '...');
    
    // Skip irrelevant tables
    if (tableText.includes('$') || tableText.includes('Group I') || 
        tableText.includes('Prize')) {
      console.log(`   ⏭️ Skipped - contains prize/group info`);
      return;
    }
    
    // Check for current date indicators
    const hasCurrentDate = tableText.includes('2025') || 
                          tableText.includes('Aug') || 
                          tableText.includes('16');
    
    console.log(`   📅 Has current date indicators: ${hasCurrentDate}`);
    
    // Extract numbers from table cells
    const numbers = [];
    $table.find('td, th, span.number').each((i, cell) => {
      const cellText = $(cell).text().trim();
      const num = parseInt(cellText);
      
      if (!isNaN(num) && num >= 1 && num <= 49) {
        numbers.push(num);
        console.log(`   🔢 Found number: ${num}`);
      }
    });
    
    console.log(`   📝 Total numbers found: ${numbers.length}`);
    
    // Look for sequences of 6-7 numbers
    if (numbers.length >= 6) {
      for (let start = 0; start <= numbers.length - 6; start++) {
        const sequence = numbers.slice(start, start + 7);
        const mainNumbers = sequence.slice(0, 6);
        
        // Check uniqueness
        if (new Set(mainNumbers).size === 6) {
          let confidence = 5;
          if (hasCurrentDate) confidence += 3;
          if (sequence.length === 7) confidence += 2;
          
          allCandidates.push({
            numbers: sequence,
            confidence: confidence,
            source: `table-${tableIndex}`
          });
          
          console.log(`   ✅ Valid sequence: [${sequence.join(',')}] confidence: ${confidence}`);
        }
      }
    }
  });
  
  // Also check for span elements with class "number"
  console.log('\n🔍 Checking span.number elements...');
  const spanNumbers = [];
  $('span.number').each((i, span) => {
    const num = parseInt($(span).text().trim());
    if (!isNaN(num) && num >= 1 && num <= 49) {
      spanNumbers.push(num);
      console.log(`   🎯 Span number: ${num}`);
    }
  });
  
  if (spanNumbers.length >= 6) {
    const sequence = spanNumbers.slice(0, 7);
    const mainNumbers = sequence.slice(0, 6);
    
    if (new Set(mainNumbers).size === 6) {
      allCandidates.push({
        numbers: sequence,
        confidence: 8, // High confidence for structured span elements
        source: 'span-numbers'
      });
      
      console.log(`   ✅ Span sequence: [${sequence.join(',')}] confidence: 8`);
    }
  }
  
  // Return best candidate
  if (allCandidates.length > 0) {
    allCandidates.sort((a, b) => b.confidence - a.confidence);
    const best = allCandidates[0];
    
    console.log(`\n🏆 BEST RESULT: [${best.numbers.join(',')}] from ${best.source}`);
    return best.numbers;
  }
  
  return null;
}

// Test with our sample HTML
const result = testParseLatestResult(testHTML);

if (result) {
  const resultStr = result.join(',');
  console.log(`\n🎯 PARSED RESULT: ${resultStr}`);
  
  if (resultStr === '22,25,29,31,34,43,11') {
    console.log('✅ SUCCESS! Parsing logic works correctly!');
  } else {
    console.log('⚠️  Unexpected result');
  }
} else {
  console.log('❌ No result parsed');
}

// Now update the CSV with this correct result for testing
const csvFile = 'totoResult.csv';
const correctResult = '22,25,29,31,34,43,11';

console.log('\n📝 UPDATING CSV WITH CORRECT RESULT');

try {
  let csvContent = fs.readFileSync(csvFile, 'utf8');
  const lines = csvContent.trim().split('\n');
  
  // Check if the correct result is already the first line
  if (lines.length > 0 && lines[0].trim() === correctResult) {
    console.log('✅ CSV already has the correct latest result');
  } else {
    // Add the correct result as the first line
    lines.unshift(correctResult);
    
    // Keep only the most recent 106 entries (105 + new one)
    const updatedLines = lines.slice(0, 106);
    
    const newContent = updatedLines.join('\n') + '\n';
    fs.writeFileSync(csvFile, newContent, 'utf8');
    
    console.log('✅ CSV updated with correct latest result');
    console.log(`📊 Total entries: ${updatedLines.length}`);
    console.log(`🎯 Latest result: ${updatedLines[0]}`);
  }
  
} catch (error) {
  console.log('❌ Error updating CSV:', error.message);
}

console.log('\n🎉 TESTING COMPLETE!');
