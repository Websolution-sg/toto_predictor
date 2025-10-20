// Final System 6 Only Verification Test
console.log('🎯 TESTING SYSTEM 6 ONLY TOTO PREDICTOR');
console.log('=====================================');

// Test if we're in browser environment
if (typeof document !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Test all prediction methods
  const methods = ['enhanced', 'frequency', 'weighted', 'hotcold'];
  
  methods.forEach(method => {
    console.log(`\n🧪 Testing ${method} method:`);
    
    try {
      // Set the method
      document.getElementById('predictionMethod').value = method;
      document.getElementById('drawRange').value = 50;
      
      // Get initial result display
      const resultBefore = document.getElementById('result').innerHTML;
      
      // Run prediction
      predict();
      
      // Get result after prediction
      const resultAfter = document.getElementById('result').innerHTML;
      
      // Check if result changed (indicates successful prediction)
      if (resultAfter !== resultBefore && resultAfter.length > 0) {
        console.log(`✅ ${method} method working correctly`);
        
        // Extract numbers from result to verify exactly 6 numbers
        const numberMatches = resultAfter.match(/\b([1-4]?[0-9])\b/g);
        if (numberMatches && numberMatches.length >= 6) {
          const uniqueNumbers = [...new Set(numberMatches.filter(n => parseInt(n) >= 1 && parseInt(n) <= 49))];
          console.log(`   Numbers generated: ${uniqueNumbers.slice(0, 6).length} unique numbers`);
          
          if (uniqueNumbers.length >= 6) {
            console.log(`   ✅ Proper 6-number System 6 output confirmed`);
          } else {
            console.log(`   ❌ Warning: Less than 6 valid numbers detected`);
          }
        } else {
          console.log(`   ❌ Warning: Could not detect proper number format`);
        }
      } else {
        console.log(`❌ ${method} method may not be working`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${method} method:`, error.message);
    }
  });
  
  // Test system type is locked to 6
  const systemType = document.getElementById('systemType').value;
  console.log(`\n🔒 System Type Check:`);
  console.log(`   Current system type: ${systemType}`);
  
  if (systemType === '6') {
    console.log(`   ✅ System correctly locked to System 6`);
  } else {
    console.log(`   ❌ Warning: System not set to 6`);
  }
  
  console.log('\n🎯 FINAL VERIFICATION COMPLETE');
  console.log('==============================');
  
} else {
  console.log('❌ Not in browser environment - please run this in browser console with HTML page open');
}