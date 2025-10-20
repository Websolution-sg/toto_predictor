/**
 * SYSTEM 7 DEEP DIAGNOSTIC SCRIPT
 * Comprehensive testing to identify why System 7 is still not working
 */

const fs = require('fs');

console.log('🔍 SYSTEM 7 DEEP DIAGNOSTIC');
console.log('=' .repeat(40));

try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  console.log('\n1️⃣ HTML STRUCTURE VERIFICATION:');
  console.log('=' .repeat(35));
  
  // Check if base7 field exists
  const hasBase7Field = htmlContent.includes('id="base7"');
  console.log('✅ base7 field exists:', hasBase7Field ? 'YES' : 'NO');
  
  if (hasBase7Field) {
    const base7FieldMatch = htmlContent.match(/<select id="base7"[^>]*>/);
    if (base7FieldMatch) {
      console.log('✅ base7 field HTML:', base7FieldMatch[0]);
    }
  }
  
  console.log('\n2️⃣ JAVASCRIPT INITIALIZATION VERIFICATION:');
  console.log('=' .repeat(45));
  
  // Check base7 in dropdown population
  const hasBase7InInit = htmlContent.includes("'base7'") && 
                        htmlContent.includes("forEach(id => {");
  console.log('✅ base7 in dropdown population:', hasBase7InInit ? 'YES' : 'NO');
  
  // Check system type change handler
  const hasSystemTypeHandler = htmlContent.includes('systemType') && 
                               htmlContent.includes('addEventListener') &&
                               htmlContent.includes('change');
  console.log('✅ systemType change handler:', hasSystemTypeHandler ? 'YES' : 'NO');
  
  console.log('\n3️⃣ GETSELECTEDBASES FUNCTION VERIFICATION:');
  console.log('=' .repeat(45));
  
  // Extract getSelectedBases function
  const getSelectedBasesMatch = htmlContent.match(/function getSelectedBases\(\)[\s\S]*?^}/m);
  if (getSelectedBasesMatch) {
    console.log('✅ getSelectedBases function found');
    const functionContent = getSelectedBasesMatch[0];
    
    const hasSystemTypeCheck = functionContent.includes('systemType === 7');
    const hasBase7Array = functionContent.includes("'base7'");
    
    console.log('✅ systemType === 7 check:', hasSystemTypeCheck ? 'YES' : 'NO');
    console.log('✅ base7 in array:', hasBase7Array ? 'YES' : 'NO');
    
    console.log('\n📋 getSelectedBases function:');
    console.log(functionContent);
  } else {
    console.log('❌ getSelectedBases function NOT FOUND');
  }
  
  console.log('\n4️⃣ PREDICTION METHOD VERIFICATION:');
  console.log('=' .repeat(40));
  
  // Check each method for systemType usage
  const methods = [
    { name: 'runFrequencyCompatibilityPrediction', pattern: /function runFrequencyCompatibilityPrediction\(\)[\s\S]*?displayPredictedNumbers/ },
    { name: 'runWeightedPrediction', pattern: /function runWeightedPrediction\(\)[\s\S]*?displayPredictedNumbers/ },
    { name: 'runHotColdPrediction', pattern: /function runHotColdPrediction\(\)[\s\S]*?displayPredictedNumbers/ },
    { name: 'runEnhancedEnsemblePrediction', pattern: /function runEnhancedEnsemblePrediction\(\)[\s\S]*?displayPredictedNumbers/ }
  ];
  
  methods.forEach(method => {
    const methodMatch = htmlContent.match(method.pattern);
    if (methodMatch) {
      const methodContent = methodMatch[0];
      const hasSystemType = methodContent.includes('systemType');
      const usesSystemType = methodContent.includes('systemType') && 
                            (methodContent.includes('.slice(0, systemType)') || 
                             methodContent.includes('< systemType') || 
                             methodContent.includes('>= systemType'));
      
      console.log(`✅ ${method.name}:`);
      console.log(`   - Has systemType variable: ${hasSystemType ? 'YES' : 'NO'}`);
      console.log(`   - Uses systemType in logic: ${usesSystemType ? 'YES' : 'NO'}`);
    } else {
      console.log(`❌ ${method.name}: NOT FOUND`);
    }
  });
  
  console.log('\n5️⃣ BROWSER SIMULATION TEST:');
  console.log('=' .repeat(35));
  
  console.log('🧪 BROWSER TEST COMMANDS:');
  console.log('Copy these into browser console to test:');
  console.log('');
  console.log('// 1. Check if base7 exists');
  console.log('console.log("base7 field:", document.getElementById("base7"));');
  console.log('');
  console.log('// 2. Set System 7 and trigger change');
  console.log('document.getElementById("systemType").value = "7";');
  console.log('document.getElementById("systemType").dispatchEvent(new Event("change"));');
  console.log('console.log("base7 display:", document.getElementById("base7").style.display);');
  console.log('');
  console.log('// 3. Set base7 value manually');
  console.log('document.getElementById("base7").value = "49";');
  console.log('console.log("base7 value:", document.getElementById("base7").value);');
  console.log('');
  console.log('// 4. Test getSelectedBases()');
  console.log('console.log("Selected bases:", getSelectedBases());');
  console.log('console.log("Expected length for System 7:", 7);');
  console.log('');
  console.log('// 5. Test prediction with debug');
  console.log('document.getElementById("predictionMethod").value = "frequency";');
  console.log('generatePrediction();');
  
  console.log('\n🎯 POTENTIAL ISSUES TO CHECK:');
  console.log('=' .repeat(35));
  console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
  console.log('2. Base7 field not being populated with options');
  console.log('3. Base7 field not visible when System 7 selected');
  console.log('4. GetSelectedBases() returning NaN for base7');
  console.log('5. Prediction methods not receiving systemType parameter');
  console.log('6. DisplayPredictedNumbers not showing 7th number');
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('=' .repeat(25));
  console.log('Run the browser test commands above to identify');
  console.log('which specific step is failing in System 7 execution.');
  
} catch (error) {
  console.error('❌ Error during diagnostic:', error.message);
}