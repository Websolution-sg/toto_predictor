#!/usr/bin/env node
/**
 * 🎯 PREDICTION VALIDATION SCRIPT
 * Tests prediction accuracy against actual winning numbers for last 20 draws
 * Excludes additional numbers (tests main 6 numbers only)
 */

import fs from 'fs';

console.log('🎯 PREDICTION VALIDATION - LAST 20 DRAWS');
console.log('==========================================');
console.log('📋 Testing main 6 numbers only (excluding additional number)');

// Load and parse CSV data
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const allDraws = csvContent.trim().split('\n').map(line => {
  const parts = line.split(',');
  return {
    date: parts[0],
    numbers: parts.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b),
    additional: parseInt(parts[7])
  };
});

console.log(`📊 Total historical draws available: ${allDraws.length}`);

// Get last 20 draws for validation
const validationDraws = allDraws.slice(0, 20);
console.log(`🎯 Validating against last 20 draws: ${validationDraws[19].date} to ${validationDraws[0].date}`);

// Prediction algorithms (same as in the website)
function calculateFrequencyScores(historical, excludeLatest = 1) {
  const frequency = {};
  for (let i = 1; i <= 49; i++) frequency[i] = 0;
  
  // Use historical data excluding the most recent draw(s)
  const trainingData = historical.slice(excludeLatest);
  
  trainingData.forEach(draw => {
    draw.numbers.forEach(num => frequency[num]++);
  });
  
  return frequency;
}

function calculateCompatibilityScores(baseNumbers, historical, excludeLatest = 1) {
  const compatibility = {};
  for (let i = 1; i <= 49; i++) compatibility[i] = 0;
  
  const trainingData = historical.slice(excludeLatest);
  
  for (let num = 1; num <= 49; num++) {
    if (baseNumbers.includes(num)) continue;
    
    trainingData.forEach(draw => {
      const hasTarget = draw.numbers.includes(num);
      const commonCount = baseNumbers.filter(baseNum => draw.numbers.includes(baseNum)).length;
      
      if (hasTarget && commonCount > 0) {
        compatibility[num] += commonCount / baseNumbers.length;
      }
    });
    
    compatibility[num] = compatibility[num] / trainingData.length;
  }
  
  return compatibility;
}

function calculateWeightedScores(historical, excludeLatest = 1, drawCount = 50) {
  const weighted = {};
  for (let i = 1; i <= 49; i++) weighted[i] = 0;
  
  const trainingData = historical.slice(excludeLatest, excludeLatest + drawCount);
  
  trainingData.forEach((draw, index) => {
    const weight = Math.exp(-index / (drawCount / 3));
    draw.numbers.forEach(num => {
      weighted[num] += weight;
    });
  });
  
  return weighted;
}

function calculateHotColdScores(historical, excludeLatest = 1) {
  const recentDraws = historical.slice(excludeLatest, excludeLatest + 20);
  const allTrainingDraws = historical.slice(excludeLatest);
  
  const recentFreq = {};
  const overallFreq = {};
  for (let i = 1; i <= 49; i++) {
    recentFreq[i] = 0;
    overallFreq[i] = 0;
  }
  
  recentDraws.forEach(draw => {
    draw.numbers.forEach(num => recentFreq[num]++);
  });
  
  allTrainingDraws.forEach(draw => {
    draw.numbers.forEach(num => overallFreq[num]++);
  });
  
  const hotColdScores = {};
  for (let num = 1; num <= 49; num++) {
    const recentRate = recentFreq[num] / recentDraws.length;
    const overallRate = overallFreq[num] / allTrainingDraws.length;
    const trend = recentRate - overallRate;
    hotColdScores[num] = trend * 100; // Convert to percentage
  }
  
  return hotColdScores;
}

