// ADAPTIVE TOTO Prediction System for February 19, 2026
// Learning from Pattern Volatility: Feb 13 (50% success) vs Feb 16 (0% success)  
// Key Insights: Diversification critical, Mid-range emphasis, Pattern volatility accommodation
// Updated with February 16, 2026 results: [13, 24, 28, 34, 37, 44] + 29

const fs = require('fs');

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
    return results.reverse(); // Most recent first
}

function calculateAdaptiveFrequency(results, drawCount = 30, volatilityFactor = 1.0) {
    const freq = {};
    for (let i = 1; i <= 49; i++) freq[i] = 0;
    
    const subset = results.slice(0, Math.min(drawCount, results.length));
    subset.forEach((result, index) => {
        // Reduced recent weighting due to volatility learning
        const weight = Math.pow(1.5, -index / (12 * volatilityFactor));
        result.numbers.forEach(num => freq[num] += weight);
    });
    
    return freq;
}

function calculateVolatilityWeights(results) {
    const weights = {};
    for (let i = 1; i <= 49; i++) weights[i] = 1.0;
    
    // LEARNING: Avoid heavy bias towards previous winners (caused Feb 16 miss)
    // Only slight boost instead of 50% boost
    const recentNumbers = [...results[0].numbers, ...results[1].numbers]; // Last 2 draws
    recentNumbers.forEach(num => {
        weights[num] = 0.8; // Actually reduce recent number weights
    });
    
    // LEARNING: Mid-range emphasis (17-33) based on Feb 16 pattern  
    for (let i = 17; i <= 33; i++) {
        weights[i] = 1.3; // 30% boost for mid-range
    }
    
    // LEARNING: Even number emphasis (Feb 16 was 4/2 even/odd)
    for (let i = 2; i <= 48; i += 2) {
        weights[i] *= 1.15; // 15% boost for evens
    }
    
    // LEARNING: Higher number ranges (Feb 16 sum was 180)
    for (let i = 20; i <= 40; i++) {
        weights[i] *= 1.1; // Favor mid-to-high ranges
    }
    
    return weights;
}

function calculateGapAnalysisAdaptive(results, drawCount = 40) {
    const gaps = {};
    const lastSeen = {};
    
    for (let i = 1; i <= 49; i++) {
        gaps[i] = 0;
        lastSeen[i] = -1;
    }
    
    const subset = results.slice(0, Math.min(drawCount, results.length));
    subset.forEach((result, index) => {
        for (let num = 1; num <= 49; num++) {
            if (result.numbers.includes(num)) {
                gaps[num] = index - lastSeen[num];
                lastSeen[num] = index;
            }
        }
    });
    
    // Enhanced gap scoring with volatility adjustment
    for (let num = 1; num <= 49; num++) {
        if (lastSeen[num] === -1) {
            gaps[num] = subset.length * 1.2; // Slightly higher penalty for never-seen
        }
    }
    
    return gaps;
}

