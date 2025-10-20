// Comprehensive Prediction Model Validation
// After duplicate function cleanup - verify all models work correctly

console.log('🔍 COMPREHENSIVE PREDICTION MODEL VALIDATION');
console.log('Testing after duplicate function cleanup');
console.log('=' .repeat(70));

// Test Configuration
const testRanges = [20, 50, 100];
const testMethods = [
  { value: 'enhanced', name: 'Enhanced Ensemble', expected: 'Multi-method voting' },
  { value: 'frequency', name: 'Frequency+Compatibility', expected: 'Recent + historical analysis' },
  { value: 'weighted', name: 'Weighted Recent Analysis', expected: 'Range-differentiated decay' },
  { value: 'hotCold', name: 'Hot/Cold Balance', expected: 'Temperature-based analysis' }
];

// Validation Results Storage
let validationResults = {
  consistency: {},
  differentiation: {},
  functionality: {},
  errors: []
};

// Model Validation Function
function validatePredictionModel(methodValue, methodName, testRanges) {
  console.log(`\n📊 VALIDATING: ${methodName}`);
  console.log('=' .repeat(50));
  
  const methodResults = {};
  let isConsistent = true;
  let hasDifferentiation = false;
  let hasErrors = false;
  
  // Test each range
  for (const range of testRanges) {
    console.log(`\n  🎯 Testing Range ${range}:`);
    
    const rangeResults = [];
    
    // Capture original display function
    const originalDisplay = window.displayPredictedNumbers;
    
    // Test consistency - run same range multiple times
    for (let attempt = 1; attempt <= 3; attempt++) {
      let capturedResult = null;
      let capturedTitle = '';
      let errorOccurred = false;
      
      // Override display function to capture results
      window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
        capturedResult = {
          numbers: [...numbers].sort((a, b) => a - b),
          title: title,
          scores: scores ? [...scores] : [],
          timestamp: Date.now()
        };
        // Call original for UI
        originalDisplay(numbers, _, scores, freq, compat, title);
      };
      
      try {
        // Set method and range
        document.getElementById('predictionMethod').value = methodValue;
        document.getElementById('drawRange').value = range;
        
        // Generate prediction
        generatePrediction();
        
        if (capturedResult) {
          rangeResults.push(capturedResult);
          console.log(`    Attempt ${attempt}: [${capturedResult.numbers.join(',')}]`);
        } else {
          console.log(`    Attempt ${attempt}: ❌ No result captured`);
          hasErrors = true;
          errorOccurred = true;
        }
        
      } catch (error) {
        console.log(`    Attempt ${attempt}: ❌ Error - ${error.message}`);
        validationResults.errors.push(`${methodName} Range ${range}: ${error.message}`);
        hasErrors = true;
        errorOccurred = true;
      }
      
      // Restore display function
      window.displayPredictedNumbers = originalDisplay;
    }
    
    // Analyze consistency for this range
    if (rangeResults.length > 1) {
      const firstResult = JSON.stringify(rangeResults[0].numbers);
      const allIdentical = rangeResults.every(r => JSON.stringify(r.numbers) === firstResult);
      
      if (allIdentical) {
        console.log(`    ✅ Range ${range}: CONSISTENT`);
        methodResults[range] = {
          status: 'CONSISTENT',
          numbers: rangeResults[0].numbers,
          title: rangeResults[0].title
        };
      } else {
        console.log(`    ❌ Range ${range}: INCONSISTENT`);
        console.log(`       Results varied between attempts`);
        isConsistent = false;
        methodResults[range] = {
          status: 'INCONSISTENT',
          attempts: rangeResults.map(r => r.numbers)
        };
      }
    } else {
      console.log(`    ⚠️ Range ${range}: Insufficient data for consistency check`);
      methodResults[range] = { status: 'INCOMPLETE' };
    }
  }
  
  // Check range differentiation
  const consistentRanges = Object.entries(methodResults)
    .filter(([_, result]) => result.status === 'CONSISTENT')
    .map(([range, result]) => ({ range: parseInt(range), numbers: result.numbers }));
  
  if (consistentRanges.length >= 2) {
    const allSame = consistentRanges.every(r => 
      JSON.stringify(r.numbers) === JSON.stringify(consistentRanges[0].numbers)
    );
    
    if (!allSame) {
      hasDifferentiation = true;
      console.log(`\n  ✅ RANGE DIFFERENTIATION: Different ranges produce different results`);
    } else {
      console.log(`\n  ⚠️ RANGE DIFFERENTIATION: All ranges produce identical results`);
    }
  }
  
  return {
    methodName,
    consistent: isConsistent,
    differentiated: hasDifferentiation,
    hasErrors: hasErrors,
    results: methodResults
  };
}

