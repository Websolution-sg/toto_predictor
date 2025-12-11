const fs = require('fs');

console.log('🎯 TOTO 10 Predictions for Next Draw - December 15, 2025');
console.log('Updated with December 11, 2025 result: [6, 11, 20, 28, 33, 43] + 16');
console.log('='.repeat(70));

// Load historical data from CSV
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

console.log(`Historical data loaded: ${historical.length} draws`);
console.log(`Latest result: ${historical[0].date} - [${historical[0].numbers.join(', ')}] + ${historical[0].additional}`);

const baseNumbers = [16, 22, 10];

// Helper functions
function getFrequency(draws) {
    const freq = Array(50).fill(0);
    draws.forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
    });
    return freq;
}

function selectWithBalance(candidates, count = 6) {
    const selected = [];
    let evenCount = 0, oddCount = 0;
    
    for (const candidate of candidates) {
        if (selected.length >= count) break;
        const num = typeof candidate === 'object' ? candidate.n : candidate;
        const isEven = num % 2 === 0;
        
        if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || selected.length >= 4) {
            selected.push(num);
            if (isEven) evenCount++;
            else oddCount++;
        }
    }
    
    return selected.sort((a, b) => a - b);
}

// 1. Enhanced Ensemble ⭐⭐⭐⭐⭐ (Updated with latest patterns)
function enhancedEnsemble() {
    const recent20 = historical.slice(0, 20);
    const historical30 = historical.slice(20, 50);
    
    const recentFreq = getFrequency(recent20);
    const historicalFreq = getFrequency(historical30);
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            const recentRate = recentFreq[n] / recent20.length;
            const historicalRate = historicalFreq[n] / historical30.length;
            const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentFreq[n] > 0 ? 5 : 0);
            
            let score = recentFreq[n] * 0.4 + hotRatio * 0.3 + historicalFreq[n] * 0.2;
            
            // Boost for numbers appearing in recent 3 draws
            if (historical.slice(0, 3).some(draw => draw.numbers.includes(n))) {
                score += 0.15;
            }
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 2. Frequency + Compatibility ⭐⭐⭐⭐ (Refined)
function frequencyCompatibility() {
    const draws = historical.slice(0, 50);
    const freq = getFrequency(draws);
    const compat = Array(50).fill(0);
    
    draws.forEach(draw => {
        baseNumbers.forEach(base => {
            if (draw.numbers.includes(base)) {
                draw.numbers.filter(n => n !== base).forEach(n => compat[n]++);
            }
        });
    });
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let score = freq[n] + compat[n] * 0.5;
            
            // Penalty for numbers in last draw (avoid immediate repeats)
            if (historical[0].numbers.includes(n)) {
                score *= 0.6;
            }
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 3. Hot/Cold Analysis ⭐⭐⭐⭐ (Adjusted after Dec 11 result)
function hotColdAnalysis() {
    const recent15 = historical.slice(0, 15);
    const historical35 = historical.slice(15, 50);
    
    const recentFreq = getFrequency(recent15);
    const historicalFreq = getFrequency(historical35);
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            const recentRate = recentFreq[n] / recent15.length;
            const historicalRate = historicalFreq[n] / historical35.length;
            const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentFreq[n] > 0 ? 8 : 0);
            
            let hotScore = recentFreq[n] * 0.3;
            if (hotRatio > 1.5 && recentRate > 0.08) hotScore += hotRatio * 0.4;
            if (recentFreq[n] >= 3) hotScore += 0.2;
            if (recentFreq[n] === 0 && historicalRate > 0.06) hotScore -= 0.05; // Less penalty for cold
            
            // Bonus for mid-range numbers (17-33) after Dec 11 pattern
            if (n >= 17 && n <= 33) hotScore += 0.1;
            
            suggestions.push({ n, score: hotScore, hotRatio });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 4. Weighted Recent ⭐⭐⭐⭐ (Enhanced weighting)
function weightedRecent() {
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let weighted = 0;
            for (let i = 0; i < Math.min(25, historical.length); i++) {
                const weight = 25 - i;
                if (historical[i].numbers.includes(n)) {
                    weighted += weight;
                }
            }
            
            // Extra weight for numbers not in last 2 draws (fresh picks)
            if (!historical.slice(0, 2).some(draw => draw.numbers.includes(n))) {
                weighted += 5;
            }
            
            suggestions.push({ n, score: weighted });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 5. Pattern Analysis ⭐⭐⭐ (Sum-focused after 141 result)
function patternAnalysis() {
    const recent10 = historical.slice(0, 10);
    
    // Analyze recent patterns
    let totalSum = 0, totalEven = 0, totalLow = 0, totalMid = 0, totalHigh = 0;
    
    recent10.forEach(draw => {
        totalSum += draw.numbers.reduce((a, b) => a + b, 0);
        totalEven += draw.numbers.filter(n => n % 2 === 0).length;
        totalLow += draw.numbers.filter(n => n <= 16).length;
        totalMid += draw.numbers.filter(n => n >= 17 && n <= 33).length;
        totalHigh += draw.numbers.filter(n => n >= 34).length;
    });
    
    const avgSum = totalSum / recent10.length;
    const freq = getFrequency(historical.slice(0, 40));
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let score = freq[n];
            
            // Favor numbers that create balanced sums (120-150)
            if (n >= 15 && n <= 35) score += 0.4;
            
            // Pattern bonuses based on recent distribution
            if (n <= 16 && totalLow / recent10.length > 1.5) score += 0.2;
            if (n >= 17 && n <= 33 && totalMid / recent10.length > 2) score += 0.3;
            if (n >= 34 && totalHigh / recent10.length > 1.5) score += 0.2;
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 6. Momentum Tracker ⭐⭐⭐ (Recent momentum focus)
function momentumTracker() {
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let momentum = 0;
            
            // Recent 5 draws (highest weight)
            for (let i = 0; i < 5 && i < historical.length; i++) {
                if (historical[i].numbers.includes(n)) {
                    momentum += (6 - i) * 2.5;
                }
            }
            
            // Next 10 draws (medium weight)
            for (let i = 5; i < 15 && i < historical.length; i++) {
                if (historical[i].numbers.includes(n)) {
                    momentum += (16 - i) * 1.2;
                }
            }
            
            // Bonus for numbers that "skipped" recent draws
            if (!historical.slice(0, 3).some(draw => draw.numbers.includes(n)) && 
                historical.slice(3, 8).some(draw => draw.numbers.includes(n))) {
                momentum += 3;
            }
            
            suggestions.push({ n, score: momentum });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 7. Statistical Balance ⭐⭐⭐ (Deviation correction)
function statisticalBalance() {
    const draws = historical.slice(0, 50);
    const freq = getFrequency(draws);
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            const frequency = freq[n];
            const expected = draws.length * 6 / 49; // Expected frequency
            const deviation = frequency - expected;
            
            // Score favors underrepresented numbers
            let score = frequency + (expected - Math.abs(deviation)) * 0.3;
            if (deviation < 0) score += 0.5; // Bonus for underrepresented
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 8. Consecutive Avoidance ⭐⭐⭐ (Your best performer!)
function consecutiveAvoidance() {
    const lastDraw = historical[0].numbers;
    const secondLastDraw = historical[1].numbers;
    const freq = getFrequency(historical.slice(0, 35));
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let score = freq[n];
            
            // Avoid consecutive numbers from last draw
            const hasConsecutive = lastDraw.some(num => Math.abs(num - n) === 1);
            if (hasConsecutive) score *= 0.6;
            
            // Avoid numbers from last 2 draws
            if (lastDraw.includes(n)) score *= 0.4;
            if (secondLastDraw.includes(n)) score *= 0.7;
            
            // Bonus for numbers that appeared 3-5 draws ago (comeback potential)
            if (historical.slice(2, 6).some(draw => draw.numbers.includes(n))) {
                score += 1.0;
            }
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 9. Range Distribution ⭐⭐⭐ (Balanced spread)
function rangeDistribution() {
    const freq = getFrequency(historical.slice(0, 45));
    
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            let score = freq[n];
            
            // Enhanced range bonuses after analyzing Dec 11 result
            if (n >= 1 && n <= 16) score += 0.3; // Low range (had 2 numbers)
            if (n >= 17 && n <= 33) score += 0.4; // Mid range (had 3 numbers)
            if (n >= 34 && n <= 49) score += 0.2; // High range (had 1 number)
            
            // Special bonus for "sweet spot" numbers
            if (n >= 20 && n <= 30) score += 0.2;
            
            suggestions.push({ n, score });
        }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// 10. Gap Analysis ⭐⭐⭐ (Your previous winner - refined!)
function gapAnalysis() {
    const freq = getFrequency(historical.slice(0, 25)); // Shorter window for gaps
    
    // Identify current gaps and active numbers
    const gapNumbers = [];
    const activeNumbers = [];
    
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            if (freq[n] === 0) {
                gapNumbers.push(n);
            } else if (freq[n] <= 2) { // Include low-frequency numbers
                activeNumbers.push({ n, freq: freq[n] });
            }
        }
    }
    
    // Also consider numbers absent from last 5 draws
    const recent5Freq = getFrequency(historical.slice(0, 5));
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n) && recent5Freq[n] === 0 && !gapNumbers.includes(n)) {
            gapNumbers.push(n);
        }
    }
    
    activeNumbers.sort((a, b) => b.freq - a.freq);
    
    const suggestions = [];
    
    // Add gap numbers with high scores (overdue theory)
    gapNumbers.slice(0, 15).forEach(n => {
        suggestions.push({ n, score: 6 + Math.random() * 0.5 });
    });
    
    // Add selective active numbers
    activeNumbers.slice(0, 15).forEach(item => {
        suggestions.push({ n: item.n, score: item.freq + 3 });
    });
    
    suggestions.sort((a, b) => b.score - a.score);
    return selectWithBalance(suggestions);
}

// Generate all predictions
const predictions = [
    { name: "Enhanced Ensemble ⭐⭐⭐⭐⭐", numbers: enhancedEnsemble(), desc: "Advanced weighted multi-factor analysis" },
    { name: "Frequency + Compatibility ⭐⭐⭐⭐", numbers: frequencyCompatibility(), desc: "Statistical frequency with base compatibility" },
    { name: "Hot/Cold Analysis ⭐⭐⭐⭐", numbers: hotColdAnalysis(), desc: "Temperature-based number analysis (mid-range boost)" },
    { name: "Weighted Recent ⭐⭐⭐⭐", numbers: weightedRecent(), desc: "Recent draws with fresh number priority" },
    { name: "Pattern Analysis ⭐⭐⭐", numbers: patternAnalysis(), desc: "Sum and distribution pattern (120-150 target)" },
    { name: "Momentum Tracker ⭐⭐⭐", numbers: momentumTracker(), desc: "Number momentum with comeback detection" },
    { name: "Statistical Balance ⭐⭐⭐", numbers: statisticalBalance(), desc: "Expected frequency deviation correction" },
    { name: "Consecutive Avoidance ⭐⭐⭐", numbers: consecutiveAvoidance(), desc: "Avoiding recent patterns (best last time!)" },
    { name: "Range Distribution ⭐⭐⭐", numbers: rangeDistribution(), desc: "Enhanced balanced range distribution" },
    { name: "Gap Analysis ⭐⭐⭐", numbers: gapAnalysis(), desc: "Refined overdue numbers (your Dec 9 winner!)" }
];

// Display predictions
predictions.forEach((pred, index) => {
    console.log(`\n${index + 1}. ${pred.name}`);
    console.log(`   Numbers: ${pred.numbers.join(', ')}`);
    console.log(`   ${pred.desc}`);
    
    // Calculate stats
    const sum = pred.numbers.reduce((a, b) => a + b, 0);
    const evenCount = pred.numbers.filter(n => n % 2 === 0).length;
    const range = Math.max(...pred.numbers) - Math.min(...pred.numbers);
    
    console.log(`   Sum: ${sum}, Even/Odd: ${evenCount}/${6-evenCount}, Range: ${Math.min(...pred.numbers)}-${Math.max(...pred.numbers)}`);
});

console.log('\n' + '='.repeat(70));
console.log('🎯 Next Draw: Monday, December 15, 2025 at 6:30 PM');
console.log('💰 Jackpot: $1 Million (reset after Dec 11 $2.93M winner)');
console.log('📊 Updated with latest patterns from Dec 11 result [6,11,20,28,33,43]');
console.log('🏆 Consecutive Avoidance had best performance last time (1 match)');
console.log('🎲 Gap Analysis won you $10 on Dec 9!');
console.log('⚖️  All predictions exclude base numbers [16, 22, 10] and maintain balance');

// Export to file
const output = predictions.map((pred, index) => 
    `${index + 1}. ${pred.name}\nNumbers: [${pred.numbers.join(', ')}]\n${pred.desc}\n`
).join('\n');

fs.writeFileSync('dec15_predictions.txt', output);
console.log('\n📄 Predictions saved to: dec15_predictions.txt');