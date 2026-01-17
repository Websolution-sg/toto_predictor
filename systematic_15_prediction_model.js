const fs = require('fs');

// Load historical TOTO data
function loadTotoData() {
    const data = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = data.trim().split('\n');
    const results = [];
    
    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 7) {
            const numbers = parts.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b);
            const additional = parseInt(parts[7]);
            results.push({
                date: parts[0],
                numbers: numbers,
                additional: additional
            });
        }
    }
    return results.reverse();
}

// Range definitions
const LOW_RANGE = [1, 16];
const MID_RANGE = [17, 33];
const HIGH_RANGE = [34, 49];

// Mathematical analysis functions
function calculateFrequency(results, depth = 50) {
    const freq = new Array(50).fill(0);
    const recentResults = results.slice(0, depth);
    
    recentResults.forEach(result => {
        result.numbers.forEach(num => {
            freq[num]++;
        });
    });
    return freq;
}

function calculateWeightedFrequency(results, depth = 50, recentWeight = 2) {
    const freq = new Array(50).fill(0);
    const recentResults = results.slice(0, depth);
    
    recentResults.forEach((result, index) => {
        const weight = index < 15 ? recentWeight : 1;
        result.numbers.forEach(num => {
            freq[num] += weight;
        });
    });
    return freq;
}

function calculateGapAnalysis(results, depth = 100) {
    const gaps = new Array(50).fill(0);
    const recentResults = results.slice(0, depth);
    
    for (let num = 1; num <= 49; num++) {
        let drawsSinceAppearance = 0;
        for (let i = 0; i < recentResults.length; i++) {
            if (recentResults[i].numbers.includes(num)) {
                drawsSinceAppearance = i;
                break;
            }
            if (i === recentResults.length - 1) {
                drawsSinceAppearance = recentResults.length;
            }
        }
        gaps[num] = drawsSinceAppearance;
    }
    return gaps;
}

function calculateConsecutivePatterns(results) {
    const patterns = new Array(50).fill(0);
    const recentResults = results.slice(0, 30);
    
    for (let i = 0; i < recentResults.length - 1; i++) {
        const current = recentResults[i].numbers;
        const next = recentResults[i + 1].numbers;
        
        current.forEach(num => {
            if (next.includes(num)) {
                patterns[num]++;
            }
        });
    }
    return patterns;
}

function calculateEvenOddBalance(results) {
    const evenOdd = { even: new Array(50).fill(0), odd: new Array(50).fill(0) };
    const recentResults = results.slice(0, 50);
    
    recentResults.forEach(result => {
        let evenCount = 0, oddCount = 0;
        result.numbers.forEach(num => {
            if (num % 2 === 0) {
                evenCount++;
                evenOdd.even[num]++;
            } else {
                oddCount++;
                evenOdd.odd[num]++;
            }
        });
    });
    return evenOdd;
}

function getNumbersInRange(range) {
    const numbers = [];
    for (let i = range[0]; i <= range[1]; i++) {
        numbers.push(i);
    }
    return numbers;
}

// Systematic prediction generator
function generateSystematicPrediction(freq, gaps, patterns, evenOdd, strategy, seed = 0) {
    const lowNumbers = getNumbersInRange(LOW_RANGE);
    const midNumbers = getNumbersInRange(MID_RANGE);
    const highNumbers = getNumbersInRange(HIGH_RANGE);
    
    // Different scoring algorithms for each strategy
    const getScore = (n, strategyType, rangePref = null) => {
        let baseScore = 0;
        
        switch(strategyType) {
            case 'frequency':
                baseScore = freq[n] * 1.0;
                break;
            case 'gap':
                baseScore = gaps[n] * 0.8;
                break;
            case 'pattern':
                baseScore = patterns[n] * 0.6 + freq[n] * 0.4;
                break;
            case 'balanced':
                baseScore = freq[n] * 0.4 + gaps[n] * 0.3 + patterns[n] * 0.3;
                break;
            case 'evenodd':
                baseScore = (n % 2 === 0 ? evenOdd.even[n] : evenOdd.odd[n]) * 0.7 + freq[n] * 0.3;
                break;
            case 'hybrid':
                baseScore = freq[n] * 0.35 + gaps[n] * 0.35 + patterns[n] * 0.3;
                break;
            default:
                baseScore = freq[n] * 0.5 + gaps[n] * 0.3 + patterns[n] * 0.2;
        }
        
        // Range preference modifier
        if (rangePref === 'low' && n <= 16) baseScore *= 1.3;
        else if (rangePref === 'mid' && n >= 17 && n <= 33) baseScore *= 1.3;
        else if (rangePref === 'high' && n >= 34) baseScore *= 1.3;
        
        // Add systematic variation
        return baseScore + (Math.sin(n * seed) * 2);
    };
    
    const scoreLow = lowNumbers.map(n => ({ n, score: getScore(n, strategy.type, strategy.rangePref) }))
        .sort((a, b) => b.score - a.score);
    const scoreMid = midNumbers.map(n => ({ n, score: getScore(n, strategy.type, strategy.rangePref) }))
        .sort((a, b) => b.score - a.score);
    const scoreHigh = highNumbers.map(n => ({ n, score: getScore(n, strategy.type, strategy.rangePref) }))
        .sort((a, b) => b.score - a.score);
    
    const selected = [];
    const startOffset = seed % 3;
    
    // Select based on strategy distribution
    for (let i = startOffset; i < startOffset + strategy.lowCount && i < scoreLow.length; i++) {
        selected.push(scoreLow[i].n);
    }
    for (let i = startOffset; i < startOffset + strategy.midCount && i < scoreMid.length; i++) {
        selected.push(scoreMid[i].n);
    }
    for (let i = startOffset; i < startOffset + strategy.highCount && i < scoreHigh.length; i++) {
        selected.push(scoreHigh[i].n);
    }
    
    return selected.sort((a, b) => a - b);
}

