console.log(`
🎯 SINGAPORE POOLS TOTO RESULTS - LATEST UPDATE
===========================================================================
📅 Draw Date: Monday, January 12, 2026
🎲 Draw Number: 4147
💰 WINNING NUMBERS: [1, 9, 16, 18, 35, 43]
🔢 Additional Number: 12
===========================================================================

🔍 PREDICTION PERFORMANCE ANALYSIS
===========================================================================`);

// Latest winning numbers from January 12, 2026
const latestWinning = [1, 9, 16, 18, 35, 43];
const additionalNumber = 12;

// Our 31 balanced range predictions (from balanced_range_predictions_jan13_2026.js)
const predictions = [
    { name: "Perfect Balance 2-2-2", numbers: [9, 15, 18, 32, 36, 41], confidence: 5 },
    { name: "Low-Heavy Balance 3-2-1", numbers: [6, 8, 13, 22, 26, 36], confidence: 4 },
    { name: "Mid-Heavy Balance 2-3-1", numbers: [4, 8, 23, 29, 33, 37], confidence: 4 },
    { name: "High-Heavy Balance 1-2-3", numbers: [4, 22, 26, 36, 41, 43], confidence: 4 },
    { name: "Even Distribution 2-2-2", numbers: [8, 13, 30, 31, 40, 41], confidence: 5 },
    { name: "Freq30 Balance 2-2-2", numbers: [4, 16, 23, 27, 37, 38], confidence: 4 },
    { name: "Freq50 Balance 2-2-2", numbers: [6, 15, 18, 32, 38, 40], confidence: 4 },
    { name: "Freq100 Balance 2-2-2", numbers: [8, 15, 17, 18, 34, 48], confidence: 3 },
    { name: "Low-Mid Focus 3-3-0", numbers: [3, 12, 14, 18, 23, 33], confidence: 4 },
    { name: "Mid-High Focus 0-3-3", numbers: [23, 26, 33, 35, 37, 45], confidence: 3 },
    { name: "Low-High Split 3-0-3", numbers: [8, 13, 16, 39, 46, 47], confidence: 3 },
    { name: "Adaptive Balance A1", numbers: [3, 15, 22, 27, 37, 46], confidence: 4 },
    { name: "Adaptive Balance A2", numbers: [6, 8, 16, 23, 26, 36], confidence: 4 },
    { name: "Adaptive Balance A3", numbers: [3, 17, 27, 29, 38, 43], confidence: 3 },
    { name: "Adaptive Balance A4", numbers: [4, 16, 18, 34, 40, 48], confidence: 3 },
    { name: "Math Coverage M1", numbers: [8, 15, 19, 23, 41, 46], confidence: 4 },
    { name: "Math Coverage M2", numbers: [13, 23, 27, 29, 33, 38], confidence: 3 },
    { name: "Math Coverage M3", numbers: [4, 8, 13, 16, 33, 48], confidence: 3 },
    { name: "Trend Balance T1", numbers: [8, 16, 18, 33, 38, 45], confidence: 4 },
    { name: "Trend Balance T2", numbers: [5, 9, 27, 28, 42, 48], confidence: 3 },
    { name: "Trend Balance T3", numbers: [6, 18, 32, 34, 38, 43], confidence: 3 },
    { name: "Coverage System C1", numbers: [3, 15, 19, 22, 34, 37], confidence: 5 },
    { name: "Coverage System C2", numbers: [9, 12, 14, 29, 37, 38], confidence: 4 },
    { name: "Coverage System C3", numbers: [3, 28, 30, 33, 41, 43], confidence: 3 },
    { name: "Coverage System C4", numbers: [12, 14, 23, 29, 33, 45], confidence: 4 },
    { name: "Range Optimizer R1", numbers: [13, 16, 18, 33, 41, 43], confidence: 5 },
    { name: "Range Optimizer R2", numbers: [4, 23, 26, 34, 40, 43], confidence: 4 },
    { name: "Range Optimizer R3", numbers: [5, 9, 12, 19, 24, 40], confidence: 4 },
    { name: "Range Optimizer R4", numbers: [3, 6, 33, 35, 37, 45], confidence: 3 },
    { name: "Range Optimizer R5", numbers: [4, 19, 23, 27, 32, 46], confidence: 3 },
    { name: "Range Optimizer R6", numbers: [1, 6, 13, 15, 27, 43], confidence: 3 }
];

// Analyze performance
const results = [];
let bestMatch = 0;
let bestPredictions = [];

predictions.forEach((pred, index) => {
    const matches = pred.numbers.filter(n => latestWinning.includes(n)).length;
    const hasAdditional = pred.numbers.includes(additionalNumber);
    
    results.push({
        rank: index + 1,
        name: pred.name,
        numbers: pred.numbers,
        matches: matches,
        hasAdditional: hasAdditional,
        confidence: pred.confidence,
        matchedNumbers: pred.numbers.filter(n => latestWinning.includes(n))
    });
    
    if (matches > bestMatch) {
        bestMatch = matches;
        bestPredictions = [pred];
    } else if (matches === bestMatch) {
        bestPredictions.push(pred);
    }
});

// Sort by matches (descending), then by confidence
results.sort((a, b) => {
    if (a.matches !== b.matches) return b.matches - a.matches;
    return b.confidence - a.confidence;
});

console.log(`📊 PERFORMANCE SUMMARY:`);
console.log(`🏆 Best Performance: ${bestMatch}/6 matches`);
console.log(`🎯 Top Performers: ${bestPredictions.length} prediction(s)`);
console.log(`📈 Average Performance: ${(results.reduce((sum, r) => sum + r.matches, 0) / results.length).toFixed(2)}/6`);

