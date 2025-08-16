const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Test the exact parsing logic on current Singapore Pools website
async function testFetchAccuracy() {
  console.log('🧪 TOTO FETCH ACCURACY TEST');
  console.log('='.repeat(50));
  
  try {
    console.log('📡 Fetching from Singapore Pools...');
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`📄 HTML received: ${html.length} characters`);
    
    // Expected result from manual verification
    const expectedResult = [22, 25, 29, 31, 34, 43, 11];
    console.log(`🎯 Expected result: [${expectedResult.join(', ')}]`);
    
    // Test the table pattern parsing
    console.log('\n🔍 TESTING TABLE PATTERN PARSING:');
    console.log('-'.repeat(40));
    
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`📊 Found ${matches.length} table patterns`);
    
    if (matches.length > 0) {
      // Process the first few matches to see what we get
      for (let i = 0; i < Math.min(3, matches.length); i++) {
        const match = matches[i];
        const numbers = match.slice(1, 7).map(n => parseInt(n));
        console.log(`🎯 Match ${i + 1}: [${numbers.join(', ')}]`);
        
        // Check if this matches our expected result
        if (JSON.stringify(numbers.sort()) === JSON.stringify(expectedResult.slice(0, 6).sort())) {
          console.log(`✅ MATCH ${i + 1} MATCHES EXPECTED MAIN NUMBERS!`);
          
          // Look for additional number
          const afterMatch = html.substring(match.index + match[0].length, match.index + match[0].length + 500);
          const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
          const additionalMatch = afterMatch.match(additionalPattern);
          
          if (additionalMatch) {
            const additional = parseInt(additionalMatch[1]);
            const fullResult = [...numbers, additional];
            console.log(`🎯 Full result: [${fullResult.join(', ')}]`);
            
            if (JSON.stringify(fullResult.sort()) === JSON.stringify(expectedResult.sort())) {
              console.log('🎉 PERFECT MATCH! Fetching is 100% accurate!');
              return { accurate: true, result: fullResult };
            } else {
              console.log(`⚠️ Additional number mismatch. Expected: ${expectedResult[6]}, Got: ${additional}`);
            }
          }
        }
      }
    }
    
    // Alternative: Look for the specific numbers we expect
    console.log('\n🔍 TESTING SPECIFIC NUMBER SEARCH:');
    console.log('-'.repeat(40));
    
    const expectedMain = [22, 25, 29, 31, 34, 43];
    const expectedAdditional = 11;
    
    // Check if all expected numbers appear in sequence
    let foundSequence = false;
    for (const num of expectedMain) {
      if (html.includes(`| ${num} |`) || html.includes(`|${num}|`)) {
        console.log(`✅ Found ${num} in table format`);
      } else {
        console.log(`❌ Missing ${num} in table format`);
      }
    }
    
    if (html.includes(`| ${expectedAdditional} |`) || html.includes(`|${expectedAdditional}|`)) {
      console.log(`✅ Found additional number ${expectedAdditional} in table format`);
    }
    
    // Check for the exact sequence pattern
    const exactPattern = `| 22 | 25 | 29 | 31 | 34 | 43 |`;
    if (html.includes(exactPattern) || html.includes(exactPattern.replace(/ /g, ''))) {
      console.log('🎯 EXACT SEQUENCE FOUND!');
      return { accurate: true, result: expectedResult };
    }
    
    console.log('\n📋 HTML SAMPLE (looking for TOTO patterns):');
    const totoIndex = html.toLowerCase().indexOf('toto');
    if (totoIndex !== -1) {
      console.log(html.substring(totoIndex, totoIndex + 1000));
    }
    
    return { accurate: false, reason: 'Pattern not found or parsing failed' };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { accurate: false, reason: error.message };
  }
}

// Run the test
testFetchAccuracy().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('🏁 FINAL RESULT:');
  if (result.accurate) {
    console.log('✅ FETCHING IS ACCURATE!');
    console.log(`🎯 Successfully extracted: [${result.result.join(', ')}]`);
  } else {
    console.log('❌ FETCHING NEEDS IMPROVEMENT');
    console.log(`💡 Reason: ${result.reason}`);
    console.log('🔧 The parsing logic may need updates for current website structure');
  }
  console.log('='.repeat(50));
});
