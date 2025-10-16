import fs from 'fs';
import { JSDOM } from 'jsdom';

// Load the HTML file
const html = fs.readFileSync('./index.html', 'utf8');

function testMethodConsistency(methodValue, range, methodName) {
  console.log(`\n=== Testing ${methodName} (Range ${range}) ===`);
  
  const results = [];
  
  for (let run = 1; run <= 5; run++) {
    // Create fresh DOM for each test
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;
    const document = window.document;
    
    // Set up the prediction method and range
    document.getElementById('predictionMethod').value = methodValue;
    document.getElementById('range').value = range;
    
    // Mock the display function to capture results
    let capturedResults = null;
    window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
      capturedResults = {
        numbers: [...numbers].sort((a, b) => a - b),
        title: title
      };
    };
    
    // Trigger prediction
    window.generatePrediction();
    
    if (capturedResults) {
      results.push({
        run: run,
        numbers: capturedResults.numbers,
        title: capturedResults.title
      });
      console.log(`Run ${run}: [${capturedResults.numbers.join(',')}]`);
    } else {
      console.log(`Run ${run}: No results captured`);
    }
    
    // Clean up
    dom.window.close();
  }
  
  // Check consistency
  if (results.length > 1) {
    const firstResult = JSON.stringify(results[0].numbers);
    const allIdentical = results.every(r => JSON.stringify(r.numbers) === firstResult);
    
    if (allIdentical) {
      console.log(`✅ ${methodName} is CONSISTENT - all runs produced identical results`);
    } else {
      console.log(`❌ ${methodName} is INCONSISTENT - results vary between runs`);
      results.forEach((r, i) => {
        if (i > 0 && JSON.stringify(r.numbers) !== firstResult) {
          console.log(`  Difference in run ${r.run}: [${r.numbers.join(',')}]`);
        }
      });
    }
  }
  
  return results.length > 0 ? results[0].numbers : [];
}

// Test all 4 methods for consistency
console.log('🔍 Testing All Prediction Methods for Consistency');
console.log('=' .repeat(60));

const testCases = [
  { value: 'enhanced', name: 'Enhanced Ensemble', ranges: [20, 50] },
  { value: 'frequency', name: 'Frequency+Compatibility', ranges: [20, 50] },
  { value: 'weighted', name: 'Weighted Recent Analysis', ranges: [20, 50] },
  { value: 'hotCold', name: 'Hot/Cold Balance', ranges: [20, 50] }
];

const allResults = {};

for (const test of testCases) {
  allResults[test.name] = {};
  
  for (const range of test.ranges) {
    const result = testMethodConsistency(test.value, range, test.name);
    allResults[test.name][`Range${range}`] = result;
  }
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📊 CONSISTENCY TEST SUMMARY');
console.log('=' .repeat(60));

for (const [method, ranges] of Object.entries(allResults)) {
  console.log(`\n${method}:`);
  for (const [range, numbers] of Object.entries(ranges)) {
    console.log(`  ${range}: [${numbers.join(',')}]`);
  }
}

console.log('\n✨ All methods should now produce consistent results for the same parameters!');