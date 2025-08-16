// Test the table pattern parsing logic
const testHTML = `
|  |
|  |
| 22 | 25 | 29 | 31 | 34 | 43 |

|  |
|  |
| 11 |

|  |
|  |
| 9 | 24 | 31 | 34 | 43 | 44 |

|  |
|  |
| 1 |
`;

console.log('🧪 Testing TOTO pattern parsing...');

// Test the exact regex from our code
const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
const matches = [...testHTML.matchAll(tablePattern)];

console.log(`📊 Found ${matches.length} table patterns`);

matches.forEach((match, index) => {
  const mainNumbers = match.slice(1, 7).map(n => parseInt(n));
  console.log(`🎯 Match ${index + 1}: [${mainNumbers.join(', ')}]`);
  
  // Look for additional number after this match
  const afterMatch = testHTML.substring(match.index + match[0].length, match.index + match[0].length + 200);
  const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
  const additionalMatch = afterMatch.match(additionalPattern);
  
  if (additionalMatch) {
    const additional = parseInt(additionalMatch[1]);
    console.log(`   Additional: ${additional}`);
    console.log(`   Complete: [${[...mainNumbers, additional].join(', ')}]`);
  }
});

console.log('✅ Pattern test completed');
