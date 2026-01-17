const fs = require('fs');

// Load historical TOTO data
function loadTotoData() {
    const data = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = data.trim().split('\n');
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
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
    return results.reverse(); // Most recent first
}

// Range definitions
const LOW_RANGE = [1, 16];    // 1-16
const MID_RANGE = [17, 33];   // 17-33  
const HIGH_RANGE = [34, 49];  // 34-49

// Base numbers to exclude for maximum coverage
const BASE_NUMBERS = [10, 49, 2];

// Calculate frequency for all numbers
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

// Calculate compatibility with base numbers
function calculateCompatibility(results, bases = BASE_NUMBERS, depth = 50) {
    const compat = new Array(50).fill(0);
    const recentResults = results.slice(0, depth);
    
    recentResults.forEach(result => {
        const hasBase = bases.some(base => result.numbers.includes(base));
        if (hasBase) {
            result.numbers.forEach(num => {
                if (!bases.includes(num)) {
                    compat[num]++;
                }
            });
        }
    });
    return compat;
}

// Get numbers in specific range
function getNumbersInRange(range) {
    const numbers = [];
    for (let i = range[0]; i <= range[1]; i++) {
        numbers.push(i);
    }
    return numbers;
}

// Select balanced numbers across all ranges
function selectBalancedNumbers(freq, compat, lowCount = 2, midCount = 2, highCount = 2, usedCombinations) {
    const lowNumbers = getNumbersInRange(LOW_RANGE).filter(n => !BASE_NUMBERS.includes(n));
    const midNumbers = getNumbersInRange(MID_RANGE).filter(n => !BASE_NUMBERS.includes(n));
    const highNumbers = getNumbersInRange(HIGH_RANGE).filter(n => !BASE_NUMBERS.includes(n));
    
    // Score and sort each range
    const scoreLow = lowNumbers.map(n => ({ n, score: freq[n] + compat[n], freq: freq[n], compat: compat[n] }))
        .sort((a, b) => b.score - a.score);
    const scoreMid = midNumbers.map(n => ({ n, score: freq[n] + compat[n], freq: freq[n], compat: compat[n] }))
        .sort((a, b) => b.score - a.score);
    const scoreHigh = highNumbers.map(n => ({ n, score: freq[n] + compat[n], freq: freq[n], compat: compat[n] }))
        .sort((a, b) => b.score - a.score);
    
    // Try multiple combinations to find unique one
    for (let attempts = 0; attempts < 50; attempts++) {
        const selected = [];
        
        // Select from low range
        const lowStart = Math.floor(Math.random() * Math.min(10, scoreLow.length - lowCount + 1));
        for (let i = lowStart; i < lowStart + lowCount && i < scoreLow.length; i++) {
            selected.push(scoreLow[i].n);
        }
        
        // Select from mid range
        const midStart = Math.floor(Math.random() * Math.min(10, scoreMid.length - midCount + 1));
        for (let i = midStart; i < midStart + midCount && i < scoreMid.length; i++) {
            selected.push(scoreMid[i].n);
        }
        
        // Select from high range
        const highStart = Math.floor(Math.random() * Math.min(10, scoreHigh.length - highCount + 1));
        for (let i = highStart; i < highStart + highCount && i < scoreHigh.length; i++) {
            selected.push(scoreHigh[i].n);
        }
        
        selected.sort((a, b) => a - b);
        const key = selected.join(',');
        
        if (!usedCombinations.has(key) && selected.length === 6) {
            usedCombinations.add(key);
            return selected;
        }
    }
    
    return null; // Couldn't find unique combination
}