// Main Validation Function
function runCompleteModelValidation() {
  console.log('\n🚀 STARTING COMPLETE MODEL VALIDATION...');
  console.log('This will test all 4 methods with ranges 20, 50, 100');
  console.log('Each method will be tested 3 times per range for consistency\n');
  
  const allResults = [];
  
  // Test each prediction method
  for (const method of testMethods) {
    try {
      const result = validatePredictionModel(method.value, method.name, testRanges);
      allResults.push(result);
      
      // Store in validation results
      validationResults.consistency[method.name] = result.consistent;
      validationResults.differentiation[method.name] = result.differentiated;
      validationResults.functionality[method.name] = !result.hasErrors;
      
    } catch (error) {
      console.log(`❌ FATAL ERROR testing ${method.name}: ${error.message}`);
      validationResults.errors.push(`FATAL: ${method.name} - ${error.message}`);
      allResults.push({
        methodName: method.name,
        consistent: false,
        differentiated: false,
        hasErrors: true,
        results: {}
      });
    }
  }
  
  // Generate Comprehensive Report
  generateValidationReport(allResults);
  
  return { allResults, validationResults };
}

// Generate Detailed Validation Report
function generateValidationReport(results) {
  console.log('\n' + '=' .repeat(70));
  console.log('📋 COMPREHENSIVE VALIDATION REPORT');
  console.log('=' .repeat(70));
  
  // Overall Status
  const allConsistent = results.every(r => r.consistent);
  const allDifferentiated = results.every(r => r.differentiated);
  const noErrors = results.every(r => !r.hasErrors);
  
  console.log('\n🎯 OVERALL STATUS:');
  console.log(`  Consistency: ${allConsistent ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Differentiation: ${allDifferentiated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  No Errors: ${noErrors ? '✅ PASS' : '❌ FAIL'}`);
  
  // Individual Method Results
  console.log('\n📊 INDIVIDUAL METHOD RESULTS:');
  results.forEach(result => {
    const status = result.consistent && result.differentiated && !result.hasErrors ? '✅' : '❌';
    console.log(`\n${status} ${result.methodName}:`);
    console.log(`    Consistency: ${result.consistent ? '✅' : '❌'}`);
    console.log(`    Range Differentiation: ${result.differentiated ? '✅' : '❌'}`);
    console.log(`    Error-Free: ${!result.hasErrors ? '✅' : '❌'}`);
    
    // Show results for each range
    Object.entries(result.results).forEach(([range, rangeResult]) => {
      if (rangeResult.status === 'CONSISTENT') {
        console.log(`    Range ${range}: [${rangeResult.numbers.join(',')}]`);
      } else {
        console.log(`    Range ${range}: ${rangeResult.status}`);
      }
    });
  });
  
  // Error Summary
  if (validationResults.errors.length > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    validationResults.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (allConsistent && allDifferentiated && noErrors) {
    console.log('🎉 ALL MODELS VALIDATED SUCCESSFULLY!');
    console.log('✅ All prediction methods are working correctly');
    console.log('✅ Duplicate function cleanup was successful');
    console.log('✅ Range differentiation is working properly');
    console.log('✅ Consistency is maintained within same ranges');
  } else {
    console.log('⚠️ Issues found that need attention:');
    if (!allConsistent) {
      console.log('  - Some methods lack consistency');
    }
    if (!allDifferentiated) {
      console.log('  - Some methods lack range differentiation');
    }
    if (!noErrors) {
      console.log('  - Some methods have runtime errors');
    }
  }
  
  console.log('\n✨ Validation Complete!');
}

// Instructions for manual testing
console.log('\n📋 MANUAL VALIDATION INSTRUCTIONS:');
console.log('1. Ensure TOTO data is loaded in your HTML interface');
console.log('2. Open browser console and paste this validation code');
console.log('3. Run: runCompleteModelValidation()');
console.log('4. Wait for complete testing (this may take a minute)');
console.log('5. Review the comprehensive report');

// Make functions globally available
if (typeof window !== 'undefined') {
  window.runCompleteModelValidation = runCompleteModelValidation;
  window.validatePredictionModel = validatePredictionModel;
  window.validationResults = validationResults;
}

console.log('\n🎯 Ready to run comprehensive validation!');