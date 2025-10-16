// Manual test results for ranges 20, 50, 100
// Run this in browser console after loading index.html

console.log('🔍 MANUAL RANGE VALIDATION TEST');
console.log('Testing Weighted Recent Analysis & Hot/Cold Balance');
console.log('Ranges: 20, 50, 100');
console.log('=' .repeat(60));

function manualRangeTest() {
  const ranges = [20, 50, 100];
  const methods = [
    { value: 'weighted', name: 'Weighted Recent Analysis' },
    { value: 'hotCold', name: 'Hot/Cold Balance Analysis' }
  ];
  
  console.log('\n📊 RUNNING MANUAL TESTS...\n');
  
  methods.forEach(method => {
    console.log(`🔸 ${method.name}:`);
    
    ranges.forEach(range => {
      // Set method and range
      document.getElementById('predictionMethod').value = method.value;
      document.getElementById('drawRange').value = range;
      
      // Capture results
      let capturedNumbers = null;
      const originalDisplay = window.displayPredictedNumbers;
      
      window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
        capturedNumbers = [...numbers].sort((a, b) => a - b);
        originalDisplay(numbers, _, scores, freq, compat, title);
      };
      
      // Generate prediction
      generatePrediction();
      
      if (capturedNumbers) {
        console.log(`  Range ${range}: [${capturedNumbers.join(',')}]`);
      } else {
        console.log(`  Range ${range}: ❌ No result`);
      }
      
      // Restore function
      window.displayPredictedNumbers = originalDisplay;
    });
    
    console.log(''); // Empty line between methods
  });
  
  console.log('✅ Test completed! Each range should show different results.');
  console.log('🔄 Run this function multiple times to verify consistency.');
  console.log('   (Same range should always give same result)');
}

// Instructions
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Make sure TOTO data is loaded');
console.log('2. Run: manualRangeTest()');
console.log('3. Check that each method shows different results for different ranges');
console.log('4. Run manualRangeTest() again to verify same results repeat');

// Make function available
window.manualRangeTest = manualRangeTest;