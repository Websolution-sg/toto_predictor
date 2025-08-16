// Quick result display
const fs = require('fs');

console.log('🎯 TOTO PREDICTOR RESULTS');
console.log('========================');
console.log('📅 Date: August 16, 2025');
console.log('');

// Read current CSV
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');

console.log('📊 CURRENT CSV STATUS:');
console.log(`   Total entries: ${lines.length}`);
console.log(`   Latest result: ${lines[0]}`);
console.log('');

console.log('🎯 LATEST TOTO RESULT:');
console.log('----------------------');
const latestNumbers = lines[0].split(',').map(n => parseInt(n.trim()));
const mainNumbers = latestNumbers.slice(0, 6);
const additionalNumber = latestNumbers[6];

console.log(`Main Numbers: ${mainNumbers.join(', ')}`);
console.log(`Additional Number: ${additionalNumber}`);
console.log(`Full Result: ${lines[0]}`);

console.log('');
console.log('✅ This is the current latest result in your system');
console.log('🔄 Your workflow will update this when a newer result is available from Singapore Pools');
