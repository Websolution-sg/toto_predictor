// Comprehensive consistency validation for Weighted Recent Analysis & Hot/Cold methods
// Testing with ranges 20, 50, and 100

console.log('🔍 COMPREHENSIVE VALIDATION: WEIGHTED RECENT & HOT/COLD METHODS');
console.log('Testing Ranges: 20, 50, 100');
console.log('=' .repeat(80));

// Enhanced test function for specific method and ranges
function validateMethodConsistency(methodValue, methodName, testRanges = [20, 50, 100]) {
  console.log(`\n📊 Testing ${methodName}:`);
  console.log('-' .repeat(60));
  
  const allResults = {};
  let overallConsistent = true;
  
  for (const range of testRanges) {
    console.log(`\n  🎯 Range ${range}:`);
    const results = [];
    
    // Capture original functions
    const originalDisplay = window.displayPredictedNumbers;
    
    for (let run = 1; run <= 5; run++) {
      let capturedNumbers = null;
      let capturedTitle = '';
      
      // Override display function to capture results
      window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
        capturedNumbers = [...numbers].sort((a, b) => a - b);
        capturedTitle = title;
        // Call original for UI
        originalDisplay(numbers, _, scores, freq, compat, title);
      };
      
      // Set method and range
      document.getElementById('predictionMethod').value = methodValue;
      document.getElementById('drawRange').value = range;
      
      // Generate prediction
      try {
        generatePrediction();
        
        if (capturedNumbers) {
          results.push({
            run: run,
            numbers: capturedNumbers,
            title: capturedTitle
          });
          console.log(`    Run ${run}: [${capturedNumbers.join(',')}]`);
        } else {
          console.log(`    Run ${run}: ❌ No results captured`);
        }
      } catch (error) {
        console.log(`    Run ${run}: ❌ Error - ${error.message}`);
      }
      
      // Restore display function
      window.displayPredictedNumbers = originalDisplay;
    }
    
    // Check consistency for this range
    if (results.length > 1) {
      const firstResult = JSON.stringify(results[0].numbers);
      const allMatch = results.every(r => JSON.stringify(r.numbers) === firstResult);
      
      if (allMatch) {
        console.log(`    ✅ Range ${range}: CONSISTENT - [${results[0].numbers.join(',')}]`);
        allResults[`Range${range}`] = { 
          status: 'CONSISTENT', 
          numbers: results[0].numbers,
          title: results[0].title
        };
      } else {
        console.log(`    ❌ Range ${range}: INCONSISTENT`);
        overallConsistent = false;
        allResults[`Range${range}`] = { 
          status: 'INCONSISTENT', 
          numbers: results.map(r => r.numbers),
          differences: results.slice(1).filter((r, i) => JSON.stringify(r.numbers) !== firstResult)
        };
        
        // Show differences
        results.forEach((r, i) => {
          if (i > 0 && JSON.stringify(r.numbers) !== firstResult) {
            console.log(`      Difference in run ${r.run}: [${r.numbers.join(',')}]`);
          }
        });
      }
    } else if (results.length === 1) {
      console.log(`    ⚠️ Range ${range}: Only one result captured`);
      allResults[`Range${range}`] = { 
        status: 'SINGLE_RESULT', 
        numbers: results[0].numbers 
      };
    } else {
      console.log(`    ❌ Range ${range}: No valid results`);
      overallConsistent = false;
      allResults[`Range${range}`] = { status: 'NO_RESULTS' };
    }
  }
  
  return { results: allResults, consistent: overallConsistent };
}

