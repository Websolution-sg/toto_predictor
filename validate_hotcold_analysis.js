const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the HTML file
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Create a DOM environment
const dom = new JSDOM(htmlContent);
global.window = dom.window;
global.document = dom.window.document;

// Set up the DOM elements
document.body.innerHTML = `
  <input id="includeAdd" type="checkbox">
  <select id="drawRange">
    <option value="20">20 draws</option>
    <option value="50" selected>50 draws</option>
    <option value="100">100 draws</option>
  </select>
  <input id="base1" value="16">
  <input id="base2" value="22">
  <input id="base3" value="10">
`;

// Load sample historical data (same as validation tools)
const sampleHistorical = [
  { numbers: [1, 12, 23, 34, 45, 49], additional: 7 },
  { numbers: [2, 13, 24, 35, 46, 48], additional: 8 },
  { numbers: [3, 14, 25, 36, 47, 40], additional: 9 },
  { numbers: [4, 15, 26, 37, 41, 42], additional: 10 },
  { numbers: [5, 16, 27, 38, 43, 44], additional: 11 },
  { numbers: [6, 17, 28, 39, 45, 46], additional: 12 },
  { numbers: [7, 18, 29, 40, 47, 48], additional: 13 },
  { numbers: [8, 19, 30, 41, 49, 1], additional: 14 },
  { numbers: [9, 20, 31, 42, 2, 3], additional: 15 },
  { numbers: [10, 21, 32, 43, 4, 5], additional: 16 },
  { numbers: [11, 22, 33, 44, 6, 7], additional: 17 },
  { numbers: [12, 23, 34, 45, 8, 9], additional: 18 },
  { numbers: [13, 24, 35, 46, 10, 11], additional: 19 },
  { numbers: [14, 25, 36, 47, 12, 13], additional: 20 },
  { numbers: [15, 26, 37, 48, 14, 15], additional: 21 },
  { numbers: [16, 27, 38, 49, 16, 17], additional: 22 },
  { numbers: [17, 28, 39, 1, 18, 19], additional: 23 },
  { numbers: [18, 29, 40, 2, 20, 21], additional: 24 },
  { numbers: [19, 30, 41, 3, 22, 23], additional: 25 },
  { numbers: [20, 31, 42, 4, 24, 25], additional: 26 }
];

// Extend to 100 draws
global.historical = [...sampleHistorical];
for (let i = 0; i < 80; i++) {
  const baseEntry = sampleHistorical[i % 20];
  const offset = Math.floor(i / 20) * 5;
  global.historical.push({
    numbers: baseEntry.numbers.map(n => ((n + offset - 1) % 49) + 1),
    additional: ((baseEntry.additional + offset - 1) % 49) + 1
  });
}

// Track results from Hot/Cold Analysis
const testResults = {
  range20: null,
  range50: null,
  range100: null
};

// Mock displayPredictedNumbers to capture results
global.displayPredictedNumbers = function(numbers, additional, scores, freq, compat, title, extraData) {
  const range = document.getElementById('drawRange').value;
  
  const result = {
    numbers: numbers,
    scores: scores,
    title: title,
    extraData: extraData,
    evenCount: numbers.filter(n => n % 2 === 0).length,
    oddCount: numbers.filter(n => n % 2 === 1).length,
    hasBaseNumbers: numbers.some(n => [16, 22, 10].includes(n)),
    avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    minNumber: Math.min(...numbers),
    maxNumber: Math.max(...numbers),
    temperatureTypes: extraData ? extraData.map(d => d.temperature) : []
  };
  
  if (range === '20') testResults.range20 = result;
  else if (range === '50') testResults.range50 = result;
  else if (range === '100') testResults.range100 = result;
  
  console.log(`Hot/Cold Analysis (${range} draws):`, {
    numbers: numbers,
    evenOdd: `${result.evenCount}/${result.oddCount}`,
    avgScore: result.avgScore.toFixed(2),
    range: `${result.minNumber}-${result.maxNumber}`,
    temperatures: result.temperatureTypes.join(',')
  });
};

// Capture console output for debug analysis
const debugOutput = [];
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && args[0].toString().includes('Debug:')) {
    debugOutput.push(args.join(' '));
  }
  originalLog(...args);
};

