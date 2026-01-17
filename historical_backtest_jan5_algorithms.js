const fs = require('fs');

console.log('🧪 HISTORICAL BACKTEST: 15 ALGORITHMS vs ALL CSV DATA');
console.log('=========================================================');

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

console.log(`📊 Loaded ${historical.length} historical draws from CSV`);
console.log(`📅 Date range: ${historical[historical.length-1].date} to ${historical[0].date}`);
console.log('');

// Base numbers (same as your Jan 5th script)
const baseNumbers = [10, 49, 2];

// Helper functions (replicated from your script)
function getFrequency(draws, includeAdditional = true) {
    const freq = Array(50).fill(0);
    draws.forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
        if (includeAdditional && draw.additional) freq[draw.additional]++;
    });
    return freq;
}

function getCompatibility(draws, bases) {
    const compat = Array(50).fill(0);
    draws.forEach(draw => {
        const allNumbers = [...draw.numbers];
        if (draw.additional) allNumbers.push(draw.additional);
        
        const hasBase = bases.some(base => allNumbers.includes(base));
        if (hasBase) {
            allNumbers.forEach(n => {
                if (!bases.includes(n)) compat[n]++;
            });
        }
    });
    return compat;
}

function selectWithBalance(candidates, count = 6) {
    const selected = [];
    let evenCount = 0, oddCount = 0;
    let lowCount = 0, midCount = 0, highCount = 0;
    
    for (const candidate of candidates) {
        if (selected.length >= count) break;
        if (baseNumbers.includes(candidate.n)) continue;
        
        const n = candidate.n;
        const isEven = n % 2 === 0;
        const isLow = n <= 16, isMid = n >= 17 && n <= 33, isHigh = n >= 34;
        
        // Balance constraints
        if (isEven && evenCount >= 4) continue;
        if (!isEven && oddCount >= 4) continue;
        if (isLow && lowCount >= 3) continue;
        if (isMid && midCount >= 3) continue;
        if (isHigh && highCount >= 3) continue;
        
        selected.push(n);
        if (isEven) evenCount++; else oddCount++;
        if (isLow) lowCount++; else if (isMid) midCount++; else highCount++;
    }
    
    return selected.slice(0, 6).sort((a, b) => a - b);
}

