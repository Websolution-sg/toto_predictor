// COMPREHENSIVE CODE VALIDATION SCRIPT
// This script performs comprehensive validation of the TOTO prediction system

console.log('🎯 COMPREHENSIVE TOTO PREDICTION SYSTEM VALIDATION');
console.log('=' .repeat(60));

// Test 1: CSV Data Validation
function validateCsvData() {
  console.log('\n📋 TEST 1: CSV DATA VALIDATION');
  console.log('=' .repeat(40));
  
  if (typeof historical === 'undefined') {
    console.log('❌ Historical data not loaded');
    return false;
  }
  
  console.log(`✅ Historical data loaded: ${historical.length} entries`);
  
  if (historical.length === 0) {
    console.log('❌ No historical data available');
    return false;
  }
  
  // Check data structure
  const sample = historical[0];
  console.log('📊 Sample data structure:', sample);
  
  if (!sample.numbers || !Array.isArray(sample.numbers) || sample.numbers.length !== 6) {
    console.log('❌ Invalid numbers array structure');
    return false;
  }
  
  if (typeof sample.additional !== 'number') {
    console.log('❌ Invalid additional number structure');
    return false;
  }
  
  console.log('✅ CSV data structure is valid');
  console.log(`📅 Latest draw: ${sample.date} - Numbers: ${sample.numbers.join(',')} + ${sample.additional}`);
  
  return true;
}

