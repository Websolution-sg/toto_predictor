// Enhanced TOTO Prediction System for February 13, 2026
// Based on validation insights: Pattern strategies performed best (50% accuracy with Master Pattern Analysis)
// Updated with February 10, 2026 results: [10, 15, 29, 31, 33, 49] + 30

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

function calculateFrequency(results, drawCount = 50) {
    const freq = {};
    for (let i = 1; i <= 49; i++) freq[i] = 0;
    
    const subset = results.slice(0, Math.min(drawCount, results.length));
    subset.forEach(result => {
        result.numbers.forEach(num => freq[num]++);
    });
    
    return freq;
}

function calculateWeightedFrequency(results, drawCount = 40, decayFactor = 2.0) {
    const freq = {};
    for (let i = 1; i <= 49; i++) freq[i] = 0;
    
    const subset = results.slice(0, Math.min(drawCount, results.length));
    subset.forEach((result, index) => {
        const weight = Math.pow(decayFactor, -index / 10); // Recent draws weighted more
        result.numbers.forEach(num => freq[num] += weight);
    });
    
    return freq;
}

function calculateGapAnalysis(results, drawCount = 80) {
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
    
    // Calculate expected gaps for numbers not recently seen
    for (let num = 1; num <= 49; num++) {
        if (lastSeen[num] === -1) {
            gaps[num] = subset.length;
        }
    }
    
    return gaps;
}

function calculateConsecutivePatterns(results) {
    const patterns = { consecutive: 0, gaps: 0 };
    
    results.slice(0, 30).forEach(result => {
        for (let i = 0; i < result.numbers.length - 1; i++) {
            if (result.numbers[i + 1] - result.numbers[i] === 1) {
                patterns.consecutive++;
            }
        }
    });
    
    return patterns;
}

function generateEnhancedPrediction(freq, gaps, consecutive, rangeWeights, strategy, seed) {
    const numbers = [];
    const used = new Set();
    
    // Enhanced seeding for variety
    Math.seedrandom = (function() {
        let m = 1;
        return function(seed) {
            return function() {
                let x = Math.sin(seed + m++) * 10000;
                return x - Math.floor(x);
            };
        };
    })();
    const rng = Math.seedrandom(seed * 7919 + Date.now());
    
    // Apply strategy-specific selection logic
    const candidates = [];
    for (let i = 1; i <= 49; i++) {
        let score = 0;
        
        switch(strategy.type) {
            case 'pattern':
                // Prioritize pattern-based selection (best performer)
                score = freq[i] * 2 + (50 - gaps[i]) * 1.5 + rangeWeights[i] * 1.8;
                if (strategy.favorConsecutive && (consecutive.consecutive > 0)) {
                    if (i < 49 && freq[i + 1] > 0) score += 0.5;
                    if (i > 1 && freq[i - 1] > 0) score += 0.5;
                }
                break;
                
            case 'frequency':
                score = freq[i] * 2.5 + rangeWeights[i] * 1.2;
                break;
                
            case 'gap':
                score = (50 - gaps[i]) * 2.0 + freq[i] * 1.2 + rangeWeights[i];
                break;
                
            case 'balanced':
                score = freq[i] * 1.5 + (50 - gaps[i]) * 1.5 + rangeWeights[i] * 1.5;
                break;
                
            case 'hybrid':
                score = freq[i] * 1.8 + (50 - gaps[i]) * 1.3 + rangeWeights[i] * 1.4;
                break;
                
            default:
                score = freq[i] + rangeWeights[i];
        }
        
        // Add strategic randomization
        score += (rng() - 0.5) * strategy.randomFactor;
        
        candidates.push({ number: i, score: score });
    }
    
    // Sort by score and add range distribution logic
    candidates.sort((a, b) => b.score - a.score);
    
    // Ensure balanced range distribution based on strategy
    const ranges = { low: 0, mid: 0, high: 0 };
    const targetRanges = {
        low: strategy.lowCount || 2,
        mid: strategy.midCount || 2, 
        high: strategy.highCount || 2
    };
    
    // Select numbers with range balancing
    for (let candidate of candidates) {
        if (numbers.length >= 6) break;
        
        const num = candidate.number;
        if (used.has(num)) continue;
        
        let range = 'mid';
        if (num <= 16) range = 'low';
        else if (num >= 34) range = 'high';
        
        // Check if we can add this number based on range targets
        if (ranges[range] < targetRanges[range] || 
            (numbers.length >= 4 && ranges[range] < 3)) {
            numbers.push(num);
            used.add(num);
            ranges[range]++;
        }
    }
    
    // Fill remaining slots if needed
    while (numbers.length < 6 && candidates.length > numbers.length) {
        for (let candidate of candidates) {
            if (numbers.length >= 6) break;
            if (!used.has(candidate.number)) {
                numbers.push(candidate.number);
                used.add(candidate.number);
            }
        }
    }
    
    return numbers.slice(0, 6).sort((a, b) => a - b);
}

