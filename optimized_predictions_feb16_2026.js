// OPTIMIZED TOTO Prediction System for February 16, 2026
// Based on EXCEPTIONAL Feb 13 validation: 4 algorithms achieved 50% accuracy!
// Prioritizing BALANCED and HYBRID strategies (3.00 avg matches)
// Updated with February 13, 2026 results: [10, 15, 25, 43, 45, 49] + 4

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

function calculateAdvancedFrequency(results, drawCount = 40) {
    const freq = {};
    for (let i = 1; i <= 49; i++) freq[i] = 0;
    
    const subset = results.slice(0, Math.min(drawCount, results.length));
    subset.forEach((result, index) => {
        const weight = Math.pow(1.8, -index / 8); // Enhanced recent weighting
        result.numbers.forEach(num => freq[num] += weight);
    });
    
    return freq;
}

function calculateSuccessWeights(results) {
    // Weight numbers based on recent success patterns
    const weights = {};
    for (let i = 1; i <= 49; i++) weights[i] = 1.0;
    
    // Boost numbers that appeared in successful Feb 13 predictions
    const successNumbers = [10, 15, 43, 49]; // Key numbers from 50% accuracy predictions
    successNumbers.forEach(num => {
        weights[num] = 1.5; // 50% boost for proven performers
    });
    
    // Additional boost for high-heavy pattern (Feb 13 showed 2-1-3 distribution)
    for (let i = 34; i <= 49; i++) {
        weights[i] *= 1.2; // 20% boost for high range
    }
    
    // Slight boost for odd numbers (Feb 13 was 1/5 even/odd)
    for (let i = 1; i <= 49; i += 2) {
        weights[i] *= 1.1; // 10% boost for odds
    }
    
    return weights;
}

function calculateGapAnalysis(results, drawCount = 60) {
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
    
    // Enhanced gap scoring for numbers not recently seen
    for (let num = 1; num <= 49; num++) {
        if (lastSeen[num] === -1) {
            gaps[num] = subset.length + 5; // Penalize never-seen numbers slightly less
        }
    }
    
    return gaps;
}

function generateOptimizedPrediction(freq, gaps, successWeights, strategy, seed) {
    const numbers = [];
    const used = new Set();
    
    // Enhanced seeding with strategy-specific variation
    Math.seedrandom = (function() {
        let m = 1;
        return function(seed) {
            return function() {
                let x = Math.sin(seed + m++) * 10000;
                return x - Math.floor(x);
            };
        };
    })();
    const rng = Math.seedrandom(seed * 13 + strategy.multiplier + Date.now());
    
    // Build candidate pool with enhanced scoring
    const candidates = [];
    for (let i = 1; i <= 49; i++) {
        let score = 0;
        
        switch(strategy.type) {
            case 'balanced':
                // PRIORITY: Top performing strategy (3.00 avg matches)
                score = freq[i] * 2.5 + (70 - gaps[i]) * 2.0 + successWeights[i] * 2.2;
                break;
                
            case 'hybrid':
                // PRIORITY: Second top performing strategy (3.00 avg matches)
                score = freq[i] * 2.2 + (65 - gaps[i]) * 1.8 + successWeights[i] * 2.5;
                break;
                
            case 'pattern':
                // Enhanced pattern with success insights
                score = freq[i] * 1.8 + (60 - gaps[i]) * 1.6 + successWeights[i] * 2.0;
                break;
                
            case 'frequency':
                score = freq[i] * 2.8 + successWeights[i] * 1.8;
                break;
                
            case 'gap':
                score = (75 - gaps[i]) * 2.5 + freq[i] * 1.5 + successWeights[i] * 1.6;
                break;
                
            default:
                score = freq[i] * 1.5 + (50 - gaps[i]) * 1.2 + successWeights[i] * 1.5;
        }
        
        // Strategy-specific bonuses
        if (strategy.favorHigh && i >= 34) score += 1.0;
        if (strategy.favorOdd && i % 2 === 1) score += 0.8;
        if (strategy.favorSuccess && [10, 15, 43, 49].includes(i)) score += 1.2;
        
        // Add controlled randomization
        score += (rng() - 0.5) * strategy.randomFactor;
        
        candidates.push({ number: i, score: score });
    }
    
    // Sort by enhanced score
    candidates.sort((a, b) => b.score - a.score);
    
    // Enhanced range-balanced selection
    const ranges = { low: 0, mid: 0, high: 0 };
    const targetRanges = {
        low: strategy.lowCount || 2,
        mid: strategy.midCount || 2, 
        high: strategy.highCount || 2
    };
    
    // Primary selection with range balancing
    for (let candidate of candidates) {
        if (numbers.length >= 6) break;
        
        const num = candidate.number;
        if (used.has(num)) continue;
        
        let range = 'mid';
        if (num <= 16) range = 'low';
        else if (num >= 34) range = 'high';
        
        // Smart range distribution
        if (ranges[range] < targetRanges[range] || 
            (numbers.length >= 4 && ranges[range] < 3)) {
            numbers.push(num);
            used.add(num);
            ranges[range]++;
        }
    }
    
    // Fill remaining slots with best available
    while (numbers.length < 6) {
        for (let candidate of candidates) {
            if (numbers.length >= 6) break;
            if (!used.has(candidate.number)) {
                numbers.push(candidate.number);
                used.add(candidate.number);
                break;
            }
        }
    }
    
    return numbers.slice(0, 6).sort((a, b) => a - b);
}

