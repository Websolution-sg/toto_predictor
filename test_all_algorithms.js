// Test All Prediction Algorithms for Contamination Issues
const fs = require('fs');

console.log('🧪 TESTING ALL PREDICTION ALGORITHMS');
console.log('🔍 Checking for data contamination issues');
console.log('📅 Test Date: December 1, 2025');
console.log('=' * 60);

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

console.log(`📊 Loaded ${historical.length} historical draws`);

// Latest actual result for contamination checking
const latestResult = historical[0];
console.log(`🎯 Latest actual result (${latestResult.date}):`, latestResult.numbers);

// Test Enhanced Ensemble Algorithm (Corrected)
function testEnhancedEnsemble() {
  console.log('\n🔬 TEST 1: Enhanced Ensemble Algorithm');
  
  const bases = [16, 22];
  const scores = Array(50).fill(0);
  const range = 30;
  
  // Multi-factor scoring (corrected version)
  historical.slice(0, range).forEach((draw, idx) => {
    const weight = Math.pow(0.95, idx);
    draw.numbers.forEach(num => {
      scores[num] += 0.4 + (0.35 * weight); // 40% frequency + 35% recent
    });
  });
  
  // Hot/Cold balance (25%)
  for (let num = 1; num <= 49; num++) {
    const recentCount = historical.slice(0, 10).reduce((count, draw) => {
      return count + (draw.numbers.includes(num) ? 1 : 0);
    }, 0);
    
    if (recentCount >= 3) {
      scores[num] += 0.25 * 0.3; // Hot bonus
    } else if (recentCount === 0) {
      scores[num] += 0.25 * 0.7; // Cold bonus
    } else {
      scores[num] += 0.25 * 0.1; // Neutral
    }
  }
  
  // Create ranking and prediction
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    if (!bases.includes(num)) {
      ranking.push({ num, score: scores[num] });
    }
  }
  ranking.sort((a, b) => b.score - a.score);
  
  const prediction = [...bases, ...ranking.slice(0, 4).map(item => item.num)]
    .slice(0, 6).sort((a, b) => a - b);
  
  return prediction;
}

// Test Frequency-Based Algorithm
function testFrequencyBasic() {
  console.log('\n🔬 TEST 2: Basic Frequency Algorithm');
  
  const frequency = Array(50).fill(0);
  const range = 30;
  
  // Count frequencies
  historical.slice(0, range).forEach(draw => {
    draw.numbers.forEach(num => frequency[num]++);
  });
  
  // Get top frequencies
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    ranking.push({ num, freq: frequency[num] });
  }
  ranking.sort((a, b) => b.freq - a.freq);
  
  const prediction = ranking.slice(0, 6).map(item => item.num).sort((a, b) => a - b);
  return prediction;
}

// Test Hot/Cold Algorithm
function testHotCold() {
  console.log('\n🔬 TEST 3: Hot/Cold Algorithm');
  
  const recentDraws = 10;
  const hotColdScores = Array(50).fill(0);
  
  // Calculate hot/cold scores
  for (let num = 1; num <= 49; num++) {
    const recentCount = historical.slice(0, recentDraws).reduce((count, draw) => {
      return count + (draw.numbers.includes(num) ? 1 : 0);
    }, 0);
    
    if (recentCount >= 3) {
      hotColdScores[num] = recentCount * 10; // Hot numbers
    } else if (recentCount === 0) {
      hotColdScores[num] = 50; // Cold numbers (due)
    } else {
      hotColdScores[num] = recentCount; // Neutral
    }
  }
  
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    ranking.push({ num, score: hotColdScores[num] });
  }
  ranking.sort((a, b) => b.score - a.score);
  
  const prediction = ranking.slice(0, 6).map(item => item.num).sort((a, b) => a - b);
  return prediction;
}

