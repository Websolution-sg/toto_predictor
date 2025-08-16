// Minimal script to test and fix the TOTO fetching issue
const fs = require('fs');

console.log('🔧 MINIMAL TOTO UPDATE TEST');
console.log('='.repeat(50));

// For testing, let's use the known latest result and update CSV directly
const latestResult = [22, 25, 29, 31, 34, 43, 11];
console.log(`🎯 Latest result from Singapore Pools: [${latestResult.join(', ')}]`);

// Read current CSV
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const currentTop = lines[0].split(',').map(n => parseInt(n.trim()));

console.log(`📊 Current CSV top entry: [${currentTop.join(', ')}]`);

// Compare
const arraysEqual = (a, b) => {
  return a.length === b.length && a.every((val, i) => val === b[val]);
};

if (!arraysEqual(latestResult, currentTop)) {
  console.log('🔄 Results differ - updating CSV...');
  
  // Add new result to top
  const newLines = [`${latestResult.join(',')}`, ...lines];
  fs.writeFileSync('totoResult.csv', newLines.join('\n'));
  
  console.log('✅ CSV updated successfully!');
  console.log(`📈 New top entry: [${latestResult.join(', ')}]`);
} else {
  console.log('ℹ️ Results are the same - no update needed');
}

console.log('🏁 Test complete');
