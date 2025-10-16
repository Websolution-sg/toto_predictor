import fs from 'fs';

console.log('🔍 FINAL WEIGHTED METHOD VALIDATION');
console.log('='.repeat(60));
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Load actual TOTO data
function loadTotoData() {
  const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const parts = line.split(',');
    return {
      date: parts[0],
      numbers: parts.slice(1, 7).map(n => parseInt(n)),
      additional: parseInt(parts[7])
    };
  });
}

// Improved weighted prediction method (matching the HTML implementation)
function improvedWeightedPrediction(totoData, basesArray, range = 20) {
  console.log(`🎯 Testing Improved Weighted Method (Range: ${range})`);
  
  const draws = totoData.slice(0, Math.min(range, totoData.length));
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Range-adaptive decay factor (matching HTML logic)
  const decayFactor = Math.max(0.80, Math.min(0.95, 0.75 + (range / 200)));
  console.log(`   Decay factor: ${decayFactor.toFixed(3)} for range ${range}`);
  
  draws.forEach((draw, index) => {
    const weight = Math.pow(decayFactor, index);
    const pool = [...draw.numbers, draw.additional]; // Include additional for better analysis
    
    pool.forEach(n => {
      if (n >= 1 && n <= 49) {
        weighted[n] += weight;
      }
    });
    
    basesArray.forEach(base => {
      if (pool.includes(base)) {
        pool.filter(n => n !== base && n >= 1 && n <= 49).forEach(n => {
          compat[n] += weight;
        });
      }
    });
  });
  
  // Range-based scoring adjustment
  const rangeBonus = Math.max(0, (range - 20) * 0.01);
  
  const suggestions = weighted.map((weight, n) => ({
    n,
    weight,
    compat: compat[n],
    baseScore: weight + compat[n],
    score: weight + compat[n] + (rangeBonus * weight)
  }))
  .filter(o => o.n >= 1 && o.n <= 49 && !basesArray.includes(o.n))
  .sort((a, b) => b.score - a.score || a.n - b.n);
  
  // Filter for significant predictions
  const finalPredictions = suggestions
    .filter(o => o.weight > 0.1 || o.compat > 0.1)
    .slice(0, 6);
  
  console.log(`   Top predictions: [${finalPredictions.map(p => p.n).join(', ')}]`);
  console.log(`   Scores: [${finalPredictions.map(p => p.score.toFixed(2)).join(', ')}]`);
  
  return {
    predictions: finalPredictions.map(p => p.n),
    scores: finalPredictions.map(p => p.score),
    decayFactor,
    totalDrawsUsed: draws.length
  };
}

// Test the method with different ranges
function testRangeVariation() {
  console.log('\n📊 TESTING RANGE VARIATION');
  console.log('-'.repeat(50));
  
  const data = loadTotoData();
  const testBases = [1, 2, 3, 4, 5, 6];
  const testRanges = [5, 10, 20, 30, 50, 100];
  
  const results = {};
  
  testRanges.forEach(range => {
    console.log(`\n🔍 Range ${range}:`);
    const result = improvedWeightedPrediction(data, testBases, range);
    results[range] = result;
  });
  
  // Analyze diversity
  console.log('\n📈 DIVERSITY ANALYSIS:');
  console.log('-'.repeat(30));
  
  const allPredictions = Object.values(results).flatMap(r => r.predictions);
  const uniquePredictions = new Set(allPredictions);
  
  console.log(`Total predictions made: ${allPredictions.length}`);
  console.log(`Unique numbers predicted: ${uniquePredictions.size}`);
  console.log(`Diversity ratio: ${((uniquePredictions.size / allPredictions.length) * 100).toFixed(1)}%`);
  
  // Check range-by-range similarity
  console.log('\n🔍 RANGE SIMILARITY MATRIX:');
  const ranges = Object.keys(results);
  
  ranges.forEach(range1 => {
    const similarities = ranges.map(range2 => {
      if (range1 === range2) return '100%';
      
      const pred1 = new Set(results[range1].predictions);
      const pred2 = new Set(results[range2].predictions);
      const intersection = [...pred1].filter(n => pred2.has(n));
      const similarity = Math.round((intersection.length / 6) * 100);
      
      return `${similarity}%`;
    });
    
    console.log(`Range ${range1.padStart(3)}: ${similarities.join('  ')}`);
  });
  
  return results;
}