function generateDiversifiedPrediction(freq, gaps, volatilityWeights, strategy, seed) {
    const numbers = [];
    const used = new Set();
    
    // Enhanced diversification seeding
    Math.seedrandom = (function() {
        let m = 1;
        return function(seed) {
            return function() {
                let x = Math.sin(seed + m++ + strategy.diversityOffset) * 10000;
                return x - Math.floor(x);
            };
        };
    })();
    const rng = Math.seedrandom(seed * strategy.prime + strategy.diversityOffset + Date.now());
    
    // Build candidates with DIVERSIFIED scoring
    const candidates = [];
    for (let i = 1; i <= 49; i++) {
        let score = 0;
        
        switch(strategy.type) {
            case 'diverse_balanced':
                // New category: True diversification
                score = freq[i] * 1.5 + (60 - gaps[i]) * 1.5 + volatilityWeights[i] * 1.8;
                break;
                
            case 'mid_heavy':
                // LEARNING: Mid-range focus from Feb 16 
                score = freq[i] * 1.2 + volatilityWeights[i] * 2.0;
                if (i >= 17 && i <= 33) score += 2.0; // Strong mid-range boost
                break;
                
            case 'high_sum':
                // LEARNING: Higher sum targeting (Feb 16 = 180)
                score = freq[i] * 1.0 + volatilityWeights[i] * 1.5;
                if (i >= 25) score += 1.5; // Favor higher numbers for sum boost
                break;
                
            case 'even_favor':
                // LEARNING: Even number preference (Feb 16 = 4/2)
                score = freq[i] * 1.3 + volatilityWeights[i] * 1.5;
                if (i % 2 === 0) score += 1.0;
                break;
                
            case 'gap_adaptive':
                // Enhanced gap with volatility awareness
                score = (70 - gaps[i]) * 2.0 + freq[i] * 1.0 + volatilityWeights[i] * 1.3;
                break;
                
            case 'range_spread':
                // Wide range coverage
                score = freq[i] * 1.1 + volatilityWeights[i] * 1.6;
                break;
                
            default:
                score = freq[i] * 1.2 + (50 - gaps[i]) * 1.0 + volatilityWeights[i] * 1.4;
        }
        
        // Strategy-specific diversification bonuses
        if (strategy.favorMid && i >= 17 && i <= 33) score += 1.5;
        if (strategy.favorEven && i % 2 === 0) score += 0.8;
        if (strategy.favorHigh && i >= 34) score += 1.0;
        if (strategy.favorSum && i >= 20 && i <= 35) score += 0.7;
        
        // CRITICAL: Enhanced diversification randomization
        score += (rng() - 0.5) * strategy.randomFactor;
        
        candidates.push({ number: i, score: score });
    }
    
    // Sort and apply FORCED diversification selection
    candidates.sort((a, b) => b.score + (a.number * strategy.diversityOffset * 0.001) - a.score);
    
    // DIVERSIFIED range-balanced selection with volatility accommodation
    const ranges = { low: 0, mid: 0, high: 0 };
    const targetRanges = {
        low: strategy.lowCount || 2,
        mid: strategy.midCount || 2, 
        high: strategy.highCount || 2
    };
    
    // Primary selection with FORCED range diversification
    let candidateIndex = 0;
    while (numbers.length < 6 && candidateIndex < candidates.length) {
        const candidate = candidates[candidateIndex];
        const num = candidate.number;
        
        if (used.has(num)) {
            candidateIndex++;
            continue;
        }
        
        let range = 'mid';
        if (num <= 16) range = 'low';
        else if (num >= 34) range = 'high';
        
        // Enhanced range balancing with flexibility for volatility
        const totalRangesTaken = ranges.low + ranges.mid + ranges.high;
        const needsThisRange = ranges[range] < targetRanges[range];
        const canTakeAnyRange = totalRangesTaken >= 4; // More flexible after 4 numbers
        
        if (needsThisRange || canTakeAnyRange) {
            numbers.push(num);
            used.add(num);
            ranges[range]++;
        }
        
        candidateIndex++;
    }
    
    // Emergency fill if needed
    while (numbers.length < 6 && candidateIndex < candidates.length) {
        const candidate = candidates[candidateIndex];
        if (!used.has(candidate.number)) {
            numbers.push(candidate.number);
            used.add(candidate.number);
        }
        candidateIndex++;
    }
    
    return numbers.slice(0, 6).sort((a, b) => a - b);
}