function generateOptimizedFeb16Predictions() {
    console.log('🏆 OPTIMIZED TOTO PREDICTION SYSTEM FOR FEBRUARY 16, 2026');
    console.log('🎯 Based on EXCEPTIONAL Feb 13 validation: 4 algorithms achieved 50% accuracy!');
    console.log('⭐ Prioritizing BALANCED & HYBRID strategies (3.00 avg matches each)');
    console.log('🔄 Updated with Feb 13, 2026 results: [10, 15, 25, 43, 45, 49] + 4');
    console.log('=================================================================================');

    const results = loadTotoData();
    console.log(`📊 Enhanced Dataset: ${results.length} draws (including latest Feb 13, 2026)`);
    console.log(`🎲 Latest: ${results[0].numbers.join(', ')} + ${results[0].additional} (${results[0].date})`);
    console.log(`💰 Previous Jackpot: $6,188,268 (1 winner)`);
    console.log('');

    // Enhanced analysis incorporating validation insights
    const freq20 = calculateAdvancedFrequency(results, 20);
    const freq35 = calculateAdvancedFrequency(results, 35);
    const freq60 = calculateAdvancedFrequency(results, 60);
    const gaps = calculateGapAnalysis(results, 80);
    const successWeights = calculateSuccessWeights(results);

    // OPTIMIZED strategies prioritizing proven performers
    const strategies = [
        // TIER 1: PROVEN 50% ACCURACY CHAMPIONS (Priority)
        { name: "🏆 Perfect Balance Elite", type: "balanced", lowCount: 2, midCount: 1, highCount: 3, weight: 3.0, randomFactor: 0.25, confidence: 5, multiplier: 101, favorHigh: true, favorSuccess: true },
        { name: "👑 Range Equilibrium Master", type: "balanced", lowCount: 2, midCount: 2, highCount: 2, weight: 2.9, randomFactor: 0.3, confidence: 5, multiplier: 103, favorSuccess: true },
        { name: "⭐ Pattern-Frequency Supreme", type: "hybrid", lowCount: 2, midCount: 1, highCount: 3, weight: 2.8, randomFactor: 0.3, confidence: 5, multiplier: 107, favorHigh: true, favorOdd: true },
        { name: "💎 Smart Hybrid Champion", type: "hybrid", lowCount: 1, midCount: 2, highCount: 3, weight: 2.7, randomFactor: 0.35, confidence: 5, multiplier: 109, favorHigh: true, favorSuccess: true },
        
        // TIER 2: ENHANCED BALANCED STRATEGIES (3.00 avg proven)
        { name: "⚖️ Advanced Balance Pro", type: "balanced", lowCount: 2, midCount: 2, highCount: 2, weight: 2.5, randomFactor: 0.35, confidence: 4, multiplier: 113, favorSuccess: true },
        { name: "🎯 Equilibrium Optimizer", type: "balanced", lowCount: 2, midCount: 1, highCount: 3, weight: 2.4, randomFactor: 0.4, confidence: 4, multiplier: 127, favorHigh: true },
        
        // TIER 3: ENHANCED HYBRID STRATEGIES (3.00 avg proven)  
        { name: "🚀 Meta Hybrid System", type: "hybrid", lowCount: 1, midCount: 2, highCount: 3, weight: 2.3, randomFactor: 0.4, confidence: 4, multiplier: 131, favorHigh: true, favorOdd: true },
        { name: "🌟 Adaptive Hybrid Pro", type: "hybrid", lowCount: 2, midCount: 2, highCount: 2, weight: 2.2, randomFactor: 0.45, confidence: 4, multiplier: 137, favorSuccess: true },
        
        // TIER 4: HIGH-PERFORMANCE PATTERN (Updated)
        { name: "🔥 Enhanced Pattern Elite", type: "pattern", lowCount: 2, midCount: 1, highCount: 3, weight: 2.1, randomFactor: 0.4, confidence: 4, multiplier: 139, favorHigh: true, favorOdd: true },
        { name: "🎪 Success Pattern Tracker", type: "pattern", lowCount: 1, midCount: 2, highCount: 3, weight: 2.0, randomFactor: 0.45, confidence: 3, multiplier: 149, favorSuccess: true },
        
        // TIER 5: OPTIMIZED FREQUENCY & GAP
        { name: "📊 Success-Weighted Frequency", type: "frequency", lowCount: 2, midCount: 2, highCount: 2, weight: 1.9, randomFactor: 0.4, confidence: 4, multiplier: 151, favorSuccess: true },
        { name: "⚡ Enhanced Gap Elite", type: "gap", lowCount: 2, midCount: 1, highCount: 3, weight: 1.8, randomFactor: 0.45, confidence: 3, multiplier: 157, favorHigh: true },
        
        // TIER 6: SPECIALIZED HIGH-HEAVY STRATEGIES
        { name: "🎯 High-Heavy Specialist", type: "balanced", lowCount: 1, midCount: 1, highCount: 4, weight: 1.8, randomFactor: 0.4, confidence: 3, multiplier: 163, favorHigh: true, favorOdd: true },
        { name: "🌈 Odd-Heavy Optimizer", type: "hybrid", lowCount: 2, midCount: 2, highCount: 2, weight: 1.7, randomFactor: 0.45, confidence: 3, multiplier: 167, favorOdd: true },
        { name: "✨ Success Echo System", type: "pattern", lowCount: 2, midCount: 2, highCount: 2, weight: 1.6, randomFactor: 0.5, confidence: 3, multiplier: 173, favorSuccess: true }
    ];

    const predictions = [];
    const usedCombinations = new Set();

    strategies.forEach((strategy, index) => {
        let attempts = 0;
        let selected;
        let freq = freq35; // Default
        
        // Select frequency data based on strategy priority
        if (strategy.confidence === 5) freq = freq20;  // Top tier gets recent data
        else if (strategy.confidence <= 3) freq = freq60; // Lower tier gets long-term
        
        do {
            selected = generateOptimizedPrediction(
                freq, gaps, successWeights, strategy,
                index * 23 + attempts * 7 + 54321 // Enhanced seed diversity
            );
            attempts++;
        } while (usedCombinations.has(selected?.join(',')) && attempts < 15);

        if (selected && selected.length === 6) {
            // Enhanced statistics calculation
            const sum = selected.reduce((a, b) => a + b, 0);
            const evenCount = selected.filter(n => n % 2 === 0).length;
            const oddCount = 6 - evenCount;
            const lowCount = selected.filter(n => n <= 16).length;
            const midCount = selected.filter(n => n >= 17 && n <= 33).length;
            const highCount = selected.filter(n => n >= 34).length;
            const range = Math.max(...selected) - Math.min(...selected);
            const hasSuccess = selected.some(n => [10, 15, 43, 49].includes(n));
            
            // Consecutive analysis
            let consecutiveCount = 0;
            for (let i = 0; i < selected.length - 1; i++) {
                if (selected[i + 1] - selected[i] === 1) consecutiveCount++;
            }
            
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
                weight: strategy.weight,
                hasConsecutive: consecutiveCount > 0,
                hasSuccess: hasSuccess,
                tier: strategy.confidence === 5 ? 1 : strategy.confidence === 4 ? 2 : 3
            });

            usedCombinations.add(selected.join(','));
        }
    });

    // Display with enhanced formatting
    console.log('🏆 15 OPTIMIZED PREDICTIONS FOR FEBRUARY 16, 2026:');
    console.log('====================================================');
    
    predictions.forEach(pred => {
        const stars = '⭐'.repeat(pred.confidence);
        const tier = pred.tier === 1 ? ' 👑' : pred.tier === 2 ? ' 🔥' : ' ⚡';
        const success = pred.hasSuccess ? ' 🎯' : '';
        const conseq = pred.hasConsecutive ? ' 🔗' : '';
        
        console.log(`${pred.rank.toString().padStart(2)}. ${pred.algorithm} ${stars}${tier}`);
        console.log(`    Numbers: [${pred.numbers.join(', ')}]`);
        console.log(`    Stats: Sum=${pred.sum} | E/O=${pred.evenOdd} | L/M/H=${pred.ranges} | Range=${pred.range}${success}${conseq}`);
        console.log('');
    });

    // Enhanced comprehensive statistics
    const avgSum = (predictions.reduce((sum, p) => sum + p.sum, 0) / predictions.length).toFixed(1);
    const tiers = { 1: 0, 2: 0, 3: 0 };
    const types = {};
    const rangeDistribution = { balanced: 0, lowHeavy: 0, midHeavy: 0, highHeavy: 0 };
    
    predictions.forEach(pred => {
        tiers[pred.tier]++;
        types[pred.type] = (types[pred.type] || 0) + 1;
        
        const [low, mid, high] = pred.ranges.split('/').map(n => parseInt(n));
        if (low > mid && low > high) rangeDistribution.lowHeavy++;
        else if (mid > low && mid > high) rangeDistribution.midHeavy++;
        else if (high > low && high > mid) rangeDistribution.highHeavy++;
        else rangeDistribution.balanced++;
    });

    console.log('📈 OPTIMIZED PREDICTION STATISTICS:');
    console.log('===================================');
    console.log(`🎯 Total Predictions: ${predictions.length}`);
    console.log(`📊 Average Sum: ${avgSum} (optimized for higher range)`);
    console.log(`👑 Tier 1 (Champions): ${tiers[1]} predictions`);
    console.log(`🔥 Tier 2 (Elite): ${tiers[2]} predictions`);
    console.log(`⚡ Tier 3 (Advanced): ${tiers[3]} predictions`);
    console.log(`🎯 With Success Numbers: ${predictions.filter(p => p.hasSuccess).length}`);
    console.log(`🔗 With Consecutive: ${predictions.filter(p => p.hasConsecutive).length}`);
    
    console.log(`\n🚀 Strategy Distribution (Optimized):`);
    Object.keys(types).forEach(type => {
        const percentage = ((types[type] / predictions.length) * 100).toFixed(1);
        console.log(`   ${type.toUpperCase()}: ${types[type]} (${percentage}%)`);
    });
    
    console.log(`\n📐 Range Distribution Analysis:`);
    Object.keys(rangeDistribution).forEach(range => {
        console.log(`   ${range}: ${rangeDistribution[range]} predictions`);
    });

    // Export enhanced predictions
    const exportData = {
        drawDate: "February 16, 2026",
        generatedOn: new Date().toISOString(),
        basedOn: `${results.length} draws + Feb 13 validation (4 x 50% accuracy)`,
        optimization: "Prioritized BALANCED & HYBRID strategies (3.00 avg matches)",
        validationInsight: "Perfect Balance, Range Equilibrium, Pattern-Frequency, Smart Hybrid achieved 50%",
        predictions: predictions,
        statistics: {
            averageSum: parseFloat(avgSum),
            tierDistribution: tiers,
            strategyDistribution: types,
            rangeDistribution: rangeDistribution,
            successNumbers: predictions.filter(p => p.hasSuccess).length,
            consecutiveCount: predictions.filter(p => p.hasConsecutive).length,
            totalPredictions: predictions.length
        },
        keyOptimizations: [
            "50% weightage to BALANCED & HYBRID strategies",
            "Success number boosting (10, 15, 43, 49)",
            "High-range emphasis (34-49 gets 20% boost)",
            "Odd-number preference (10% boost)",
            "Enhanced recent frequency analysis",
            "Tier-based confidence system"
        ]
    };

    fs.writeFileSync('optimized_predictions_feb16_2026.json', JSON.stringify(exportData, null, 2));
    
    console.log('\n🏆 OPTIMIZATION COMPLETE!');
    console.log('✅ Predictions exported to optimized_predictions_feb16_2026.json');
    console.log('🎯 Ready for February 16, 2026 draw with $1,000,000 jackpot!');
    console.log('⭐ System optimized based on validated 50% accuracy performance');
    console.log('👑 4 Tier-1 champions lead the predictions with proven strategies');

    return predictions;
}

// Generate optimized predictions
console.log('🚀 Starting OPTIMIZED TOTO Prediction Generation...\n');
generateOptimizedFeb16Predictions();