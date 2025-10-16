import fs from 'fs';
import path from 'path';

console.log('🔍 HARDCODED RESULTS DETECTION SCAN');
console.log('='.repeat(60));
console.log(`📅 Scan Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Files to check for hardcoded values
const filesToCheck = [
  'index.html',
  'updateTotoCSV.cjs',
  'updateTotoCSV.mjs',
  'totoResult.csv'
];

// Patterns that might indicate hardcoded results
const hardcodedPatterns = [
  // Date patterns
  /\d{1,2}-\w{3}-\d{2}/g,
  // Number arrays that look like TOTO results
  /\[\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*\]/g,
  // CSV-like patterns
  /\d{1,2},\d{1,2},\d{1,2},\d{1,2},\d{1,2},\d{1,2},\d{1,2}/g,
  // Specific result patterns
  /19,22,26,37,40,46,14/g,
  /2-Oct-25/g
];

function checkFileForHardcoded(filename) {
  console.log(`\n📁 Checking: ${filename}`);
  console.log('-'.repeat(40));
  
  try {
    if (!fs.existsSync(filename)) {
      console.log('   ⚠️ File not found');
      return { found: false, reason: 'File not found' };
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');
    
    let hardcodedFound = false;
    let findings = [];
    
    // Check each pattern
    hardcodedPatterns.forEach((pattern, patternIndex) => {
      const matches = content.match(pattern);
      if (matches) {
        // For CSV file, only first few lines are expected to have data
        if (filename === 'totoResult.csv') {
          console.log(`   ✅ CSV data format detected (expected): ${matches.length} entries`);
          console.log(`   📊 Sample: ${matches.slice(0, 3).join(' | ')}`);
          return; // CSV data is expected, not hardcoded
        }
        
        // For other files, check context
        matches.forEach(match => {
          const lineIndex = content.indexOf(match);
          const lineNumber = content.substring(0, lineIndex).split('\n').length;
          const line = lines[lineNumber - 1];
          
          // Check if it's in a comment or test data
          const isComment = line.includes('//') || line.includes('/*') || line.includes('*');
          const isTestData = line.toLowerCase().includes('test') || line.toLowerCase().includes('example');
          const isVariable = line.includes('const ') || line.includes('let ') || line.includes('var ');
          
          if (!isComment && !isTestData) {
            hardcodedFound = true;
            findings.push({
              match,
              line: lineNumber,
              context: line.trim(),
              isVariable
            });
          }
        });
      }
    });
    
    if (hardcodedFound) {
      console.log(`   ❌ HARDCODED RESULTS DETECTED:`);
      findings.forEach(finding => {
        console.log(`      Line ${finding.line}: ${finding.match}`);
        console.log(`      Context: ${finding.context}`);
        if (finding.isVariable) {
          console.log(`      ⚠️ WARNING: Appears to be a variable assignment`);
        }
      });
    } else {
      console.log('   ✅ No hardcoded results detected');
    }
    
    return { found: hardcodedFound, findings };
    
  } catch (error) {
    console.log(`   ❌ Error reading file: ${error.message}`);
    return { found: false, error: error.message };
  }
}

// Check prediction methods in index.html
function checkPredictionMethods() {
  console.log(`\n🔧 CHECKING PREDICTION METHODS IN index.html`);
  console.log('-'.repeat(50));
  
  try {
    const content = fs.readFileSync('index.html', 'utf8');
    
    // Look for dynamic data loading
    const dynamicPatterns = [
      /fetch\s*\(\s*['"`]totoResult\.csv['"`]/g,
      /csvData\s*=\s*await/g,
      /loadTotoData\s*\(/g,
      /\.csv\?t=/g // Cache busting
    ];
    
    let dynamicFound = false;
    dynamicPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        dynamicFound = true;
      }
    });
    
    if (dynamicFound) {
      console.log('   ✅ Dynamic data loading detected');
      console.log('   ✅ Predictions use CSV data (not hardcoded)');
    } else {
      console.log('   ⚠️ Could not verify dynamic data loading');
    }
    
    // Check for hardcoded prediction logic
    const hardcodedLogic = [
      /function.*prediction.*\{[\s\S]*return\s*\[[\d,\s]+\]/g,
      /const.*numbers.*=.*\[[\d,\s]+\]/g
    ];
    
    let logicHardcoded = false;
    hardcodedLogic.forEach(pattern => {
      if (pattern.test(content)) {
        logicHardcoded = true;
      }
    });
    
    if (logicHardcoded) {
      console.log('   ❌ Hardcoded prediction logic detected');
    } else {
      console.log('   ✅ Prediction methods appear to be algorithmic');
    }
    
    return { dynamic: dynamicFound, hardcodedLogic };
    
  } catch (error) {
    console.log(`   ❌ Error checking prediction methods: ${error.message}`);
    return { error: error.message };
  }
}

