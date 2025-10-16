import fs from 'fs';
import { JSDOM } from 'jsdom';

// Load the HTML file
const html = fs.readFileSync('./index.html', 'utf8');

function testFrequencyMethodMultipleTimes() {
  console.log('🔍 Deep Testing Frequency+Compatibility Method for Hidden Randomization');
  console.log('=' .repeat(70));
  
  const results = [];
  
  for (let run = 1; run <= 10; run++) {
    // Create fresh DOM for each test
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;
    const document = window.document;
    
    // Mock CSV data to avoid fetch issues
    const mockHistoricalData = [
      { numbers: [2, 15, 22, 31, 34, 43], additional: 11 },
      { numbers: [8, 14, 25, 29, 37, 42], additional: 19 },
      { numbers: [3, 12, 18, 26, 35, 44], additional: 7 },
      { numbers: [5, 16, 23, 30, 38, 41], additional: 13 },
      { numbers: [1, 17, 24, 27, 36, 45], additional: 9 }
    ];
    
    window.historical = mockHistoricalData;
    window.isDataLoaded = true;
    
    // Set up the test
    document.getElementById('predictionMethod').value = 'frequency';
    document.getElementById('drawRange').value = '30';
    document.getElementById('includeAdd').checked = false;
    document.getElementById('baseNumbers').value = '';
    
    // Mock the display function to capture results
    let capturedResults = null;
    window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title) {
      capturedResults = {
        numbers: [...numbers].sort((a, b) => a - b),
        title: title,
        scores: [...scores]
      };
    };
    
    // Trigger prediction
    try {
      window.runFrequencyCompatibilityPrediction();
      
      if (capturedResults) {
        results.push({
          run: run,
          numbers: capturedResults.numbers,
          scores: capturedResults.scores,
          title: capturedResults.title
        });
        console.log(`Run ${run}: [${capturedResults.numbers.join(',')}]`);
      } else {
        console.log(`Run ${run}: No results captured`);
      }
    } catch (error) {
      console.log(`Run ${run}: Error - ${error.message}`);
    }
    
    // Clean up
    dom.window.close();
  }
  
  // Analyze results for consistency
  console.log('\n📊 CONSISTENCY ANALYSIS:');
  console.log('=' .repeat(50));
  
  if (results.length < 2) {
    console.log('❌ Not enough valid results to analyze');
    return;
  }
  
  const firstResult = JSON.stringify(results[0].numbers);
  const firstScores = JSON.stringify(results[0].scores.map(s => Math.round(s * 1000)));
  
  let numbersConsistent = true;
  let scoresConsistent = true;
  
  for (let i = 1; i < results.length; i++) {
    const currentNumbers = JSON.stringify(results[i].numbers);
    const currentScores = JSON.stringify(results[i].scores.map(s => Math.round(s * 1000)));
    
    if (currentNumbers !== firstResult) {
      numbersConsistent = false;
      console.log(`❌ Numbers differ in run ${results[i].run}: [${results[i].numbers.join(',')}]`);
    }
    
    if (currentScores !== firstScores) {
      scoresConsistent = false;
      console.log(`⚠️ Scores differ in run ${results[i].run}`);
    }
  }
  
  if (numbersConsistent && scoresConsistent) {
    console.log('✅ PERFECT CONSISTENCY: All numbers and scores are identical');
  } else if (numbersConsistent) {
    console.log('✅ Numbers are consistent, but scores vary slightly (acceptable)');
  } else {
    console.log('❌ INCONSISTENT: Numbers are changing between runs');
    console.log('\n🔍 First 3 results for comparison:');
    for (let i = 0; i < Math.min(3, results.length); i++) {
      console.log(`  Run ${results[i].run}: [${results[i].numbers.join(',')}]`);
    }
  }
  
  return { numbersConsistent, scoresConsistent, results };
}

// Run the test
const testResult = testFrequencyMethodMultipleTimes();

console.log('\n🎯 DIAGNOSTIC RECOMMENDATION:');
if (testResult && !testResult.numbersConsistent) {
  console.log('The Frequency+Compatibility method has hidden randomization that needs to be fixed.');
  console.log('Likely causes:');
  console.log('- Object property iteration order');
  console.log('- Array sorting with equal values');
  console.log('- Date.now() or other time-based functions');
  console.log('- Hidden Math.random() calls in helper functions');
} else {
  console.log('The Frequency+Compatibility method appears to be consistent in this test environment.');
}