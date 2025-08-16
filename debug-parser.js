// Test script to verify TOTO parsing with current website data
const testHTML = `
|  |
|  |
| 22 | 25 | 29 | 31 | 34 | 43 |

|  |
|  |
| 11 |

|  |
|  |
| $2,980,746 |

|  |
|  |
| 9 | 24 | 31 | 34 | 43 | 44 |

|  |
|  |
| 1 |
`;

console.log('🧪 Testing TOTO Parsing with Current Website Structure');
console.log('='.repeat(60));

// Test the regex pattern
const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
const matches = [...testHTML.matchAll(tablePattern)];

console.log(`📊 Found ${matches.length} table patterns`);

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const mainNumbers = match.slice(1, 7).map(n => parseInt(n));
  console.log(`\n🎯 Match ${i + 1}: [${mainNumbers.join(', ')}]`);
  
  // Look for additional number
  const afterMatch = testHTML.substring(match.index + match[0].length, match.index + match[0].length + 200);
  console.log(`🔍 Looking in: ${afterMatch.substring(0, 50).replace(/\n/g, '\\n')}...`);
  
  const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
  const additionalMatch = afterMatch.match(additionalPattern);
  
  if (additionalMatch) {
    const additional = parseInt(additionalMatch[1]);
    console.log(`✅ Additional number: ${additional}`);
    const fullResult = [...mainNumbers, additional];
    console.log(`🎉 Complete result: [${fullResult.join(', ')}]`);
    
    // Test validation
    console.log('🔍 Validation checks:');
    console.log(`   - All numbers 1-49: ${fullResult.every(n => n >= 1 && n <= 49)}`);
    console.log(`   - No duplicates: ${new Set(fullResult).size === fullResult.length}`);
    console.log(`   - Length is 7: ${fullResult.length === 7}`);
    
    if (i === 0) {
      console.log('⭐ This should be the LATEST result that the workflow should fetch');
    }
  } else {
    console.log('❌ No additional number found');
  }
}

console.log('\n🏁 Parsing test completed');
console.log('\nExpected behavior:');
console.log('✅ First match should be: [22, 25, 29, 31, 34, 43, 11]');
console.log('✅ Second match should be: [9, 24, 31, 34, 43, 44, 1]');