function generateAdaptiveFeb19Predictions() {
    console.log('🔄 ADAPTIVE TOTO PREDICTION SYSTEM FOR FEBRUARY 19, 2026');
    console.log('📚 Learning from Pattern Volatility: Feb 13 (50% success) vs Feb 16 (0% success)');
    console.log('🎯 Key Adaptations: Diversification focus, Mid-range emphasis, Volatility accommodation');
    console.log('⚠️  Updated with Feb 16, 2026 results: [13, 24, 28, 34, 37, 44] + 29');
    console.log('==================================================================================');

    const results = loadTotoData();
    console.log(`📊 Enhanced Dataset: ${results.length} draws (including Feb 16 volatility data)`);
    console.log(`🎲 Latest: ${results[0].numbers.join(', ')} + ${results[0].additional} (${results[0].date})`);
    console.log(`💡 Learning: Pattern shifts require diversification & volatility adaptation`);
    console.log('');

    // Adaptive analysis incorporating volatility lessons
    const freq20 = calculateAdaptiveFrequency(results, 20, 1.0);
    const freq40 = calculateAdaptiveFrequency(results, 40, 1.2);
    const freq60 = calculateAdaptiveFrequency(results, 60, 1.5);
    const gaps = calculateGapAnalysisAdaptive(results);
    const volatilityWeights = calculateVolatilityWeights(results);

    // DIVERSIFIED strategies with volatility accommodation
    const strategies = [
        // TIER 1: MAXIMUM DIVERSIFICATION (Learning from convergence failure)
        { name: "🌈 Ultra Diversified System", type: "diverse_balanced", lowCount: 2, midCount: 2, highCount: 2, randomFactor: 1.0, confidence: 4, diversityOffset: 1.618, prime: 101, favorMid: true },
        { name: "🎯 Spread Spectrum Analyzer", type: "range_spread", lowCount: 1, midCount: 3, highCount: 2, randomFactor: 1.2, confidence: 4, diversityOffset: 2.718, prime: 103, favorSum: true },
        { name: "⚡ Volatility Adaptive", type: "diverse_balanced", lowCount: 3, midCount: 1, highCount: 2, randomFactor: 0.9, confidence: 4, diversityOffset: 3.141, prime: 107, favorEven: true },
        
        // TIER 2: MID-RANGE EMPHASIS (Feb 16 learning)
        { name: "🎪 Mid-Range Specialist", type: "mid_heavy", lowCount: 1, midCount: 4, highCount: 1, randomFactor: 0.8, confidence: 4, diversityOffset: 1.414, prime: 109, favorMid: true },
        { name: "📊 Central Pattern Focus", type: "mid_heavy", lowCount: 2, midCount: 3, highCount: 1, randomFactor: 1.0, confidence: 3, diversityOffset: 1.732, prime: 113, favorMid: true },
        { name: "🌟 Mid-Heavy Optimizer", type: "mid_heavy", lowCount: 1, midCount: 3, highCount: 2, randomFactor: 0.9, confidence: 4, diversityOffset: 2.236, prime: 127, favorMid: true, favorSum: true },
        
        // TIER 3: HIGH SUM TARGETING (Feb 16 = 180)
        { name: "🔥 High Sum Hunter", type: "high_sum", lowCount: 1, midCount: 2, highCount: 3, randomFactor: 0.7, confidence: 3, diversityOffset: 2.449, prime: 131, favorSum: true, favorHigh: true },
        { name: "💎 Sum Optimizer Pro", type: "high_sum", lowCount: 2, midCount: 1, highCount: 3, randomFactor: 0.8, confidence: 3, diversityOffset: 2.646, prime: 137, favorSum: true },
        
        // TIER 4: EVEN NUMBER EMPHASIS (Feb 16 = 4/2)
        { name: "⚖️ Even Preference System", type: "even_favor", lowCount: 2, midCount: 2, highCount: 2, randomFactor: 0.6, confidence: 3, diversityOffset: 2.828, prime: 139, favorEven: true },
        { name: "🎲 Balanced Even Focus", type: "even_favor", lowCount: 1, midCount: 3, highCount: 2, randomFactor: 0.7, confidence: 3, diversityOffset: 3.000, prime: 149, favorEven: true, favorMid: true },
        
        // TIER 5: ADAPTIVE GAP ANALYSIS
        { name: "🔍 Gap Volatility Tracker", type: "gap_adaptive", lowCount: 2, midCount: 2, highCount: 2, randomFactor: 0.8, confidence: 3, diversityOffset: 3.317, prime: 151, favorMid: true },
        { name: "⚗️ Enhanced Gap System", type: "gap_adaptive", lowCount: 1, midCount: 2, highCount: 3, randomFactor: 1.0, confidence: 3, diversityOffset: 3.606, prime: 157, favorSum: true },
        
        // TIER 6: EXPERIMENTAL DIVERSIFICATION
        { name: "🎨 Pattern Breaker", type: "diverse_balanced", lowCount: 2, midCount: 2, highCount: 2, randomFactor: 1.5, confidence: 3, diversityOffset: 3.873, prime: 163, },
        { name: "🌀 Chaos Adaptive", type: "range_spread", lowCount: 1, midCount: 1, highCount: 4, randomFactor: 1.3, confidence: 3, diversityOffset: 4.123, prime: 167, favorHigh: true },
        { name: "🔮 Volatility Echo", type: "diverse_balanced", lowCount: 3, midCount: 2, highCount: 1, randomFactor: 1.1, confidence: 3, diversityOffset: 4.359, prime: 173, favorMid: true }
    ];

    const predictions = [];
    const usedCombinations = new Set();

    strategies.forEach((strategy, index) => {
        let attempts = 0;
        let selected;
        let freq = freq40; // Default
        
        // Frequency selection based on strategy type
        if (strategy.type === 'diverse_balanced' || strategy.type === 'range_spread') freq = freq20;
        else if (strategy.randomFactor >= 1.0) freq = freq60;
        
        do {
            selected = generateDiversifiedPrediction(
                freq, gaps, volatilityWeights, strategy,
                index * strategy.prime + attempts * 13 + 98765
            );
            attempts++;
        } while (usedCombinations.has(selected?.join(',')) && attempts < 20); // More attempts for diversity

        if (selected && selected.length === 6) {
            // Enhanced statistics with volatility insights
            const sum = selected.reduce((a, b) => a + b, 0);
            const evenCount = selected.filter(n => n % 2 === 0).length;
            const oddCount = 6 - evenCount;
            const lowCount = selected.filter(n => n <= 16).length;
            const midCount = selected.filter(n => n >= 17 && n <= 33).length;
            const highCount = selected.filter(n => n >= 34).length;
            const range = Math.max(...selected) - Math.min(...selected);
            const midRangeNumbers = selected.filter(n => n >= 17 && n <= 33);
            
            predictions.push({
                rank: index + 1,
                algorithm: strategy.name,
                numbers: selected,
                sum: sum,
                evenOdd: `${evenCount}/${oddCount}`,
                ranges: `${lowCount}/${midCount}/${highCount}`,
                range: range,
                type: strategy.type,
                confidence: strategy.confidence,
                diversityScore: strategy.diversityOffset,
                hasMidFocus: midCount >= 3,
                sumCategory: sum >= 160 ? 'High' : sum >= 140 ? 'Medium' : 'Low'
            });

            usedCombinations.add(selected.join(','));
        }
    });

    // Display with emphasis on diversity and learning
    console.log('🌈 15 ADAPTIVE & DIVERSIFIED PREDICTIONS FOR FEBRUARY 19, 2026:');
    console.log('================================================================');
    
    predictions.forEach(pred => {
        const stars = '⭐'.repeat(pred.confidence);
        const midFocus = pred.hasMidFocus ? ' 🎯' : '';
        const sumLabel = pred.sumCategory === 'High' ? ' 🔥' : pred.sumCategory === 'Medium' ? ' ⚖️' : ' ❄️';
        const diversityIcon = pred.diversityScore > 3.0 ? ' 🌈' : ' 🎪';
        
        console.log(`${pred.rank.toString().padStart(2)}. ${pred.algorithm} ${stars}`);
        console.log(`    Numbers: [${pred.numbers.join(', ')}]`);
        console.log(`    Stats: Sum=${pred.sum}${sumLabel} | E/O=${pred.evenOdd} | L/M/H=${pred.ranges}${midFocus} | Range=${pred.range}${diversityIcon}`);
        console.log('');
    });

    // Enhanced statistics with volatility learning insights
    const avgSum = (predictions.reduce((sum, p) => sum + p.sum, 0) / predictions.length).toFixed(1);
    const sumDistribution = { High: 0, Medium: 0, Low: 0 };
    const typeDistribution = {};
    const midFocusCount = predictions.filter(p => p.hasMidFocus).length;
    const uniqueCombinations = new Set(predictions.map(p => p.numbers.join(','))).size;
    
    predictions.forEach(pred => {
        sumDistribution[pred.sumCategory]++;
        typeDistribution[pred.type] = (typeDistribution[pred.type] || 0) + 1;
    });

    console.log('📈 ADAPTIVE PREDICTION STATISTICS:');
    console.log('==================================');
    console.log(`🎯 Total Predictions: ${predictions.length}`);
    console.log(`📊 Average Sum: ${avgSum} (adapted for higher targeting)`);
    console.log(`🌈 Unique Combinations: ${uniqueCombinations}/15 (${((uniqueCombinations/15)*100).toFixed(1)}% diversification)`);
    console.log(`🎪 Mid-Range Focus: ${midFocusCount} predictions (learning from Feb 16)`);
    console.log(`⭐ High Confidence: ${predictions.filter(p => p.confidence === 4).length} predictions`);
    
    console.log(`\n🔥 Sum Distribution (Learning from Feb 16 = 180):`);
    Object.keys(sumDistribution).forEach(cat => {
        console.log(`   ${cat} Sum (${cat === 'High' ? '160+' : cat === 'Medium' ? '140-159' : '<140'}): ${sumDistribution[cat]} predictions`);
    });
    
    console.log(`\n🎪 Strategy Type Distribution (Diversified):`);
    Object.keys(typeDistribution).forEach(type => {
        const percentage = ((typeDistribution[type] / predictions.length) * 100).toFixed(1);
        console.log(`   ${type.replace(/_/g, ' ').toUpperCase()}: ${typeDistribution[type]} (${percentage}%)`);
    });

    // Export with learning emphasis
    const exportData = {
        drawDate: "February 19, 2026",
        generatedOn: new Date().toISOString(),
        basedOn: `${results.length} draws + volatility learning from Feb 13 vs Feb 16`,
        learningInsights: "Complete miss on Feb 16 taught us diversification is critical",
        majorAdaptations: [
            "Maximum diversification - unique combinations prioritized",
            "Mid-range emphasis (17-33) from Feb 16 pattern analysis", 
            "Reduced recent number bias - avoid over-optimization trap",
            "Higher sum targeting (160+) based on Feb 16 sum=180",
            "Even number preference incorporated",
            "Enhanced volatility accommodation in all algorithms"
        ],
        predictions: predictions,
        statistics: {
            averageSum: parseFloat(avgSum),
            uniqueCombinations: uniqueCombinations,
            diversificationRate: parseFloat(((uniqueCombinations/15)*100).toFixed(1)),
            sumDistribution: sumDistribution,
            typeDistribution: typeDistribution,
            midFocusCount: midFocusCount,
            totalPredictions: predictions.length
        }
    };

    fs.writeFileSync('adaptive_predictions_feb19_2026.json', JSON.stringify(exportData, null, 2));
    
    console.log('\n🔄 ADAPTIVE LEARNING COMPLETE!');
    console.log('✅ Predictions exported to adaptive_predictions_feb19_2026.json');
    console.log('🎯 Ready for February 19, 2026 - $1,000,000 jackpot!');
    console.log('🌈 System adapted with maximum diversification and volatility learning');
    console.log('📚 Key Learning: Pattern volatility requires adaptive, not convergent strategies');

    return predictions;
}

// Generate adaptive predictions
console.log('🚀 Starting ADAPTIVE TOTO Prediction Generation with Volatility Learning...\n');
generateAdaptiveFeb19Predictions();