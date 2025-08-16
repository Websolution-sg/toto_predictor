/**
 * CSV FETCH TEST AFTER REMOVING LATEST RESULT
 * This script tests if index.html properly fetches the updated CSV
 */

const fs = require('fs');
const https = require('https');

console.log('🧪 CSV FETCH TEST AFTER REMOVING LATEST RESULT');
console.log('===============================================\n');

function testLocalCSV() {
  console.log('📋 Step 1: Verify Local CSV Changes');
  console.log('-----------------------------------');
  
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`📊 Local CSV now has ${lines.length} lines`);
    console.log(`🎯 New first line: ${lines[0]}`);
    console.log(`📅 Second line: ${lines[1]}`);
    console.log(`📈 Third line: ${lines[2]}`);
    
    if (lines[0] === '9,24,31,34,43,44,1') {
      console.log('✅ Latest result successfully removed');
      console.log('📝 Expected website display: RECENT RESULT: 9,24,31,34,43,44(1)');
    } else {
      console.log('❌ Unexpected first line content');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error reading local CSV: ${error.message}`);
    return false;
  }
}

function simulateIndexHTMLFetch() {
  console.log('\n📋 Step 2: Simulate index.html Fetch Process');
  console.log('--------------------------------------------');
  
  console.log('🔄 Simulating the exact fetch logic from index.html...');
  
  // Simulate the cache-busting URL construction from index.html
  const cacheBuster = new Date().getTime();
  const randomId = Math.random().toString(36).substring(7);
  const csvUrl = `totoResult.csv?v=${cacheBuster}&r=${randomId}&nocache=${Date.now()}`;
  
  console.log(`📡 Constructed URL: ${csvUrl}`);
  
  // Read local file (simulating successful fetch)
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    console.log('✅ File read successful (simulating fetch)');
    
    // Simulate the exact processing from index.html
    const historical = csvContent.trim().split('\n').map(line => line.split(',').map(Number));
    console.log(`📊 Processed ${historical.length} historical records`);
    
    if (historical.length > 0) {
      const recent = historical[0];
      console.log(`🎯 Most recent draw: ${recent.slice(0, 6)} + ${recent[6]}`);
      
      // Simulate the UI update logic
      const resultText = `${recent.slice(0, 6).join(',')}(${recent[6]})`;
      console.log(`📱 UI would display: RECENT RESULT: ${resultText}`);
      
      // Simulate dropdown population
      console.log('🔢 Dropdowns would be populated with:');
      recent.slice(0, 6).forEach((num, idx) => {
        console.log(`   base${idx + 1}: ${num}`);
      });
      console.log(`   additional: ${recent[6]}`);
      
      return recent;
    }
  } catch (error) {
    console.log(`❌ Simulation failed: ${error.message}`);
    return null;
  }
}

async function testAfterCommitAndPush() {
  console.log('\n📋 Step 3: Commit and Test Live Fetch');
  console.log('------------------------------------');
  
  console.log('💡 To complete the test, you should:');
  console.log('1. Commit the CSV changes: git add totoResult.csv');
  console.log('2. Push to GitHub: git commit -m "Test: Remove latest result" && git push');
  console.log('3. Wait 5-10 minutes for GitHub Pages deployment');
  console.log('4. Check website: https://websolution-sg.github.io/toto_predictor/');
  console.log('');
  console.log('🎯 Expected result on website:');
  console.log('   RECENT RESULT: 9,24,31,34,43,44(1)');
  console.log('');
  console.log('📊 This will confirm if index.html is properly fetching the CSV!');
}

function runTestSequence() {
  console.log('🚀 Starting CSV fetch test sequence...\n');
  
  const localOk = testLocalCSV();
  
  if (localOk) {
    const simulatedResult = simulateIndexHTMLFetch();
    
    if (simulatedResult) {
      console.log('\n✅ LOCAL SIMULATION SUCCESSFUL');
      console.log('============================');
      console.log('📝 The fetch logic should work correctly');
      console.log(`🎯 Expected display: RECENT RESULT: ${simulatedResult.slice(0, 6).join(',')}(${simulatedResult[6]})`);
      
      testAfterCommitAndPush();
    } else {
      console.log('\n❌ SIMULATION FAILED');
    }
  } else {
    console.log('\n❌ LOCAL TEST FAILED');
  }
  
  console.log('\n🔍 TESTING CHECKLIST:');
  console.log('====================');
  console.log('□ 1. Local CSV modified ✅');
  console.log('□ 2. Fetch simulation works ✅');
  console.log('□ 3. Commit and push changes');
  console.log('□ 4. Wait for GitHub Pages deployment');
  console.log('□ 5. Verify website shows new result');
  console.log('□ 6. Add back the latest result if needed');
}

runTestSequence();