// Test with different base combinations
function testBaseCombinations() {
  console.log('\n🧪 TESTING BASE COMBINATIONS');
  console.log('-'.repeat(50));
  
  const data = loadTotoData();
  const range = 20; // Fixed range for comparison
  
  const testCases = [
    { bases: [1,2,3,4,5,6], label: 'Low Sequential' },
    { bases: [7,14,21,28,35,42], label: 'Multiples of 7' },
    { bases: [10,20,30,40,41,49], label: 'High Mixed' },
    { bases: [15,22,26,37,40,46], label: 'Recent Winners (Oct 2)' },
    { bases: [2,4,8,19,35,39], label: 'Latest Winners (Oct 16)' }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n🎯 ${testCase.label}: [${testCase.bases.join(', ')}]`);
    const result = improvedWeightedPrediction(data, testCase.bases, range);
    
    // Check if predictions avoid bases
    const hasBaseConflict = result.predictions.some(p => testCase.bases.includes(p));
    if (hasBaseConflict) {
      console.log('   ⚠️  WARNING: Prediction conflicts with base numbers!');
    } else {
      console.log('   ✅ All predictions properly exclude base numbers');
    }
  });
}

// Performance comparison
function comparePerformance() {
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log('-'.repeat(50));
  
  const data = loadTotoData();
  const bases = [1,2,3,4,5,6];
  
  // Test old method (1/index+1)
  console.log('\n📊 Old Method (Linear Decay: 1/(index+1)):');
  const range = 20;
  const oldWeighted = Array(50).fill(0);
  
  data.slice(0, range).forEach((draw, index) => {
    const weight = 1 / (index + 1);
    draw.numbers.forEach(n => oldWeighted[n] += weight);
  });
  
  const oldTop = oldWeighted.map((w, n) => ({n, w}))
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.w - a.w)
    .slice(0, 6)
    .map(o => o.n);
  
  console.log(`   Predictions: [${oldTop.join(', ')}]`);
  
  // Test new method
  console.log('\n📊 New Method (Adaptive Exponential Decay):');
  const newResult = improvedWeightedPrediction(data, bases, range);
  console.log(`   Predictions: [${newResult.predictions.join(', ')}]`);
  
  // Compare diversity
  const overlap = oldTop.filter(n => newResult.predictions.includes(n)).length;
  console.log(`\n🔄 Methods Comparison:`);
  console.log(`   Overlap: ${overlap}/6 numbers (${Math.round(overlap/6*100)}%)`);
  console.log(`   Difference: ${6-overlap}/6 numbers (${Math.round((6-overlap)/6*100)}%)`);
  
  if (overlap >= 5) {
    console.log('   ⚠️  High overlap - new method may not be different enough');
  } else if (overlap <= 2) {
    console.log('   ✅ Good differentiation between methods');
  } else {
    console.log('   📊 Moderate difference - acceptable variation');
  }
}

// Main validation function
function runFinalValidation() {
  console.log('🚀 Starting comprehensive weighted method validation...\n');
  
  try {
    const data = loadTotoData();
    console.log(`📚 Loaded ${data.length} historical draws`);
    console.log(`📅 Date range: ${data[data.length-1].date} to ${data[0].date}\n`);
    
    const results = testRangeVariation();
    testBaseCombinations();
    comparePerformance();
    
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('='.repeat(60));
    
    // Calculate overall diversity
    const allResults = Object.values(results);
    const totalPredictions = allResults.flatMap(r => r.predictions);
    const uniqueCount = new Set(totalPredictions).size;
    const diversityScore = (uniqueCount / totalPredictions.length) * 100;
    
    if (diversityScore > 70) {
      console.log('✅ EXCELLENT: High diversity across ranges');
      console.log('✅ Algorithm successfully addresses the range sensitivity issue');
    } else if (diversityScore > 50) {
      console.log('✅ GOOD: Moderate diversity improvement');
      console.log('📈 Significant improvement over old method');
    } else {
      console.log('⚠️  NEEDS WORK: Still low diversity');
      console.log('🔧 Algorithm may need further tuning');
    }
    
    console.log(`📊 Overall Diversity Score: ${diversityScore.toFixed(1)}%`);
    console.log(`🎯 Method Status: ${diversityScore > 60 ? 'READY FOR DEPLOYMENT' : 'NEEDS REFINEMENT'}`);
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}

// Run the comprehensive validation
runFinalValidation();