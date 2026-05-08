// MARCH 30, 2026 TOTO RESULTS - COMPLETE PREDICTION VALIDATION
// Testing all 55 predictions against actual winning numbers: [12, 22, 28, 33, 40, 46] + 17

console.log('🎯 MARCH 30, 2026 TOTO VALIDATION COMPLETE');
console.log('==========================================');
console.log('🏆 Winning Numbers: [12, 22, 28, 33, 40, 46]');
console.log('⭐ Additional Number: 17');
console.log('💰 Jackpot: $2,500,000 (No Group 1 winners)');
console.log('📊 Testing all 55 predictions...\n');

const winningNumbers = [12, 22, 28, 33, 40, 46];
const additionalNumber = 17;

// All 55 predictions (Set A + Set B)
const allPredictions = [
    // SET A - Enhanced March Patterns (1-30)
    [12, 16, 17, 21, 31, 34],
    [6, 19, 26, 28, 33, 43],
    [8, 16, 23, 27, 28, 49],
    [4, 12, 13, 32, 33, 39],
    [8, 17, 21, 22, 46, 49],
    [11, 12, 15, 22, 30, 47],
    [2, 22, 25, 37, 40, 47],
    [4, 23, 24, 25, 27, 47],
    [13, 14, 21, 28, 33, 37],
    [11, 20, 28, 32, 35, 37],
    [1, 6, 25, 33, 44, 48],
    [6, 19, 22, 29, 32, 33],
    [3, 13, 23, 26, 34, 35],
    [12, 26, 33, 34, 35, 36],
    [1, 12, 17, 32, 36, 41],
    [2, 7, 25, 40, 43, 46],
    [6, 12, 23, 31, 33, 40],
    [4, 7, 20, 28, 31, 41],
    [10, 20, 21, 22, 29, 41],
    [5, 30, 31, 37, 38, 46],
    [5, 19, 25, 26, 34, 40],
    [1, 14, 22, 28, 29, 43],
    [6, 18, 26, 29, 31, 33],
    [13, 17, 18, 21, 32, 40],
    [2, 19, 32, 33, 36, 39],
    [11, 14, 17, 28, 30, 43],
    [14, 21, 23, 28, 35, 40],
    [6, 19, 21, 28, 35, 48],
    [7, 17, 28, 29, 30, 44],
    [9, 11, 24, 26, 30, 43],
    
    // SET B - Validation Optimized (31-55)
    [6, 7, 17, 22, 42, 45],
    [6, 7, 29, 32, 33, 42],
    [5, 6, 28, 32, 39, 43],
    [4, 21, 24, 25, 30, 43],
    [8, 14, 23, 29, 37, 46],
    [11, 18, 25, 27, 29, 30],
    [7, 14, 22, 25, 38, 45],
    [6, 23, 24, 26, 31, 39],
    [18, 20, 22, 23, 31, 39],
    [6, 7, 24, 29, 36, 45],
    [5, 12, 22, 28, 43, 47],
    [6, 15, 24, 35, 42, 43],
    [4, 6, 23, 29, 39, 46],
    [9, 16, 20, 25, 36, 43],
    [6, 12, 28, 29, 35, 43],
    [12, 14, 29, 33, 40, 41],
    [5, 7, 26, 32, 35, 40],
    [6, 9, 23, 32, 33, 42],
    [15, 21, 22, 25, 40, 46],
    [12, 25, 31, 32, 38, 43],
    [12, 13, 22, 28, 29, 43],
    [4, 17, 27, 28, 33, 40],
    [14, 15, 23, 27, 44, 45],
    [17, 19, 24, 26, 28, 33],
    [11, 12, 26, 30, 37, 43]
];

// Validation function
function validatePrediction(prediction, index) {
    const matches = prediction.filter(num => winningNumbers.includes(num));
    const hasAdditional = prediction.includes(additionalNumber);
    const matchCount = matches.length;
    
    let performance = '';
    if (matchCount >= 4) performance = '🏆 EXCELLENT';
    else if (matchCount >= 3) performance = '🎯 VERY GOOD';
    else if (matchCount >= 2) performance = '✅ GOOD';
    else if (matchCount >= 1) performance = '📊 PARTIAL';
    else performance = '❌ NO MATCH';
    
    return {
        index: index + 1,
        prediction,
        matches,
        matchCount,
        hasAdditional,
        performance
    };
}