// Main validation function for ranges 20, 50, 100
function validateRanges20_50_100() {
  console.log('🚀 Starting comprehensive validation...');
  console.log('⏱️  This will test each method 5 times for each range (30 total tests)');
  
  // Test Weighted Recent Analysis
  const weightedTest = validateMethodConsistency('weighted', 'Weighted Recent Analysis', [20, 50, 100]);
  
  // Test Hot/Cold Analysis  
  const hotColdTest = validateMethodConsistency('hotCold', 'Hot/Cold Balance Analysis', [20, 50, 100]);
  
  // Comprehensive Summary Report
  console.log('\n' + '=' .repeat(80));
  console.log('📋 COMPREHENSIVE VALIDATION SUMMARY');
  console.log('=' .repeat(80));
  
  console.log('\n🔸 Weighted Recent Analysis Results:');
  for (const [range, result] of Object.entries(weightedTest.results)) {
    if (result.status === 'CONSISTENT') {
      console.log(`  ${range}: ✅ ${result.status} - [${result.numbers.join(',')}]`);
    } else if (result.status === 'INCONSISTENT') {
      console.log(`  ${range}: ❌ ${result.status} - Multiple different results found`);
    } else {
      console.log(`  ${range}: ⚠️ ${result.status}`);
    }
  }
  
  console.log('\n🔸 Hot/Cold Balance Analysis Results:');
  for (const [range, result] of Object.entries(hotColdTest.results)) {
    if (result.status === 'CONSISTENT') {
      console.log(`  ${range}: ✅ ${result.status} - [${result.numbers.join(',')}]`);
    } else if (result.status === 'INCONSISTENT') {
      console.log(`  ${range}: ❌ ${result.status} - Multiple different results found`);
    } else {
      console.log(`  ${range}: ⚠️ ${result.status}`);
    }
  }
  
  // Range Differentiation Analysis
  console.log('\n🎯 RANGE DIFFERENTIATION ANALYSIS:');
  console.log('-' .repeat(50));
  
  // Check if different ranges produce different results (which is expected and good)
  const checkRangeDifferentiation = (testResults, methodName) => {
    const consistentRanges = Object.entries(testResults.results)
      .filter(([_, result]) => result.status === 'CONSISTENT')
      .map(([range, result]) => ({ range, numbers: result.numbers }));
    
    if (consistentRanges.length >= 2) {
      const allSame = consistentRanges.every(r => 
        JSON.stringify(r.numbers) === JSON.stringify(consistentRanges[0].numbers)
      );
      
      if (allSame) {
        console.log(`⚠️ ${methodName}: All ranges produce identical results (may lack range sensitivity)`);
      } else {
        console.log(`✅ ${methodName}: Different ranges produce different results (good range differentiation)`);
        consistentRanges.forEach(r => {
          console.log(`   ${r.range}: [${r.numbers.join(',')}]`);
        });
      }
    }
  };
  
  checkRangeDifferentiation(weightedTest, 'Weighted Recent Analysis');
  checkRangeDifferentiation(hotColdTest, 'Hot/Cold Balance Analysis');
  
  // Overall Assessment
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log('=' .repeat(50));
  
  const weightedPassed = weightedTest.consistent;
  const hotColdPassed = hotColdTest.consistent;
  
  if (weightedPassed && hotColdPassed) {
    console.log('🎉 VALIDATION PASSED: Both methods are fully consistent!');
    console.log('✅ Weighted Recent Analysis: All ranges produce consistent results');
    console.log('✅ Hot/Cold Balance Analysis: All ranges produce consistent results');
    console.log('🎯 System is ready for reliable predictions across all ranges!');
  } else {
    console.log('❌ VALIDATION FAILED: Consistency issues detected');
    if (!weightedPassed) {
      console.log('  🔴 Weighted Recent Analysis: Has inconsistencies');
    }
    if (!hotColdPassed) {
      console.log('  🔴 Hot/Cold Balance Analysis: Has inconsistencies');
    }
    console.log('  📋 Check individual range results above for details');
  }
  
  return { 
    weightedTest, 
    hotColdTest, 
    overallPassed: weightedPassed && hotColdPassed 
  };
}

// Quick individual range test
function quickRangeTest(range) {
  console.log(`\n🚀 Quick test for range ${range}:`);
  
  const tests = [
    { method: 'weighted', name: 'Weighted Recent' },
    { method: 'hotCold', name: 'Hot/Cold Balance' }
  ];
  
  tests.forEach(test => {
    document.getElementById('predictionMethod').value = test.method;
    document.getElementById('drawRange').value = range;
    
    console.log(`  ${test.name}:`);
    generatePrediction();
    
    // Give a moment for the UI to update
    setTimeout(() => {
      const results = document.getElementById('results');
      const numbersMatch = results.innerHTML.match(/(\d+(?:,\s*\d+)*)/);
      if (numbersMatch) {
        console.log(`    Result: [${numbersMatch[1]}]`);
      }
    }, 100);
  });
}

// Make functions globally available
console.log('\n📋 AVAILABLE TEST FUNCTIONS:');
console.log('1. validateRanges20_50_100() - Full comprehensive test');
console.log('2. quickRangeTest(range) - Quick test for specific range');
console.log('3. validateMethodConsistency(method, name, ranges) - Custom test');

window.validateRanges20_50_100 = validateRanges20_50_100;
window.quickRangeTest = quickRangeTest;
window.validateMethodConsistency = validateMethodConsistency;

console.log('\n✨ Run validateRanges20_50_100() to start the comprehensive test!');