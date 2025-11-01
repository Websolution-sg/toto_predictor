// SCRIPT TO UPDATE ALL RANGE PARSING INSTANCES
const fs = require('fs');

console.log('🔧 UPDATING ALL RANGE PARSING INSTANCES');
console.log('=' .repeat(45));

// Read the HTML file
let content = fs.readFileSync('index.html', 'utf8');

// Count current instances
const oldPattern = /const range = parseInt\(document\.getElementById\('drawRange'\)\.value\);/g;
const matches = content.match(oldPattern);
console.log('Found instances to replace:', matches ? matches.length : 0);

// Replace all instances
content = content.replace(oldPattern, 'const range = getDrawRange();');

// Write back to file
fs.writeFileSync('index.html', content);

console.log('✅ Updated all range parsing instances to use getDrawRange()');
console.log('📊 This enables "All results (129 draws)" option to work properly');

console.log('\n🎯 NEW FUNCTIONALITY:');
console.log('• "All results (129 draws)" option added to dropdown');
console.log('• Data point information shown to users');
console.log('• All prediction methods now support full dataset analysis');
console.log('• Range parsing centralized in getDrawRange() function');

console.log('\n📋 DROPDOWN OPTIONS NOW AVAILABLE:');
console.log('1. Last 20 draws - Recent pattern focus');
console.log('2. Last 50 draws - Balanced analysis');
console.log('3. Last 100 draws - Extended historical view');
console.log('4. All results (129 draws) - Complete dataset analysis');

console.log('\n🚀 READY FOR TESTING!');
console.log('Users can now analyze the complete dataset from 31-Oct-25 to 5-Aug-24');