const fs = require('fs');

console.log('🔍 VALIDATING DECEMBER 29 PREDICTIONS vs LATEST WINNING RESULT');
console.log('='.repeat(70));

// Latest winning result (December 25, 2025)
const latestWinning = {
    date: '25-Dec-25',
    numbers: [3, 8, 15, 28, 37, 43],
    additional: 49
};

console.log(`📅 Latest Draw: ${latestWinning.date}`);
console.log(`🎯 Winning Numbers: ${latestWinning.numbers.join(', ')}`);
console.log(`➕ Additional: ${latestWinning.additional}`);
console.log('');

// Load and run the prediction script logic
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

const baseNumbers = [10, 49, 2];

function getFrequency(draws, includeAdditional = true) {
    const freq = Array(50).fill(0);
    draws.forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
        if (includeAdditional && draw.additional) freq[draw.additional]++;
    });
    return freq;
}

function selectWithBalance(candidates, count = 6) {
    const selected = [];
    let evenCount = 0, oddCount = 0;
    
    for (const candidate of candidates) {
        if (selected.length >= count) break;
        const num = typeof candidate === 'object' ? candidate.n : candidate;
        
        if (baseNumbers.includes(num)) continue;
        
        const isEven = num % 2 === 0;
        
        if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || selected.length >= 4) {
            selected.push(num);
            if (isEven) evenCount++;
            else oddCount++;
        }
    }
    
    while (selected.length < count) {
        for (let n = 1; n <= 49; n++) {
            if (selected.length >= count) break;
            if (!baseNumbers.includes(n) && !selected.includes(n)) {
                selected.push(n);
                break;
            }
        }
    }
    
    return selected.sort((a, b) => a - b);
}

// Simplified prediction methods (just getting the numbers)
function enhancedFrequencyCompatibility() {
    const recent25 = historical.slice(0, 25);
    const recent50 = historical.slice(0, 50);
    
    const recentFreq = getFrequency(recent25, true);
    const overallFreq = getFrequency(recent50, true);
    const compatibility = Array(50).fill(0);
    
    historical.slice(0, 30).forEach(draw => {
        baseNumbers.forEach(base => {
            if (draw.numbers.includes(base) || draw.additional === base) {
                draw.numbers.forEach(n => {
                    if (n !== base) compatibility[n] += 1;
                });
                if (draw.additional !== base) compatibility[draw.additional] += 0.5;
            }
        });
    });
    
    const scores = recentFreq.map((rf, i) => {
        return (rf * 0.4) + (overallFreq[i] * 0.3) + (compatibility[i] * 0.3);
    });
    
    const ranked = scores
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);
    
    return selectWithBalance(ranked);
}

// Simplified versions of other methods (just to get predictions)
// For validation purposes, we'll focus on the top methods from the file

const predictions = [
    { name: "Enhanced Frequency + Compatibility", numbers: enhancedFrequencyCompatibility() }
];

// Validate predictions
console.log('🎲 VALIDATION RESULTS');
console.log('='.repeat(70));

predictions.forEach((pred, index) => {
    const allWinning = [...latestWinning.numbers, latestWinning.additional];
    const matches = pred.numbers.filter(n => latestWinning.numbers.includes(n));
    const additionalMatch = pred.numbers.includes(latestWinning.additional);
    
    console.log(`${index + 1}. ${pred.name}`);
    console.log(`   Predicted: [${pred.numbers.join(', ')}]`);
    console.log(`   Matches: ${matches.length}/6 main numbers`);
    if (matches.length > 0) {
        console.log(`   Matched Numbers: ${matches.join(', ')}`);
    }
    if (additionalMatch) {
        console.log(`   ✅ Additional Number (${latestWinning.additional}) also predicted!`);
    }
    console.log(`   Accuracy: ${((matches.length / 6) * 100).toFixed(1)}%`);
    console.log('');
});

console.log('='.repeat(70));
console.log('📊 NOTE: These predictions were generated for Dec 29 draw');
console.log('📊 Validated against Dec 25 draw result');
