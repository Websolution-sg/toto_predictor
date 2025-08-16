// Quick test to debug the regex pattern issue
const testHTML = `
| 22 | 25 | 29 | 31 | 34 | 43 |
| 11 |
| 9 | 24 | 31 | 34 | 43 | 44 |
| 1 |
`;

console.log('🧪 Testing TOTO Regex Pattern');
console.log('='.repeat(40));

// This is the exact pattern from updateTotoCSV.cjs
const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;

console.log('Testing HTML:');
console.log(testHTML);

const matches = [...testHTML.matchAll(tablePattern)];
console.log(`\nFound ${matches.length} matches with main pattern`);

matches.forEach((match, i) => {
  const numbers = match.slice(1, 7).map(n => parseInt(n));
  console.log(`Match ${i + 1}: [${numbers.join(', ')}]`);
});

// Test if the pattern works with exactly what we see on the website
const websiteFormat = `| 22 | 25 | 29 | 31 | 34 | 43 |`;
console.log(`\nTesting exact website format: "${websiteFormat}"`);
const websiteMatch = websiteFormat.match(tablePattern);
console.log(`Website format matches: ${websiteMatch ? 'YES' : 'NO'}`);

if (websiteMatch) {
  const websiteNumbers = websiteMatch.slice(1, 7).map(n => parseInt(n));
  console.log(`Extracted: [${websiteNumbers.join(', ')}]`);
}

// Alternative patterns to try
console.log('\n🔍 Testing alternative patterns:');

// Pattern without requiring spaces around pipes
const altPattern1 = /\|(\d{1,2})\|\s*(\d{1,2})\|\s*(\d{1,2})\|\s*(\d{1,2})\|\s*(\d{1,2})\|\s*(\d{1,2})\|/g;
const alt1Matches = [...testHTML.matchAll(altPattern1)];
console.log(`Alt pattern 1 (no spaces): ${alt1Matches.length} matches`);

// Pattern allowing variable spaces
const altPattern2 = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
const alt2Matches = [...testHTML.matchAll(altPattern2)];
console.log(`Alt pattern 2 (flexible spaces): ${alt2Matches.length} matches`);

console.log('\n🎯 Expected: Should find [22, 25, 29, 31, 34, 43] as first match');