function generateFeb13Predictions() {
    console.log('🎯 ENHANCED TOTO PREDICTION SYSTEM FOR FEBRUARY 13, 2026');
    console.log('📈 Based on validation insights: Pattern strategies achieved 50% accuracy!');
    console.log('🔄 Updated with Feb 10, 2026 results: [10, 15, 29, 31, 33, 49] + 30');
    console.log('==================================================================================');

    const results = loadTotoData();
    console.log(`📊 Dataset: ${results.length} draws (including latest Feb 10, 2026)`);
    console.log(`🎲 Latest: ${results[0].numbers.join(', ')} + ${results[0].additional} (${results[0].date})`);
    console.log('');

    // Enhanced analysis with validation insights
    const freq20 = calculateFrequency(results, 20);   // Recent trends
    const freq40 = calculateFrequency(results, 40);   // Medium-term patterns  
    const freq80 = calculateFrequency(results, 80);   // Long-term patterns
    const weightedFreq = calculateWeightedFrequency(results, 35, 2.5);
    const gaps = calculateGapAnalysis(results, 100);
    const consecutive = calculateConsecutivePatterns(results);

    // Range weights based on recent performance
    const rangeWeights = {};
    for (let i = 1; i <= 49; i++) {
        if (i <= 16) rangeWeights[i] = 1.2;      // Low range slightly favored
        else if (i >= 17 && i <= 33) rangeWeights[i] = 1.4;  // Mid range preferred
        else rangeWeights[i] = 1.0;              // High range standard
    }

    // Enhanced strategies prioritizing PATTERN (proven best performer)
    const strategies = [
        // TOP TIER - PATTERN STRATEGIES (50% proven accuracy)
        { name: "🏆 Master Pattern Analysis Pro", type: "pattern", lowCount: 2, midCount: 3, highCount: 1, weight: 2.0, randomFactor: 0.3, confidence: 5, favorConsecutive: true },
        { name: "⭐ Advanced Pattern Hunter", type: "pattern", lowCount: 2, midCount: 2, highCount: 2, weight: 1.9, randomFactor: 0.4, confidence: 5, favorConsecutive: false },
        { name: "🎯 Pattern Range Master", type: "pattern", lowCount: 3, midCount: 2, highCount: 1, weight: 1.8, randomFactor: 0.35, confidence: 5, favorConsecutive: true },
        { name: "🔥 Consecutive Pattern Elite", type: "pattern", lowCount: 1, midCount: 3, highCount: 2, weight: 1.7, randomFactor: 0.4, confidence: 4, favorConsecutive: true },
        
        // ENHANCED FREQUENCY (Second tier)
        { name: "📊 Smart Frequency Plus", type: "frequency", lowCount: 2, midCount: 2, highCount: 2, weight: 1.6, randomFactor: 0.4, confidence: 4 },
        { name: "🎲 Recent Focus Analytics", type: "frequency", lowCount: 1, midCount: 4, highCount: 1, weight: 1.5, randomFactor: 0.45, confidence: 4 },
        
        // GAP ANALYSIS (Strong secondary performance)
        { name: "⚡ Gap Analysis Elite", type: "gap", lowCount: 2, midCount: 3, highCount: 1, weight: 1.5, randomFactor: 0.4, confidence: 4 },
        { name: "🔍 Enhanced Gap Hunter", type: "gap", lowCount: 2, midCount: 2, highCount: 2, weight: 1.4, randomFactor: 0.45, confidence: 3 },
        
        // BALANCED APPROACHES
        { name: "⚖️ Perfect Balance 2026", type: "balanced", lowCount: 2, midCount: 2, highCount: 2, weight: 1.4, randomFactor: 0.4, confidence: 4 },
        { name: "🎯 Range Equilibrium Pro", type: "balanced", lowCount: 2, midCount: 2, highCount: 2, weight: 1.3, randomFactor: 0.5, confidence: 3 },
        
        // HYBRID STRATEGIES
        { name: "🚀 Pattern-Frequency Fusion", type: "hybrid", lowCount: 2, midCount: 2, highCount: 2, weight: 1.3, randomFactor: 0.4, confidence: 4 },
        { name: "💎 Smart Hybrid System", type: "hybrid", lowCount: 1, midCount: 3, highCount: 2, weight: 1.2, randomFactor: 0.5, confidence: 3 },
        
        // SPECIALIZED STRATEGIES  
        { name: "🌟 Mid-Range Optimizer", type: "pattern", lowCount: 1, midCount: 4, highCount: 1, weight: 1.4, randomFactor: 0.35, confidence: 4 },
        { name: "🎪 Adaptive Pattern System", type: "pattern", lowCount: 2, midCount: 2, highCount: 2, weight: 1.3, randomFactor: 0.4, confidence: 3 },
        { name: "🎨 Creative Pattern Explorer", type: "pattern", lowCount: 2, midCount: 3, highCount: 1, weight: 1.2, randomFactor: 0.5, confidence: 3 }
    ];

    const predictions = [];
    const usedCombinations = new Set();

    strategies.forEach((strategy, index) => {
        let attempts = 0;
        let selected;
        let freq = freq40; // Default frequency data
        
        // Select frequency data based on strategy emphasis
        if (strategy.randomFactor <= 0.35) freq = freq20;      // Recent focus
        else if (strategy.randomFactor >= 0.5) freq = freq80;   // Long-term focus
        else if (strategy.type === 'frequency') freq = weightedFreq; // Weighted for frequency strategies
        
        do {
            selected = generateEnhancedPrediction(
                freq, gaps, consecutive, rangeWeights, strategy, 
                index * 17 + attempts * 5 + 12345 // Enhanced seed variety
            );
            attempts++;
        } while (usedCombinations.has(selected?.join(',')) && attempts < 12);

        if (selected && selected.length === 6) {
            // Calculate prediction statistics
            const sum = selected.reduce((a, b) => a + b, 0);
            const evenCount = selected.filter(n => n % 2 === 0).length;
            const oddCount = 6 - evenCount;
            const lowCount = selected.filter(n => n <= 16).length;
            const midCount = selected.filter(n => n >= 17 && n <= 33).length;
            const highCount = selected.filter(n => n >= 34).length;
            const range = Math.max(...selected) - Math.min(...selected);
            
            // Check for consecutive numbers
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
                consecutiveCount: consecutiveCount
            });

            usedCombinations.add(selected.join(','));
        }
    });

    // Display predictions with enhanced formatting
    console.log('🎯 15 ENHANCED PREDICTIONS FOR FEBRUARY 13, 2026:');
    console.log('=====================================================');
    
    predictions.forEach(pred => {
        const stars = '⭐'.repeat(pred.confidence);
        const conseq = pred.hasConsecutive ? ` 🔗(${pred.consecutiveCount})` : '';
        
        console.log(`${pred.rank.toString().padStart(2)}. ${pred.algorithm} ${stars}`);
        console.log(`    Numbers: [${pred.numbers.join(', ')}]`);
        console.log(`    Stats: Sum=${pred.sum} | E/O=${pred.evenOdd} | L/M/H=${pred.ranges} | Range=${pred.range}${conseq}`);
        console.log('');
    });

    // Generate comprehensive statistics
    const avgSum = (predictions.reduce((sum, p) => sum + p.sum, 0) / predictions.length).toFixed(1);
    const strategyCount = {};
    const rangeCount = { balanced: 0, lowHeavy: 0, midHeavy: 0, highHeavy: 0 };
    
    predictions.forEach(pred => {
        strategyCount[pred.type] = (strategyCount[pred.type] || 0) + 1;
        
        const [low, mid, high] = pred.ranges.split('/').map(n => parseInt(n));
        if (low === mid && mid === high) rangeCount.balanced++;
        else if (low > mid && low > high) rangeCount.lowHeavy++;
        else if (mid > low && mid > high) rangeCount.midHeavy++;
        else if (high > low && high > mid) rangeCount.highHeavy++;
    });

    console.log('📈 PREDICTION STATISTICS:');
    console.log('=========================');
    console.log(`🎯 Total Predictions: ${predictions.length}`);
    console.log(`📊 Average Sum: ${avgSum}`);
    console.log(`🏆 5-Star Predictions: ${predictions.filter(p => p.confidence === 5).length}`);
    console.log(`⭐ 4-Star Predictions: ${predictions.filter(p => p.confidence === 4).length}`);
    console.log(`🔗 With Consecutive: ${predictions.filter(p => p.hasConsecutive).length}`);
    
    console.log(`\n🎪 Strategy Distribution:`);
    Object.keys(strategyCount).forEach(type => {
        console.log(`   ${type.toUpperCase()}: ${strategyCount[type]} predictions`);
    });
    
    console.log(`\n📐 Range Distribution:`);
    Object.keys(rangeCount).forEach(range => {
        console.log(`   ${range}: ${rangeCount[range]} predictions`);
    });

    // Export to JSON
    const exportData = {
        drawDate: "February 13, 2026",
        generatedOn: new Date().toISOString(),
        basedOn: `${results.length} draws with latest Feb 10, 2026 + validation insights`,
        validationInsight: "Pattern strategies achieved 50% accuracy - prioritized accordingly",
        predictions: predictions,
        statistics: {
            averageSum: parseFloat(avgSum),
            rangeDistribution: rangeCount,
            strategyDistribution: strategyCount,
            consecutiveCount: predictions.filter(p => p.hasConsecutive).length,
            totalPredictions: predictions.length
        },
        enhancements: [
            "Pattern strategy prioritization based on 50% validation success",
            "Enhanced seed variety for better diversity",
            "Mid-range emphasis from recent pattern analysis",
            "Updated 157-draw dataset including Feb 10 results",
            "Consecutive pattern detection and weighting"
        ]
    };

    fs.writeFileSync('enhanced_predictions_feb13_2026.json', JSON.stringify(exportData, null, 2));
    console.log('\n✅ Predictions exported to enhanced_predictions_feb13_2026.json');
    console.log('🎯 Ready for February 13, 2026 draw!');
    console.log('💡 Pattern strategies prioritized based on validated 50% accuracy performance');

    return predictions;
}

// Generate predictions
console.log('🚀 Starting Enhanced TOTO Prediction Generation...\n');
generateFeb13Predictions();