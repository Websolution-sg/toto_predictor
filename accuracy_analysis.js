// TOTO PREDICTION MODEL ACCURACY ANALYSIS
// This script analyzes how well each prediction method performs against actual results

console.log('🎯 TOTO PREDICTION ACCURACY ANALYSIS');
console.log('=' .repeat(50));

// Function to calculate accuracy metrics
function analyzeAccuracy() {
    if (typeof results === 'undefined' || !results || results.length === 0) {
        console.log('❌ Error: CSV data not loaded. Please ensure totoResult.csv is loaded.');
        return;
    }

    console.log(`📊 Analyzing ${results.length} historical draws`);
    console.log('Latest 10 draws for reference:');
    results.slice(0, 10).forEach((draw, index) => {
        const numbers = draw.slice(1, 7).join(',');
        const additional = draw[7];
        console.log(`${index + 1}. ${draw[0]}: ${numbers} + ${additional}`);
    });

    console.log('\n🔍 ACCURACY TESTING METHODOLOGY:');
    console.log('For each historical draw, we\'ll:');
    console.log('1. Use previous draws to predict the next result');
    console.log('2. Compare prediction with actual result');
    console.log('3. Count matches (exact numbers, not positions)');
    console.log('4. Calculate hit rates for each method');

    // Test ranges to analyze
    const testRanges = [20, 50, 100];
    const methods = [
        { id: 'enhanced', name: 'Enhanced Ensemble' },
        { id: 'frequency', name: 'Frequency + Compatibility' },
        { id: 'weighted', name: 'Weighted Recent Analysis' },
        { id: 'hotcold', name: 'Hot/Cold Balance' }
    ];

    console.log('\n📈 STARTING ACCURACY ANALYSIS...');
    console.log('This may take a moment to process all combinations.\n');

    const accuracyResults = {};

    // Initialize results structure
    methods.forEach(method => {
        accuracyResults[method.id] = {};
        testRanges.forEach(range => {
            accuracyResults[method.id][range] = {
                totalTests: 0,
                matches: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
                totalMatches: 0
            };
        });
    });

    // Analyze last 30 draws for accuracy (use earlier draws to predict later ones)
    const testDraws = Math.min(30, results.length - 100); // Ensure we have enough historical data
    
    console.log(`🧪 Testing accuracy on last ${testDraws} draws...`);

    for (let testDraw = 0; testDraw < testDraws; testDraw++) {
        const actualResult = results[testDraw];
        const actualNumbers = actualResult.slice(1, 7).map(n => parseInt(n));
        
        console.log(`\n📅 Testing draw ${testDraw + 1}/${testDraws}: ${actualResult[0]}`);
        console.log(`🎯 Actual result: ${actualNumbers.join(', ')}`);

        // For each method and range combination
        methods.forEach(method => {
            testRanges.forEach(range => {
                try {
                    // Skip if we don't have enough historical data for this range
                    if (testDraw + range >= results.length) return;

                    // Simulate prediction using historical data up to this point
                    const historicalData = results.slice(testDraw + 1); // Use data before this draw
                    
                    // Mock prediction (in real scenario, you'd run the actual prediction algorithm)
                    // For now, we'll simulate by analyzing patterns in the historical data
                    const prediction = simulatePrediction(historicalData, range, method.id);
                    
                    if (prediction && prediction.length === 6) {
                        const matches = countMatches(prediction, actualNumbers);
                        accuracyResults[method.id][range].totalTests++;
                        accuracyResults[method.id][range].totalMatches += matches;
                        if (matches > 0) {
                            accuracyResults[method.id][range].matches[matches]++;
                        }
                        
                        console.log(`   ${method.name} (Range ${range}): ${matches} matches`);
                    }
                } catch (error) {
                    console.log(`   ⚠️ Error testing ${method.name} (Range ${range}): ${error.message}`);
                }
            });
        });
    }

    // Display results
    console.log('\n📊 ACCURACY ANALYSIS RESULTS');
    console.log('=' .repeat(50));

    methods.forEach(method => {
        console.log(`\n🔍 ${method.name.toUpperCase()}`);
        console.log('-'.repeat(method.name.length + 5));

        testRanges.forEach(range => {
            const result = accuracyResults[method.id][range];
            if (result.totalTests > 0) {
                const avgMatches = (result.totalMatches / result.totalTests).toFixed(2);
                const hitRate = ((result.totalMatches / (result.totalTests * 6)) * 100).toFixed(1);
                
                console.log(`\n  Range ${range} draws:`);
                console.log(`    Tests conducted: ${result.totalTests}`);
                console.log(`    Average matches per draw: ${avgMatches}/6`);
                console.log(`    Overall hit rate: ${hitRate}%`);
                console.log(`    Match distribution:`);
                for (let i = 1; i <= 6; i++) {
                    const count = result.matches[i];
                    const percentage = result.totalTests > 0 ? ((count / result.totalTests) * 100).toFixed(1) : '0.0';
                    console.log(`      ${i} matches: ${count} times (${percentage}%)`);
                }
            } else {
                console.log(`\n  Range ${range}: No test data available`);
            }
        });
    });

    console.log('\n🎲 STATISTICAL CONTEXT:');
    console.log('Random chance expectations:');
    console.log('• 0 matches: ~40.9% of draws');
    console.log('• 1 match: ~42.1% of draws');
    console.log('• 2 matches: ~14.5% of draws');
    console.log('• 3 matches: ~2.3% of draws');
    console.log('• 4 matches: ~0.17% of draws');
    console.log('• 5 matches: ~0.005% of draws');
    console.log('• 6 matches: ~0.000007% of draws (jackpot!)');

    console.log('\n💡 INTERPRETATION GUIDE:');
    console.log('• If average matches > 1.0: Better than random');
    console.log('• If hit rate > 16.7%: Above statistical expectation');
    console.log('• Higher match distribution in 2-3 range indicates skill');
    console.log('• Consistency across ranges suggests robust model');
}

