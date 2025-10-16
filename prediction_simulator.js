// Prediction Result Simulator - Shows exact results for verification
// This simulates the core prediction algorithms to show expected results

console.log('🎯 PREDICTION RESULT SIMULATOR');
console.log('Showing expected results for Weighted Recent Analysis & Hot/Cold Balance');
console.log('Ranges: 20, 50, 100');
console.log('=' .repeat(70));

// Simulate historical data (simplified version of actual TOTO data)
const mockHistoricalData = [
  { numbers: [2, 15, 22, 31, 34, 43], additional: 11 },
  { numbers: [8, 14, 25, 29, 37, 42], additional: 19 },
  { numbers: [3, 12, 18, 26, 35, 44], additional: 7 },
  { numbers: [5, 16, 23, 30, 38, 41], additional: 13 },
  { numbers: [1, 17, 24, 27, 36, 45], additional: 9 },
  { numbers: [4, 11, 20, 28, 33, 46], additional: 6 },
  { numbers: [7, 13, 19, 32, 39, 47], additional: 21 },
  { numbers: [6, 10, 21, 25, 40, 48], additional: 15 },
  { numbers: [9, 18, 26, 29, 37, 49], additional: 3 },
  { numbers: [2, 14, 23, 31, 38, 44], additional: 12 }
];

// Simulate Weighted Recent Analysis
function simulateWeightedPrediction(range) {
  console.log(`\n🔸 Weighted Recent Analysis - Range ${range}:`);
  
  const draws = mockHistoricalData.slice(0, Math.min(range, mockHistoricalData.length));
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Calculate weights with exponential decay
  draws.forEach((draw, index) => {
    const weight = Math.exp(-index * 0.1);
    draw.numbers.forEach(n => {
      if (n >= 1 && n <= 49) {
        weighted[n] += weight;
      }
    });
  });
  
  // Create suggestions
  const suggestions = weighted.map((weight, n) => ({
    n,
    weight: weight,
    compat: compat[n],
    score: weight + compat[n] * 1.5
  }))
    .filter(o => o.n >= 1 && o.n <= 49)
    .sort((a, b) => b.score - a.score || a.n - b.n)
    .slice(0, 6);
  
  const result = suggestions.map(o => o.n).sort((a, b) => a - b);
  console.log(`  Expected Result: [${result.join(',')}]`);
  console.log(`  Algorithm: Simple weighted analysis with exponential decay`);
  
  return result;
}

// Simulate Hot/Cold Analysis
function simulateHotColdPrediction(range) {
  console.log(`\n🔸 Hot/Cold Balance Analysis - Range ${range}:`);
  
  const recentDraws = mockHistoricalData.slice(0, Math.min(20, mockHistoricalData.length));
  const historicalDraws = mockHistoricalData.slice(20, Math.min(range + 20, mockHistoricalData.length));
  
  const recentFreq = Array(50).fill(0);
  const historicalFreq = Array(50).fill(0);
  
  // Count frequencies
  recentDraws.forEach(draw => {
    draw.numbers.forEach(n => {
      if (n >= 1 && n <= 49) recentFreq[n]++;
    });
  });
  
  historicalDraws.forEach(draw => {
    draw.numbers.forEach(n => {
      if (n >= 1 && n <= 49) historicalFreq[n]++;
    });
  });
  
  // Calculate hot scores
  const suggestions = recentFreq.map((recentCount, n) => {
    const recentRate = recentCount / Math.max(1, recentDraws.length);
    const historicalRate = historicalFreq[n] / Math.max(1, historicalDraws.length);
    const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentCount > 0 ? 10 : 0);
    
    let hotScore = 0;
    hotScore += recentCount * 0.25;
    if (hotRatio > 1.5 && recentRate > 0.10) {
      hotScore += hotRatio * 0.40;
    }
    if (recentCount >= 3 && hotRatio > 1.2) {
      hotScore += 0.20;
    }
    if (recentCount === 0 && historicalRate > 0.08) {
      hotScore -= 0.15;
    }
    
    return {
      n,
      recentCount,
      hotRatio,
      hotScore
    };
  })
    .filter(o => o.n >= 1 && o.n <= 49)
    .sort((a, b) => b.hotScore - a.hotScore || a.n - b.n);
  
  // Select top 6 with even/odd balance
  const finalPredictions = [];
  let evenCount = 0, oddCount = 0;
  
  for (const candidate of suggestions) {
    if (finalPredictions.length >= 6) break;
    
    const isEven = candidate.n % 2 === 0;
    if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || (finalPredictions.length >= 4)) {
      finalPredictions.push(candidate.n);
      if (isEven) evenCount++;
      else oddCount++;
    }
  }
  
  const result = finalPredictions.sort((a, b) => a - b);
  console.log(`  Expected Result: [${result.join(',')}]`);
  console.log(`  Algorithm: Hot/Cold analysis with even/odd balance (${evenCount}E/${oddCount}O)`);
  
  return result;
}