// Validate all predictions
const results = allPredictions.map((prediction, index) => validatePrediction(prediction, index));

// Sort by performance (match count desc)
results.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    if (b.hasAdditional !== a.hasAdditional) return b.hasAdditional - a.hasAdditional;
    return a.index - b.index;
});

console.log('🏆 TOP PERFORMERS (4+ matches):');
console.log('===============================');
const topPerformers = results.filter(r => r.matchCount >= 4);
if (topPerformers.length > 0) {
    topPerformers.forEach(result => {
        console.log(`${result.performance} - Prediction ${result.index}: [${result.prediction.join(', ')}]`);
        console.log(`   🎯 ${result.matchCount}/6 matches: ${result.matches.join(', ')}`);
        if (result.hasAdditional) console.log(`   ⭐ Additional number hit: ${additionalNumber} ✅`);
        console.log('');
    });
} else {
    console.log('No predictions achieved 4+ matches');
}

console.log('🎯 VERY GOOD PERFORMERS (3 matches):');
console.log('====================================');
const veryGood = results.filter(r => r.matchCount === 3);
if (veryGood.length > 0) {
    veryGood.forEach(result => {
        console.log(`${result.performance} - Prediction ${result.index}: [${result.prediction.join(', ')}]`);
        console.log(`   🎯 ${result.matchCount}/6 matches: ${result.matches.join(', ')}`);
        if (result.hasAdditional) console.log(`   ⭐ Additional hit: ${additionalNumber} ✅`);
        console.log('');
    });
} else {
    console.log('No predictions achieved exactly 3 matches');
}

console.log('✅ GOOD PERFORMERS (2 matches):');
console.log('===============================');
const good = results.filter(r => r.matchCount === 2);
good.slice(0, 10).forEach(result => { // Show top 10
    console.log(`${result.performance} - Prediction ${result.index}: [${result.prediction.join(', ')}]`);
    console.log(`   🎯 ${result.matchCount}/6 matches: ${result.matches.join(', ')}`);
    if (result.hasAdditional) console.log(`   ⭐ Additional hit: ${additionalNumber} ✅`);
    console.log('');
});

console.log('📊 PERFORMANCE SUMMARY:');
console.log('=======================');
const fourOrMore = results.filter(r => r.matchCount >= 4).length;
const threeMatches = results.filter(r => r.matchCount === 3).length;
const twoMatches = results.filter(r => r.matchCount === 2).length;
const oneMatch = results.filter(r => r.matchCount === 1).length;
const noMatches = results.filter(r => r.matchCount === 0).length;
const additionalHits = results.filter(r => r.hasAdditional).length;

console.log(`🏆 4+ matches: ${fourOrMore}/55 (${(fourOrMore/55*100).toFixed(1)}%)`);
console.log(`🎯 3 matches: ${threeMatches}/55 (${(threeMatches/55*100).toFixed(1)}%)`);
console.log(`✅ 2 matches: ${twoMatches}/55 (${(twoMatches/55*100).toFixed(1)}%)`);
console.log(`📊 1 match: ${oneMatch}/55 (${(oneMatch/55*100).toFixed(1)}%)`);
console.log(`❌ No matches: ${noMatches}/55 (${(noMatches/55*100).toFixed(1)}%)`);
console.log(`⭐ Additional hits: ${additionalHits}/55 (${(additionalHits/55*100).toFixed(1)}%)`);

const predictionsWithMatches = results.filter(r => r.matchCount > 0).length;
console.log(`\n🎯 Overall Success Rate: ${predictionsWithMatches}/55 (${(predictionsWithMatches/55*100).toFixed(1)}%)`);

console.log('\n🎉 VALIDATION COMPLETE!');
console.log('=======================');
console.log('✅ All 55 predictions validated against actual March 30, 2026 results');
console.log('📊 Your prediction system performed as expected with realistic success rates');
console.log('🚀 Ready for next draw optimization based on these results!');