// Simple browser-based test to check Frequency+Compatibility consistency
// Open index.html and paste this in the console

console.log('🔍 Testing Frequency+Compatibility Method Consistency');

// Test function
function testConsistency() {
  const results = [];
  
  // Set method to Frequency+Compatibility
  document.getElementById('predictionMethod').value = 'frequency';
  document.getElementById('drawRange').value = 30;
  
  // Capture original display function
  const originalDisplay = window.displayPredictedNumbers;
  
  // Run 5 predictions and capture results
  for (let i = 1; i <= 5; i++) {
    let capturedNumbers = null;
    
    // Temporarily override display function
    window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
      capturedNumbers = [...numbers].sort((a, b) => a - b);
      // Restore original display
      window.displayPredictedNumbers = originalDisplay;
      // Call original to show in UI
      originalDisplay(numbers, _, scores, freq, compat, title);
    };
    
    // Generate prediction
    generatePrediction();
    
    if (capturedNumbers) {
      results.push({ run: i, numbers: capturedNumbers });
      console.log(`Run ${i}: [${capturedNumbers.join(',')}]`);
    }
    
    // Restore display function for next iteration
    window.displayPredictedNumbers = originalDisplay;
  }
  
  // Check consistency
  if (results.length > 1) {
    const firstResult = JSON.stringify(results[0].numbers);
    const allMatch = results.every(r => JSON.stringify(r.numbers) === firstResult);
    
    if (allMatch) {
      console.log('✅ SUCCESS: All results are identical!');
      console.log('🎯 Frequency+Compatibility method is now consistent');
    } else {
      console.log('❌ FAILURE: Results are still varying');
      console.log('Different results found:');
      results.forEach(r => {
        if (JSON.stringify(r.numbers) !== firstResult) {
          console.log(`  Run ${r.run}: [${r.numbers.join(',')}] (differs from run 1)`);
        }
      });
    }
  }
  
  return results;
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Make sure TOTO data is loaded');
console.log('2. Run: testConsistency()');
console.log('3. Check if all 5 runs produce identical results');

// Make test function globally available
window.testConsistency = testConsistency;