// IMPROVED WEIGHTED RECENT ANALYSIS METHOD
// Fixes the issue where different ranges produce identical results

function improvedWeightedRecentPrediction(totoData, basesArray, rangeCount = 20) {
    console.log(`🎯 IMPROVED Weighted Recent Analysis (Range: ${rangeCount})`);
    
    // Ensure we don't exceed available data
    const actualRange = Math.min(rangeCount, totoData.length);
    const recentData = totoData.slice(0, actualRange);
    
    console.log(`📊 Using ${actualRange} most recent draws for analysis`);
    
    const weighted = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    // IMPROVED: Use gentler exponential decay instead of harsh linear decay
    // New formula: Math.pow(0.85, index) provides gradual decay
    // Old formula: 1 / (index + 1) was too aggressive
    
    recentData.forEach((draw, index) => {
        // IMPROVED WEIGHT CALCULATION
        // Old: const weight = 1 / (index + 1);  // Too aggressive!
        const weight = Math.pow(0.85, index);     // Gentler decay
        
        const pool = [...draw.numbers]; // Include additional number for better analysis
        if (draw.additional && !pool.includes(draw.additional)) {
            pool.push(draw.additional);
        }
        
        // Weight frequency analysis
        pool.forEach(n => {
            if (n >= 1 && n <= 49) {
                weighted[n] += weight;
            }
        });
        
        // Compatibility analysis with base numbers
        basesArray.forEach(base => {
            if (pool.includes(base)) {
                pool.filter(n => n !== base).forEach(n => {
                    if (n >= 1 && n <= 49) {
                        compat[n] += weight;
                    }
                });
            }
        });
        
        console.log(`   Draw ${index + 1}: [${draw.numbers.join(',')}] Weight: ${weight.toFixed(4)} (vs old: ${(1/(index+1)).toFixed(4)})`);
    });
    
    // Calculate final scores and get predictions
    const suggestions = weighted.map((weight, n) => ({
        number: n,
        weight: weight,
        compatibility: compat[n],
        totalScore: weight + compat[n],
        confidence: Math.min(95, 60 + (weight + compat[n]) * 10) // Dynamic confidence
    }))
    .filter(item => item.number >= 1 && item.number <= 49 && !basesArray.includes(item.number))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
    
    // Calculate method statistics
    const totalWeight = weighted.reduce((sum, w) => sum + w, 0);
    const avgScore = suggestions.length > 0 ? suggestions.reduce((sum, s) => sum + s.totalScore, 0) / suggestions.length : 0;
    const maxWeight = Math.max(...weighted.filter(w => w > 0));
    const minWeight = Math.min(...weighted.filter(w => w > 0));
    
    console.log(`📈 Weight Distribution: ${minWeight.toFixed(4)} to ${maxWeight.toFixed(4)}`);
    console.log(`📊 Average Prediction Score: ${avgScore.toFixed(3)}`);
    console.log('');
    
    return {
        method: 'Improved Weighted Recent Analysis',
        range: actualRange,
        predictions: suggestions.slice(0, 6).map(s => s.number),
        confidence: Math.round(suggestions.length > 0 ? suggestions[0].confidence : 50),
        details: {
            weightFormula: 'Math.pow(0.85, index)',
            totalDrawsAnalyzed: actualRange,
            predictions: suggestions.map(s => ({
                number: s.number,
                score: parseFloat(s.totalScore.toFixed(3)),
                weight: parseFloat(s.weight.toFixed(3)),
                compatibility: parseFloat(s.compatibility.toFixed(3)),
                confidence: Math.round(s.confidence)
            }))
        }
    };
}