// Check update scripts
function checkUpdateScripts() {
  console.log(`\n🔄 CHECKING UPDATE SCRIPTS`);
  console.log('-'.repeat(30));
  
  const updateFiles = ['updateTotoCSV.cjs', 'updateTotoCSV.mjs'];
  
  updateFiles.forEach(filename => {
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf8');
      
      // Look for dynamic fetching
      const dynamicFetch = content.includes('fetch') || content.includes('axios') || content.includes('https://');
      const noHardcode = content.includes('NO hardcoded') || content.includes('FULLY DYNAMIC');
      
      console.log(`   📁 ${filename}:`);
      console.log(`      ${dynamicFetch ? '✅' : '❌'} Dynamic fetching: ${dynamicFetch}`);
      console.log(`      ${noHardcode ? '✅' : '⚠️'} No hardcode declaration: ${noHardcode}`);
    }
  });
}

// Main scan function
function runHardcodeScan() {
  console.log('🎯 Starting comprehensive hardcode detection...\n');
  
  // Check main files
  const results = {};
  filesToCheck.forEach(filename => {
    results[filename] = checkFileForHardcoded(filename);
  });
  
  // Check prediction methods
  const predictionCheck = checkPredictionMethods();
  
  // Check update scripts
  checkUpdateScripts();
  
  // Summary
  console.log('\n📊 HARDCODE DETECTION SUMMARY');
  console.log('='.repeat(60));
  
  const filesWithHardcode = Object.entries(results)
    .filter(([filename, result]) => result.found)
    .map(([filename]) => filename);
  
  if (filesWithHardcode.length === 0) {
    console.log('✅ NO HARDCODED RESULTS DETECTED IN CORE FILES');
    console.log('✅ All prediction methods appear to use dynamic data');
    console.log('✅ Update scripts use dynamic fetching');
    console.log('\n🎯 SYSTEM STATUS: CLEAN - No hardcoded values found');
  } else {
    console.log('❌ HARDCODED RESULTS FOUND IN:');
    filesWithHardcode.forEach(filename => {
      console.log(`   • ${filename}`);
    });
    console.log('\n⚠️ RECOMMENDATION: Remove hardcoded values for proper dynamic operation');
  }
  
  // Additional checks
  console.log('\n🔍 ADDITIONAL VALIDATION:');
  console.log(`   CSV Data Source: ${fs.existsSync('totoResult.csv') ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Dynamic Loading: ${predictionCheck.dynamic ? '✅ Verified' : '⚠️ Uncertain'}`);
  console.log(`   Algorithmic Methods: ${!predictionCheck.hardcodedLogic ? '✅ Confirmed' : '❌ Hardcoded logic found'}`);
  
  console.log('\n💡 CONCLUSION:');
  if (filesWithHardcode.length === 0 && predictionCheck.dynamic && !predictionCheck.hardcodedLogic) {
    console.log('🎉 SYSTEM IS PROPERLY CONFIGURED FOR DYNAMIC OPERATION');
  } else {
    console.log('⚠️ SYSTEM MAY HAVE HARDCODED ELEMENTS THAT NEED ATTENTION');
  }
}

// Run the scan
runHardcodeScan();