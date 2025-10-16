// Validate Weighted Recent Analysis and Hot/Cold consistency
// This test checks if both methods produce identical results across multiple runs

console.log('🔍 VALIDATING WEIGHTED RECENT ANALYSIS & HOT/COLD CONSISTENCY');
console.log('=' .repeat(70));

// Test function for a specific method
function testMethodConsistency(methodValue, methodName, testRanges = [20, 30, 50]) {
  console.log(`\n📊 Testing ${methodName}:`);
  console.log('-' .repeat(50));
  
  const allResults = {};
  
  for (const range of testRanges) {
    console.log(`\n  Range ${range}:`);
    const results = [];
    
    // Capture original functions
    const originalDisplay = window.displayPredictedNumbers;
    
    for (let run = 1; run <= 3; run++) {
      let capturedNumbers = null;
      
      // Override display function to capture results
      window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
        capturedNumbers = [...numbers].sort((a, b) => a - b);
        // Call original for UI
        originalDisplay(numbers, _, scores, freq, compat, title);
      };
      
      // Set method and range
      document.getElementById('predictionMethod').value = methodValue;
      document.getElementById('drawRange').value = range;
      
      // Generate prediction
      generatePrediction();
      
      if (capturedNumbers) {
        results.push(capturedNumbers);
        console.log(`    Run ${run}: [${capturedNumbers.join(',')}]`);
      }
      
      // Restore display function
      window.displayPredictedNumbers = originalDisplay;
    }
    
    // Check consistency for this range
    if (results.length > 1) {
      const firstResult = JSON.stringify(results[0]);
      const allMatch = results.every(r => JSON.stringify(r) === firstResult);
      
      if (allMatch) {
        console.log(`    ✅ Range ${range}: CONSISTENT`);
        allResults[`Range${range}`] = { status: 'CONSISTENT', numbers: results[0] };
      } else {
        console.log(`    ❌ Range ${range}: INCONSISTENT`);
        allResults[`Range${range}`] = { status: 'INCONSISTENT', numbers: results };
      }
    }
  }
  
  return allResults;
}

// Main validation function
function validateBothMethods() {
  console.log('Starting validation of Weighted Recent Analysis and Hot/Cold methods...');
  
  // Test Weighted Recent Analysis
  const weightedResults = testMethodConsistency('weighted', 'Weighted Recent Analysis');
  
  // Test Hot/Cold Analysis  
  const hotColdResults = testMethodConsistency('hotCold', 'Hot/Cold Balance Analysis');
  
  // Summary report
  console.log('\n' + '=' .repeat(70));
  console.log('📋 CONSISTENCY VALIDATION SUMMARY');
  console.log('=' .repeat(70));
  
  console.log('\n🔸 Weighted Recent Analysis:');
  for (const [range, result] of Object.entries(weightedResults)) {
    if (result.status === 'CONSISTENT') {
      console.log(`  ${range}: ✅ ${result.status} - [${result.numbers.join(',')}]`);
    } else {
      console.log(`  ${range}: ❌ ${result.status}`);
    }
  }
  
  console.log('\n🔸 Hot/Cold Balance Analysis:');
  for (const [range, result] of Object.entries(hotColdResults)) {
    if (result.status === 'CONSISTENT') {
      console.log(`  ${range}: ✅ ${result.status} - [${result.numbers.join(',')}]`);
    } else {
      console.log(`  ${range}: ❌ ${result.status}`);
    }
  }
  
  // Overall assessment
  const weightedConsistent = Object.values(weightedResults).every(r => r.status === 'CONSISTENT');
  const hotColdConsistent = Object.values(hotColdResults).every(r => r.status === 'CONSISTENT');
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  if (weightedConsistent && hotColdConsistent) {
    console.log('✅ VALIDATION PASSED: Both methods produce consistent results');
    console.log('🎉 All prediction methods are now deterministic and reliable!');
  } else {
    console.log('❌ VALIDATION FAILED: One or more methods are inconsistent');
    if (!weightedConsistent) {
      console.log('  - Weighted Recent Analysis needs fixing');
    }
    if (!hotColdConsistent) {
      console.log('  - Hot/Cold Balance Analysis needs fixing');
    }
  }
  
  return { weightedResults, hotColdResults, weightedConsistent, hotColdConsistent };
}

// Instructions
console.log('\n📋 VALIDATION INSTRUCTIONS:');
console.log('1. Ensure TOTO data is loaded');
console.log('2. Run: validateBothMethods()');
console.log('3. Check that both methods show ✅ CONSISTENT for all ranges');
console.log('4. Look for final "VALIDATION PASSED" message');

// Make function globally available
window.testMethodConsistency = testMethodConsistency;
window.validateBothMethods = validateBothMethods;