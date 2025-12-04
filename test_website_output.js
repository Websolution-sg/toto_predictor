// Test Website Prediction Output
// This simulates what the website Enhanced Ensemble should produce

console.log('🧪 TESTING WEBSITE ENHANCED ENSEMBLE OUTPUT');
console.log('🌐 Simulating: https://websolution-sg.github.io/toto_predictor/');
console.log('=' * 50);

// Load current CSV data
const fs = require('fs');
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
console.log(`📅 Latest result: ${historical[0].date} - ${historical[0].numbers.join(',')}`);

// Simulate the corrected Enhanced Ensemble from the website
function simulateWebsiteEnhancedEnsemble() {
  console.log('\n🔧 SIMULATING WEBSITE ENHANCED ENSEMBLE ALGORITHM');
  
  // Same parameters as website
  const bases = [16, 22];
  const range = 30;
  const includeAdd = false;
  
  console.log(`📌 Base numbers: ${bases.join(',')}`);
  console.log(`📊 Analysis range: ${range} draws`);
  
  // Initialize scores (corrected algorithm)
  const scores = Array(50).fill(0);
  
  // Multi-factor scoring exactly as implemented in HTML
  historical.slice(0, range).forEach((draw, idx) => {
    const weight = Math.pow(0.95, idx); // Recent weighting
    
    // Frequency analysis (40%) + Recent weighting (35%)
    draw.numbers.forEach(num => {
      scores[num] += 0.4 + (0.35 * weight);
    });
    
    if (includeAdd && draw.additional) {
      scores[draw.additional] += 0.2 + (0.15 * weight);
    }
  });
  
  // Hot/Cold balance (25%)
  const recentDraws = historical.slice(0, 10);
  for (let num = 1; num <= 49; num++) {
    const recentCount = recentDraws.reduce((count, draw) => {
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
  
  // Create ranking exactly as website does
  const ranking = [];
  for (let num = 1; num <= 49; num++) {
    if (!bases.includes(num)) {
      ranking.push({ num, score: scores[num] });
    }
  }
  ranking.sort((a, b) => b.score - a.score);
  
  console.log('\n🏆 Top 10 Enhanced Ensemble rankings (website simulation):');
  ranking.slice(0, 10).forEach((item, i) => {
    console.log(`  ${i + 1}. Number ${item.num}: Score ${item.score.toFixed(4)}`);
  });
  
  // Final prediction
  const neededNumbers = 6 - bases.length;
  const ensemblePrediction = ranking.slice(0, neededNumbers).map(item => item.num);
  let finalPrediction = [...bases, ...ensemblePrediction].slice(0, 6).sort((a, b) => a - b);
  
  console.log('\n✅ WEBSITE ENHANCED ENSEMBLE PREDICTION:');
  console.log(`   🎯 ${finalPrediction.join(',')}`);
  console.log(`   📌 Base: ${bases.join(',')}`);
  console.log(`   🎲 Ensemble: ${ensemblePrediction.join(',')}`);
  
  // Verify no contamination
  const latestActual = historical[0].numbers.slice().sort((a,b) => a-b);
  const prediction = finalPrediction.slice().sort((a,b) => a-b);
  const isContaminated = JSON.stringify(prediction) === JSON.stringify(latestActual);
  
  console.log(`\n🔍 CONTAMINATION CHECK:`);
  console.log(`   📊 Latest actual: ${latestActual.join(',')}`);
  console.log(`   🎯 Prediction: ${prediction.join(',')}`);
  console.log(`   ${isContaminated ? '❌ CONTAMINATED' : '✅ CLEAN'}`);
  
  return finalPrediction;
}

// Run simulation
const websitePrediction = simulateWebsiteEnhancedEnsemble();

console.log('\n🌐 EXPECTED WEBSITE OUTPUT:');
console.log(`   This is what the website should show: ${websitePrediction.join(',')}`);

console.log('\n📋 TROUBLESHOOTING CHECKLIST:');
console.log('   1. Clear browser cache (Ctrl+F5)');
console.log('   2. Check CSV data loads correctly');
console.log('   3. Verify Enhanced Ensemble option selected');
console.log('   4. Confirm prediction button works');
console.log('   5. Check browser console for errors');

console.log('\n🔗 WEBSITE URL: https://websolution-sg.github.io/toto_predictor/');
console.log('💡 If website shows different results, browser cache may need clearing');