// Run simulations for all ranges
function showAllPredictions() {
  console.log('\n🚀 RUNNING PREDICTION SIMULATIONS...\n');
  
  const ranges = [20, 50, 100];
  const results = {
    weighted: {},
    hotCold: {}
  };
  
  ranges.forEach(range => {
    console.log(`\n📊 RANGE ${range} PREDICTIONS:`);
    console.log('=' .repeat(40));
    
    results.weighted[range] = simulateWeightedPrediction(range);
    results.hotCold[range] = simulateHotColdPrediction(range);
  });
  
  // Summary table
  console.log('\n' + '=' .repeat(70));
  console.log('📋 PREDICTION SUMMARY TABLE');
  console.log('=' .repeat(70));
  
  console.log('\n🔸 Weighted Recent Analysis:');
  ranges.forEach(range => {
    console.log(`  Range ${range.toString().padEnd(3)}: [${results.weighted[range].join(',')}]`);
  });
  
  console.log('\n🔸 Hot/Cold Balance Analysis:');
  ranges.forEach(range => {
    console.log(`  Range ${range.toString().padEnd(3)}: [${results.hotCold[range].join(',')}]`);
  });
  
  console.log('\n✅ VERIFICATION INSTRUCTIONS:');
  console.log('1. Test each method with each range in your HTML interface');
  console.log('2. Compare results with the predictions shown above');
  console.log('3. Results should match exactly if algorithms are consistent');
  console.log('4. If results differ, there may be randomization still present');
  
  return results;
}

// Simple verification helper
function verifyRange(method, range, actualResult) {
  console.log(`\n🔍 VERIFICATION: ${method} - Range ${range}`);
  
  let expectedResult;
  if (method.includes('weighted') || method.includes('Weighted')) {
    expectedResult = simulateWeightedPrediction(range);
  } else if (method.includes('hotCold') || method.includes('Hot') || method.includes('Cold')) {
    expectedResult = simulateHotColdPrediction(range);
  } else {
    console.log('❌ Unknown method');
    return false;
  }
  
  const actualSorted = [...actualResult].sort((a, b) => a - b);
  const expectedSorted = [...expectedResult].sort((a, b) => a - b);
  
  const matches = JSON.stringify(actualSorted) === JSON.stringify(expectedSorted);
  
  if (matches) {
    console.log('✅ MATCH: Results are consistent');
  } else {
    console.log('❌ MISMATCH: Results differ');
    console.log(`  Expected: [${expectedSorted.join(',')}]`);
    console.log(`  Actual:   [${actualSorted.join(',')}]`);
  }
  
  return matches;
}

// Instructions
console.log('\n📋 AVAILABLE FUNCTIONS:');
console.log('1. showAllPredictions() - Show all expected results');
console.log('2. simulateWeightedPrediction(range) - Test specific weighted range');
console.log('3. simulateHotColdPrediction(range) - Test specific hot/cold range');
console.log('4. verifyRange(method, range, actualResult) - Verify actual vs expected');

// Make functions available
if (typeof window !== 'undefined') {
  window.showAllPredictions = showAllPredictions;
  window.simulateWeightedPrediction = simulateWeightedPrediction;
  window.simulateHotColdPrediction = simulateHotColdPrediction;
  window.verifyRange = verifyRange;
}

// Auto-run the simulation
console.log('\n🎯 AUTO-RUNNING SIMULATION...');
showAllPredictions();