// TOTO PREDICTIONS vs ACTUAL RESULTS ANALYSIS - January 5, 2026
// Actual Result: [5, 20, 35, 39, 40, 49] + Additional: 27

console.log('🎯 TOTO PREDICTION ANALYSIS - January 5, 2026');
console.log('='.repeat(60));
console.log('🏆 ACTUAL WINNING NUMBERS: 5, 20, 35, 39, 40, 49');
console.log('➕ ADDITIONAL NUMBER: 27');
console.log('💰 ACTUAL JACKPOT: $1,206,430 (1 winner - Group 2: $253,986)');
console.log('');

const actualNumbers = [5, 20, 35, 39, 40, 49];
const additionalNumber = 27;

const predictions = [
    { id: 1, name: "Enhanced Frequency + Compatibility", numbers: [19, 22, 24, 34, 35, 39], rating: 5 },
    { id: 2, name: "Momentum Tracker Plus", numbers: [15, 22, 24, 35, 37, 39], rating: 5 },
    { id: 3, name: "Hot/Cold Analysis Advanced", numbers: [5, 15, 20, 24, 30, 43], rating: 4 },
    { id: 4, name: "Weighted Recent Enhanced", numbers: [20, 22, 30, 35, 39, 43], rating: 4 },
    { id: 5, name: "Pattern Analysis Advanced Plus", numbers: [12, 19, 22, 24, 34, 39], rating: 4 },
    { id: 6, name: "Compatibility Network Enhanced", numbers: [15, 19, 22, 24, 35, 39], rating: 4 },
    { id: 7, name: "Balanced Distribution Enhanced", numbers: [8, 13, 22, 24, 34, 35], rating: 3 },
    { id: 8, name: "Trend Reversal Moderate", numbers: [1, 16, 19, 34, 36, 46], rating: 5 },
    { id: 9, name: "Frequency Hybrid Enhanced", numbers: [15, 22, 24, 34, 35, 39], rating: 3 },
    { id: 10, name: "Adaptive Learning Plus", numbers: [19, 22, 24, 34, 35, 39], rating: 4 },
    { id: 11, name: "Gap Analysis Advanced", numbers: [5, 20, 27, 35, 39, 40], rating: 4 },
    { id: 12, name: "Seasonal Pattern Enhanced", numbers: [4, 22, 24, 35, 38, 39], rating: 3 },
    { id: 13, name: "Multiple Range Fusion", numbers: [22, 24, 31, 34, 35, 39], rating: 4 },
    { id: 14, name: "Probability Matrix Advanced", numbers: [22, 24, 32, 34, 35, 39], rating: 4 },
    { id: 15, name: "Meta-Algorithm Ensemble", numbers: [19, 22, 24, 34, 35, 39], rating: 5 }
];

function analyzeMatches(predicted, actual, additional) {
    const mainMatches = predicted.filter(n => actual.includes(n));
    const additionalMatch = predicted.includes(additional);
    const totalMatches = mainMatches.length;
    
    return {
        mainMatches,
        mainMatchCount: mainMatches.length,
        additionalMatch,
        totalMatches,
        accuracy: ((totalMatches / 6) * 100).toFixed(1)
    };
}

console.log('📊 INDIVIDUAL PREDICTION ANALYSIS:');
console.log('='.repeat(60));

let bestPerformer = null;
let bestMatches = 0;
let results = [];

predictions.forEach(pred => {
    const analysis = analyzeMatches(pred.numbers, actualNumbers, additionalNumber);
    results.push({ ...pred, ...analysis });
    
    console.log(`${pred.id}. ${pred.name} ${'⭐'.repeat(pred.rating)}`);
    console.log(`   Predicted: [${pred.numbers.join(', ')}]`);
    console.log(`   Matches: ${analysis.mainMatchCount}/6 - [${analysis.mainMatches.join(', ') || 'None'}]`);
    if (analysis.additionalMatch) {
        console.log(`   ✅ Additional Number Match: ${additionalNumber}`);
    }
    console.log(`   Accuracy: ${analysis.accuracy}%`);
    console.log('');
    
    if (analysis.mainMatchCount > bestMatches) {
        bestMatches = analysis.mainMatchCount;
        bestPerformer = pred;
    }
});

console.log('🏆 PERFORMANCE SUMMARY:');
console.log('='.repeat(60));

// Group by performance
const by4matches = results.filter(r => r.mainMatchCount === 4);
const by3matches = results.filter(r => r.mainMatchCount === 3);
const by2matches = results.filter(r => r.mainMatchCount === 2);
const by1match = results.filter(r => r.mainMatchCount === 1);
const by0matches = results.filter(r => r.mainMatchCount === 0);

console.log(`🥇 BEST PERFORMERS (${bestMatches} matches):`);
if (bestMatches >= 3) {
    results.filter(r => r.mainMatchCount === bestMatches).forEach(r => {
        console.log(`   • ${r.name}: ${r.mainMatches.join(', ')}`);
    });
}

console.log(`\n📈 PERFORMANCE BREAKDOWN:`);
console.log(`   4+ matches: ${by4matches.length} algorithms`);
console.log(`   3 matches: ${by3matches.length} algorithms`);
console.log(`   2 matches: ${by2matches.length} algorithms`);
console.log(`   1 match: ${by1match.length} algorithms`);
console.log(`   0 matches: ${by0matches.length} algorithms`);

console.log(`\n🎯 KEY INSIGHTS:`);
console.log(`   • Best performance: ${bestMatches} matches`);
console.log(`   • Average accuracy: ${(results.reduce((sum, r) => sum + parseFloat(r.accuracy), 0) / 15).toFixed(1)}%`);

// Check which numbers were most predicted
const allPredicted = predictions.flatMap(p => p.numbers);
const predictionFreq = {};
actualNumbers.forEach(num => {
    const count = allPredicted.filter(n => n === num).length;
    predictionFreq[num] = count;
});

console.log(`\n🔍 WINNING NUMBER PREDICTION FREQUENCY:`);
actualNumbers.forEach(num => {
    const count = predictionFreq[num];
    console.log(`   • ${num}: Predicted by ${count}/15 algorithms (${((count/15)*100).toFixed(1)}%)`);
});

console.log(`\n💡 ANALYSIS COMPLETE`);
console.log('='.repeat(60));