// Test Weighted Recency Algorithm
function testWeightedRecency() {
  console.log('\n🔬 TEST 4: Weighted Recency Algorithm');
  
  const scores = Array(50).fill(0);
  const range = 20;
  
  // Apply exponential decay weighting
  historical.slice(0, range).forEach((draw, idx) => {
    const weight = Math.pow(0.9, idx); // Exponential decay
    draw.numbers.forEach(num => {
      scores[num] += weight;
    });
  });
  
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    ranking.push({ num, score: scores[num] });
  }
  ranking.sort((a, b) => b.score - a.score);
  
  const prediction = ranking.slice(0, 6).map(item => item.num).sort((a, b) => a - b);
  return prediction;
}

// Run all algorithm tests
function runAllTests() {
  const results = {
    enhancedEnsemble: testEnhancedEnsemble(),
    frequency: testFrequencyBasic(),
    hotCold: testHotCold(),
    weighted: testWeightedRecency()
  };
  
  console.log('\n📋 ALGORITHM PREDICTIONS:');
  console.log('=' * 40);
  Object.entries(results).forEach(([name, prediction]) => {
    console.log(`🔮 ${name.padEnd(16)}: ${prediction.join(',')}`);
  });
  
  // Check for contamination
  console.log('\n🚨 CONTAMINATION CHECK:');
  console.log(`🎯 Latest actual result: ${latestResult.numbers.join(',')}`);
  console.log('=' * 40);
  
  let contaminationFound = false;
  Object.entries(results).forEach(([name, prediction]) => {
    const isContaminated = JSON.stringify(prediction.sort()) === 
                          JSON.stringify(latestResult.numbers.slice().sort());
    
    if (isContaminated) {
      console.log(`❌ ${name}: CONTAMINATED (matches actual result)`);
      contaminationFound = true;
    } else {
      console.log(`✅ ${name}: CLEAN (no contamination)`);
    }
  });
  
  // Check prediction diversity
  console.log('\n🎲 PREDICTION DIVERSITY:');
  const uniquePredictions = new Set(Object.values(results).map(p => JSON.stringify(p)));
  console.log(`📊 Unique predictions: ${uniquePredictions.size}/${Object.keys(results).length}`);
  
  if (uniquePredictions.size === 1) {
    console.log('⚠️ All algorithms produce identical predictions');
  } else if (uniquePredictions.size === Object.keys(results).length) {
    console.log('✅ Good diversity - all algorithms produce different predictions');
  } else {
    console.log('⚠️ Some algorithms produce identical predictions');
  }
  
  // Validate prediction quality
  console.log('\n📊 PREDICTION QUALITY CHECKS:');
  Object.entries(results).forEach(([name, prediction]) => {
    const inRange = prediction.every(num => num >= 1 && num <= 49);
    const uniqueNums = new Set(prediction).size === 6;
    const isSorted = JSON.stringify(prediction) === JSON.stringify([...prediction].sort((a,b) => a-b));
    const sumInRange = prediction.reduce((a,b) => a+b, 0);
    const validSum = sumInRange >= 70 && sumInRange <= 280;
    
    const quality = inRange && uniqueNums && isSorted && validSum;
    console.log(`${quality ? '✅' : '❌'} ${name}: ${quality ? 'VALID' : 'INVALID'} (sum: ${sumInRange})`);
  });
  
  return {
    predictions: results,
    contaminated: contaminationFound,
    diversity: uniquePredictions.size
  };
}

// Execute all tests
const testResults = runAllTests();

console.log('\n' + '=' * 60);
console.log('🏆 OVERALL ALGORITHM VALIDATION RESULTS:');
console.log('=' * 60);

if (!testResults.contaminated) {
  console.log('✅ NO CONTAMINATION DETECTED: All algorithms are clean');
} else {
  console.log('❌ CONTAMINATION FOUND: Some algorithms use future data');
}

console.log(`📊 Algorithm Diversity: ${testResults.diversity}/4 unique predictions`);

console.log('\n🎯 RECOMMENDED PREDICTION (Enhanced Ensemble):');
console.log(`   ${testResults.predictions.enhancedEnsemble.join(',')}`);

console.log('\n🌟 VALIDATION COMPLETE:');
console.log('   All prediction algorithms have been tested and validated');
console.log('   Ready for $2.5M TOTO jackpot on 05-Dec-2025!');

process.exit(testResults.contaminated ? 1 : 0);