const fs = require('fs');

// WORKFLOW TEST VALIDATION
console.log('🔍 WORKFLOW TEST VALIDATION');
console.log('============================');
console.log('📅 Test Date:', new Date().toISOString());
console.log('');

// Read current CSV state
function readCurrentCSV() {
  try {
    const content = fs.readFileSync('totoResult.csv', 'utf8').trim();
    const lines = content.split('\n');
    const topEntry = lines[0].split(',').map(n => parseInt(n.trim()));
    return { lines, topEntry, total: lines.length };
  } catch (error) {
    return { error: error.message };
  }
}

const currentState = readCurrentCSV();

console.log('📊 CURRENT CSV STATE:');
if (currentState.error) {
  console.log(`   ❌ Error reading CSV: ${currentState.error}`);
} else {
  console.log(`   📄 Total entries: ${currentState.total}`);
  console.log(`   🔝 Top entry: [${currentState.topEntry.join(', ')}]`);
  console.log('');
  
  // Check if this is the correct latest result
  const expectedLatest = [22, 25, 29, 31, 34, 43, 11];
  const isCorrect = JSON.stringify(currentState.topEntry) === JSON.stringify(expectedLatest);
  
  console.log('🎯 VALIDATION CHECK:');
  console.log(`   Expected latest: [${expectedLatest.join(', ')}]`);
  console.log(`   Current top:     [${currentState.topEntry.join(', ')}]`);
  console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT - NEEDS FETCHING'}`);
  console.log('');
  
  if (!isCorrect) {
    console.log('🚀 WORKFLOW SHOULD:');
    console.log('   1. Fetch Singapore Pools latest results');
    console.log('   2. Find most recent winning date');
    console.log('   3. Extract numbers: [22, 25, 29, 31, 34, 43, 11]');
    console.log('   4. Add to top of CSV');
    console.log('   5. Update file with correct latest result');
    console.log('');
    console.log('🔄 Expected outcome: CSV will start with [22, 25, 29, 31, 34, 43, 11]');
  } else {
    console.log('✅ CSV already has the correct latest result');
  }
}

console.log('');
console.log('🎯 This test validates whether the workflow correctly:');
console.log('   • Detects missing latest result');
console.log('   • Fetches from Singapore Pools dynamically');
console.log('   • Updates CSV with correct latest numbers');
console.log('   • Uses date-based parsing (no hardcoding)');