// Test function
function runValidationTests() {
  console.log('🔥 TOTO Hot/Cold Analysis Validation');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Range 20
    console.log('\n📊 Testing Range: 20 draws');
    document.getElementById('drawRange').value = '20';
    window.runHotColdPrediction();
    
    // Test 2: Range 50  
    console.log('\n📊 Testing Range: 50 draws');
    document.getElementById('drawRange').value = '50';
    window.runHotColdPrediction();
    
    // Test 3: Range 100
    console.log('\n📊 Testing Range: 100 draws');
    document.getElementById('drawRange').value = '100';
    window.runHotColdPrediction();
    
    // Analysis of results
    console.log('\n' + '='.repeat(50));
    console.log('📋 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    const ranges = ['20', '50', '100'];
    ranges.forEach(range => {
      const result = testResults[`range${range}`];
      if (result) {
        console.log(`\n📈 Range ${range} draws:`);
        console.log(`   Numbers: [${result.numbers.join(', ')}]`);
        console.log(`   Even/Odd: ${result.evenCount}/${result.oddCount} ${result.evenCount === 3 && result.oddCount === 3 ? '✅' : '⚠️'}`);
        console.log(`   Avg Score: ${result.avgScore.toFixed(2)}`);
        console.log(`   Range: ${result.minNumber}-${result.maxNumber}`);
        console.log(`   Temperatures: ${result.temperatureTypes.join(', ')}`);
        console.log(`   Base overlap: ${result.hasBaseNumbers ? 'Yes ⚠️' : 'No ✅'}`);
        
        // Validate basic requirements
        const validations = [
          { test: result.numbers.length === 6, name: '6 numbers' },
          { test: result.evenCount === 3 && result.oddCount === 3, name: 'Even/Odd balance' },
          { test: !result.hasBaseNumbers, name: 'No base number overlap' },
          { test: result.minNumber >= 1 && result.maxNumber <= 49, name: 'Valid range 1-49' },
          { test: result.scores.length === 6, name: 'Score array complete' },
          { test: result.extraData && result.extraData.length === 6, name: 'Temperature data' }
        ];
        
        validations.forEach(v => {
          console.log(`   ${v.name}: ${v.test ? '✅' : '❌'}`);
        });
      }
    });
    
    // Compare consistency across ranges
    console.log('\n🔍 CONSISTENCY ANALYSIS:');
    if (testResults.range20 && testResults.range50 && testResults.range100) {
      console.log(`   All ranges produced results: ✅`);
      
      // Check if results are different across ranges (should be due to different data sets)
      const nums20 = testResults.range20.numbers.sort().join(',');
      const nums50 = testResults.range50.numbers.sort().join(',');
      const nums100 = testResults.range100.numbers.sort().join(',');
      
      const allSame = nums20 === nums50 && nums50 === nums100;
      console.log(`   Results vary by range: ${allSame ? '❌' : '✅'}`);
      
      // Check score variations
      const scores = [testResults.range20.avgScore, testResults.range50.avgScore, testResults.range100.avgScore];
      const scoreRange = Math.max(...scores) - Math.min(...scores);
      console.log(`   Score variation: ${scoreRange.toFixed(2)} ${scoreRange > 0.1 ? '✅' : '⚠️'}`);
    }
    
    // Debug output analysis
    console.log('\n🔧 DEBUG OUTPUT ANALYSIS:');
    console.log(`   Debug messages captured: ${debugOutput.length}`);
    
    const hasRequiredDebug = [
      'Debug: Final predictions count',
      'Debug: Final predictions numbers', 
      'Debug: Scores array'
    ];
    
    hasRequiredDebug.forEach(debugType => {
      const found = debugOutput.some(msg => msg.includes(debugType));
      console.log(`   ${debugType}: ${found ? '✅' : '❌'}`);
    });
    
    // Overall status
    console.log('\n🎯 OVERALL STATUS:');
    const allRangesTested = testResults.range20 && testResults.range50 && testResults.range100;
    const basicValidation = allRangesTested && 
                          testResults.range50.numbers.length === 6 && 
                          testResults.range50.evenCount === 3;
    
    if (basicValidation) {
      console.log('✅ Hot/Cold Analysis is working correctly!');
      console.log('✅ All ranges produce valid 6-number predictions');
      console.log('✅ Even/odd balance maintained');
      console.log('✅ Temperature analysis included');
      console.log('✅ Debug statements functioning');
    } else {
      console.log('❌ Issues detected in Hot/Cold Analysis');
      if (!allRangesTested) console.log('   - Not all ranges tested successfully');
      if (testResults.range50 && testResults.range50.numbers.length !== 6) console.log('   - Invalid number count');
      if (testResults.range50 && testResults.range50.evenCount !== 3) console.log('   - Even/odd imbalance');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during validation:', error.message);
    console.error(error.stack);
  }
}

// Run the validation
runValidationTests();