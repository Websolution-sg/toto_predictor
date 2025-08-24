// CSV Structure Verification Script
// Tests that the new CSV structure is correctly parsed

const fs = require('fs');

console.log('🔍 Verifying CSV structure and parsing...');

// Read and parse CSV
const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log(`📊 CSV Structure Analysis:`);
console.log(`- Total columns: ${headers.length}`);
console.log(`- Total data rows: ${lines.length - 1}`);

console.log('\n📋 Column Structure:');
console.log(`1-3: Main prizes (${headers.slice(2, 5).join(', ')})`);
console.log(`4-13: Starter prizes (${headers.slice(5, 15).join(', ')})`);
console.log(`14-23: Consolation prizes (${headers.slice(15, 25).join(', ')})`);

// Parse first row to verify structure
const firstDataRow = lines[1].split(',');
console.log('\n🎯 Latest Draw Verification:');
console.log(`Draw: ${firstDataRow[0]}`);
console.log(`Date: ${firstDataRow[1]}`);
console.log(`1st Prize: ${firstDataRow[2]}`);
console.log(`2nd Prize: ${firstDataRow[3]}`);
console.log(`3rd Prize: ${firstDataRow[4]}`);

const starters = firstDataRow.slice(5, 15);
const consolations = firstDataRow.slice(15, 25);

console.log(`Starter Prizes (${starters.length}): ${starters.join(', ')}`);
console.log(`Consolation Prizes (${consolations.length}): ${consolations.join(', ')}`);

// Verify structure matches Singapore Pools format
const isCorrectStructure = 
  headers.length === 25 && 
  starters.length === 10 && 
  consolations.length === 10;

if (isCorrectStructure) {
  console.log('\n✅ CSV structure is CORRECT!');
  console.log('- 3 main winning numbers ✓');
  console.log('- 10 starter numbers ✓');
  console.log('- 10 consolation numbers ✓');
} else {
  console.log('\n❌ CSV structure needs adjustment');
}

console.log(`\n📈 Sample of all ${lines.length - 1} draws:`);
for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
  const row = lines[i].split(',');
  console.log(`Draw ${row[0]} (${row[1]}): ${row[2]}, ${row[3]}, ${row[4]}`);
}
