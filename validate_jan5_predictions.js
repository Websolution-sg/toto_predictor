const fs = require('fs');

console.log('🔍 VALIDATION: 15 JANUARY 5TH PREDICTIONS OPTIMALITY CHECK');
console.log('================================================================');

// Load historical data
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const historical = lines.map(line => {
    const parts = line.split(',');
    return {
        date: parts[0],
        numbers: parts.slice(1, 7).map(n => parseInt(n)),
        additional: parseInt(parts[7])
    };
});

// Your 15 predictions from January 5th script
const predictions = [
    { name: "Enhanced Frequency + Compatibility", numbers: [8, 15, 22, 24, 31, 39], confidence: 5 },
    { name: "Momentum Tracker Plus", numbers: [15, 22, 24, 30, 35, 37], confidence: 5 },
    { name: "Hot/Cold Analysis Advanced", numbers: [11, 15, 20, 24, 30, 43], confidence: 4 },
    { name: "Weighted Recent Enhanced", numbers: [4, 15, 22, 24, 30, 43], confidence: 4 },
    { name: "Pattern Analysis Advanced Plus", numbers: [8, 15, 22, 24, 34, 35], confidence: 4 },
    { name: "Compatibility Network Enhanced", numbers: [15, 19, 22, 24, 35, 39], confidence: 4 },
    { name: "Balanced Distribution Enhanced", numbers: [4, 8, 22, 24, 34, 35], confidence: 3 },
    { name: "Trend Reversal Moderate", numbers: [1, 16, 19, 34, 40, 46], confidence: 5 },
    { name: "Frequency Hybrid Enhanced", numbers: [8, 15, 22, 24, 34, 43], confidence: 3 },
    { name: "Adaptive Learning Plus", numbers: [15, 22, 24, 30, 31, 34], confidence: 4 },
    { name: "Gap Analysis Advanced", numbers: [11, 18, 32, 34, 38, 39], confidence: 4 },
    { name: "Seasonal Pattern Enhanced", numbers: [22, 24, 31, 34, 35, 38], confidence: 3 },
    { name: "Multiple Range Fusion", numbers: [15, 22, 24, 31, 34, 35], confidence: 4 },
    { name: "Probability Matrix Advanced", numbers: [15, 22, 32, 34, 36, 37], confidence: 4 },
    { name: "Meta-Algorithm Ensemble", numbers: [15, 22, 24, 31, 34, 35], confidence: 5 }
];

console.log(`📊 Analyzing ${predictions.length} predictions against ${historical.length} historical draws`);
console.log('');

// Analysis functions
function getFrequency(draws, includeAdditional = true) {
    const freq = Array(50).fill(0);
    draws.forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
        if (includeAdditional && draw.additional) freq[draw.additional]++;
    });
    return freq;
}

function validatePrediction(prediction, recentDraws = 20) {
    const testDraws = historical.slice(0, recentDraws);
    const freq = getFrequency(testDraws);
    
    let totalMatches = 0;
    let frequencyScore = 0;
    let rangeScore = 0;
    let sumScore = 0;
    
    prediction.numbers.forEach(num => {
        frequencyScore += freq[num] || 0;
    });
    
    // Test against actual draws to see hit rates
    testDraws.forEach(draw => {
        const allNumbers = [...draw.numbers, draw.additional];
        const matches = prediction.numbers.filter(n => allNumbers.includes(n)).length;
        totalMatches += matches;
    });
    
    // Calculate sum and range characteristics
    const sum = prediction.numbers.reduce((a, b) => a + b, 0);
    const range = Math.max(...prediction.numbers) - Math.min(...prediction.numbers);
    
    // Balance analysis
    const evenCount = prediction.numbers.filter(n => n % 2 === 0).length;
    const lowCount = prediction.numbers.filter(n => n <= 16).length;
    const midCount = prediction.numbers.filter(n => n >= 17 && n <= 33).length;
    const highCount = prediction.numbers.filter(n => n >= 34).length;
    
    return {
        avgMatches: totalMatches / recentDraws,
        frequencyScore,
        sum,
        range,
        evenOdd: `${evenCount}/${6-evenCount}`,
        distribution: `${lowCount}/${midCount}/${highCount}`,
        balanceScore: Math.abs(3 - evenCount) + Math.abs(2 - lowCount) + Math.abs(2 - midCount) + Math.abs(2 - highCount)
    };
}

// Analyze each prediction
console.log('📋 INDIVIDUAL PREDICTION ANALYSIS');
console.log('='.repeat(80));

let totalScore = 0;
const results = [];

predictions.forEach((pred, index) => {
    const analysis = validatePrediction(pred);
    const optimality = (analysis.avgMatches * 25) + (analysis.frequencyScore * 0.5) - (analysis.balanceScore * 2) + (pred.confidence * 5);
    
    results.push({
        ...pred,
        ...analysis,
        optimality
    });
    
    totalScore += optimality;
    
    console.log(`\n${index + 1}. ${pred.name} (⭐${pred.confidence})`);
    console.log(`   Numbers: [${pred.numbers.join(', ')}]`);
    console.log(`   📊 Avg Matches: ${analysis.avgMatches.toFixed(2)}/20 draws`);
    console.log(`   🔢 Frequency Score: ${analysis.frequencyScore}`);
    console.log(`   📈 Sum: ${analysis.sum} | Range: ${analysis.range}`);
    console.log(`   ⚖️ Even/Odd: ${analysis.evenOdd} | Distribution: ${analysis.distribution}`);
    console.log(`   🎯 Optimality Score: ${optimality.toFixed(2)}`);
});

