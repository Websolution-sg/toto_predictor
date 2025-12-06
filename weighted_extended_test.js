// Extended Accuracy Test for Weighted Recent Analysis
console.log('📈 EXTENDED ACCURACY VALIDATION');
console.log('=' .repeat(50));

const fs = require('fs');

function loadTestData() {
  const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
  return csvContent.trim().split('\n').map(line => {
    const [date, ...nums] = line.split(',');
    return {
      date,
      numbers: nums.slice(0, 6).map(n => parseInt(n)),
      additional: parseInt(nums[6])
    };
  });
}

function testWeightedPrediction(historical, bases, range, includeAdd) {
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  const draws = historical.slice(0, range);
  
  draws.forEach((draw, index) => {
    const decayRate = range <= 20 ? 0.2 : range <= 50 ? 0.1 : 0.05;
    const weight = Math.exp(-index * decayRate);
    const rangeMultiplier = range <= 20 ? 1.5 : range <= 50 ? 1.2 : 1.0;
    const adjustedWeight = weight * rangeMultiplier;
    
    const pool = includeAdd ? draw.numbers.concat(draw.additional) : draw.numbers;
    
    pool.forEach(n => weighted[n] += adjustedWeight);
    
    bases.forEach(b => {
      if (pool.includes(b)) {
        pool.filter(n => n !== b).forEach(n => compat[n] += adjustedWeight);
      }
    });
  });
  
  const suggestions = weighted.map((weight, n) => ({ 
    n, 
    weight: weight, 
    compat: compat[n],
    score: weight + compat[n] * 1.5
  }))
    .filter(o => o.n >= 1 && o.n <= 49)
    .sort((a, b) => b.score - a.score || a.n - b.n)
    .slice(0, 6);
    
  return suggestions.map(o => o.n);
}

const historical = loadTestData();

console.log('🎯 TESTING WEIGHTED RECENT ANALYSIS ON LAST 10 DRAWS:');
console.log('=' .repeat(55));

let totalMatches = 0;
let totalTests = 0;
const testResults = [];

// Test on last 10 actual results
for (let i = 0; i < Math.min(10, historical.length - 30); i++) {
  const testDraw = historical[i];
  const trainingData = historical.slice(i + 1); // Exclude test draw and later
  
  if (trainingData.length < 30) break; // Need enough training data
  
  const prediction = testWeightedPrediction(trainingData, [16, 22, 10], 30, false);
  const matches = prediction.filter(p => testDraw.numbers.includes(p));
  
  totalMatches += matches.length;
  totalTests++;
  
  const accuracy = (matches.length / 6 * 100).toFixed(1);
  testResults.push({
    date: testDraw.date,
    actual: testDraw.numbers,
    predicted: prediction,
    matches: matches,
    accuracy: accuracy
  });
  
  console.log(`\n📅 ${testDraw.date}:`);
  console.log(`   Actual:    [${testDraw.numbers.join(', ')}]`);
  console.log(`   Predicted: [${prediction.join(', ')}]`);
  console.log(`   Matches:   [${matches.join(', ')}] (${matches.length}/6 = ${accuracy}%)`);
}

console.log('\n📊 OVERALL PERFORMANCE ANALYSIS:');
console.log('=' .repeat(35));

const overallAccuracy = (totalMatches / (totalTests * 6) * 100).toFixed(1);
const averageMatchesPerDraw = (totalMatches / totalTests).toFixed(2);

console.log(`Total Tests: ${totalTests} draws`);
console.log(`Total Matches: ${totalMatches} out of ${totalTests * 6} possible`);
console.log(`Overall Accuracy: ${overallAccuracy}%`);
console.log(`Average Matches per Draw: ${averageMatchesPerDraw}`);

// Performance breakdown
const perfectMatches = testResults.filter(r => r.matches.length >= 4).length;
const goodMatches = testResults.filter(r => r.matches.length >= 2).length;
const someMatches = testResults.filter(r => r.matches.length >= 1).length;

console.log('\n🎯 MATCH DISTRIBUTION:');
console.log(`   4+ matches: ${perfectMatches}/${totalTests} draws (${(perfectMatches/totalTests*100).toFixed(1)}%)`);
console.log(`   2+ matches: ${goodMatches}/${totalTests} draws (${(goodMatches/totalTests*100).toFixed(1)}%)`);
console.log(`   1+ matches: ${someMatches}/${totalTests} draws (${(someMatches/totalTests*100).toFixed(1)}%)`);

console.log('\n📈 PERFORMANCE RATING:');
if (parseFloat(overallAccuracy) >= 25) {
  console.log('🏆 EXCELLENT: Above 25% accuracy (significantly above random 12.2%)');
} else if (parseFloat(overallAccuracy) >= 20) {
  console.log('✅ VERY GOOD: 20-25% accuracy (well above random)');
} else if (parseFloat(overallAccuracy) >= 15) {
  console.log('✅ GOOD: 15-20% accuracy (above random)');
} else if (parseFloat(overallAccuracy) >= 12.2) {
  console.log('⚠️ FAIR: Around random chance (12.2%)');
} else {
  console.log('❌ POOR: Below random chance');
}

console.log('\n💡 WEIGHTED RECENT ANALYSIS STRENGTHS:');
console.log('• Emphasizes recent draw patterns');
console.log('• Adaptive decay rates for different ranges');
console.log('• Compatibility scoring with base numbers');
console.log('• Good for trend-following strategies');

console.log('\n🎯 RECOMMENDED SETTINGS:');
console.log('• Range: 20-50 draws (optimal balance)');
console.log('• Base numbers: [16, 22, 10] (high-frequency anchors)');
console.log('• Best for: Volatile periods with clear trends');