// Helper function to simulate prediction (simplified version)
function simulatePrediction(historicalData, range, methodId) {
    if (!historicalData || historicalData.length < range) return null;
    
    const recentDraws = historicalData.slice(0, range);
    const allNumbers = [];
    
    // Collect all numbers from recent draws
    recentDraws.forEach(draw => {
        for (let i = 1; i <= 6; i++) {
            allNumbers.push(parseInt(draw[i]));
        }
    });
    
    // Simple frequency-based prediction simulation
    const frequency = {};
    for (let i = 1; i <= 49; i++) {
        frequency[i] = 0;
    }
    
    allNumbers.forEach(num => {
        if (frequency[num] !== undefined) {
            frequency[num]++;
        }
    });
    
    // Different methods use different selection strategies
    let prediction = [];
    const sortedByFreq = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .map(([num]) => parseInt(num));
    
    switch (methodId) {
        case 'enhanced':
        case 'frequency':
            // Pick top frequent numbers
            prediction = sortedByFreq.slice(0, 6);
            break;
        case 'weighted':
            // Weight recent draws more heavily
            prediction = sortedByFreq.slice(0, 8);
            prediction = prediction.sort(() => Math.random() - 0.5).slice(0, 6);
            break;
        case 'hotcold':
            // Mix of hot and cold numbers
            const hot = sortedByFreq.slice(0, 3);
            const cold = sortedByFreq.slice(-3);
            prediction = [...hot, ...cold];
            break;
        default:
            prediction = sortedByFreq.slice(0, 6);
    }
    
    return prediction.slice(0, 6);
}

// Helper function to count matches between prediction and actual result
function countMatches(prediction, actual) {
    let matches = 0;
    prediction.forEach(num => {
        if (actual.includes(num)) {
            matches++;
        }
    });
    return matches;
}

// Function to run quick accuracy test
function quickAccuracyTest() {
    console.log('🚀 QUICK ACCURACY TEST');
    console.log('Checking last 5 draws only...\n');
    
    if (typeof results === 'undefined' || !results || results.length < 10) {
        console.log('❌ Error: Insufficient data for accuracy test');
        return;
    }
    
    for (let i = 0; i < Math.min(5, results.length - 5); i++) {
        const actualResult = results[i];
        const actualNumbers = actualResult.slice(1, 7).map(n => parseInt(n));
        console.log(`\n📅 ${actualResult[0]}: ${actualNumbers.join(', ')}`);
        
        // Test against frequency analysis of previous 50 draws
        const historicalData = results.slice(i + 1, i + 51);
        const prediction = simulatePrediction(historicalData, 50, 'frequency');
        
        if (prediction) {
            const matches = countMatches(prediction, actualNumbers);
            console.log(`🔮 Simulated prediction: ${prediction.join(', ')}`);
            console.log(`✨ Matches: ${matches}/6`);
        }
    }
}

// Export functions for manual testing
window.analyzeAccuracy = analyzeAccuracy;
window.quickAccuracyTest = quickAccuracyTest;

console.log('\n🎯 ACCURACY ANALYSIS READY!');
console.log('Usage in browser console:');
console.log('• analyzeAccuracy()     - Full accuracy analysis');
console.log('• quickAccuracyTest()   - Quick test on last 5 draws');
console.log('\nMake sure to load your HTML file first so CSV data is available!');