// Sort by optimality
results.sort((a, b) => b.optimality - a.optimality);

console.log('\n🏆 RANKING BY OPTIMALITY SCORE');
console.log('='.repeat(80));

results.forEach((result, index) => {
    const rank = index + 1;
    const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][index] : `${rank}.`;
    console.log(`${medal} ${result.name} (Score: ${result.optimality.toFixed(2)})`);
    console.log(`    Avg Matches: ${result.avgMatches.toFixed(2)} | Confidence: ⭐${result.confidence}`);
});

// Diversity analysis
console.log('\n📊 DIVERSITY & OVERLAP ANALYSIS');
console.log('='.repeat(80));

const allPredictedNumbers = new Set();
const numberFreq = {};

predictions.forEach(pred => {
    pred.numbers.forEach(num => {
        allPredictedNumbers.add(num);
        numberFreq[num] = (numberFreq[num] || 0) + 1;
    });
});

console.log(`🎯 Total unique numbers used: ${allPredictedNumbers.size}/49 (${(allPredictedNumbers.size/49*100).toFixed(1)}%)`);
console.log(`📊 Total predictions: ${predictions.length * 6} number slots`);
console.log(`🔄 Diversity ratio: ${(allPredictedNumbers.size/(predictions.length * 6)*100).toFixed(1)}%`);

// Most used numbers
const sortedNumbers = Object.entries(numberFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

console.log('\n🔥 MOST FREQUENTLY PREDICTED NUMBERS:');
sortedNumbers.forEach(([num, freq]) => {
    console.log(`   ${num}: ${freq}/15 predictions (${(freq/15*100).toFixed(1)}%)`);
});

// Range analysis
console.log('\n📊 RANGE & SUM ANALYSIS');
console.log('='.repeat(80));

const sums = results.map(r => r.sum);
const ranges = results.map(r => r.range);

console.log(`💯 Sum range: ${Math.min(...sums)} - ${Math.max(...sums)} (avg: ${(sums.reduce((a,b) => a+b)/sums.length).toFixed(1)})`);
console.log(`📏 Range span: ${Math.min(...ranges)} - ${Math.max(...ranges)} (avg: ${(ranges.reduce((a,b) => a+b)/ranges.length).toFixed(1)})`);

// Recent performance insight
const latestDraw = historical[0];
console.log(`\n🎯 LATEST DRAW ANALYSIS (${latestDraw.date})`);
console.log('='.repeat(80));
console.log(`Winning numbers: [${latestDraw.numbers.join(', ')}] + ${latestDraw.additional}`);
console.log(`Sum: ${latestDraw.numbers.reduce((a,b) => a+b, 0) + latestDraw.additional} | Range: ${Math.max(...latestDraw.numbers) - Math.min(...latestDraw.numbers)}`);

// Check how many predictions would have hit
let bestMatches = 0;
let bestPrediction = null;

results.forEach(pred => {
    const allLatest = [...latestDraw.numbers, latestDraw.additional];
    const matches = pred.numbers.filter(n => allLatest.includes(n)).length;
    if (matches > bestMatches) {
        bestMatches = matches;
        bestPrediction = pred.name;
    }
});

console.log(`\n🎯 Best retrospective performance: ${bestPrediction} (${bestMatches}/7 matches)`);

// Final assessment
console.log('\n🏁 OPTIMALITY ASSESSMENT');
console.log('='.repeat(80));

const avgOptimality = totalScore / predictions.length;
const topTier = results.filter(r => r.confidence >= 4).length;
const diversityScore = allPredictedNumbers.size / 49 * 100;

console.log(`📊 Average optimality score: ${avgOptimality.toFixed(2)}`);
console.log(`⭐ High-confidence predictions: ${topTier}/15 (${(topTier/15*100).toFixed(1)}%)`);
console.log(`🎯 Diversity score: ${diversityScore.toFixed(1)}%`);

let assessment = 'NEEDS IMPROVEMENT';
if (avgOptimality >= 60 && diversityScore >= 30) assessment = 'EXCELLENT';
else if (avgOptimality >= 50 && diversityScore >= 25) assessment = 'GOOD';
else if (avgOptimality >= 40 && diversityScore >= 20) assessment = 'FAIR';

console.log(`\n🎖️ OVERALL ASSESSMENT: ${assessment}`);

console.log('\n💡 RECOMMENDATIONS:');
if (diversityScore < 25) {
    console.log('⚠️ LOW DIVERSITY: Consider reducing number overlap between algorithms');
}
if (avgOptimality < 50) {
    console.log('⚠️ LOW OPTIMALITY: Review algorithm parameters and weighting');
}
if (topTier < 8) {
    console.log('⚠️ FEW HIGH-CONFIDENCE: Strengthen algorithm validation');
}

console.log('\n🏆 TOP 3 RECOMMENDED PREDICTIONS:');
results.slice(0, 3).forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: [${result.numbers.join(', ')}]`);
});

console.log('\n✅ VALIDATION COMPLETE');