// Test 2: Function Existence Validation
function validateFunctions() {
  console.log('\n🔧 TEST 2: FUNCTION EXISTENCE VALIDATION');
  console.log('=' .repeat(45));
  
  const requiredFunctions = [
    'runEnhancedEnsemblePrediction',
    'runFrequencyCompatibilityPrediction', 
    'runWeightedPrediction',
    'runHotColdPrediction',
    'predict',
    'getSelectedBases',
    'displayPredictedNumbers'
  ];
  
  let allFunctionsExist = true;
  
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ ${funcName} - EXISTS`);
    } else {
      console.log(`❌ ${funcName} - MISSING`);
      allFunctionsExist = false;
    }
  });
  
  return allFunctionsExist;
}

// Test 3: UI Elements Validation
function validateUIElements() {
  console.log('\n🖥️ TEST 3: UI ELEMENTS VALIDATION');
  console.log('=' .repeat(40));
  
  const requiredElements = [
    'predictionMethod',
    'drawRange',
    'includeAdd',
    'base1', 'base2', 'base3', 'base4', 'base5', 'base6',
    'additional',
    'recentResult'
  ];
  
  let allElementsExist = true;
  
  requiredElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      console.log(`✅ ${elementId} - EXISTS (${element.tagName})`);
    } else {
      console.log(`❌ ${elementId} - MISSING`);
      allElementsExist = false;
    }
  });
  
  return allElementsExist;
}

// Test 4: Prediction Methods Functionality
function validatePredictionMethods() {
  console.log('\n🎲 TEST 4: PREDICTION METHODS FUNCTIONALITY');
  console.log('=' .repeat(50));
  
  const methods = [
    {id: 'enhanced', name: 'Enhanced Ensemble'},
    {id: 'frequency', name: 'Frequency+Compatibility'},
    {id: 'weighted', name: 'Weighted Recent Analysis'},
    {id: 'hotcold', name: 'Hot/Cold Balance'}
  ];
  
  let allMethodsWork = true;
  
  methods.forEach(method => {
    try {
      console.log(`\n🧪 Testing ${method.name}...`);
      
      // Set up test parameters
      document.getElementById('predictionMethod').value = method.id;
      document.getElementById('drawRange').value = 30;
      
      // Clear any existing results
      const resultDiv = document.getElementById('predictedNumbers');
      if (resultDiv) resultDiv.innerHTML = '';
      
      // Run prediction
      predict();
      
      // Check if result was generated
      const hasResult = resultDiv && resultDiv.innerHTML.trim() !== '';
      
      if (hasResult) {
        console.log(`✅ ${method.name} - WORKING`);
      } else {
        console.log(`❌ ${method.name} - NO OUTPUT`);
        allMethodsWork = false;
      }
      
    } catch (error) {
      console.log(`❌ ${method.name} - ERROR: ${error.message}`);
      allMethodsWork = false;
    }
  });
  
  return allMethodsWork;
}

// Test 5: Range Differentiation
function validateRangeDifferentiation() {
  console.log('\n📊 TEST 5: RANGE DIFFERENTIATION VALIDATION');
  console.log('=' .repeat(50));
  
  const ranges = [20, 50, 100];
  const results = {};
  
  document.getElementById('predictionMethod').value = 'enhanced';
  
  ranges.forEach(range => {
    try {
      document.getElementById('drawRange').value = range;
      
      // Capture console output for comparison
      const originalLog = console.log;
      let capturedOutput = '';
      console.log = function(...args) {
        capturedOutput += args.join(' ') + '\n';
        originalLog.apply(console, args);
      };
      
      predict();
      
      console.log = originalLog;
      
      // Get displayed result
      const resultDiv = document.getElementById('predictedNumbers');
      const displayedResult = resultDiv ? resultDiv.textContent : '';
      
      results[range] = {
        output: capturedOutput,
        display: displayedResult
      };
      
      console.log(`📋 Range ${range} - Result captured`);
      
    } catch (error) {
      console.log(`❌ Range ${range} - ERROR: ${error.message}`);
      results[range] = { error: error.message };
    }
  });
  
  // Compare results
  console.log('\n🔍 Range Comparison:');
  const range20 = results[20]?.display || '';
  const range50 = results[50]?.display || '';
  const range100 = results[100]?.display || '';
  
  const allDifferent = range20 !== range50 && range50 !== range100 && range20 !== range100;
  
  console.log(`Range 20 result: ${range20}`);
  console.log(`Range 50 result: ${range50}`);
  console.log(`Range 100 result: ${range100}`);
  console.log(`All ranges different: ${allDifferent ? '✅ YES' : '❌ NO'}`);
  
  return allDifferent;
}

// Test 6: Consistency Check
function validateConsistency() {
  console.log('\n🔄 TEST 6: CONSISTENCY VALIDATION');
  console.log('=' .repeat(40));
  
  document.getElementById('predictionMethod').value = 'weighted';
  document.getElementById('drawRange').value = 30;
  
  const results = [];
  
  for (let i = 1; i <= 3; i++) {
    try {
      predict();
      const resultDiv = document.getElementById('predictedNumbers');
      const result = resultDiv ? resultDiv.textContent : '';
      results.push(result);
      console.log(`Run ${i}: ${result}`);
    } catch (error) {
      console.log(`❌ Run ${i} - ERROR: ${error.message}`);
      return false;
    }
  }
  
  const allSame = results.every(result => result === results[0]);
  console.log(`Consistency check: ${allSame ? '✅ PASSED' : '❌ FAILED'}`);
  
  return allSame;
}

// Test 7: Data Integrity
function validateDataIntegrity() {
  console.log('\n🔍 TEST 7: DATA INTEGRITY VALIDATION');
  console.log('=' .repeat(45));
  
  if (!historical || historical.length === 0) {
    console.log('❌ No historical data available');
    return false;
  }
  
  let integrityIssues = 0;
  
  historical.forEach((draw, index) => {
    // Check numbers are in valid range (1-49)
    const invalidNumbers = draw.numbers.filter(n => n < 1 || n > 49);
    if (invalidNumbers.length > 0) {
      console.log(`❌ Draw ${index}: Invalid numbers ${invalidNumbers.join(',')}`);
      integrityIssues++;
    }
    
    // Check for duplicates within a draw
    const uniqueNumbers = new Set(draw.numbers);
    if (uniqueNumbers.size !== 6) {
      console.log(`❌ Draw ${index}: Duplicate numbers found`);
      integrityIssues++;
    }
    
    // Check additional number
    if (draw.additional < 1 || draw.additional > 49) {
      console.log(`❌ Draw ${index}: Invalid additional number ${draw.additional}`);
      integrityIssues++;
    }
    
    // Check if additional number conflicts with main numbers
    if (draw.numbers.includes(draw.additional)) {
      console.log(`❌ Draw ${index}: Additional number ${draw.additional} conflicts with main numbers`);
      integrityIssues++;
    }
  });
  
  if (integrityIssues === 0) {
    console.log(`✅ Data integrity check passed for ${historical.length} draws`);
    return true;
  } else {
    console.log(`❌ Found ${integrityIssues} data integrity issues`);
    return false;
  }
}

// Main Validation Runner
function runCompleteValidation() {
  console.log('🚀 STARTING COMPREHENSIVE VALIDATION...\n');
  
  const results = {
    csvData: validateCsvData(),
    functions: validateFunctions(),
    uiElements: validateUIElements(),
    predictionMethods: validatePredictionMethods(),
    rangeDifferentiation: validateRangeDifferentiation(),
    consistency: validateConsistency(),
    dataIntegrity: validateDataIntegrity()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 FINAL VALIDATION SUMMARY');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL VALIDATION TESTS PASSED!');
    console.log('✅ Your TOTO prediction system is fully functional');
  } else {
    console.log('⚠️ Some validation tests failed');
    console.log('❌ Please review the failed tests above');
  }
  
  return results;
}

// Instructions for user
console.log('\n📋 VALIDATION INSTRUCTIONS:');
console.log('1. Open your index.html file in a web browser');
console.log('2. Wait for the page to fully load (CSV data should be loaded)');
console.log('3. Open Developer Console (F12)');
console.log('4. Copy and paste this entire script');
console.log('5. Run: runCompleteValidation()');
console.log('\n🚀 Ready to validate your system!');

// Auto-run if in browser context
if (typeof window !== 'undefined' && window.document) {
  console.log('\n⏳ Auto-running validation in 2 seconds...');
  setTimeout(() => {
    runCompleteValidation();
  }, 2000);
}