import fs from 'fs';

console.log('🧪 PREDICTION CONSISTENCY TEST');
console.log('='.repeat(50));
console.log(`📅 Test Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Verify the fix
function verifyRandomnessRemoval() {
  console.log('🔍 VERIFYING RANDOMNESS REMOVAL');
  console.log('-'.repeat(40));
  
  try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Check for problematic Math.random() usage
    const lines = htmlContent.split('\n');
    const problemLines = [];
    
    lines.forEach((line, index) => {
      if (line.includes('Math.random()') && 
          !line.includes('csvUrl') && 
          !line.includes('cache') &&
          !line.includes('randomId')) {
        problemLines.push({
          lineNumber: index + 1,
          content: line.trim()
        });
      }
    });
    
    if (problemLines.length === 0) {
      console.log('✅ NO PROBLEMATIC RANDOMNESS FOUND');
      console.log('   All Math.random() calls are for cache busting only');
    } else {
      console.log('❌ REMAINING RANDOMNESS ISSUES:');
      problemLines.forEach(line => {
        console.log(`   Line ${line.lineNumber}: ${line.content}`);
      });
    }
    
    // Check the specific lines that were fixed
    const patternFilterSection = htmlContent.substring(
      htmlContent.indexOf('function applyPatternFilters'),
      htmlContent.indexOf('return filtered;') + 15
    );
    
    console.log('\n🔧 PATTERN FILTER ANALYSIS:');
    if (patternFilterSection.includes('Math.random()')) {
      console.log('❌ Pattern filter still contains randomness');
    } else {
      console.log('✅ Pattern filter is now deterministic');
    }
    
    // Check for deterministic replacement methods
    if (patternFilterSection.includes('available[0]') && 
        patternFilterSection.includes('available[available.length - 1]')) {
      console.log('✅ Using deterministic selection (first/last available)');
    } else {
      console.log('⚠️ Deterministic selection method unclear');
    }
    
    return problemLines.length === 0;
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
    return false;
  }
}

// Instructions for testing
function provideTestingInstructions() {
  console.log('\n📋 TESTING INSTRUCTIONS');
  console.log('-'.repeat(30));
  
  console.log('To verify predictions are now consistent:');
  console.log('');
  console.log('1. Open the TOTO predictor in your browser');
  console.log('2. Select the SAME base numbers (e.g., 1,2,3,4,5,6)');
  console.log('3. Keep the SAME settings:');
  console.log('   • Same prediction method');
  console.log('   • Same draw range');
  console.log('   • Same include additional number setting');
  console.log('4. Click "Predict" multiple times');
  console.log('5. Results should be IDENTICAL each time');
  console.log('');
  console.log('✅ Expected: Same inputs = Same predictions');
  console.log('❌ If different: There\'s still randomness somewhere');
}

// Analyze what should be consistent
function analyzeConsistencyExpectations() {
  console.log('\n🎯 CONSISTENCY EXPECTATIONS');
  console.log('-'.repeat(40));
  
  console.log('After the fix, these should be DETERMINISTIC:');
  console.log('✅ Frequency calculations (based on historical data)');
  console.log('✅ Compatibility scoring (based on base numbers)');
  console.log('✅ Weighted recent performance (mathematical weights)');
  console.log('✅ Hot/Cold analysis (statistical calculations)');
  console.log('✅ Pattern filtering adjustments (deterministic selection)');
  console.log('✅ Final number selection (highest scoring numbers)');
  console.log('');
  
  console.log('These will CHANGE predictions (as expected):');
  console.log('🔄 Different base numbers selected');
  console.log('🔄 Different prediction method chosen');
  console.log('🔄 Different draw range setting');
  console.log('🔄 Including/excluding additional number');
  console.log('🔄 New historical data added (new draws)');
  console.log('');
  
  console.log('These should NOT affect predictions:');
  console.log('❌ Page refresh');
  console.log('❌ Multiple clicks with same settings');
  console.log('❌ Browser restart');
  console.log('❌ Time of day');
}

// Main test function
function runConsistencyTest() {
  console.log('🚀 Running prediction consistency verification...\n');
  
  const isFixed = verifyRandomnessRemoval();
  provideTestingInstructions();
  analyzeConsistencyExpectations();
  
  console.log('\n📊 FIX VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  if (isFixed) {
    console.log('✅ RANDOMNESS SUCCESSFULLY REMOVED');
    console.log('   • Problematic Math.random() calls eliminated');
    console.log('   • Pattern filtering now uses deterministic selection');
    console.log('   • Predictions should be consistent with same inputs');
  } else {
    console.log('❌ RANDOMNESS STILL PRESENT');
    console.log('   • Additional fixes needed');
    console.log('   • Check remaining Math.random() calls');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Test the predictions manually with same inputs');
  console.log('2. Verify results are identical across multiple attempts');
  console.log('3. Confirm predictions only change when inputs change');
  console.log('4. If issues persist, analyze remaining randomness sources');
  
  console.log('\n🎉 EXPECTED BENEFIT:');
  console.log('• More reliable and trustworthy predictions');
  console.log('• Users can reproduce results for verification');
  console.log('• Easier to analyze prediction accuracy');
  console.log('• Professional, deterministic behavior');
}

// Run the test
runConsistencyTest();