// Prediction methods
function predictFrequencyMethod(historical, baseNumbers, excludeLatest = 1) {
  const frequency = calculateFrequencyScores(historical, excludeLatest);
  const compatibility = calculateCompatibilityScores(baseNumbers, historical, excludeLatest);
  
  const scores = {};
  for (let num = 1; num <= 49; num++) {
    if (baseNumbers.includes(num)) continue;
    scores[num] = frequency[num] * 0.7 + compatibility[num] * 30;
  }
  
  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6 - baseNumbers.length)
    .map(([num]) => parseInt(num));
}

function predictWeightedMethod(historical, baseNumbers, excludeLatest = 1) {
  const weighted = calculateWeightedScores(historical, excludeLatest);
  
  const scores = {};
  for (let num = 1; num <= 49; num++) {
    if (baseNumbers.includes(num)) continue;
    scores[num] = weighted[num];
  }
  
  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6 - baseNumbers.length)
    .map(([num]) => parseInt(num));
}

function predictHotColdMethod(historical, baseNumbers, excludeLatest = 1) {
  const hotCold = calculateHotColdScores(historical, excludeLatest);
  const frequency = calculateFrequencyScores(historical, excludeLatest);
  
  const scores = {};
  for (let num = 1; num <= 49; num++) {
    if (baseNumbers.includes(num)) continue;
    scores[num] = hotCold[num] * 0.6 + frequency[num] * 0.4;
  }
  
  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6 - baseNumbers.length)
    .map(([num]) => parseInt(num));
}

// Validation function
function validatePrediction(predicted, actual) {
  const matches = predicted.filter(num => actual.includes(num));
  return {
    matches: matches.length,
    matchedNumbers: matches,
    accuracy: (matches.length / 6) * 100,
    predicted: predicted.sort((a, b) => a - b),
    actual: actual.sort((a, b) => a - b)
  };
}

// Run validation for each draw
console.log('\n📊 VALIDATION RESULTS');
console.log('====================');

const results = {
  frequency: { totalMatches: 0, draws: [] },
  weighted: { totalMatches: 0, draws: [] },
  hotCold: { totalMatches: 0, draws: [] }
};

validationDraws.forEach((targetDraw, index) => {
  const drawNumber = index + 1;
  const trainingData = allDraws.slice(index + 1); // Use all draws before this one
  
  console.log(`\n🎯 DRAW ${drawNumber}: ${targetDraw.date}`);
  console.log(`📋 Actual winning numbers: ${targetDraw.numbers.join(', ')}`);
  
  // Use previous draw as base numbers (common prediction strategy)
  const baseNumbers = index < validationDraws.length - 1 ? 
    validationDraws[index + 1].numbers.slice(0, 3) : // Use 3 numbers from previous draw
    []; // For the oldest draw, predict all 6 numbers
  
  if (baseNumbers.length > 0) {
    console.log(`🔢 Base numbers (from previous draw): ${baseNumbers.join(', ')}`);
  }
  
  // Method 1: Frequency + Compatibility
  try {
    const freqPredicted = baseNumbers.length > 0 ? 
      [...baseNumbers, ...predictFrequencyMethod(trainingData, baseNumbers)] :
      predictFrequencyMethod(trainingData, []).slice(0, 6);
    
    const freqResult = validatePrediction(freqPredicted, targetDraw.numbers);
    results.frequency.totalMatches += freqResult.matches;
    results.frequency.draws.push(freqResult);
    
    console.log(`📊 Frequency Method: ${freqPredicted.join(', ')}`);
    console.log(`   ✅ Matches: ${freqResult.matches}/6 (${freqResult.accuracy.toFixed(1)}%)`);
    if (freqResult.matchedNumbers.length > 0) {
      console.log(`   🎯 Matched numbers: ${freqResult.matchedNumbers.join(', ')}`);
    }
  } catch (err) {
    console.log(`   ❌ Frequency method failed: ${err.message}`);
  }
  
  // Method 2: Weighted Recent
  try {
    const weightedPredicted = baseNumbers.length > 0 ? 
      [...baseNumbers, ...predictWeightedMethod(trainingData, baseNumbers)] :
      predictWeightedMethod(trainingData, []).slice(0, 6);
    
    const weightedResult = validatePrediction(weightedPredicted, targetDraw.numbers);
    results.weighted.totalMatches += weightedResult.matches;
    results.weighted.draws.push(weightedResult);
    
    console.log(`⚖️ Weighted Method: ${weightedPredicted.join(', ')}`);
    console.log(`   ✅ Matches: ${weightedResult.matches}/6 (${weightedResult.accuracy.toFixed(1)}%)`);
    if (weightedResult.matchedNumbers.length > 0) {
      console.log(`   🎯 Matched numbers: ${weightedResult.matchedNumbers.join(', ')}`);
    }
  } catch (err) {
    console.log(`   ❌ Weighted method failed: ${err.message}`);
  }
  
  // Method 3: Hot/Cold Analysis
  try {
    const hotColdPredicted = baseNumbers.length > 0 ? 
      [...baseNumbers, ...predictHotColdMethod(trainingData, baseNumbers)] :
      predictHotColdMethod(trainingData, []).slice(0, 6);
    
    const hotColdResult = validatePrediction(hotColdPredicted, targetDraw.numbers);
    results.hotCold.totalMatches += hotColdResult.matches;
    results.hotCold.draws.push(hotColdResult);
    
    console.log(`🌡️ Hot/Cold Method: ${hotColdPredicted.join(', ')}`);
    console.log(`   ✅ Matches: ${hotColdResult.matches}/6 (${hotColdResult.accuracy.toFixed(1)}%)`);
    if (hotColdResult.matchedNumbers.length > 0) {
      console.log(`   🎯 Matched numbers: ${hotColdResult.matchedNumbers.join(', ')}`);
    }
  } catch (err) {
    console.log(`   ❌ Hot/Cold method failed: ${err.message}`);
  }
});

