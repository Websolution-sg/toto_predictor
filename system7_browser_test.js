/**
 * SYSTEM 7 BROWSER TEST SCRIPT
 * Copy this entire script into your browser console when index.html is open
 */

console.log('🚀 SYSTEM 7 BROWSER TEST SCRIPT');
console.log('=' .repeat(40));

// Test 1: Check base7 field existence and setup
console.log('\n1️⃣ CHECKING BASE7 FIELD:');
const base7Field = document.getElementById('base7');
console.log('base7 field exists:', base7Field !== null);
if (base7Field) {
  console.log('base7 field options count:', base7Field.options.length);
  console.log('base7 field current value:', base7Field.value);
  console.log('base7 field display style:', base7Field.style.display);
}

// Test 2: Test system type switching
console.log('\n2️⃣ TESTING SYSTEM TYPE SWITCHING:');
const systemTypeField = document.getElementById('systemType');
console.log('Current system type:', systemTypeField.value);

// Switch to System 6
systemTypeField.value = '6';
systemTypeField.dispatchEvent(new Event('change'));
console.log('After setting System 6:');
console.log('- base7 display:', document.getElementById('base7').style.display);

// Switch to System 7  
systemTypeField.value = '7';
systemTypeField.dispatchEvent(new Event('change'));
console.log('After setting System 7:');
console.log('- base7 display:', document.getElementById('base7').style.display);

// Set a value for base7
document.getElementById('base7').value = '49';
console.log('Set base7 value to 49');

// Test 3: Test getSelectedBases function
console.log('\n3️⃣ TESTING GETSELECTEDBASES FUNCTION:');
try {
  const selectedBases = getSelectedBases();
  console.log('Selected bases:', selectedBases);
  console.log('Number of bases:', selectedBases.length);
  console.log('Expected for System 7:', 7);
  
  if (selectedBases.length === 7) {
    console.log('✅ SUCCESS: getSelectedBases returns 7 numbers');
  } else {
    console.log('❌ FAILURE: Expected 7 numbers, got', selectedBases.length);
  }
  
  // Check for NaN values
  const hasNaN = selectedBases.some(base => isNaN(base));
  if (hasNaN) {
    console.log('❌ WARNING: Some base values are NaN:', selectedBases);
  }
} catch (error) {
  console.log('❌ ERROR in getSelectedBases:', error.message);
}

// Test 4: Test prediction method with detailed logging
console.log('\n4️⃣ TESTING PREDICTION METHOD:');
const originalLog = console.log;
const debugMessages = [];

// Capture debug messages
console.log = function(...args) {
  debugMessages.push(args.join(' '));
  originalLog(...args);
};

// Set up for frequency prediction
document.getElementById('predictionMethod').value = 'frequency';

// Test prediction
try {
  console.log('Starting prediction test...');
  predict();
  
  // Wait a moment then check results
  setTimeout(() => {
    console.log = originalLog; // Restore console
    
    console.log('\n5️⃣ CHECKING PREDICTION RESULTS:');
    const resultElement = document.getElementById('result');
    if (resultElement) {
      const resultText = resultElement.innerHTML;
      console.log('Result element content:', resultText);
      
      // Count numbers in result
      const numberMatches = resultText.match(/\b\d{1,2}\b/g);
      if (numberMatches) {
        console.log('Numbers found in result:', numberMatches);
        console.log('Count of numbers:', numberMatches.length);
        
        if (numberMatches.length >= 7) {
          console.log('✅ SUCCESS: Result shows 7 or more numbers!');
        } else {
          console.log('❌ FAILURE: Result shows only', numberMatches.length, 'numbers');
        }
      } else {
        console.log('❌ No numbers found in result');
      }
    } else {
      console.log('❌ Result element not found');
    }
    
    console.log('\n📊 DEBUG MESSAGES CAPTURED:');
    debugMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg}`);
    });
    
    console.log('\n🎯 SYSTEM 7 TEST COMPLETE!');
  }, 1000);
  
} catch (error) {
  console.log = originalLog; // Restore console
  console.log('❌ ERROR during prediction:', error.message);
  console.log('❌ Stack trace:', error.stack);
}