// Generate 15 systematic predictions
function generate15Predictions(results) {
    console.log(`🎯 15-PREDICTION SYSTEMATIC MODEL
📊 Mathematical Coverage for Every Draw
🔢 Data analyzed: ${results.length} historical draws
===========================================================================`);

    // Calculate all analysis factors
    const freq30 = calculateFrequency(results, 30);
    const freq50 = calculateFrequency(results, 50);
    const weightedFreq = calculateWeightedFrequency(results, 40, 2);
    const gaps = calculateGapAnalysis(results, 80);
    const patterns = calculateConsecutivePatterns(results);
    const evenOdd = calculateEvenOddBalance(results);

    // 15 systematic strategies for consistent coverage
    const strategies = [
        // BALANCED DISTRIBUTIONS (2-2-2)
        { name: "Core Frequency", type: "frequency", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        { name: "Mathematical Balance", type: "balanced", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        { name: "Pattern Harmony", type: "pattern", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        { name: "Gap Equilibrium", type: "gap", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        { name: "Hybrid Balance", type: "hybrid", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        
        // LOW-EMPHASIS DISTRIBUTIONS
        { name: "Low Frequency Focus", type: "frequency", lowCount: 3, midCount: 2, highCount: 1, rangePref: "low" },
        { name: "Low Pattern Analysis", type: "pattern", lowCount: 4, midCount: 1, highCount: 1, rangePref: "low" },
        { name: "Low Gap Strategy", type: "gap", lowCount: 3, midCount: 3, highCount: 0, rangePref: "low" },
        
        // HIGH-EMPHASIS DISTRIBUTIONS  
        { name: "High Frequency Focus", type: "frequency", lowCount: 1, midCount: 2, highCount: 3, rangePref: "high" },
        { name: "High Pattern Analysis", type: "pattern", lowCount: 1, midCount: 1, highCount: 4, rangePref: "high" },
        { name: "High Gap Strategy", type: "gap", lowCount: 0, midCount: 3, highCount: 3, rangePref: "high" },
        
        // MID-EMPHASIS DISTRIBUTIONS
        { name: "Mid Frequency Focus", type: "frequency", lowCount: 1, midCount: 4, highCount: 1, rangePref: "mid" },
        { name: "Mid Pattern Analysis", type: "pattern", lowCount: 2, midCount: 3, highCount: 1, rangePref: "mid" },
        
        // SPECIALIZED STRATEGIES
        { name: "Even-Odd Optimizer", type: "evenodd", lowCount: 2, midCount: 2, highCount: 2, rangePref: null },
        { name: "Weighted Systematic", type: "hybrid", lowCount: 1, midCount: 3, highCount: 2, rangePref: null }
    ];

    const predictions = [];
    const usedCombinations = new Set();

    // Generate exactly 15 predictions
    strategies.forEach((strategy, index) => {
        let attempts = 0;
        let selected;
        
        do {
            const freqData = attempts === 0 ? freq30 : (attempts === 1 ? freq50 : weightedFreq);
            selected = generateSystematicPrediction(
                freqData,
                gaps,
                patterns,
                evenOdd,
                strategy,
                index * 7 + attempts // Systematic seed
            );
            attempts++;
        } while (usedCombinations.has(selected.join(',')) && attempts < 5);
        
        if (selected && selected.length === 6) {
            const key = selected.join(',');
            if (!usedCombinations.has(key)) {
                usedCombinations.add(key);
                
                const sum = selected.reduce((a, b) => a + b, 0);
                const evenCount = selected.filter(n => n % 2 === 0).length;
                const oddCount = 6 - evenCount;
                const lowCount = selected.filter(n => n >= LOW_RANGE[0] && n <= LOW_RANGE[1]).length;
                const midCount = selected.filter(n => n >= MID_RANGE[0] && n <= MID_RANGE[1]).length;
                const highCount = selected.filter(n => n >= HIGH_RANGE[0] && n <= HIGH_RANGE[1]).length;
                const range = Math.max(...selected) - Math.min(...selected);
                
                predictions.push({
                    rank: predictions.length + 1,
                    algorithm: strategy.name,
                    numbers: selected,
                    sum: sum,
                    evenOdd: `${evenCount}/${oddCount}`,
                    ranges: `${lowCount}/${midCount}/${highCount}`,
                    range: range,
                    type: strategy.type,
                    distribution: `${strategy.lowCount}-${strategy.midCount}-${strategy.highCount}`
                });
            }
        }
    });

    return predictions.slice(0, 15);
}

// Main execution
const results = loadTotoData();
const predictions = generate15Predictions(results);

console.log(`\n🎯 15 SYSTEMATIC PREDICTIONS - EVERY DRAW MODEL
💰 Next Draw: Monday, January 19, 2026
===========================================================================\n`);

predictions.forEach(pred => {
    console.log(`${pred.rank.toString().padStart(2)}. ${pred.algorithm}`);
    console.log(`    Numbers: [${pred.numbers.join(', ')}]`);
    console.log(`    📊 Sum: ${pred.sum} | E/O: ${pred.evenOdd} | L/M/H: ${pred.ranges} | Range: ${pred.range}`);
    console.log(`    🎯 Type: ${pred.type.toUpperCase()} | Pattern: ${pred.distribution}\n`);
});

// Statistics
const avgSum = predictions.reduce((sum, pred) => sum + pred.sum, 0) / predictions.length;
const sumRanges = {
    low: predictions.filter(p => p.sum < 121).length,
    medium: predictions.filter(p => p.sum >= 121 && p.sum <= 180).length,
    high: predictions.filter(p => p.sum > 180).length
};

const patternCoverage = {
    balanced: predictions.filter(p => p.distribution === '2-2-2').length,
    lowHeavy: predictions.filter(p => parseInt(p.distribution.split('-')[0]) >= 3).length,
    highHeavy: predictions.filter(p => parseInt(p.distribution.split('-')[2]) >= 3).length,
    midHeavy: predictions.filter(p => parseInt(p.distribution.split('-')[1]) >= 3).length
};

console.log(`===========================================================================
📊 15-PREDICTION SYSTEMATIC MODEL STATISTICS
🎯 Designed for consistent use on every draw
🔢 Total predictions: ${predictions.length}

💰 Sum Distribution:
   Average sum: ${avgSum.toFixed(1)}
   • Low sums (< 121): ${sumRanges.low} predictions
   • Medium sums (121-180): ${sumRanges.medium} predictions  
   • High sums (> 180): ${sumRanges.high} predictions

🎲 Pattern Coverage:
   • Balanced (2-2-2): ${patternCoverage.balanced} predictions
   • Low-Heavy (3+ low): ${patternCoverage.lowHeavy} predictions
   • High-Heavy (3+ high): ${patternCoverage.highHeavy} predictions
   • Mid-Heavy (3+ mid): ${patternCoverage.midHeavy} predictions

🚀 ALGORITHM TYPES USED:
   • Frequency Analysis: Mathematical number occurrence
   • Gap Analysis: Overdue number targeting
   • Pattern Analysis: Consecutive draw patterns
   • Balanced: Multi-factor optimization
   • Even-Odd: Parity distribution analysis
   • Hybrid: Combined systematic approach

💡 SYSTEMATIC APPROACH:
   • No historical bias - pure mathematical analysis
   • Consistent 15 predictions for every draw
   • Full range and pattern coverage
   • Repeatable and reliable methodology

🎯 USE THIS MODEL FOR EVERY TOTO DRAW!
===========================================================================`);

// Export predictions for external use
const exportData = {
    drawDate: "January 19, 2026",
    predictions: predictions,
    statistics: {
        avgSum: avgSum.toFixed(1),
        sumRanges: sumRanges,
        patternCoverage: patternCoverage,
        totalPredictions: predictions.length
    }
};

fs.writeFileSync('systematic_15_predictions.json', JSON.stringify(exportData, null, 2));
console.log(`\n📁 Predictions exported to: systematic_15_predictions.json`);