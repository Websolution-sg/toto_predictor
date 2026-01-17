console.log(`
🎯 SINGAPORE POOLS TOTO RESULTS - JANUARY 15, 2026
===========================================================================
📅 Draw Date: Thursday, January 15, 2026
🎲 Draw Number: 4148
💰 WINNING NUMBERS: [16, 32, 34, 35, 36, 41]
🔢 Additional Number: 14
===========================================================================

🔍 PREDICTION PERFORMANCE ANALYSIS - January 16th Predictions
===========================================================================`);

// Latest winning numbers from January 15, 2026
const latestWinning = [16, 32, 34, 35, 36, 41];
const additionalNumber = 14;

// Our enhanced predictions for January 16 (generated for this draw)
const predictions = [
    { name: "Range Optimizer R1 Enhanced", numbers: [6, 11, 21, 28, 44, 47], confidence: 5 },
    { name: "Range Optimizer R2 Pro", numbers: [6, 11, 21, 28, 40, 44], confidence: 5 },
    { name: "Range Optimizer R3 Elite", numbers: [11, 16, 21, 28, 40, 44], confidence: 5 },
    { name: "Low-Heavy Winner", numbers: [6, 11, 14, 21, 28, 44], confidence: 4 },
    { name: "Low Dominance Plus", numbers: [6, 8, 11, 21, 44, 47], confidence: 4 },
    { name: "Pattern Continuation", numbers: [6, 11, 14, 21, 40, 44], confidence: 4 },
    { name: "Overdue Optimizer", numbers: [11, 14, 17, 21, 28, 44], confidence: 4 },
    { name: "Thermal Analysis", numbers: [11, 17, 21, 28, 40, 44], confidence: 3 },
    { name: "Mathematical Edge", numbers: [6, 11, 21, 38, 44, 47], confidence: 4 },
    { name: "Trend Analyzer Pro", numbers: [11, 21, 28, 38, 40, 44], confidence: 3 },
    { name: "Coverage Elite C2", numbers: [6, 8, 11, 16, 21, 44], confidence: 3 },
    { name: "Coverage Elite C3", numbers: [11, 17, 21, 25, 28, 44], confidence: 3 },
    { name: "Premium Strategy P2", numbers: [6, 11, 17, 21, 28, 44], confidence: 4 },
    { name: "Victory Formula V1", numbers: [6, 11, 14, 21, 44, 47], confidence: 4 },
    { name: "Master Algorithm M2", numbers: [6, 9, 11, 14, 21, 28], confidence: 3 }
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
    console.log(`   ${result.hasAdditional ? '🔢' : '❌'} Additional number (14): ${result.hasAdditional ? 'YES' : 'NO'}`);
    
    // Prize calculation
    let prizeGroup = "No Prize";
    if (result.matches === 6) {
        prizeGroup = "Group 1 (JACKPOT)";
    } else if (result.matches === 5 && result.hasAdditional) {
        prizeGroup = "Group 2";
    } else if (result.matches === 5) {
        prizeGroup = "Group 3";
    } else if (result.matches === 4 && result.hasAdditional) {
        prizeGroup = "Group 4";
    } else if (result.matches === 4) {
        prizeGroup = "Group 5";
    } else if (result.matches === 3 && result.hasAdditional) {
        prizeGroup = "Group 6";
    } else if (result.matches === 3) {
        prizeGroup = "Group 7";
    }
    console.log(`   💰 Prize Group: ${prizeGroup}`);
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
console.log(`   0 matches: ${match0} predictions (${(match0/15*100).toFixed(1)}%)`);
console.log(`   1 match:   ${match1} predictions (${(match1/15*100).toFixed(1)}%)`);
console.log(`   2 matches: ${match2} predictions (${(match2/15*100).toFixed(1)}%)`);
console.log(`   3 matches: ${match3} predictions (${(match3/15*100).toFixed(1)}%)`);
console.log(`   4 matches: ${match4} predictions (${(match4/15*100).toFixed(1)}%)`);
console.log(`   5 matches: ${match5} predictions (${(match5/15*100).toFixed(1)}%)`);
console.log(`   6 matches: ${match6} predictions (${(match6/15*100).toFixed(1)}%)`);

const successRate = ((match3 + match4 + match5 + match6) / 15 * 100);
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

console.log(`\n🎯 SYSTEM INSIGHTS:`);
console.log(`===========================================================================`);
console.log(`🔄 PATTERN SHIFT DETECTED:`);
console.log(`   • Previous draw (Jan 12): 3-1-2 (Low-heavy)`);
console.log(`   • Current draw (Jan 15): ${lowCount}-${midCount}-${highCount} (${highCount > 3 ? 'High-heavy' : midCount > 3 ? 'Mid-heavy' : 'Balanced'})`);
console.log(`   • Sum increase: 122 → ${sum} (+${sum - 122})`);
console.log(`   • Pattern: ${highCount > lowCount ? 'Shift to high numbers' : 'Continuing balanced approach'}`);

console.log(`\n💡 ALGORITHM PERFORMANCE:`);
const rangeOptimizerResults = results.filter(r => r.name.includes('Range Optimizer'));
const avgRangeOptimizer = rangeOptimizerResults.reduce((sum, r) => sum + r.matches, 0) / rangeOptimizerResults.length;
console.log(`   🔹 Range Optimizer algorithms: Avg ${avgRangeOptimizer.toFixed(1)} matches`);
console.log(`   🔹 Our winning algorithm category performed: ${avgRangeOptimizer >= 1.5 ? 'WELL' : 'AVERAGE'}`);

console.log(`\n📋 FINAL ASSESSMENT:`);
console.log(`===========================================================================`);
console.log(`🎯 LATEST TOTO RESULT (15-Jan-26): [${latestWinning.join(', ')}] + ${additionalNumber}`);
console.log(`🏆 BEST PREDICTION PERFORMANCE: ${bestMatch}/6 matches`);
console.log(`📊 SYSTEM SUCCESS RATE: ${successRate.toFixed(1)}% (3+ matches)`);
console.log(`🔍 WINNING PATTERN: ${lowCount}-${midCount}-${highCount} range distribution (HIGH-HEAVY)`);
console.log(`💡 NEXT STRATEGY: Adjust for high-heavy trend in upcoming predictions`);
console.log(`===========================================================================`);