console.log('🔍 Checking Missing TOTO Results Since Last Update');
console.log('Last update in CSV: December 11, 2025');
console.log('Current date: December 25, 2025');
console.log('='.repeat(60));

// Read current CSV to identify the last update
const fs = require('fs');
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');

console.log('Current CSV entries (first 10):');
lines.slice(0, 10).forEach((line, index) => {
    console.log(`${index + 1}. ${line}`);
});

console.log('\n📅 TOTO Draw Schedule Analysis:');
console.log('TOTO draws typically occur on:');
console.log('- Monday: 6:30 PM');
console.log('- Thursday: 6:30 PM');

// Parse the last date
const lastEntry = lines[0].split(',')[0]; // "11-Dec-25"
console.log(`\nLast recorded draw: ${lastEntry}`);

// Calculate potential missing draws
const expectedDraws = [
    '15-Dec-25', // Monday after 11-Dec
    '19-Dec-25', // Thursday 
    '22-Dec-25', // Monday (might be affected by Christmas week)
    '25-Dec-25'  // Christmas Day (might not have draw)
];

console.log('\n🤔 Potentially Missing Draws:');
expectedDraws.forEach(date => {
    const exists = lines.some(line => line.startsWith(date));
    console.log(`${date}: ${exists ? '✅ Present' : '❌ Missing'}`);
});

console.log('\n📊 Based on Singapore Pools website, latest visible result:');
console.log('Latest: [4, 5, 13, 22, 24, 30] + Additional: 36');
console.log('Prize: $2,920,757 rolled over (no Group 1 winner)');
console.log('Next Draw: Thursday, December 25, 2025 at 6:30 PM');
console.log('Next Jackpot: $4,500,000 estimated');

console.log('\n💡 ANALYSIS:');
console.log('The latest result visible suggests it might be from December 22, 2025');
console.log('This means we potentially need to add:');
console.log('- December 15, 2025 (Monday)');
console.log('- December 19, 2025 (Thursday)'); 
console.log('- December 22, 2025 (Monday) - the [4,5,13,22,24,30]+36 result');

console.log('\n🔧 RECOMMENDED ACTIONS:');
console.log('1. Update CSV with December 15 result (if available)');
console.log('2. Update CSV with December 19 result (if available)');
console.log('3. Update CSV with December 22 result: [4,5,13,22,24,30]+36');
console.log('4. Note: December 25 draw might be delayed due to Christmas');

console.log('\n⚠️  Note: Without access to Singapore Pools archive, we need to');
console.log('   manually verify each missing draw date and results.');
console.log('   The website only shows the most recent result clearly.');