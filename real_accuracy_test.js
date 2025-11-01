// REAL PREDICTION MODEL ACCURACY TESTER
// Tests your actual prediction functions against historical TOTO results

console.log('🎯 REAL PREDICTION MODEL ACCURACY ANALYSIS');
console.log('=' .repeat(55));

async function testPredictionAccuracy() {
    console.log('\n🔍 TESTING YOUR ACTUAL PREDICTION MODELS');
    console.log('This will test your 4 prediction methods against real historical data\n');

    // Check if we have access to prediction functions
    const requiredFunctions = [
        'runEnhancedEnsemblePrediction',
        'runFrequencyCompatibilityPrediction', 
        'runWeightedPrediction',
        'runHotColdPrediction',
        'predict'
    ];

    console.log('🔧 Checking prediction functions...');
    const availableFunctions = {};
    requiredFunctions.forEach(func => {
        const available = typeof window[func] === 'function';
        availableFunctions[func] = available;
        console.log(`  ${func}: ${available ? '✅' : '❌'}`);
    });

    if (!availableFunctions.predict) {
        console.log('\n❌ Main predict() function not found. Please load your HTML file first.');
        return;
    }

    if (typeof results === 'undefined' || !results || results.length < 20) {
        console.log('\n❌ CSV data not loaded or insufficient. Please ensure totoResult.csv is loaded.');
        return;
    }

    console.log(`\n📊 CSV Data: ${results.length} draws loaded`);
    console.log('Latest draw:', results[0]);

    // Test configuration
    const testMethods = [
        { id: 'enhanced', name: 'Enhanced Ensemble' },
        { id: 'frequency', name: 'Frequency + Compatibility' },
        { id: 'weighted', name: 'Weighted Recent Analysis' },
        { id: 'hotcold', name: 'Hot/Cold Balance' }
    ];

    const testRanges = [20, 50, 100];
    const testDrawCount = Math.min(10, results.length - 100); // Test last 10 draws

    console.log(`\n🧪 Testing ${testDrawCount} recent draws against each method/range combination`);
    console.log('=' .repeat(60));

    const accuracyData = {};

    // Initialize accuracy tracking
    testMethods.forEach(method => {
        accuracyData[method.id] = {};
        testRanges.forEach(range => {
            accuracyData[method.id][range] = {
                tests: 0,
                totalMatches: 0,
                matchDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
                predictions: []
            };
        });
    });

    // Test each recent draw
    for (let testIndex = 0; testIndex < testDrawCount; testIndex++) {
        const targetDraw = results[testIndex];
        const actualNumbers = targetDraw.slice(1, 7).map(n => parseInt(n));
        
        console.log(`\n📅 Testing Draw ${testIndex + 1}/${testDrawCount}: ${targetDraw[0]}`);
        console.log(`🎯 Actual: [${actualNumbers.join(', ')}]`);

        // Test each method with each range
        for (const method of testMethods) {
            for (const range of testRanges) {
                try {
                    // Set up the UI for this test
                    document.getElementById('predictionMethod').value = method.id;
                    document.getElementById('drawRange').value = range;

                    // Temporarily modify results to exclude the target draw and future draws
                    const originalResults = [...results];
                    results.splice(0, testIndex + 1); // Remove target and future draws
                    
                    // Check if we have enough data for this range
                    if (results.length < range) {
                        results.splice(0, 0, ...originalResults); // Restore
                        console.log(`    ⚠️ ${method.name} (${range}): Insufficient data`);
                        continue;
                    }

                    // Run the prediction
                    await new Promise(resolve => {
                        predict();
                        setTimeout(resolve, 100); // Give time for async operations
                    });

                    // Extract prediction from the results display
                    const resultElement = document.getElementById('result');
                    if (resultElement && resultElement.innerHTML) {
                        const prediction = extractPredictionFromHTML(resultElement.innerHTML);
                        
                        if (prediction && prediction.length === 6) {
                            const matches = countNumberMatches(prediction, actualNumbers);
                            
                            // Record results
                            accuracyData[method.id][range].tests++;
                            accuracyData[method.id][range].totalMatches += matches;
                            accuracyData[method.id][range].matchDistribution[matches]++;
                            accuracyData[method.id][range].predictions.push({
                                draw: targetDraw[0],
                                prediction: [...prediction],
                                actual: [...actualNumbers],
                                matches: matches
                            });

                            console.log(`    🔮 ${method.name} (${range}): [${prediction.join(', ')}] → ${matches} matches`);
                        } else {
                            console.log(`    ❌ ${method.name} (${range}): Could not extract prediction`);
                        }
                    } else {
                        console.log(`    ❌ ${method.name} (${range}): No result element found`);
                    }

                    // Restore original results
                    results.splice(0, results.length, ...originalResults);

                } catch (error) {
                    console.log(`    ❌ ${method.name} (${range}): Error - ${error.message}`);
                    results.splice(0, results.length, ...originalResults); // Restore on error
                }
            }
        }
    }

    // Display comprehensive results
    console.log('\n\n📊 COMPREHENSIVE ACCURACY RESULTS');
    console.log('=' .repeat(55));

    testMethods.forEach(method => {
        console.log(`\n🔍 ${method.name.toUpperCase()}`);
        console.log('-'.repeat(method.name.length + 5));

        testRanges.forEach(range => {
            const data = accuracyData[method.id][range];
            
            if (data.tests > 0) {
                const avgMatches = (data.totalMatches / data.tests).toFixed(2);
                const hitRate = ((data.totalMatches / (data.tests * 6)) * 100).toFixed(1);
                
                console.log(`\n  📈 Range ${range} Analysis:`);
                console.log(`    • Tests conducted: ${data.tests}`);
                console.log(`    • Average matches: ${avgMatches}/6 per draw`);
                console.log(`    • Hit rate: ${hitRate}% (vs 16.7% random)`);
                console.log(`    • Match distribution:`);
                
                for (let matches = 0; matches <= 6; matches++) {
                    const count = data.matchDistribution[matches];
                    const percentage = ((count / data.tests) * 100).toFixed(1);
                    const indicator = matches >= 3 ? '🎯' : matches >= 2 ? '✨' : '';
                    console.log(`      ${matches} matches: ${count}/${data.tests} (${percentage}%) ${indicator}`);
                }

                // Show best predictions
                const bestPredictions = data.predictions
                    .filter(p => p.matches >= 2)
                    .sort((a, b) => b.matches - a.matches);
                
                if (bestPredictions.length > 0) {
                    console.log(`    • Best predictions (≥2 matches):`);
                    bestPredictions.slice(0, 3).forEach(pred => {
                        console.log(`      ${pred.draw}: [${pred.prediction.join(',')}] vs [${pred.actual.join(',')}] → ${pred.matches} matches`);
                    });
                }
            } else {
                console.log(`\n  📈 Range ${range}: No valid tests completed`);
            }
        });
    });

    // Overall comparison
    console.log('\n\n🏆 METHOD COMPARISON');
    console.log('=' .repeat(25));
    
    const methodPerformance = testMethods.map(method => {
        let totalTests = 0;
        let totalMatches = 0;
        let bestRange = null;
        let bestAvg = 0;

        testRanges.forEach(range => {
            const data = accuracyData[method.id][range];
            totalTests += data.tests;
            totalMatches += data.totalMatches;
            
            if (data.tests > 0) {
                const avg = data.totalMatches / data.tests;
                if (avg > bestAvg) {
                    bestAvg = avg;
                    bestRange = range;
                }
            }
        });

        return {
            name: method.name,
            totalTests,
            totalMatches,
            overallAvg: totalTests > 0 ? (totalMatches / totalTests).toFixed(2) : '0.00',
            bestRange,
            bestAvg: bestAvg.toFixed(2)
        };
    }).sort((a, b) => parseFloat(b.overallAvg) - parseFloat(a.overallAvg));

    methodPerformance.forEach((method, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
        console.log(`${medal} ${method.name}:`);
        console.log(`    Overall average: ${method.overallAvg} matches/draw`);
        console.log(`    Best range: ${method.bestRange} (${method.bestAvg} avg)`);
        console.log(`    Total tests: ${method.totalTests}`);
    });

    console.log('\n💡 ANALYSIS COMPLETE!');
    console.log('🎲 Random chance would average ~1.0 matches per draw');
    console.log('📈 Values > 1.0 indicate better than random performance');
    console.log('🎯 Look for consistent performance across different ranges');
}

// Helper function to extract prediction numbers from HTML result
function extractPredictionFromHTML(html) {
    try {
        // Look for patterns like "1, 2, 3, 4, 5, 6" in the HTML
        const numberPattern = /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/;
        const match = html.match(numberPattern);
        
        if (match) {
            return [1, 2, 3, 4, 5, 6].map(i => parseInt(match[i]));
        }

        // Alternative: look for individual numbers in sequence
        const numbers = html.match(/\b([1-9]|[1-4][0-9])\b/g);
        if (numbers && numbers.length >= 6) {
            return numbers.slice(0, 6).map(n => parseInt(n));
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Helper function to count matches between two arrays
function countNumberMatches(prediction, actual) {
    let matches = 0;
    prediction.forEach(num => {
        if (actual.includes(num)) {
            matches++;
        }
    });
    return matches;
}

// Make function available globally
window.testPredictionAccuracy = testPredictionAccuracy;

console.log('\n🚀 READY TO TEST PREDICTION ACCURACY!');
console.log('Usage:');
console.log('1. Open your index.html file');
console.log('2. Open browser console (F12)');
console.log('3. Run: testPredictionAccuracy()');
console.log('\nThis will test all your prediction methods against recent historical data!');