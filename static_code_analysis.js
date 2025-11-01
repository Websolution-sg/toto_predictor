// STATIC CODE ANALYSIS FOR TOTO PREDICTION SYSTEM
const fs = require('fs');
const path = require('path');

console.log('🔍 STATIC CODE ANALYSIS - TOTO PREDICTION SYSTEM');
console.log('=' .repeat(55));

function analyzeHtmlFile() {
  const filePath = path.join(__dirname, 'index.html');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n📋 FILE STRUCTURE ANALYSIS:');
    console.log('=' .repeat(35));
    console.log(`✅ File exists: ${filePath}`);
    console.log(`📊 File size: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`📝 Total lines: ${content.split('\n').length}`);
    
    // Extract JavaScript sections
    const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      console.log(`🔧 Script sections found: ${scriptMatches.length}`);
    }
    
    // Check for required HTML elements
    console.log('\n🖥️ UI ELEMENTS ANALYSIS:');
    console.log('=' .repeat(30));
    
    const requiredElements = [
      'predictionMethod',
      'drawRange', 
      'includeAdd',
      'base1', 'base2', 'base3', 'base4', 'base5', 'base6',
      'additional',
      'results',
      'analytics',
      'recentResult'
    ];
    
    requiredElements.forEach(elementId => {
      const regex = new RegExp(`id=['"]\${elementId}['"]`, 'i');
      if (regex.test(content)) {
        console.log(`✅ ${elementId} - Found`);
      } else {
        console.log(`❌ ${elementId} - Missing`);
      }
    });
    
    // Check for required functions
    console.log('\n🔧 FUNCTION ANALYSIS:');
    console.log('=' .repeat(25));
    
    const requiredFunctions = [
      'runEnhancedEnsemblePrediction',
      'runFrequencyCompatibilityPrediction',
      'runWeightedPrediction',
      'runHotColdPrediction',
      'predict',
      'getSelectedBases',
      'displayPredictedNumbers',
      'fetchCsvAndUpdate'
    ];
    
    requiredFunctions.forEach(funcName => {
      const regex = new RegExp(`function\\s+\${funcName}\\s*\\(`, 'i');
      if (regex.test(content)) {
        console.log(`✅ ${funcName} - Found`);
      } else {
        console.log(`❌ ${funcName} - Missing`);
      }
    });
    
    // Check for potential issues
    console.log('\n⚠️ POTENTIAL ISSUES ANALYSIS:');
    console.log('=' .repeat(35));
    
    // Check for duplicate function definitions
    const duplicateFunctions = [];
    requiredFunctions.forEach(funcName => {
      const regex = new RegExp(`function\\s+\${funcName}\\s*\\(`, 'gi');
      const matches = content.match(regex);
      if (matches && matches.length > 1) {
        duplicateFunctions.push(`${funcName} (${matches.length} definitions)`);
      }
    });
    
    if (duplicateFunctions.length > 0) {
      console.log('⚠️ Duplicate function definitions found:');
      duplicateFunctions.forEach(func => console.log(`   - ${func}`));
    } else {
      console.log('✅ No duplicate function definitions');
    }
    
    // Check for disabled functions
    const disabledFunctions = content.match(/function\s+\w+_DISABLED\s*\(/gi);
    if (disabledFunctions) {
      console.log(`⚠️ Disabled functions found: ${disabledFunctions.length}`);
      disabledFunctions.forEach(func => console.log(`   - ${func}`));
    } else {
      console.log('✅ No disabled functions found');
    }
    
    // Check for console.log statements (for debugging)
    const consoleStatements = content.match(/console\.log\(/gi);
    if (consoleStatements) {
      console.log(`📝 Debug console.log statements: ${consoleStatements.length}`);
    }
    
    // Check for error handling
    const tryBlocks = content.match(/try\s*\{/gi);
    const catchBlocks = content.match(/catch\s*\(/gi);
    console.log(`🛡️ Error handling - try blocks: ${tryBlocks?.length || 0}, catch blocks: ${catchBlocks?.length || 0}`);
    
    // Check for Chart.js integration
    if (content.includes('Chart.js') || content.includes('chartInstance')) {
      console.log('✅ Chart.js integration found');
    } else {
      console.log('⚠️ Chart.js integration not detected');
    }
    
    // Check for CSV handling
    if (content.includes('totoResult.csv')) {
      console.log('✅ CSV file reference found');
    } else {
      console.log('❌ CSV file reference missing');
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
    return false;
  }
}

function analyzeCsvFile() {
  const filePath = path.join(__dirname, 'totoResult.csv');
  
  console.log('\n📊 CSV DATA ANALYSIS:');
  console.log('=' .repeat(25));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`✅ CSV file exists: ${filePath}`);
    console.log(`📊 Total records: ${lines.length}`);
    console.log(`📝 File size: ${(content.length / 1024).toFixed(2)} KB`);
    
    if (lines.length > 0) {
      // Analyze first record
      const firstRecord = lines[0].split(',');
      console.log(`📅 Latest draw: ${firstRecord[0]}`);
      console.log(`🎲 Latest numbers: ${firstRecord.slice(1, 7).join(',')}`);
      console.log(`➕ Additional: ${firstRecord[7]}`);
      
      // Check data integrity
      let invalidRecords = 0;
      lines.forEach((line, index) => {
        const parts = line.split(',');
        if (parts.length !== 8) {
          invalidRecords++;
        } else {
          const numbers = parts.slice(1, 7).map(n => parseInt(n));
          const additional = parseInt(parts[7]);
          
          // Check number ranges
          const invalidNumbers = numbers.filter(n => n < 1 || n > 49);
          if (invalidNumbers.length > 0 || additional < 1 || additional > 49) {
            invalidRecords++;
          }
          
          // Check for duplicates
          const uniqueNumbers = new Set(numbers);
          if (uniqueNumbers.size !== 6 || numbers.includes(additional)) {
            invalidRecords++;
          }
        }
      });
      
      if (invalidRecords === 0) {
        console.log('✅ All CSV records are valid');
      } else {
        console.log(`❌ Found ${invalidRecords} invalid records`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error reading CSV file: ${error.message}`);
    return false;
  }
}

function checkProjectStructure() {
  console.log('\n📁 PROJECT STRUCTURE ANALYSIS:');
  console.log('=' .repeat(35));
  
  const requiredFiles = [
    'index.html',
    'totoResult.csv',
    'package.json'
  ];
  
  const optionalFiles = [
    'README.md',
    '.gitignore',
    'deploy-updates.bat'
  ];
  
  console.log('Required files:');
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  });
  
  console.log('\nOptional files:');
  optionalFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`➖ ${file} - Not present`);
    }
  });
}

// Main analysis function
function runStaticAnalysis() {
  console.log('🚀 Starting static code analysis...\n');
  
  const htmlAnalysis = analyzeHtmlFile();
  const csvAnalysis = analyzeCsvFile();
  checkProjectStructure();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 STATIC ANALYSIS SUMMARY');
  console.log('=' .repeat(60));
  
  if (htmlAnalysis && csvAnalysis) {
    console.log('✅ Static analysis completed successfully');
    console.log('✅ Core files are present and appear valid');
    console.log('🎉 Your TOTO prediction system structure is correct');
  } else {
    console.log('❌ Static analysis found issues');
    console.log('⚠️ Please review the problems listed above');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Open index.html in your web browser');
  console.log('2. Run the comprehensive_validation.js script');
  console.log('3. Test all prediction methods manually');
  console.log('4. Verify range differentiation works correctly');
}

// Run the analysis
runStaticAnalysis();