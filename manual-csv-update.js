// Quick manual update to verify the CSV update mechanism works
const fs = require('fs');

console.log('🔧 MANUAL CSV UPDATE TEST');
console.log('='.repeat(40));

// Known latest result from Singapore Pools (manually verified)
const latestResult = [22, 25, 29, 31, 34, 43, 11];

// Read current CSV
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const currentTop = lines[0].split(',').map(n => parseInt(n.trim()));

console.log(`📊 Current CSV top: [${currentTop.join(', ')}]`);
console.log(`🎯 Latest result: [${latestResult.join(', ')}]`);

// Check if they're different
const arraysEqual = (a, b) => a.length === b.length && a.every((val, i) => val === b[i]);

if (!arraysEqual(latestResult, currentTop)) {
  console.log('🔄 Results differ - updating CSV...');
  
  // Add new result to top
  const newContent = [latestResult.join(','), ...lines].join('\n');
  fs.writeFileSync('totoResult.csv', newContent);
  
  console.log('✅ CSV updated successfully!');
  console.log(`📈 New top entry: [${latestResult.join(', ')}]`);
  
  // Verify the update
  const verifyContent = fs.readFileSync('totoResult.csv', 'utf8');
  const verifyTop = verifyContent.trim().split('\n')[0].split(',').map(n => parseInt(n.trim()));
  console.log(`✅ Verification: [${verifyTop.join(', ')}]`);
} else {
  console.log('ℹ️ Results are the same - no update needed');
}

console.log('🏁 Manual test complete');
