/**
 * VERIFICATION: System 7 Fix Implementation Check
 * Verifies that all the necessary changes are in place for System 7 support
 */

const fs = require('fs');

console.log('🔍 SYSTEM 7 FIX VERIFICATION');
console.log('=' .repeat(40));

try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  console.log('\n✅ CHECKING FIX IMPLEMENTATIONS:');
  console.log('=' .repeat(40));
  
  // Check 1: getSelectedBases function includes System 7 logic
  const getSelectedBasesFixed = htmlContent.includes('systemType === 7') && 
                               htmlContent.includes('base7');
  console.log('1. getSelectedBases() System 7 support:', getSelectedBasesFixed ? '✅ FIXED' : '❌ MISSING');
  
  // Check 2: Frequency+Compatibility method has systemType parameter
  const freqCompatSystemType = htmlContent.includes('runFrequencyCompatibilityPrediction()') &&
                              htmlContent.match(/runFrequencyCompatibilityPrediction[\s\S]*?systemType[\s\S]*?displayPredictedNumbers/);
  console.log('2. Frequency+Compatibility systemType:', freqCompatSystemType ? '✅ FIXED' : '❌ MISSING');
  
  // Check 3: Weighted Recent Analysis method has systemType parameter  
  const weightedSystemType = htmlContent.includes('runWeightedPrediction()') &&
                            htmlContent.match(/runWeightedPrediction\(\)[\s\S]*?systemType[\s\S]*?displayPredictedNumbers/);
  console.log('3. Weighted Recent Analysis systemType:', weightedSystemType ? '✅ FIXED' : '❌ MISSING');
  
  // Check 4: Hot/Cold method has systemType parameter
  const hotColdSystemType = htmlContent.includes('runHotColdPrediction()') &&
                           htmlContent.match(/runHotColdPrediction\(\)[\s\S]*?systemType[\s\S]*?displayPredictedNumbers/);
  console.log('4. Hot/Cold Analysis systemType:', hotColdSystemType ? '✅ FIXED' : '❌ MISSING');
  
  // Check 5: Count hardcoded "6" limits that should be replaced with systemType
  const lines = htmlContent.split('\n');
  const hardcodedSixMatches = [];
  let inDisabledFunction = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track if we're in a disabled function
    if (line.includes('_DISABLED')) {
      inDisabledFunction = true;
    }
    
    // End of function (simple heuristic)
    if (inDisabledFunction && line.trim() === '}' && lines[i+1] && lines[i+1].trim().startsWith('//')) {
      inDisabledFunction = false;
    }
    
    // Check for hardcoded 6 limits only in active functions
    if (!inDisabledFunction && line.match(/finalPredictions\.length.*[<>=].*6(?!\d)/)) {
      hardcodedSixMatches.push(`Line ${i+1}: ${line.trim()}`);
    }
  }
  
  console.log('5. Hardcoded 6-number limits removed:', hardcodedSixMatches.length === 0 ? '✅ FIXED' : `❌ ${hardcodedSixMatches.length} REMAINING`);
  if (hardcodedSixMatches.length > 0) {
    console.log('   Remaining issues:', hardcodedSixMatches);
  }
  
  // Check 6: systemType usage in slice operations
  const systemTypeSliceUsage = htmlContent.match(/\.slice\(0,\s*systemType\)/g) || [];
  console.log('6. systemType in slice operations:', systemTypeSliceUsage.length >= 2 ? '✅ FOUND' : '❌ INSUFFICIENT');
  
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(15));
  const fixes = [getSelectedBasesFixed, freqCompatSystemType, weightedSystemType, hotColdSystemType, 
                hardcodedSixMatches.length === 0, systemTypeSliceUsage.length >= 2];
  const fixedCount = fixes.filter(Boolean).length;
  
  console.log(`Fixed: ${fixedCount}/6`);
  console.log(`Status: ${fixedCount === 6 ? '🎯 ALL FIXES APPLIED' : '⚠️ FIXES INCOMPLETE'}`);
  
  if (fixedCount === 6) {
    console.log('\n🚀 READY FOR TESTING!');
    console.log('All System 7 fixes have been successfully applied.');
    console.log('You can now test System 7 functionality in the browser.');
  } else {
    console.log('\n⚠️ ACTION REQUIRED:');
    console.log('Some fixes are incomplete. Please review the missing items above.');
  }
  
} catch (error) {
  console.error('❌ Error during verification:', error.message);
  process.exit(1);
}