// Algorithm implementations (replicated from your Jan 5th script)
function enhancedFrequencyCompatibility(draws) {
    const freq = getFrequency(draws.slice(0, 25));
    const compat = getCompatibility(draws.slice(0, 30), baseNumbers);
    
    const scores = freq.map((f, i) => f + compat[i] * 1.2);
    const suggestions = scores
        .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function momentumTrackerPlus(draws) {
    const recent = draws.slice(0, 15);
    const freq = getFrequency(recent);
    const compat = getCompatibility(recent, baseNumbers);
    
    const momentum = freq.map((f, i) => {
        const recentAppears = recent.slice(0, 5).some(draw => 
            [...draw.numbers, draw.additional].includes(i));
        return f + compat[i] * 0.8 + (recentAppears ? 2 : 0);
    });
    
    const suggestions = momentum
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function hotColdAnalysisAdvanced(draws) {
    const recent = draws.slice(0, 10);
    const longTerm = draws.slice(0, 40);
    
    const recentFreq = getFrequency(recent);
    const longFreq = getFrequency(longTerm);
    
    const hotCold = recentFreq.map((rf, i) => {
        const lf = longFreq[i] || 0;
        const avgLong = lf / 40;
        const avgRecent = rf / 10;
        return avgRecent > avgLong * 1.3 ? rf + 3 : rf;
    });
    
    const suggestions = hotCold
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function weightedRecentEnhanced(draws) {
    const weights = [3, 2.5, 2, 1.8, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8];
    const weightedFreq = Array(50).fill(0);
    
    draws.slice(0, 10).forEach((draw, index) => {
        const weight = weights[index] || 0.5;
        [...draw.numbers, draw.additional].forEach(n => {
            weightedFreq[n] += weight;
        });
    });
    
    const suggestions = weightedFreq
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function patternAnalysisAdvancedPlus(draws) {
    const freq = getFrequency(draws.slice(0, 20));
    const compat = getCompatibility(draws.slice(0, 25), baseNumbers);
    
    const patterns = freq.map((f, i) => {
        const bonus = (i >= 30 && i <= 45) ? 2 : 0; // Upper range boost
        return f + compat[i] + bonus;
    });
    
    const suggestions = patterns
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function compatibilityNetworkEnhanced(draws) {
    const compat = getCompatibility(draws.slice(0, 35), baseNumbers);
    const freq = getFrequency(draws.slice(0, 20));
    
    const network = compat.map((c, i) => {
        const upperBonus = (i >= 30) ? c * 0.3 : 0;
        return c + freq[i] * 0.6 + upperBonus;
    });
    
    const suggestions = network
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function balancedDistributionEnhanced(draws) {
    const freq = getFrequency(draws.slice(0, 25));
    
    const balanced = freq.map((f, i) => {
        const rangeBonus = (i >= 30) ? 1.5 : 1.0; // Higher range bias
        return f * rangeBonus;
    });
    
    const suggestions = balanced
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function trendReversalModerate(draws) {
    const freq = getFrequency(draws.slice(0, 50));
    const recent = getFrequency(draws.slice(0, 10));
    
    const overdue = freq.map((f, i) => {
        const recentApp = recent[i] || 0;
        if (recentApp === 0 && f > 0) return f + 5; // Overdue bonus
        return f;
    });
    
    const suggestions = overdue
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function frequencyHybridEnhanced(draws) {
    const freq1 = getFrequency(draws.slice(0, 15));
    const freq2 = getFrequency(draws.slice(0, 30));
    
    const hybrid = freq1.map((f1, i) => {
        const f2 = freq2[i] || 0;
        const sumBonus = (i >= 30) ? 1 : 0; // Higher sum optimization
        return f1 * 1.5 + f2 * 0.5 + sumBonus;
    });
    
    const suggestions = hybrid
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function adaptiveLearningPlus(draws) {
    const recent = draws.slice(0, 12);
    const weights = recent.map((_, i) => Math.exp(-i * 0.1));
    
    const adaptive = Array(50).fill(0);
    recent.forEach((draw, i) => {
        [...draw.numbers, draw.additional].forEach(n => {
            adaptive[n] += weights[i];
        });
    });
    
    const suggestions = adaptive
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function gapAnalysisAdvanced(draws) {
    const gaps = Array(50).fill(0);
    
    for (let n = 1; n <= 49; n++) {
        let gapsSinceLastSeen = 0;
        for (let i = 0; i < draws.length; i++) {
            const allNumbers = [...draws[i].numbers, draws[i].additional];
            if (allNumbers.includes(n)) {
                gaps[n] = gapsSinceLastSeen;
                break;
            }
            gapsSinceLastSeen++;
        }
    }
    
    const sweetSpot = gaps.map((gap, n) => {
        if (gap >= 8 && gap <= 20) return gap + 10; // Sweet spot
        return gap;
    });
    
    const suggestions = sweetSpot
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function seasonalPatternEnhanced(draws) {
    const freq = getFrequency(draws.slice(0, 20));
    
    // January-specific enhancement (current month)
    const seasonal = freq.map((f, i) => {
        const januaryBonus = (i >= 20 && i <= 40) ? 2 : 0;
        return f + januaryBonus;
    });
    
    const suggestions = seasonal
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function multipleRangeFusion(draws) {
    const freq = getFrequency(draws.slice(0, 18));
    
    const fusion = freq.map((f, i) => {
        let rangeMultiplier = 1.0;
        if (i >= 15 && i <= 35) rangeMultiplier = 1.3; // Mid-high range
        if (i >= 30 && i <= 40) rangeMultiplier = 1.5; // Overlap boost
        return f * rangeMultiplier;
    });
    
    const suggestions = fusion
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function probabilityMatrixAdvanced(draws) {
    const matrix = Array(50).fill(0);
    
    // Build probability matrix based on co-occurrence
    draws.slice(0, 30).forEach(draw => {
        const allNumbers = [...draw.numbers, draw.additional];
        allNumbers.forEach(n1 => {
            allNumbers.forEach(n2 => {
                if (n1 !== n2) matrix[n1] += 0.5;
            });
        });
    });
    
    const suggestions = matrix
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

function metaAlgorithmEnsemble(draws) {
    // Combine multiple approaches
    const freq = getFrequency(draws.slice(0, 20));
    const compat = getCompatibility(draws.slice(0, 25), baseNumbers);
    const recent = getFrequency(draws.slice(0, 8));
    
    const ensemble = freq.map((f, i) => {
        const weight1 = f * 0.3;           // Frequency
        const weight2 = compat[i] * 0.25;  // Compatibility  
        const weight3 = recent[i] * 0.35;  // Recent activity
        const weight4 = (i >= 25) ? 0.1 : 0; // Range bonus
        return weight1 + weight2 + weight3 + weight4;
    });
    
    const suggestions = ensemble
        .map((score, n) => ({ n, score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !baseNumbers.includes(o.n))
        .sort((a, b) => b.score - a.score);
    
    return selectWithBalance(suggestions);
}

// Algorithm definitions
const algorithms = [
    { name: "Enhanced Frequency + Compatibility", func: enhancedFrequencyCompatibility, confidence: 5 },
    { name: "Momentum Tracker Plus", func: momentumTrackerPlus, confidence: 5 },
    { name: "Hot/Cold Analysis Advanced", func: hotColdAnalysisAdvanced, confidence: 4 },
    { name: "Weighted Recent Enhanced", func: weightedRecentEnhanced, confidence: 4 },
    { name: "Pattern Analysis Advanced Plus", func: patternAnalysisAdvancedPlus, confidence: 4 },
    { name: "Compatibility Network Enhanced", func: compatibilityNetworkEnhanced, confidence: 4 },
    { name: "Balanced Distribution Enhanced", func: balancedDistributionEnhanced, confidence: 3 },
    { name: "Trend Reversal Moderate", func: trendReversalModerate, confidence: 5 },
    { name: "Frequency Hybrid Enhanced", func: frequencyHybridEnhanced, confidence: 3 },
    { name: "Adaptive Learning Plus", func: adaptiveLearningPlus, confidence: 4 },
    { name: "Gap Analysis Advanced", func: gapAnalysisAdvanced, confidence: 4 },
    { name: "Seasonal Pattern Enhanced", func: seasonalPatternEnhanced, confidence: 3 },
    { name: "Multiple Range Fusion", func: multipleRangeFusion, confidence: 4 },
    { name: "Probability Matrix Advanced", func: probabilityMatrixAdvanced, confidence: 4 },
    { name: "Meta-Algorithm Ensemble", func: metaAlgorithmEnsemble, confidence: 5 }
];

// Run historical backtest
console.log('🧪 RUNNING HISTORICAL BACKTEST');
console.log('='.repeat(80));

const results = {};
const detailedResults = [];

// Initialize results tracking
algorithms.forEach(algo => {
    results[algo.name] = {
        totalMatches: 0,
        perfectMatches: 0,
        draws: 0,
        matches: [],
        avgMatches: 0,
        bestMatch: 0,
        worstMatch: 7,
        confidence: algo.confidence
    };
});

// Test each algorithm against all historical draws
console.log('Testing algorithms against each historical draw...');
console.log('');

for (let testIndex = 5; testIndex < historical.length - 5; testIndex++) {
    const testDraw = historical[testIndex];
    const trainingData = historical.slice(0, testIndex); // Use all previous draws as training
    
    if (trainingData.length < 10) continue; // Need minimum training data
    
    const actualNumbers = [...testDraw.numbers, testDraw.additional];
    
    algorithms.forEach(algo => {
        try {
            const prediction = algo.func(trainingData);
            const matches = prediction.filter(n => actualNumbers.includes(n)).length;
            
            results[algo.name].totalMatches += matches;
            results[algo.name].draws++;
            results[algo.name].matches.push(matches);
            results[algo.name].bestMatch = Math.max(results[algo.name].bestMatch, matches);
            results[algo.name].worstMatch = Math.min(results[algo.name].worstMatch, matches);
            
            if (matches === 6) results[algo.name].perfectMatches++;
            
        } catch (error) {
            // Skip if algorithm fails
        }
    });
    
    if (testIndex % 20 === 0) {
        console.log(`✅ Tested ${testIndex} draws...`);
    }
}

// Calculate final statistics
algorithms.forEach(algo => {
    const result = results[algo.name];
    if (result.draws > 0) {
        result.avgMatches = result.totalMatches / result.draws;
    }
});

console.log('\n📊 HISTORICAL BACKTEST RESULTS');
console.log('='.repeat(80));

// Sort by average matches
const sortedResults = algorithms
    .map(algo => ({ ...algo, ...results[algo.name] }))
    .sort((a, b) => b.avgMatches - a.avgMatches);

sortedResults.forEach((result, index) => {
    const rank = index + 1;
    const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][index] : `${rank}.`;
    
    console.log(`\n${medal} ${result.name} (⭐${result.confidence})`);
    console.log(`   📊 Average Matches: ${result.avgMatches.toFixed(3)}/6`);
    console.log(`   📈 Total Matches: ${result.totalMatches}/${result.draws} draws`);
    console.log(`   🎯 Best Performance: ${result.bestMatch}/6 matches`);
    console.log(`   📉 Worst Performance: ${result.worstMatch}/6 matches`);
    console.log(`   🏆 Perfect Predictions: ${result.perfectMatches}`);
    console.log(`   📊 Success Rate: ${(result.avgMatches/6*100).toFixed(1)}%`);
});

// Overall statistics
console.log('\n📈 SYSTEM PERFORMANCE OVERVIEW');
console.log('='.repeat(80));

const avgSystemMatches = sortedResults.reduce((sum, r) => sum + r.avgMatches, 0) / sortedResults.length;
const totalPerfects = sortedResults.reduce((sum, r) => sum + r.perfectMatches, 0);
const totalDrawsTested = sortedResults[0]?.draws || 0;

console.log(`🎯 System Average Matches: ${avgSystemMatches.toFixed(3)}/6`);
console.log(`🏆 Total Perfect Predictions: ${totalPerfects}`);
console.log(`📊 Draws Tested: ${totalDrawsTested}`);
console.log(`⚡ Overall Success Rate: ${(avgSystemMatches/6*100).toFixed(1)}%`);

// Top performers
console.log('\n🏆 TOP 5 PERFORMING ALGORITHMS');
console.log('='.repeat(80));

sortedResults.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.avgMatches.toFixed(3)} avg matches`);
});

// Performance by confidence level
console.log('\n⭐ PERFORMANCE BY CONFIDENCE LEVEL');
console.log('='.repeat(80));

[5, 4, 3].forEach(confidence => {
    const confResults = sortedResults.filter(r => r.confidence === confidence);
    if (confResults.length > 0) {
        const avgForConf = confResults.reduce((sum, r) => sum + r.avgMatches, 0) / confResults.length;
        console.log(`⭐${'⭐'.repeat(confidence-1)} (${confidence} stars): ${avgForConf.toFixed(3)} avg matches (${confResults.length} algorithms)`);
    }
});

console.log('\n✅ HISTORICAL BACKTEST COMPLETE');
console.log(`📅 Analysis Period: ${historical[historical.length-6].date} to ${historical[5].date}`);
console.log(`🧪 Total Test Cases: ${totalDrawsTested} draws`);

// Export summary for further analysis
const summary = {
    testDate: new Date().toISOString().split('T')[0],
    totalDraws: totalDrawsTested,
    systemAverage: avgSystemMatches,
    topPerformers: sortedResults.slice(0, 5).map(r => ({
        name: r.name,
        avgMatches: r.avgMatches,
        confidence: r.confidence
    }))
};

fs.writeFileSync('historical_backtest_summary.json', JSON.stringify(summary, null, 2));
console.log('\n💾 Summary exported to historical_backtest_summary.json');