// SIMPLE DIAGNOSTIC FOR IDENTICAL RESULTS ISSUE
// Problem: All ranges showing 5,22,31,34,38,45

console.log('🚨 SIMPLE DIAGNOSTIC FOR RANGE ISSUE');
console.log('Result showing for all ranges: 5,22,31,34,38,45');
console.log('');

console.log('STEP 1: Check base numbers');
console.log('Copy this into your browser console:');
console.log('');
console.log('// Check what base numbers are currently selected');
console.log('["base1", "base2", "base3", "base4", "base5", "base6"].forEach(id => {');
console.log('  const element = document.getElementById(id);');
console.log('  if (element && element.value !== "") {');
console.log('    console.log(id + " = " + element.value);');
console.log('  }');
console.log('});');
console.log('');

console.log('STEP 2: Clear all base numbers');
console.log('Copy this:');
console.log('');
console.log('// Clear all base numbers');
console.log('["base1", "base2", "base3", "base4", "base5", "base6"].forEach(id => {');
console.log('  const element = document.getElementById(id);');
console.log('  if (element) element.value = "";');
console.log('});');
console.log('console.log("Base numbers cleared");');
console.log('');

console.log('STEP 3: Test range changes directly');
console.log('Copy this:');
console.log('');
console.log('// Test if range actually changes the slice');
console.log('[20, 50, 100].forEach(testRange => {');
console.log('  document.getElementById("drawRange").value = testRange;');
console.log('  const range = parseInt(document.getElementById("drawRange").value);');
console.log('  const sliced = historical.slice(0, range);');
console.log('  console.log(`Range ${testRange}: ${sliced.length} draws used`);');
console.log('});');
console.log('');

console.log('STEP 4: Force test Enhanced Ensemble');
console.log('Copy this:');
console.log('');
console.log('// Force test with cleared base numbers');
console.log('document.getElementById("predictionMethod").value = "enhanced";');
console.log('');
console.log('console.log("Testing Range 20:");');
console.log('document.getElementById("drawRange").value = 20;');
console.log('predict();');
console.log('');
console.log('console.log("Testing Range 50:");');
console.log('document.getElementById("drawRange").value = 50;');
console.log('predict();');
console.log('');
console.log('console.log("Testing Range 100:");');
console.log('document.getElementById("drawRange").value = 100;');
console.log('predict();');
console.log('');

console.log('QUICK FIX ATTEMPT:');
console.log('1. Open your index.html in browser');
console.log('2. Make sure ALL base number dropdowns are empty (not selected)');
console.log('3. Press Ctrl+F5 to hard refresh');
console.log('4. Try the Enhanced Ensemble with different ranges');
console.log('');
console.log('If still same result, run the diagnostic steps above and report what you see.');