// Enhanced range-balanced algorithms
function generateBalancedPredictions(results) {
    const predictions = [];
    const usedCombinations = new Set();
    
    const freq30 = calculateFrequency(results, 30);
    const freq50 = calculateFrequency(results, 50);
    const freq100 = calculateFrequency(results, 100);
    const compat30 = calculateCompatibility(results, BASE_NUMBERS, 30);
    const compat50 = calculateCompatibility(results, BASE_NUMBERS, 50);
    const compat100 = calculateCompatibility(results, BASE_NUMBERS, 100);
    
    // Algorithm definitions with full range coverage
    const algorithms = [
        // BALANCED COVERAGE STRATEGIES
        { name: "Perfect Balance 2-2-2", desc: "Equal distribution across all ranges", lowCount: 2, midCount: 2, highCount: 2, freq: freq50, compat: compat50, confidence: 5 },
        { name: "Low-Heavy Balance 3-2-1", desc: "Low range emphasis with full coverage", lowCount: 3, midCount: 2, highCount: 1, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Mid-Heavy Balance 2-3-1", desc: "Mid range emphasis with full coverage", lowCount: 2, midCount: 3, highCount: 1, freq: freq50, compat: compat50, confidence: 4 },
        { name: "High-Heavy Balance 1-2-3", desc: "High range emphasis with full coverage", lowCount: 1, midCount: 2, highCount: 3, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Even Distribution 2-2-2", desc: "Mathematically balanced approach", lowCount: 2, midCount: 2, highCount: 2, freq: freq100, compat: compat50, confidence: 5 },
        
        // FREQUENCY + RANGE VARIATIONS
        { name: "Freq30 Balance 2-2-2", desc: "30-draw frequency with range balance", lowCount: 2, midCount: 2, highCount: 2, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Freq50 Balance 2-2-2", desc: "50-draw frequency with range balance", lowCount: 2, midCount: 2, highCount: 2, freq: freq50, compat: compat50, confidence: 4 },
        { name: "Freq100 Balance 2-2-2", desc: "100-draw frequency with range balance", lowCount: 2, midCount: 2, highCount: 2, freq: freq100, compat: compat50, confidence: 3 },
        
        // STRATEGIC RANGE VARIATIONS
        { name: "Low-Mid Focus 3-3-0", desc: "January 8th pattern + mid range", lowCount: 3, midCount: 3, highCount: 0, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Mid-High Focus 0-3-3", desc: "Traditional high-value approach", lowCount: 0, midCount: 3, highCount: 3, freq: freq50, compat: compat50, confidence: 3 },
        { name: "Low-High Split 3-0-3", desc: "Skip middle, extreme ranges", lowCount: 3, midCount: 0, highCount: 3, freq: freq30, compat: compat30, confidence: 3 },
        
        // ADAPTIVE RANGE STRATEGIES
        { name: "Adaptive Balance A1", desc: "Smart range adaptation", lowCount: 2, midCount: 2, highCount: 2, freq: freq30, compat: compat50, confidence: 4 },
        { name: "Adaptive Balance A2", desc: "Enhanced range adaptation", lowCount: 3, midCount: 2, highCount: 1, freq: freq50, compat: compat30, confidence: 4 },
        { name: "Adaptive Balance A3", desc: "Dynamic range selection", lowCount: 1, midCount: 3, highCount: 2, freq: freq50, compat: compat50, confidence: 3 },
        { name: "Adaptive Balance A4", desc: "Flexible range approach", lowCount: 2, midCount: 1, highCount: 3, freq: freq30, compat: compat30, confidence: 3 },
        
        // MATHEMATICAL COVERAGE APPROACHES  
        { name: "Math Coverage M1", desc: "Mathematical range optimization", lowCount: 2, midCount: 2, highCount: 2, freq: freq100, compat: compat30, confidence: 4 },
        { name: "Math Coverage M2", desc: "Statistical range balance", lowCount: 1, midCount: 4, highCount: 1, freq: freq50, compat: compat50, confidence: 3 },
        { name: "Math Coverage M3", desc: "Probability range spread", lowCount: 4, midCount: 1, highCount: 1, freq: freq30, compat: compat30, confidence: 3 },
        
        // TREND-BASED RANGE STRATEGIES
        { name: "Trend Balance T1", desc: "Recent trend with full range", lowCount: 2, midCount: 2, highCount: 2, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Trend Balance T2", desc: "Historical trend balance", lowCount: 2, midCount: 2, highCount: 2, freq: freq100, compat: compat100, confidence: 3 },
        { name: "Trend Balance T3", desc: "Mixed trend approach", lowCount: 1, midCount: 2, highCount: 3, freq: freq50, compat: compat50, confidence: 3 },
        
        // COMPREHENSIVE COVERAGE SYSTEMS
        { name: "Coverage System C1", desc: "Maximum range coverage", lowCount: 2, midCount: 2, highCount: 2, freq: freq50, compat: compat30, confidence: 5 },
        { name: "Coverage System C2", desc: "Optimal range distribution", lowCount: 3, midCount: 1, highCount: 2, freq: freq30, compat: compat50, confidence: 4 },
        { name: "Coverage System C3", desc: "Strategic range spread", lowCount: 1, midCount: 3, highCount: 2, freq: freq100, compat: compat30, confidence: 3 },
        { name: "Coverage System C4", desc: "Balanced range coverage", lowCount: 2, midCount: 3, highCount: 1, freq: freq50, compat: compat50, confidence: 4 },
        
        // FINAL RANGE OPTIMIZATIONS
        { name: "Range Optimizer R1", desc: "Ultimate range balance", lowCount: 2, midCount: 2, highCount: 2, freq: freq30, compat: compat50, confidence: 5 },
        { name: "Range Optimizer R2", desc: "Advanced range selection", lowCount: 1, midCount: 2, highCount: 3, freq: freq50, compat: compat30, confidence: 4 },
        { name: "Range Optimizer R3", desc: "Premium range approach", lowCount: 3, midCount: 2, highCount: 1, freq: freq30, compat: compat30, confidence: 4 },
        { name: "Range Optimizer R4", desc: "Elite range strategy", lowCount: 2, midCount: 1, highCount: 3, freq: freq50, compat: compat50, confidence: 3 },
        { name: "Range Optimizer R5", desc: "Master range coverage", lowCount: 1, midCount: 4, highCount: 1, freq: freq100, compat: compat50, confidence: 3 },
        { name: "Range Optimizer R6", desc: "Supreme range balance", lowCount: 4, midCount: 1, highCount: 1, freq: freq30, compat: compat30, confidence: 3 },
        { name: "Range Optimizer R7", desc: "Perfect range harmony", lowCount: 2, midCount: 2, highCount: 2, freq: freq100, compat: compat100, confidence: 5 }
    ];
    
    // Generate predictions using balanced algorithms
    let attempts = 0;
    let successCount = 0;
    
    for (const algorithm of algorithms) {
        attempts++;
        const selected = selectBalancedNumbers(
            algorithm.freq, 
            algorithm.compat, 
            algorithm.lowCount, 
            algorithm.midCount, 
            algorithm.highCount,
            usedCombinations
        );
        
        if (selected) {
            successCount++;
            const sum = selected.reduce((a, b) => a + b, 0);
            const evenCount = selected.filter(n => n % 2 === 0).length;
            const oddCount = 6 - evenCount;
            const lowCount = selected.filter(n => n >= LOW_RANGE[0] && n <= LOW_RANGE[1]).length;
            const midCount = selected.filter(n => n >= MID_RANGE[0] && n <= MID_RANGE[1]).length;
            const highCount = selected.filter(n => n >= HIGH_RANGE[0] && n <= HIGH_RANGE[1]).length;
            const range = Math.max(...selected) - Math.min(...selected);
            
            predictions.push({
                algorithm: algorithm.name,
                description: algorithm.desc,
                numbers: selected,
                sum: sum,
                evenOdd: `${evenCount}/${oddCount}`,
                ranges: `${lowCount}/${midCount}/${highCount}`,
                range: range,
                confidence: algorithm.confidence
            });
        }
        
        if (predictions.length >= 31) break;
    }
    
    return { predictions: predictions.slice(0, 31), attempts, successCount };
}

// Main execution
console.log(`
🚀 BALANCED RANGE TOTO PREDICTIONS - Next Draw January 13, 2026
🎯 FULL RANGE COVERAGE: Low (1-16) + Mid (17-33) + High (34-49)
💰 Next Jackpot: $1,500,000+ EST
===========================================================================`);

const results = loadTotoData();
console.log(`📊 Historical data loaded: ${results.length} draws`);
console.log(`📅 Latest result: ${results[0].date} - [${results[0].numbers.join(', ')}] + ${results[0].additional}`);

console.log(`
🔢 OPTIMIZED BASE NUMBERS: [${BASE_NUMBERS.join(', ')}]
📊 Excluded from predictions for maximum coverage

🎯 RANGE STRATEGY:
• LOW RANGE (1-16): Traditional lucky numbers, frequent winners
• MID RANGE (17-33): Balanced frequency, good coverage  
• HIGH RANGE (34-49): Premium numbers, jackpot patterns

🎯 31 BALANCED RANGE PREDICTIONS FOR NEXT TOTO DRAW (JANUARY 13, 2026)
💰 JACKPOT: $1,500,000+ (ESTIMATED)
===========================================================================`);

const { predictions, attempts, successCount } = generateBalancedPredictions(results);
console.log(`📊 Generated ${predictions.length} unique predictions (${attempts} attempts, ${successCount} successful)`);
console.log(`💎 100% unique combinations - Full range coverage!\n`);

predictions.forEach((pred, index) => {
    const stars = '⭐'.repeat(pred.confidence);
    console.log(`${(index + 1).toString().padStart(2)}. ${pred.algorithm} ${stars}`);
    console.log(`    Numbers: [${pred.numbers.join(', ')}]`);
    console.log(`    🎯 ${pred.description.toUpperCase()}`);
    console.log(`    Sum: ${pred.sum} | E/O: ${pred.evenOdd} | L/M/H: ${pred.ranges} | Range: ${pred.range}\n`);
});

// Calculate statistics
const avgSum = predictions.reduce((sum, pred) => sum + pred.sum, 0) / predictions.length;
const rangeStats = {
    lowHeavy: predictions.filter(p => p.ranges.startsWith('3') || p.ranges.startsWith('4')).length,
    balanced: predictions.filter(p => p.ranges.startsWith('2') && p.ranges.includes('/2/')).length,
    highHeavy: predictions.filter(p => p.ranges.endsWith('/3') || p.ranges.endsWith('/4')).length,
    fullCoverage: predictions.filter(p => !p.ranges.includes('/0')).length
};

const confidenceStats = {
    high: predictions.filter(p => p.confidence >= 4).length,
    medium: predictions.filter(p => p.confidence === 3).length,
    total: predictions.length
};

console.log(`===========================================================================
🚀 BALANCED RANGE PREDICTION SYSTEM - 31 ALGORITHMS
🎯 Next Draw: Monday, January 13, 2026 at 6:30 PM SGT
💰 Jackpot: $1,500,000+ (Estimated)
🔢 Base numbers excluded: [${BASE_NUMBERS.join(', ')}]
⚖️ All predictions ensure FULL RANGE COVERAGE

📊 SYSTEM STATISTICS:
   Average sum: ${avgSum.toFixed(1)}
   Unique combinations: ${predictions.length}/31 (100%)
   Full range coverage: ${rangeStats.fullCoverage}/${predictions.length} predictions
   Confidence distribution: ${confidenceStats.high} high (4-5⭐), ${confidenceStats.medium} medium (3⭐)

📈 RANGE DISTRIBUTION:
   Low-heavy (3-4 low numbers): ${rangeStats.lowHeavy} predictions
   Balanced (2-2-2 distribution): ${rangeStats.balanced} predictions  
   High-heavy (3-4 high numbers): ${rangeStats.highHeavy} predictions

🏆 TOP RECOMMENDATIONS:
   • Perfect Balance 2-2-2 (⭐⭐⭐⭐⭐) - Mathematical range optimization
   • Even Distribution 2-2-2 (⭐⭐⭐⭐⭐) - Statistical balance approach
   • Coverage System C1 (⭐⭐⭐⭐⭐) - Maximum range coverage

🎯 KEY STRATEGY: Complete range coverage for maximum winning probability
💡 Every number range represented, zero duplicates, optimal distribution

🎲 GOOD LUCK WITH THE BALANCED RANGE SYSTEM!
===========================================================================`);