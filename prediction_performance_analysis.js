// TOTO Prediction Performance Analysis
// Analyzing how well the algorithms predict actual results

const fs = require('fs');

console.log('📊 TOTO PREDICTION PERFORMANCE ANALYSIS');
console.log('📅 Analysis Date: December 4, 2025');
console.log('🎯 Evaluating prediction accuracy and effectiveness');
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

console.log(`📊 Historical data loaded: ${historical.length} draws`);
console.log(`📅 Date range: ${historical[historical.length - 1].date} to ${historical[0].date}`);

// Enhanced Ensemble Algorithm (for performance testing)
function generateEnhancedEnsemblePrediction(trainingData, bases = [16, 22, 10]) {
  const scores = Array(50).fill(0);
  const range = Math.min(30, trainingData.length);
  
  // Multi-factor scoring
  trainingData.slice(0, range).forEach((draw, idx) => {
    const weight = Math.pow(0.95, idx);
    draw.numbers.forEach(num => {
      scores[num] += 0.4 + (0.35 * weight);
    });
  });
  
  // Hot/Cold balance
  const recentDraws = trainingData.slice(0, 10);
  for (let num = 1; num <= 49; num++) {
    const recentCount = recentDraws.reduce((count, draw) => {
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
  
  // Create ranking
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    if (!bases.includes(num)) {
      ranking.push({ num, score: scores[num] });
    }
  }
  ranking.sort((a, b) => b.score - a.score);
  
  const neededNumbers = 6 - bases.length;
  const ensemblePrediction = ranking.slice(0, neededNumbers).map(item => item.num);
  return [...bases, ...ensemblePrediction].slice(0, 6).sort((a, b) => a - b);
}

// Performance Analysis Functions
function analyzeBacktesting() {
  console.log('\n🔍 BACKTESTING PERFORMANCE ANALYSIS');
  console.log('=' * 40);
  
  const testResults = [];
  const testPeriods = [5, 10, 15, 20]; // Test last N draws
  
  testPeriods.forEach(testCount => {
    console.log(`\n📊 Testing last ${testCount} predictions:`);
    
    let totalMatches = 0;
    let totalPossible = testCount * 6;
    let exactMatches = 0;
    let partialMatches = [];
    
    for (let i = 0; i < testCount && i < historical.length - 1; i++) {
      // Use data BEFORE the target draw to predict it
      const trainingData = historical.slice(i + 1);
      const targetResult = historical[i];
      
      const prediction = generateEnhancedEnsemblePrediction(trainingData);
      const matches = prediction.filter(num => targetResult.numbers.includes(num)).length;
      
      totalMatches += matches;
      if (matches === 6) exactMatches++;
      partialMatches.push({ date: targetResult.date, matches, prediction, actual: targetResult.numbers });
      
      console.log(`  ${targetResult.date}: ${matches}/6 matches - Predicted: ${prediction.join(',')} | Actual: ${targetResult.numbers.join(',')}`);
    }
    
    const accuracy = (totalMatches / totalPossible * 100).toFixed(2);
    console.log(`\n📈 ${testCount}-draw summary:`);
    console.log(`   Total matches: ${totalMatches}/${totalPossible} (${accuracy}%)`);
    console.log(`   Exact matches (6/6): ${exactMatches}/${testCount}`);
    console.log(`   Average matches per draw: ${(totalMatches / testCount).toFixed(2)}`);
    
    testResults.push({
      period: testCount,
      totalMatches,
      totalPossible,
      accuracy: parseFloat(accuracy),
      exactMatches,
      averageMatches: totalMatches / testCount
    });
  });
  
  return testResults;
}

function analyzeNumberFrequency() {
  console.log('\n🔢 NUMBER FREQUENCY ANALYSIS');
  console.log('=' * 35);
  
  const frequency = Array(50).fill(0);
  const recentFrequency = Array(50).fill(0);
  
  // Overall frequency
  historical.forEach(draw => {
    draw.numbers.forEach(num => frequency[num]++);
  });
  
  // Recent frequency (last 20 draws)
  historical.slice(0, 20).forEach(draw => {
    draw.numbers.forEach(num => recentFrequency[num]++);
  });
  
  // Find hot and cold numbers
  const hotNumbers = [];
  const coldNumbers = [];
  
  for (let num = 1; num <= 49; num++) {
    const overall = frequency[num];
    const recent = recentFrequency[num];
    
    if (recent >= 3) hotNumbers.push({ num, recent, overall });
    if (recent === 0) coldNumbers.push({ num, recent, overall });
  }
  
  console.log('🔥 HOT NUMBERS (appeared 3+ times in last 20 draws):');
  hotNumbers.sort((a, b) => b.recent - a.recent).slice(0, 10).forEach(item => {
    console.log(`   ${item.num}: ${item.recent} recent, ${item.overall} total`);
  });
  
  console.log('\n❄️ COLD NUMBERS (not appeared in last 20 draws):');
  coldNumbers.sort((a, b) => b.overall - a.overall).slice(0, 15).forEach(item => {
    console.log(`   ${item.num}: 0 recent, ${item.overall} total (due for ${20 - item.recent} draws)`);
  });
  
  return { hotNumbers, coldNumbers, frequency, recentFrequency };
}

function analyzePredictionPatterns() {
  console.log('\n🎯 PREDICTION PATTERN ANALYSIS');
  console.log('=' * 35);
  
  // Generate current prediction
  const currentPrediction = generateEnhancedEnsemblePrediction(historical);
  console.log(`🔮 Current Enhanced Ensemble prediction: ${currentPrediction.join(',')}`);
  
  // Analyze prediction characteristics
  const sum = currentPrediction.reduce((a, b) => a + b, 0);
  const evenCount = currentPrediction.filter(n => n % 2 === 0).length;
  const lowCount = currentPrediction.filter(n => n <= 16).length;
  const midCount = currentPrediction.filter(n => n >= 17 && n <= 33).length;
  const highCount = currentPrediction.filter(n => n >= 34).length;
  
  console.log('\n📊 Current Prediction Analysis:');
  console.log(`   Sum: ${sum} (optimal range: 105-175)`);
  console.log(`   Even/Odd: ${evenCount}/${6-evenCount} (optimal: 3/3)`);
  console.log(`   Low/Mid/High: ${lowCount}/${midCount}/${highCount} (optimal: 2/2/2)`);
  
  // Compare with recent winning patterns
  const recentSums = historical.slice(0, 10).map(draw => 
    draw.numbers.reduce((a, b) => a + b, 0)
  );
  const avgRecentSum = recentSums.reduce((a, b) => a + b, 0) / recentSums.length;
  
  console.log(`   Recent average sum: ${avgRecentSum.toFixed(1)}`);
  console.log(`   Prediction vs recent: ${sum > avgRecentSum ? 'Higher' : 'Lower'} than average`);
  
  return {
    prediction: currentPrediction,
    characteristics: { sum, evenCount, lowCount, midCount, highCount },
    recentAverage: avgRecentSum
  };
}

function calculateROI() {
  console.log('\n💰 RETURN ON INVESTMENT ANALYSIS');
  console.log('=' * 35);
  
  // Simulate betting on Enhanced Ensemble predictions
  const betCost = 1; // $1 per ordinary bet
  let totalInvestment = 0;
  let totalReturns = 0;
  let winningDraws = 0;
  
  // Prize structure (approximate)
  const prizes = {
    3: 10,    // Group 7: $10
    4: 50,    // Group 6: $50  
    5: 500,   // Group 5: $500
    6: 100000 // Group 1: Varies ($100k average)
  };
  
  // Test last 20 predictions
  for (let i = 0; i < 20 && i < historical.length - 1; i++) {
    const trainingData = historical.slice(i + 1);
    const targetResult = historical[i];
    
    const prediction = generateEnhancedEnsemblePrediction(trainingData);
    const matches = prediction.filter(num => targetResult.numbers.includes(num)).length;
    
    totalInvestment += betCost;
    
    if (matches >= 3) {
      totalReturns += prizes[matches] || 0;
      winningDraws++;
      console.log(`   ${targetResult.date}: ${matches} matches = $${prizes[matches] || 0}`);
    }
  }
  
  const roi = totalInvestment > 0 ? ((totalReturns - totalInvestment) / totalInvestment * 100).toFixed(2) : 0;
  
  console.log(`\n📊 ROI Analysis (last 20 draws):`);
  console.log(`   Total investment: $${totalInvestment}`);
  console.log(`   Total returns: $${totalReturns}`);
  console.log(`   Profit/Loss: $${totalReturns - totalInvestment}`);
  console.log(`   ROI: ${roi}%`);
  console.log(`   Winning draws: ${winningDraws}/20 (${(winningDraws/20*100).toFixed(1)}%)`);
  
  return {
    investment: totalInvestment,
    returns: totalReturns,
    profit: totalReturns - totalInvestment,
    roi: parseFloat(roi),
    winRate: winningDraws / 20
  };
}

// Run complete performance analysis
function runCompleteAnalysis() {
  const backtestResults = analyzeBacktesting();
  const frequencyAnalysis = analyzeNumberFrequency();
  const patternAnalysis = analyzePredictionPatterns();
  const roiAnalysis = calculateROI();
  
  console.log('\n' + '=' * 60);
  console.log('🏆 PERFORMANCE SUMMARY');
  console.log('=' * 60);
  
  console.log('\n📈 ACCURACY METRICS:');
  const bestPeriod = backtestResults.find(r => r.accuracy === Math.max(...backtestResults.map(r => r.accuracy)));
  console.log(`   Best accuracy: ${bestPeriod.accuracy}% (${bestPeriod.period}-draw period)`);
  console.log(`   Average matches per draw: ${bestPeriod.averageMatches.toFixed(2)}/6`);
  console.log(`   Exact matches achieved: ${backtestResults.reduce((sum, r) => sum + r.exactMatches, 0)} total`);
  
  console.log('\n💰 FINANCIAL PERFORMANCE:');
  console.log(`   ROI: ${roiAnalysis.roi}%`);
  console.log(`   Win rate: ${(roiAnalysis.winRate * 100).toFixed(1)}%`);
  console.log(`   Profit/Loss: $${roiAnalysis.profit}`);
  
  console.log('\n🎯 CURRENT PREDICTION QUALITY:');
  const pred = patternAnalysis.prediction;
  console.log(`   Next prediction: ${pred.join(',')}`);
  console.log(`   Sum balance: ${patternAnalysis.characteristics.sum >= 105 && patternAnalysis.characteristics.sum <= 175 ? '✅ Good' : '⚠️ Outside optimal'}`);
  console.log(`   Even/Odd balance: ${patternAnalysis.characteristics.evenCount === 3 ? '✅ Perfect' : '⚠️ Imbalanced'}`);
  
  console.log('\n🌟 SYSTEM STATUS:');
  console.log(`   Algorithm: Enhanced Ensemble v2.0`);
  console.log(`   Data points: ${historical.length} draws`);
  console.log(`   Performance: ${bestPeriod.accuracy >= 15 ? '✅ Good' : bestPeriod.accuracy >= 10 ? '⚠️ Average' : '❌ Needs improvement'}`);
  console.log(`   Recommendation: ${roiAnalysis.roi > 0 ? '✅ Profitable' : '⚠️ Use with caution'}`);
  
  return {
    backtesting: backtestResults,
    frequency: frequencyAnalysis,
    patterns: patternAnalysis,
    roi: roiAnalysis,
    overall: {
      bestAccuracy: bestPeriod.accuracy,
      profitability: roiAnalysis.roi,
      recommendation: roiAnalysis.roi > 0 ? 'Profitable' : 'Cautious'
    }
  };
}

// Execute complete analysis
try {
  const analysisResults = runCompleteAnalysis();
  console.log('\n✅ Performance analysis complete!');
  process.exit(0);
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
}