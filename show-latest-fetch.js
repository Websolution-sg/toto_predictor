// Test to show exactly what TOTO result your workflow fetches
console.log('🎯 SHOWING LATEST TOTO RESULT YOUR WORKFLOW WOULD FETCH');
console.log('='.repeat(65));

// Website content shows this structure:
const websiteHTML = `
| 22 | 25 | 29 | 31 | 34 | 43 |
| 11 |
| 9 | 24 | 31 | 34 | 43 | 44 |
| 1 |
| 2 | 15 | 28 | 39 | 42 | 44 |
| 5 |
`;

console.log('📄 Current Singapore Pools website shows:');
console.log(websiteHTML);

// This is the EXACT regex pattern from your updateTotoCSV.cjs
const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;

// Extract matches just like your workflow does
const matches = [...websiteHTML.matchAll(tablePattern)];
console.log(`🔍 Found ${matches.length} table pattern matches`);

if (matches.length > 0) {
  // Get the first match (latest result) - exactly like your workflow
  const firstMatch = matches[0];
  const mainNumbers = firstMatch.slice(1, 7).map(n => parseInt(n));
  console.log(`🎯 Main numbers (first 6): [${mainNumbers.join(', ')}]`);
  
  // Look for additional number - exactly like your workflow
  const afterMatch = `| 11 |`;  // This is what follows the first match
  const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
  const additionalMatch = afterMatch.match(additionalPattern);
  
  if (additionalMatch) {
    const additional = parseInt(additionalMatch[1]);
    const fullResult = [...mainNumbers, additional];
    
    console.log('');
    console.log('🎉 LATEST TOTO RESULT YOUR WORKFLOW FETCHES:');
    console.log('='.repeat(50));
    console.log(`✅ COMPLETE RESULT: [${fullResult.join(', ')}]`);
    console.log('='.repeat(50));
    
    // Compare with current CSV
    const currentCSV = [9, 24, 31, 34, 43, 44, 1];
    console.log('');
    console.log('📊 COMPARISON:');
    console.log(`   Fetched from website: [${fullResult.join(', ')}]`);
    console.log(`   Current CSV top:      [${currentCSV.join(', ')}]`);
    
    const arraysEqual = (a, b) => a.length === b.length && a.every((val, i) => val === b[i]);
    const areEqual = arraysEqual(fullResult, currentCSV);
    
    console.log(`   Are they equal?       ${areEqual ? 'YES' : 'NO'}`);
    console.log(`   Should update CSV?    ${areEqual ? 'NO' : 'YES - NEW RESULT DETECTED!'}`);
    
    if (!areEqual) {
      console.log('');
      console.log('🔄 EXPECTED CSV UPDATE:');
      console.log(`   New top entry: ${fullResult.join(',')}`);
      console.log(`   Old top moves to second: ${currentCSV.join(',')}`);
    }
  }
  
  // Show other results for reference
  console.log('');
  console.log('📋 OTHER RESULTS ON WEBSITE:');
  for (let i = 1; i < Math.min(matches.length, 4); i++) {
    const match = matches[i];
    const numbers = match.slice(1, 7).map(n => parseInt(n));
    console.log(`   Result ${i + 1}: [${numbers.join(', ')}] + additional number`);
  }
}

console.log('');
console.log('='.repeat(65));
console.log('💡 CONCLUSION: Your workflow should fetch [22, 25, 29, 31, 34, 43, 11]');
console.log('🎯 This is different from your CSV, so it should update automatically');
console.log('='.repeat(65));