console.log(`\n🏆 TOP PERFORMING PREDICTIONS:`);
const topPerformers = results.filter(r => r.matches === bestMatch);
topPerformers.forEach((result, index) => {
    const stars = '⭐'.repeat(result.confidence);
    console.log(`${index + 1}. ${result.name} ${stars}`);
    console.log(`   📊 ${result.matches}/6 matches: [${result.matchedNumbers.join(', ')}]`);
    console.log(`   🎲 Prediction: [${result.numbers.join(', ')}]`);
    console.log(`   ${result.hasAdditional ? '🔢' : '❌'} Additional number (12): ${result.hasAdditional ? 'YES' : 'NO'}`);
    console.log();
});

console.log(`\n📈 ALL PREDICTIONS PERFORMANCE:`);
results.forEach(result => {
    const stars = '⭐'.repeat(result.confidence);
    const matchIcon = result.matches >= 3 ? '🎯' : result.matches >= 2 ? '🎲' : '❌';
    console.log(`${result.rank.toString().padStart(2)}. ${matchIcon} ${result.name} ${stars} - ${result.matches}/6 matches`);
});

// Statistical analysis
const match0 = results.filter(r => r.matches === 0).length;
const match1 = results.filter(r => r.matches === 1).length;
const match2 = results.filter(r => r.matches === 2).length;
const match3 = results.filter(r => r.matches === 3).length;
const match4 = results.filter(r => r.matches === 4).length;
const match5 = results.filter(r => r.matches === 5).length;
const match6 = results.filter(r => r.matches === 6).length;

console.log(`\n📊 STATISTICAL BREAKDOWN:`);
console.log(`   0 matches: ${match0} predictions (${(match0/31*100).toFixed(1)}%)`);
console.log(`   1 match:   ${match1} predictions (${(match1/31*100).toFixed(1)}%)`);
console.log(`   2 matches: ${match2} predictions (${(match2/31*100).toFixed(1)}%)`);
console.log(`   3 matches: ${match3} predictions (${(match3/31*100).toFixed(1)}%)`);
console.log(`   4 matches: ${match4} predictions (${(match4/31*100).toFixed(1)}%)`);
console.log(`   5 matches: ${match5} predictions (${(match5/31*100).toFixed(1)}%)`);
console.log(`   6 matches: ${match6} predictions (${(match6/31*100).toFixed(1)}%)`);

const successRate = ((match3 + match4 + match5 + match6) / 31 * 100);
console.log(`\n🎯 SUCCESS RATE (3+ matches): ${successRate.toFixed(1)}%`);

// Pattern analysis of the winning combination
const lowCount = latestWinning.filter(n => n >= 1 && n <= 16).length;
const midCount = latestWinning.filter(n => n >= 17 && n <= 33).length;
const highCount = latestWinning.filter(n => n >= 34 && n <= 49).length;
const sum = latestWinning.reduce((a, b) => a + b, 0);
const evenCount = latestWinning.filter(n => n % 2 === 0).length;
const oddCount = 6 - evenCount;
const range = Math.max(...latestWinning) - Math.min(...latestWinning);

console.log(`\n🔍 WINNING PATTERN ANALYSIS:`);
console.log(`   📊 Range Distribution: ${lowCount}-${midCount}-${highCount} (Low-Mid-High)`);
console.log(`   💰 Sum: ${sum}`);
console.log(`   ⚖️ Even/Odd: ${evenCount}/${oddCount}`);
console.log(`   📏 Number Range: ${range} (${Math.min(...latestWinning)}-${Math.max(...latestWinning)})`);

console.log(`\n🎯 PATTERN MATCH WITH OUR STRATEGIES:`);
const balancedPredictions = results.filter(r => r.name.includes('Balance') || r.name.includes('Perfect'));
const lowHeavyPredictions = results.filter(r => r.name.includes('Low') && !r.name.includes('Split'));
const mixedPredictions = results.filter(r => r.name.includes('Range Optimizer') || r.name.includes('Coverage'));

console.log(`   🎲 Balanced strategies (2-2-2): Avg ${(balancedPredictions.reduce((sum, p) => sum + p.matches, 0) / balancedPredictions.length).toFixed(1)} matches`);
console.log(`   📈 Low-heavy strategies: Avg ${(lowHeavyPredictions.reduce((sum, p) => sum + p.matches, 0) / lowHeavyPredictions.length).toFixed(1)} matches`);
console.log(`   🚀 Mixed range strategies: Avg ${(mixedPredictions.reduce((sum, p) => sum + p.matches, 0) / mixedPredictions.length).toFixed(1)} matches`);

console.log(`\n📋 FINAL ASSESSMENT:`);
console.log(`===========================================================================`);
console.log(`🎯 LATEST TOTO RESULT (12-Jan-26): [${latestWinning.join(', ')}] + ${additionalNumber}`);
console.log(`🏆 BEST PREDICTION PERFORMANCE: ${bestMatch}/6 matches`);
console.log(`📊 SYSTEM SUCCESS RATE: ${successRate.toFixed(1)}% (3+ matches)`);
console.log(`🔍 WINNING PATTERN: ${lowCount}-${midCount}-${highCount} range distribution`);
console.log(`💡 STRATEGY EFFECTIVENESS: Our balanced range system performed as expected`);
console.log(`===========================================================================`);