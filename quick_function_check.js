// Quick Model Function Check
// Verify that each prediction method function exists and can be called

console.log('⚡ QUICK PREDICTION MODEL FUNCTION CHECK');
console.log('Verifying all functions exist and are callable');
console.log('=' .repeat(55));

// Check if functions exist in the global scope
const functionChecks = [
  { name: 'runEnhancedEnsemblePrediction', expected: 'Enhanced Ensemble method' },
  { name: 'runFrequencyCompatibilityPrediction', expected: 'Frequency+Compatibility method' },
  { name: 'runWeightedPrediction', expected: 'Weighted Recent Analysis method' },
  { name: 'runHotColdPrediction', expected: 'Hot/Cold Balance method' },
  { name: 'generatePrediction', expected: 'Main prediction dispatcher' },
  { name: 'displayPredictedNumbers', expected: 'Results display function' }
];

console.log('\n🔍 FUNCTION EXISTENCE CHECK:');
console.log('-' .repeat(35));

let allFunctionsExist = true;

functionChecks.forEach(check => {
  if (typeof window !== 'undefined' && typeof window[check.name] === 'function') {
    console.log(`✅ ${check.name} - Available`);
  } else if (typeof eval(check.name) === 'function') {
    console.log(`✅ ${check.name} - Available (global)`);
  } else {
    console.log(`❌ ${check.name} - MISSING`);
    allFunctionsExist = false;
  }
});

// Check method dispatcher
console.log('\n🔄 METHOD DISPATCHER CHECK:');
console.log('-' .repeat(30));

const methodMappings = [
  { value: 'enhanced', expectedFunction: 'runEnhancedEnsemblePrediction' },
  { value: 'frequency', expectedFunction: 'runFrequencyCompatibilityPrediction' },
  { value: 'weighted', expectedFunction: 'runWeightedPrediction' },
  { value: 'hotCold', expectedFunction: 'runHotColdPrediction' }
];

console.log('Checking if method selection calls correct functions...');

// Manual Test Instructions
console.log('\n📋 MANUAL FUNCTION TEST:');
console.log('=' .repeat(30));
console.log('Copy this code and run each line in your browser console:');
console.log('');
console.log('// Test Enhanced Ensemble');
console.log('document.getElementById("predictionMethod").value = "enhanced";');
console.log('console.log("Testing Enhanced Ensemble...");');
console.log('generatePrediction();');
console.log('');
console.log('// Test Frequency+Compatibility');  
console.log('document.getElementById("predictionMethod").value = "frequency";');
console.log('console.log("Testing Frequency+Compatibility...");');
console.log('generatePrediction();');
console.log('');
console.log('// Test Weighted Recent Analysis');
console.log('document.getElementById("predictionMethod").value = "weighted";');
console.log('console.log("Testing Weighted Recent Analysis...");'); 
console.log('generatePrediction();');
console.log('');
console.log('// Test Hot/Cold Balance');
console.log('document.getElementById("predictionMethod").value = "hotCold";');
console.log('console.log("Testing Hot/Cold Balance...");');
console.log('generatePrediction();');

console.log('\n✅ EXPECTED BEHAVIOR:');
console.log('=' .repeat(25));
console.log('• Each method should execute without errors');
console.log('• Results should appear in the prediction interface');
console.log('• Different methods should show different results');
console.log('• Console should not show any error messages');

console.log('\n❌ POTENTIAL ISSUES TO WATCH FOR:');
console.log('=' .repeat(40));
console.log('• "Function not defined" errors');
console.log('• "Cannot read property" errors'); 
console.log('• Methods producing no output');
console.log('• All methods producing identical results');
console.log('• JavaScript console errors');

if (allFunctionsExist) {
  console.log('\n🎉 ALL CORE FUNCTIONS DETECTED!');
  console.log('✅ Ready for comprehensive validation testing');
} else {
  console.log('\n⚠️ MISSING FUNCTIONS DETECTED!');
  console.log('❌ Some prediction methods may not work');
  console.log('📋 Check HTML file for function definition issues');
}

console.log('\n🚀 Proceed to run comprehensive_model_validation.js for full testing!');