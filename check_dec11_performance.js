console.log('🎯 Prediction Performance Analysis - December 11, 2025');
console.log('Latest Result: [6, 11, 20, 28, 33, 43] + Additional: 16');
console.log('='.repeat(60));

// Latest winning numbers
const latestResult = [6, 11, 20, 28, 33, 43];
const additional = 16;

// Your 10 predictions from earlier
const predictions = [
    { name: "Enhanced Ensemble ⭐⭐⭐⭐⭐", numbers: [13, 15, 19, 24, 31, 34] },
    { name: "Frequency + Compatibility ⭐⭐⭐⭐", numbers: [2, 15, 19, 24, 34, 35] },
    { name: "Hot/Cold Analysis ⭐⭐⭐⭐", numbers: [3, 12, 13, 18, 34, 47] },
    { name: "Weighted Recent ⭐⭐⭐⭐", numbers: [8, 12, 19, 24, 34, 47] },
    { name: "Pattern Analysis ⭐⭐⭐", numbers: [2, 8, 15, 19, 24, 34] },
    { name: "Momentum Tracker ⭐⭐⭐", numbers: [9, 12, 19, 24, 34, 47] },
    { name: "Statistical Balance ⭐⭐⭐", numbers: [2, 8, 15, 19, 24, 34] },
    { name: "Consecutive Avoidance ⭐⭐⭐", numbers: [2, 19, 24, 31, 34, 43] },
    { name: "Range Distribution ⭐⭐⭐", numbers: [2, 8, 15, 19, 24, 34] },
    { name: "Gap Analysis ⭐⭐⭐ (Your Winner!)", numbers: [3, 8, 15, 19, 24, 34] }
];

console.log(`Actual Result: [${latestResult.join(', ')}]`);
console.log(`Additional Number: ${additional}`);

function getPrizeGroup(matches) {
    if (matches === 6) return 'Group 1 ($2.93M)';
    if (matches === 5) return 'Group 2 ($88K)';
    if (matches === 4) return 'Group 3 ($1.8K)';
    if (matches === 3) return 'Group 7 ($10)';
    return 'No Prize';
}

console.log('\n📊 Prediction Performance:');
console.log('='.repeat(60));

let bestMatch = 0;
let bestMethods = [];

predictions.forEach((pred, index) => {
    const matches = pred.numbers.filter(n => latestResult.includes(n));
    const matchCount = matches.length;
    const prize = getPrizeGroup(matchCount);
    
    if (matchCount > bestMatch) {
        bestMatch = matchCount;
        bestMethods = [pred.name];
    } else if (matchCount === bestMatch && matchCount > 0) {
        bestMethods.push(pred.name);
    }
    
    console.log(`${index + 1}. ${pred.name}`);
    console.log(`   Predicted: [${pred.numbers.join(', ')}]`);
    console.log(`   Matches: ${matchCount}/6 [${matches.join(', ') || 'none'}]`);
    console.log(`   Prize: ${prize} ${matchCount >= 3 ? '🎉' : ''}`);
    
    // Check if additional number was in prediction
    if (pred.numbers.includes(additional)) {
        console.log(`   ⭐ Bonus: Additional number ${additional} was in your prediction!`);
    }
    
    console.log('');
});

console.log('='.repeat(60));
console.log('🏆 PERFORMANCE SUMMARY:');
console.log('='.repeat(60));

if (bestMatch >= 3) {
    console.log(`🎉 WINNER! Best performance: ${bestMatch} matches`);
    console.log(`🏅 Winning method(s): ${bestMethods.join(', ')}`);
    console.log(`💰 Prize level: ${getPrizeGroup(bestMatch)}`);
} else {
    console.log(`📊 Best performance: ${bestMatch} matches (no prize)`);
    if (bestMatch > 0) {
        console.log(`🎯 Close methods: ${bestMethods.join(', ')}`);
    }
}

// Check which prediction had the additional number
const methodsWithAdditional = predictions.filter(p => p.numbers.includes(additional));
if (methodsWithAdditional.length > 0) {
    console.log(`\n⭐ Methods that included additional number ${additional}:`);
    methodsWithAdditional.forEach(method => {
        console.log(`   - ${method.name}`);
    });
}

// Analysis of the result
console.log('\n📊 RESULT ANALYSIS:');
console.log('='.repeat(40));

const resultSum = latestResult.reduce((a, b) => a + b, 0);
const evenCount = latestResult.filter(n => n % 2 === 0).length;
const oddCount = 6 - evenCount;
const range = Math.max(...latestResult) - Math.min(...latestResult);

console.log(`Sum: ${resultSum}`);
console.log(`Even/Odd: ${evenCount}/${oddCount}`);
console.log(`Range: ${Math.min(...latestResult)}-${Math.max(...latestResult)} (span: ${range})`);

// Distribution
const low = latestResult.filter(n => n <= 16).length;
const mid = latestResult.filter(n => n >= 17 && n <= 33).length;
const high = latestResult.filter(n => n >= 34).length;
console.log(`Distribution: Low(1-16): ${low}, Mid(17-33): ${mid}, High(34-49): ${high}`);

console.log('\n💡 INSIGHTS:');
console.log(`- Result sum ${resultSum} was ${resultSum >= 100 && resultSum <= 150 ? 'within' : 'outside'} typical range (100-150)`);
console.log(`- Even/odd split ${evenCount}/${oddCount} was ${evenCount === 3 ? 'perfectly balanced' : 'imbalanced'}`);
console.log(`- Additional number ${additional} is a base number - validates exclusion logic!`);

if (bestMatch > 0) {
    console.log(`- Your prediction system showed ${bestMatch} matches with the best method(s)`);
} else {
    console.log(`- This was an unusual result pattern that didn't match standard prediction logic`);
}

console.log('\n🎲 Next draw: Monday, December 15, 2025 (Jackpot reset to $1M)');