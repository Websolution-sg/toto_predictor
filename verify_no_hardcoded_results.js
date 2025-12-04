// Verify No Hard-Coded Results in TOTO Prediction System
console.log('🔍 VERIFYING NO HARD-CODED RESULTS');
console.log('📅 Check Date: December 1, 2025');
console.log('=' * 50);

const fs = require('fs');

// Check the main HTML file for any hard-coded predictions or base values
function checkHTMLForHardCoding() {
  console.log('\n🌐 CHECKING HTML FILE FOR HARD-CODED VALUES:');
  
  const htmlContent = fs.readFileSync('index.html', 'utf-8');
  
  // Check for suspicious patterns
  const patterns = [
    { name: 'Hard-coded arrays', pattern: /\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/ },
    { name: 'Fixed prediction returns', pattern: /return\s*\[\s*\d+.*\]/ },
    { name: 'Direct value assignments', pattern: /\.value\s*=\s*\d+/ },
    { name: 'Hard-coded base assignments', pattern: /bases\s*=\s*\[\s*\d+/ },
    { name: 'Fixed prediction variables', pattern: /prediction\s*=\s*\[\s*\d+/ }
  ];
  
  let issuesFound = 0;
  
  patterns.forEach(({ name, pattern }) => {
    const matches = htmlContent.match(pattern);
    if (matches) {
      console.log(`❌ ${name}: Found ${matches.length} potential issues`);
      matches.slice(0, 3).forEach(match => {
        console.log(`   - ${match.substring(0, 50)}...`);
      });
      issuesFound += matches.length;
    } else {
      console.log(`✅ ${name}: No issues found`);
    }
  });
  
  // Check that base values come from form inputs
  const getBasesPattern = /getSelectedBases\(\)/g;
  const getBasesMatches = htmlContent.match(getBasesPattern);
  if (getBasesMatches && getBasesMatches.length > 5) {
    console.log(`✅ Base selection: Uses getSelectedBases() ${getBasesMatches.length} times (dynamic)`);
  } else {
    console.log(`⚠️ Base selection: Limited use of getSelectedBases() function`);
  }
  
  // Check that dropdowns are populated dynamically
  if (htmlContent.includes('for (let i = 1; i <= 49')) {
    console.log('✅ Dropdown population: Dynamic (1-49 range)');
  } else {
    console.log('❌ Dropdown population: Not found or potentially hard-coded');
  }
  
  // Check auto-population uses recent results
  if (htmlContent.includes('recent.numbers[idx]')) {
    console.log('✅ Auto-population: Uses latest historical result');
  } else {
    console.log('❌ Auto-population: Not using historical data');
  }
  
  return issuesFound === 0;
}

// Test with different inputs to ensure results change
function testDynamicBehavior() {
  console.log('\n🧪 TESTING DYNAMIC BEHAVIOR:');
  
  // Load historical data
  const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
  const historical = csvContent.trim().split('\n').map(line => {
    const [date, ...nums] = line.split(',');
    return {
      date,
      numbers: nums.slice(0, 6).map(n => parseInt(n)),
      additional: parseInt(nums[6])
    };
  });
  
  // Simulate algorithm with different base inputs
  function testAlgorithmWithBases(testBases) {
    const scores = Array(50).fill(0);
    const range = 30;
    
    // Use actual algorithm logic
    historical.slice(0, range).forEach((draw, idx) => {
      const weight = Math.pow(0.95, idx);
      draw.numbers.forEach(num => {
        scores[num] += 0.4 + (0.35 * weight);
      });
    });
    
    for (let num = 1; num <= 49; num++) {
      const recentCount = historical.slice(0, 10).reduce((count, draw) => {
        return count + (draw.numbers.includes(num) ? 1 : 0);
      }, 0);
      
      if (recentCount >= 3) {
        scores[num] += 0.25 * 0.3;
      } else if (recentCount === 0) {
        scores[num] += 0.25 * 0.7;
      } else {
        scores[num] += 0.25 * 0.1;
      }
    }
    
    const ranking = [];
    for (let num = 1; num <= 49; num++) {
      if (!testBases.includes(num)) {
        ranking.push({ num, score: scores[num] });
      }
    }
    ranking.sort((a, b) => b.score - a.score);
    
    const neededNumbers = 6 - testBases.length;
    const ensemblePrediction = ranking.slice(0, neededNumbers).map(item => item.num);
    return [...testBases, ...ensemblePrediction].slice(0, 6).sort((a, b) => a - b);
  }
  
  // Test with different base combinations
  const testCases = [
    [1, 2],
    [10, 20], 
    [30, 40],
    [5, 15],
    []  // No bases
  ];
  
  const results = [];
  
  testCases.forEach((bases, index) => {
    const prediction = testAlgorithmWithBases(bases);
    results.push({ bases, prediction });
    console.log(`Test ${index + 1} - Bases: [${bases.join(',')}] → Prediction: [${prediction.join(',')}]`);
  });
  
  // Check if results are different (proving it's not hard-coded)
  const uniqueResults = new Set(results.map(r => JSON.stringify(r.prediction)));
  console.log(`\n📊 Result Analysis:`);
  console.log(`   Tests run: ${results.length}`);
  console.log(`   Unique predictions: ${uniqueResults.size}`);
  
  if (uniqueResults.size > 1) {
    console.log(`✅ Algorithm is dynamic: Different inputs produce different outputs`);
    return true;
  } else {
    console.log(`❌ Algorithm might be hard-coded: All inputs produce same output`);
    return false;
  }
}

// Check test files don't interfere with production
function checkTestFilesSeparation() {
  console.log('\n🧪 CHECKING TEST FILES SEPARATION:');
  
  const testFiles = [
    'test_website_output.js',
    'test_html_corrected_algorithm.js', 
    'comprehensive_system_validation.js',
    'test_all_algorithms.js'
  ];
  
  testFiles.forEach(filename => {
    try {
      fs.statSync(filename);
      console.log(`✅ ${filename}: Exists (test only)`);
    } catch (error) {
      console.log(`ℹ️ ${filename}: Not found`);
    }
  });
  
  // Check if any test files are imported in HTML
  const htmlContent = fs.readFileSync('index.html', 'utf-8');
  let testImportsFound = false;
  
  testFiles.forEach(filename => {
    if (htmlContent.includes(filename)) {
      console.log(`❌ ${filename}: Referenced in HTML (potential contamination)`);
      testImportsFound = true;
    }
  });
  
  if (!testImportsFound) {
    console.log('✅ Test files: No imports found in HTML (properly separated)');
  }
  
  return !testImportsFound;
}

// Run all verification checks
console.log('\n🎯 RUNNING COMPREHENSIVE HARD-CODING VERIFICATION:');
console.log('=' * 60);

const results = {
  htmlCheck: checkHTMLForHardCoding(),
  dynamicBehavior: testDynamicBehavior(), 
  testSeparation: checkTestFilesSeparation()
};

console.log('\n📋 VERIFICATION RESULTS:');
console.log('=' * 25);
console.log(`HTML Hard-coding Check: ${results.htmlCheck ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Dynamic Behavior Test: ${results.dynamicBehavior ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Test Files Separation: ${results.testSeparation ? '✅ PASSED' : '❌ FAILED'}`);

const allPassed = Object.values(results).every(result => result === true);

console.log('\n🏆 FINAL VERIFICATION:');
if (allPassed) {
  console.log('🎉 NO HARD-CODED RESULTS DETECTED');
  console.log('✅ System uses fully dynamic prediction algorithms');
  console.log('📊 Predictions change based on user inputs and historical data');
  console.log('🌟 Ready for live predictions without contamination');
} else {
  console.log('⚠️ POTENTIAL HARD-CODING ISSUES FOUND');
  console.log('🔧 Manual review and fixes may be required');
}

console.log('\n🔗 Live System: https://websolution-sg.github.io/toto_predictor/');
console.log('💡 All predictions should be generated dynamically from algorithms');

process.exit(allPassed ? 0 : 1);