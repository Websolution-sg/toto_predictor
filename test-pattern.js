// Simple test to see if the TOTO pattern is being extracted correctly
const testHTML = `
| 22 | 25 | 29 | 31 | 34 | 43 |
| 11 |
| 9 | 24 | 31 | 34 | 43 | 44 |
| 1 |
`;

console.log('🧪 Testing Table Pattern Extraction');
console.log('='.repeat(40));

const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
const matches = [...testHTML.matchAll(tablePattern)];

console.log(`Found ${matches.length} matches`);

matches.forEach((match, i) => {
  const numbers = match.slice(1, 7).map(n => parseInt(n));
  console.log(`Match ${i + 1}: [${numbers.join(', ')}]`);
});

// Test additional number pattern
const additionalPattern = /\|\s*(\d{1,2})\s*\|/g;
const additionalMatches = [...testHTML.matchAll(additionalPattern)];

console.log(`Found ${additionalMatches.length} additional number patterns`);
additionalMatches.forEach((match, i) => {
  console.log(`Additional ${i + 1}: ${match[1]}`);
});

console.log('\n🎯 Expected: First match should be [22, 25, 29, 31, 34, 43] with additional 11');
if (matches.length > 0) {
  const firstSix = matches[0].slice(1, 7).map(n => parseInt(n));
  const expected = [22, 25, 29, 31, 34, 43];
  const matches_expected = JSON.stringify(firstSix) === JSON.stringify(expected);
  console.log(`✅ Pattern works: ${matches_expected}`);
  
  if (matches_expected && additionalMatches.length > 0) {
    const additionalNum = parseInt(additionalMatches[0][1]);
    console.log(`✅ Full result would be: [${[...firstSix, additionalNum].join(', ')}]`);
  }
}
