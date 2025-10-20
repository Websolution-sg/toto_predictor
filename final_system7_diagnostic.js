/**
 * FINAL SYSTEM 7 DIAGNOSTIC AND FIX SCRIPT
 * This is the definitive test to identify and potentially fix System 7 issues
 * Copy this entire script into browser console after opening index.html
 */

console.log('🔧 FINAL SYSTEM 7 DIAGNOSTIC AND FIX');
console.log('=' .repeat(50));

// Step 1: Check HTML structure
console.log('\n1️⃣ HTML STRUCTURE CHECK:');
const base7 = document.getElementById('base7');
const systemType = document.getElementById('systemType');
const result = document.getElementById('result') || document.getElementById('results');

console.log('✓ base7 field exists:', !!base7);
console.log('✓ systemType field exists:', !!systemType);
console.log('✓ result field exists:', !!result);

if (!base7) {
  console.error('❌ CRITICAL: base7 field missing! Adding it now...');
  const base6 = document.getElementById('base6');
  if (base6 && base6.parentNode) {
    const newBase7 = document.createElement('select');
    newBase7.id = 'base7';
    newBase7.style.display = 'none';
    base6.parentNode.appendChild(newBase7);
    
    // Populate with options
    for (let i = 1; i <= 49; i++) {
      const option = document.createElement('option');
      option.value = option.textContent = i;
      newBase7.appendChild(option);
    }
    newBase7.value = '1'; // Set default
    console.log('✓ Created base7 field with default value 1');
  }
}

// Step 2: Ensure base7 has options
console.log('\n2️⃣ BASE7 FIELD SETUP:');
const base7Field = document.getElementById('base7');
if (base7Field) {
  console.log('base7 options count:', base7Field.options.length);
  
  if (base7Field.options.length === 0) {
    console.log('Adding options to base7 field...');
    for (let i = 1; i <= 49; i++) {
      const option = document.createElement('option');
      option.value = option.textContent = i;
      base7Field.appendChild(option);
    }
  }
  
  // Set a valid value
  base7Field.value = '47';
  console.log('Set base7 value to:', base7Field.value);
}

// Step 3: Set up System 7
console.log('\n3️⃣ SYSTEM 7 SETUP:');
systemType.value = '7';
systemType.dispatchEvent(new Event('change'));

// Make base7 visible
base7Field.style.display = 'inline';
console.log('System type set to:', systemType.value);
console.log('base7 display style:', base7Field.style.display);

// Step 4: Test getSelectedBases with detailed logging
console.log('\n4️⃣ TESTING GETSELECTEDBASES:');

// Check if function exists
if (typeof getSelectedBases === 'function') {
  console.log('✓ getSelectedBases function exists');
  
  // Call function and check result
  const bases = getSelectedBases();
  console.log('Returned bases:', bases);
  console.log('Bases count:', bases.length);
  console.log('Bases valid:', bases.every(b => !isNaN(b) && b >= 1 && b <= 49));
  
  if (bases.length === 7) {
    console.log('✅ SUCCESS: getSelectedBases returns 7 numbers');
  } else {
    console.log('❌ ISSUE: Expected 7 numbers, got', bases.length);
  }
} else {
  console.log('❌ CRITICAL: getSelectedBases function not found!');
}

// Step 5: Test individual prediction method
console.log('\n5️⃣ TESTING PREDICTION METHOD:');

// Set method
document.getElementById('predictionMethod').value = 'frequency';

// Test the specific method directly
if (typeof runFrequencyCompatibilityPrediction === 'function') {
  console.log('✓ runFrequencyCompatibilityPrediction exists');
  
  console.log('Calling prediction method directly...');
  try {
    runFrequencyCompatibilityPrediction();
    
    // Check result after brief delay
    setTimeout(() => {
      const resultElement = document.getElementById('result') || document.getElementById('results');
      if (resultElement) {
        const content = resultElement.innerHTML || resultElement.textContent;
        console.log('Result content:', content);
        
        // Count numbers in result
        const numbers = content.match(/\b\d{1,2}\b/g);
        if (numbers) {
          console.log('Numbers found:', numbers);
          console.log('Count:', numbers.length);
          
          if (numbers.length >= 7) {
            console.log('🎉 SUCCESS: System 7 IS WORKING! Found', numbers.length, 'numbers');
          } else {
            console.log('⚠️ PARTIAL: Only found', numbers.length, 'numbers (expected 7)');
          }
        } else {
          console.log('❌ No numbers found in result');
        }
      } else {
        console.log('❌ No result element found');
      }
      
      console.log('\n🎯 DIAGNOSTIC COMPLETE');
      console.log('If System 7 is still not working, the issue may be:');
      console.log('1. Browser cache (try Ctrl+F5)');
      console.log('2. Prediction method not using systemType parameter');
      console.log('3. Display function not showing all numbers');
    }, 500);
    
  } catch (error) {
    console.log('❌ ERROR calling prediction method:', error.message);
    console.log('Stack:', error.stack);
  }
} else {
  console.log('❌ runFrequencyCompatibilityPrediction function not found!');
}

console.log('\n💡 TIP: If you see "SUCCESS" messages above but System 7');
console.log('still doesn\'t work in normal use, try a hard refresh (Ctrl+F5)');