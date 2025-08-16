// Quick test for the table pattern parser
const testHTML = `
| 22 | 25 | 29 | 31 | 34 | 43 |
| 11 |
| $2,980,746 |
`;

console.log('Testing table pattern parsing...');

const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
const matches = [...testHTML.matchAll(tablePattern)];

console.log(`Found ${matches.length} table patterns`);

if (matches.length > 0) {
  const firstMatch = matches[0];
  const mainNumbers = firstMatch.slice(1, 7).map(n => parseInt(n));
  console.log(`Main numbers: [${mainNumbers.join(', ')}]`);
  
  // Look for additional number
  const afterMatch = testHTML.substring(firstMatch.index + firstMatch[0].length);
  console.log(`Looking in: ${afterMatch}`);
  
  const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
  const additionalMatch = afterMatch.match(additionalPattern);
  
  if (additionalMatch) {
    const additional = parseInt(additionalMatch[1]);
    console.log(`Additional number: ${additional}`);
    console.log(`Complete result: [${[...mainNumbers, additional].join(', ')}]`);
  }
}