// Summary statistics
console.log('\n📈 SUMMARY STATISTICS');
console.log('=====================');

const methods = [
  { name: 'Frequency + Compatibility', key: 'frequency' },
  { name: 'Weighted Recent Analysis', key: 'weighted' },
  { name: 'Hot/Cold Number Analysis', key: 'hotCold' }
];

methods.forEach(method => {
  const data = results[method.key];
  const totalPossible = validationDraws.length * 6;
  const averageMatches = data.totalMatches / validationDraws.length;
  const overallAccuracy = (data.totalMatches / totalPossible) * 100;
  
  console.log(`\n🎯 ${method.name}:`);
  console.log(`   📊 Total matches: ${data.totalMatches}/${totalPossible}`);
  console.log(`   📈 Average matches per draw: ${averageMatches.toFixed(2)}/6`);
  console.log(`   🎯 Overall accuracy: ${overallAccuracy.toFixed(2)}%`);
  
  // Distribution of match counts
  const distribution = {};
  for (let i = 0; i <= 6; i++) distribution[i] = 0;
  data.draws.forEach(draw => distribution[draw.matches]++);
  
  console.log(`   📊 Match distribution:`);
  for (let i = 6; i >= 0; i--) {
    if (distribution[i] > 0) {
      const percentage = (distribution[i] / validationDraws.length * 100).toFixed(1);
      console.log(`      ${i} matches: ${distribution[i]} draws (${percentage}%)`);
    }
  }
});

// Best performing method
const bestMethod = methods.reduce((best, current) => 
  results[current.key].totalMatches > results[best.key].totalMatches ? current : best
);

console.log(`\n🏆 BEST PERFORMING METHOD: ${bestMethod.name}`);
console.log(`🎯 Total matches: ${results[bestMethod.key].totalMatches}`);

// Random chance comparison
const randomExpected = validationDraws.length * 6 * (6/49); // Expected matches by pure chance
console.log(`\n🎲 RANDOM CHANCE BASELINE:`);
console.log(`   📊 Expected matches (pure chance): ${randomExpected.toFixed(2)}`);
console.log(`   📈 Best method vs random: ${(results[bestMethod.key].totalMatches / randomExpected).toFixed(2)}x better`);

console.log('\n🎉 PREDICTION VALIDATION COMPLETED');
console.log('==================================');