// Test the improved algorithm with different ranges
function testImprovedWeightedMethod() {
    console.log('🧪 TESTING IMPROVED WEIGHTED METHOD');
    console.log('='.repeat(60));
    
    // Simulate loading data (you would load from CSV in actual implementation)
    const mockData = [
        { numbers: [2,4,8,19,35,39], additional: 14, date: '16-Oct-25' },
        { numbers: [5,31,33,34,38,46], additional: 12, date: '13-Oct-25' },
        { numbers: [13,14,19,22,31,42], additional: 35, date: '9-Oct-25' },
        { numbers: [10,15,22,31,42,48], additional: 25, date: '6-Oct-25' },
        { numbers: [19,22,26,37,40,46], additional: 14, date: '2-Oct-25' },
        { numbers: [15,16,22,34,35,43], additional: 29, date: '29-Sept-25' },
        { numbers: [1,6,9,11,29,36], additional: 33, date: '25-Sept-25' },
        { numbers: [8,15,22,24,43,47], additional: 20, date: '22-Sept-25' },
        { numbers: [6,8,9,20,45,49], additional: 35, date: '18-Sept-25' },
        { numbers: [10,19,25,29,33,37], additional: 47, date: '15-Sept-25' },
        // Add more mock data to test with larger ranges
        ...Array(40).fill().map((_, i) => ({
            numbers: [Math.floor(Math.random()*49)+1, Math.floor(Math.random()*49)+1, Math.floor(Math.random()*49)+1, Math.floor(Math.random()*49)+1, Math.floor(Math.random()*49)+1, Math.floor(Math.random()*49)+1],
            additional: Math.floor(Math.random()*49)+1,
            date: `Mock-${i+1}`
        }))
    ];
    
    const testBases = [1,2,3,4,5,6];
    const testRanges = [5, 10, 20, 50];
    
    console.log('Testing different ranges with improved algorithm:');
    console.log('');
    
    const results = {};
    
    testRanges.forEach(range => {
        console.log(`\n${'='.repeat(40)}`);
        const result = improvedWeightedRecentPrediction(mockData, testBases, range);
        results[range] = result.predictions;
        
        console.log(`🎯 RANGE ${range} RESULTS:`);
        console.log(`   Predictions: [${result.predictions.join(', ')}]`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Method: ${result.method}`);
    });
    
    // Compare results
    console.log('\n📊 RANGE COMPARISON:');
    console.log('='.repeat(40));
    
    Object.entries(results).forEach(([range, predictions]) => {
        console.log(`Range ${range.toString().padStart(3)}: [${predictions.map(p => p.toString().padStart(2)).join(', ')}]`);
    });
    
    // Check for diversity
    const allPredictions = Object.values(results).flat();
    const uniquePredictions = new Set(allPredictions);
    const diversityRatio = uniquePredictions.size / allPredictions.length;
    
    console.log('\n🔍 DIVERSITY ANALYSIS:');
    console.log(`Total predictions: ${allPredictions.length}`);
    console.log(`Unique predictions: ${uniquePredictions.size}`);
    console.log(`Diversity ratio: ${(diversityRatio * 100).toFixed(1)}%`);
    
    if (diversityRatio > 0.7) {
        console.log('✅ GOOD: High diversity between range predictions');
    } else {
        console.log('⚠️  WARNING: Low diversity - algorithm may still need adjustment');
    }
    
    // Weight decay comparison
    console.log('\n📉 WEIGHT DECAY COMPARISON:');
    console.log('Position | Old Formula | New Formula | Improvement');
    console.log('-'.repeat(50));
    
    for (let i = 0; i < 10; i++) {
        const oldWeight = 1 / (i + 1);
        const newWeight = Math.pow(0.85, i);
        const improvement = ((newWeight / oldWeight) * 100).toFixed(1);
        console.log(`${(i+1).toString().padStart(8)} | ${oldWeight.toFixed(4).padStart(11)} | ${newWeight.toFixed(4).padStart(11)} | ${improvement.padStart(10)}%`);
    }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { improvedWeightedRecentPrediction, testImprovedWeightedMethod };
}

// Run test if called directly
if (typeof window === 'undefined' && require.main === module) {
    testImprovedWeightedMethod();
}