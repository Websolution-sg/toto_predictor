// COMPREHENSIVE WORKFLOW TEST
const fs = require('fs');

console.log('🧪 COMPREHENSIVE WORKFLOW TEST');
console.log('================================\n');

async function testWorkflow() {
  console.log('📊 CURRENT STATE ANALYSIS:');
  
  try {
    // Check CSV current state
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const currentFirst = lines[0];
    
    console.log(`   📄 CSV first entry: ${currentFirst}`);
    console.log(`   📈 Total entries: ${lines.length}`);
    console.log(`   📅 Last modified: ${fs.statSync('totoResult.csv').mtime.toISOString()}\n`);
    
    // Analyze the current result
    if (currentFirst === '9,24,31,34,43,44,1') {
      console.log('🔍 RESULT ANALYSIS:');
      console.log('   ❌ Status: UNCHANGED - Still showing old incorrect result');
      console.log('   📋 Implication: Workflow has NOT successfully updated CSV');
      console.log('   🎯 Action needed: Workflow needs to run or is failing\n');
    } else {
      console.log('🔍 RESULT ANALYSIS:');
      console.log('   ✅ Status: UPDATED - CSV shows different result');
      console.log('   📋 Implication: Workflow has modified the CSV');
      console.log(`   🎯 Current result: ${currentFirst}\n`);
    }
    
    // Check script version
    console.log('🔧 SCRIPT VALIDATION:');
    
    if (fs.existsSync('updateTotoCSV.cjs')) {
      const scriptContent = fs.readFileSync('updateTotoCSV.cjs', 'utf8');
      const scriptStats = fs.statSync('updateTotoCSV.cjs');
      
      console.log(`   ✅ Script exists (${Math.round(scriptStats.size / 1024)}KB)`);
      console.log(`   📅 Last modified: ${scriptStats.mtime.toISOString()}`);
      
      // Check for dynamic features
      const features = [
        { name: 'FULLY DYNAMIC version', check: scriptContent.includes('FULLY DYNAMIC') },
        { name: 'Date-based analysis', check: scriptContent.includes('fetchLatestByDateAnalysis') },
        { name: 'Most recent detection', check: scriptContent.includes('parseLatestResultByMostRecentDate') },
        { name: 'No hardcoded values', check: !scriptContent.includes('KNOWN_LATEST_RESULT') && !scriptContent.includes('[22, 25, 29, 31, 34, 43, 11]') },
        { name: 'Dynamic parsing', check: scriptContent.includes('extractTotoNumbersFromContext') },
        { name: 'Multiple strategies', check: scriptContent.includes('tryMultipleEndpointsForLatest') }
      ];
      
      console.log('\n   📋 Feature Analysis:');
      features.forEach(feature => {
        console.log(`      ${feature.check ? '✅' : '❌'} ${feature.name}`);
      });
      
    } else {
      console.log('   ❌ Script missing: updateTotoCSV.cjs');
    }
    
    // Check GitHub Actions workflow file
    console.log('\n🔄 WORKFLOW CONFIGURATION:');
    
    if (fs.existsSync('.github/workflows/update-toto.yml')) {
      const workflowContent = fs.readFileSync('.github/workflows/update-toto.yml', 'utf8');
      console.log('   ✅ GitHub Actions workflow exists');
      
      if (workflowContent.includes('node updateTotoCSV.cjs')) {
        console.log('   ✅ Workflow calls correct script');
      } else {
        console.log('   ❌ Workflow may not be calling correct script');
      }
      
      if (workflowContent.includes('schedule:')) {
        console.log('   ✅ Scheduled execution configured');
      }
      
      if (workflowContent.includes('workflow_dispatch:')) {
        console.log('   ✅ Manual triggering enabled');
      }
      
    } else {
      console.log('   ❌ GitHub Actions workflow missing');
    }
    
    // Overall assessment
    console.log('\n🎯 WORKFLOW TEST RESULTS:');
    
    if (currentFirst === '9,24,31,34,43,44,1') {
      console.log('   📋 OVERALL STATUS: WORKFLOW NOT EXECUTED OR FAILING');
      console.log('   🔍 POSSIBLE REASONS:');
      console.log('      1. Workflow has not been triggered recently');
      console.log('      2. Workflow is failing during execution');
      console.log('      3. Script is unable to fetch from Singapore Pools website');
      console.log('      4. Network connectivity issues in GitHub Actions environment');
      console.log('      5. Website structure changes preventing parsing');
      
      console.log('\n   📋 RECOMMENDED ACTIONS:');
      console.log('      1. Manually trigger GitHub Actions workflow');
      console.log('      2. Check workflow execution logs for errors');
      console.log('      3. Verify Singapore Pools website accessibility');
      console.log('      4. Test script locally if possible');
      
    } else {
      console.log('   📋 OVERALL STATUS: WORKFLOW HAS UPDATED CSV');
      console.log('   🔍 VERIFICATION NEEDED:');
      console.log('      1. Check if result matches current Singapore Pools website');
      console.log('      2. Verify result was fetched dynamically (not hardcoded)');
      console.log('      3. Confirm date-based latest detection worked');
      
      console.log('\n   📋 VALIDATION STEPS:');
      console.log('      1. Visit Singapore Pools TOTO results page');
      console.log('      2. Compare with CSV first entry');
      console.log('      3. Check workflow logs for dynamic fetching evidence');
    }
    
    console.log('\n✅ COMPREHENSIVE TEST COMPLETED');
    console.log(`📊 Summary: CSV ${currentFirst === '9,24,31,34,43,44,1' ? 'NOT UPDATED' : 'UPDATED'} - ${currentFirst === '9,24,31,34,43,44,1' ? 'Workflow needs execution' : 'Verify result authenticity'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkflow();
