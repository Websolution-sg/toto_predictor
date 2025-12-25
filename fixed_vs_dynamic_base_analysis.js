const fs = require('fs');

console.log('🔬 FIXED vs DYNAMIC BASE NUMBERS: COMPREHENSIVE ANALYSIS');
console.log('='.repeat(75));

// Load historical data
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

console.log(`📊 Historical data loaded: ${historical.length} draws`);
console.log(`📅 Analysis period: ${historical[historical.length-1].date} to ${historical[0].date}`);
console.log('');

// Calculate optimal fixed bases from long-term historical data
function calculateOptimalFixedBases() {
    console.log('🔍 CALCULATING OPTIMAL FIXED BASES FROM HISTORICAL DATA');
    console.log('-'.repeat(60));
    
    const frequency = Array(50).fill(0);
    
    // Use all historical data to find most frequent numbers
    historical.forEach(draw => {
        draw.numbers.forEach(n => frequency[n]++);
        if (draw.additional) frequency[draw.additional]++;
    });
    
    // Get top frequency numbers
    const freqRanking = frequency.map((freq, num) => ({ num, freq }))
        .filter(item => item.num >= 1 && item.num <= 49)
        .sort((a, b) => b.freq - a.freq);
    
    console.log('📊 Top 10 most frequent numbers historically:');
    freqRanking.slice(0, 10).forEach((item, i) => {
        const percentage = (item.freq / historical.length * 100).toFixed(1);
        console.log(`   ${i+1}. Number ${item.num}: ${item.freq} times (${percentage}%)`);
    });
    
    const optimalFixed = freqRanking.slice(0, 3).map(item => item.num);
    const htmlFixed = [16, 22, 10]; // Current HTML bases
    
    console.log(`\n🎯 Optimal Fixed Bases: [${optimalFixed.join(', ')}]`);
    console.log(`🌐 HTML Current Bases: [${htmlFixed.join(', ')}]`);
    
    // Check if HTML bases are in top frequencies
    const htmlRanks = htmlFixed.map(base => {
        const rank = freqRanking.findIndex(item => item.num === base) + 1;
        const freq = freqRanking.find(item => item.num === base)?.freq || 0;
        return { base, rank, freq };
    });
    
    console.log('\n📈 HTML Base Rankings:');
    htmlRanks.forEach(item => {
        const percentage = (item.freq / historical.length * 100).toFixed(1);
        console.log(`   Number ${item.base}: Rank #${item.rank}, ${item.freq} times (${percentage}%)`);
    });
    
    return { optimalFixed, htmlFixed, freqRanking };
}

const fixedBasesAnalysis = calculateOptimalFixedBases();

// Test both approaches against recent draws
function testApproachesAgainstHistory() {
    console.log('\n🧪 BACKTESTING: FIXED vs DYNAMIC BASE PERFORMANCE');
    console.log('='.repeat(75));
    
    const testDraws = 20; // Test against last 20 draws
    const results = {
        dynamicBase: { totalMatches: 0, predictions: [] },
        optimalFixed: { totalMatches: 0, predictions: [] },
        htmlFixed: { totalMatches: 0, predictions: [] }
    };
    
    console.log(`Testing against last ${testDraws} draws...\n`);
    
    for (let i = 1; i <= testDraws; i++) {
        if (i >= historical.length) break;
        
        const targetDraw = historical[i-1]; // Draw to predict
        const previousDraw = historical[i]; // Previous draw for dynamic base
        const trainingData = historical.slice(i); // Historical data for training
        
        console.log(`📅 Test ${i}: Predicting ${targetDraw.date} (Target: [${targetDraw.numbers.join(', ')}])`);
        
        // Dynamic base approach (using previous result)
        const dynamicBases = previousDraw ? previousDraw.numbers.slice(0, 3) : [16, 22, 10];
        const dynamicPrediction = generatePrediction(trainingData, dynamicBases, 20);
        const dynamicMatches = dynamicPrediction.filter(n => targetDraw.numbers.includes(n));
        results.dynamicBase.totalMatches += dynamicMatches.length;
        results.dynamicBase.predictions.push({
            date: targetDraw.date,
            bases: dynamicBases,
            prediction: dynamicPrediction,
            matches: dynamicMatches.length,
            matchedNumbers: dynamicMatches
        });
        
        // Optimal fixed base approach
        const optimalPrediction = generatePrediction(trainingData, fixedBasesAnalysis.optimalFixed, 20);
        const optimalMatches = optimalPrediction.filter(n => targetDraw.numbers.includes(n));
        results.optimalFixed.totalMatches += optimalMatches.length;
        results.optimalFixed.predictions.push({
            date: targetDraw.date,
            bases: fixedBasesAnalysis.optimalFixed,
            prediction: optimalPrediction,
            matches: optimalMatches.length,
            matchedNumbers: optimalMatches
        });
        
        // HTML fixed base approach
        const htmlPrediction = generatePrediction(trainingData, fixedBasesAnalysis.htmlFixed, 20);
        const htmlMatches = htmlPrediction.filter(n => targetDraw.numbers.includes(n));
        results.htmlFixed.totalMatches += htmlMatches.length;
        results.htmlFixed.predictions.push({
            date: targetDraw.date,
            bases: fixedBasesAnalysis.htmlFixed,
            prediction: htmlPrediction,
            matches: htmlMatches.length,
            matchedNumbers: htmlMatches
        });
        
        console.log(`   Dynamic [${dynamicBases.join(',')}]: ${dynamicMatches.length} matches (${dynamicMatches.join(', ') || 'none'})`);
        console.log(`   Optimal [${fixedBasesAnalysis.optimalFixed.join(',')}]: ${optimalMatches.length} matches (${optimalMatches.join(', ') || 'none'})`);
        console.log(`   HTML    [${fixedBasesAnalysis.htmlFixed.join(',')}]: ${htmlMatches.length} matches (${htmlMatches.join(', ') || 'none'})`);
        console.log('');
    }
    
    return results;
}

// Prediction algorithm (simplified but representative)
function generatePrediction(trainingData, baseNumbers, range = 20) {
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    // Use recent training data
    const recentData = trainingData.slice(0, Math.min(range, trainingData.length));
    
    // Calculate frequency
    recentData.forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
        if (draw.additional) freq[draw.additional]++;
    });
    
    // Calculate compatibility with base numbers
    recentData.forEach(draw => {
        baseNumbers.forEach(base => {
            if (draw.numbers.includes(base) || draw.additional === base) {
                draw.numbers.forEach(n => {
                    if (n !== base) compat[n]++;
                });
                if (draw.additional && draw.additional !== base) {
                    compat[draw.additional]++;
                }
            }
        });
    });
    
    // Score calculation
    const scores = [];
    for (let n = 1; n <= 49; n++) {
        if (!baseNumbers.includes(n)) {
            const score = freq[n] * 0.6 + compat[n] * 0.4;
            scores.push({ n, score });
        }
    }
    
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, 6).map(item => item.n).sort((a, b) => a - b);
}

const testResults = testApproachesAgainstHistory();

// Analyze results
function analyzeResults() {
    console.log('📊 PERFORMANCE ANALYSIS RESULTS');
    console.log('='.repeat(75));
    
    const dynamicAvg = testResults.dynamicBase.totalMatches / testResults.dynamicBase.predictions.length;
    const optimalAvg = testResults.optimalFixed.totalMatches / testResults.optimalFixed.predictions.length;
    const htmlAvg = testResults.htmlFixed.totalMatches / testResults.htmlFixed.predictions.length;
    
    console.log(`\n🏆 OVERALL PERFORMANCE (Average matches per prediction):`);
    console.log(`   Dynamic Base Approach: ${dynamicAvg.toFixed(2)} matches/prediction`);
    console.log(`   Optimal Fixed Base:    ${optimalAvg.toFixed(2)} matches/prediction`);
    console.log(`   HTML Fixed Base:       ${htmlAvg.toFixed(2)} matches/prediction`);
    
    console.log(`\n📈 TOTAL MATCHES ACROSS ALL TESTS:`);
    console.log(`   Dynamic Base: ${testResults.dynamicBase.totalMatches} total matches`);
    console.log(`   Optimal Fixed: ${testResults.optimalFixed.totalMatches} total matches`);
    console.log(`   HTML Fixed: ${testResults.htmlFixed.totalMatches} total matches`);
    
    // Find best performing approach
    const performances = [
        { name: 'Dynamic Base', avg: dynamicAvg, total: testResults.dynamicBase.totalMatches },
        { name: 'Optimal Fixed', avg: optimalAvg, total: testResults.optimalFixed.totalMatches },
        { name: 'HTML Fixed', avg: htmlAvg, total: testResults.htmlFixed.totalMatches }
    ];
    
    performances.sort((a, b) => b.avg - a.avg);
    
    console.log(`\n🥇 RANKING BY PERFORMANCE:`);
    performances.forEach((perf, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        console.log(`   ${medal} ${i+1}. ${perf.name}: ${perf.avg.toFixed(2)} avg matches`);
    });
    
    // Statistical analysis
    console.log(`\n📊 STATISTICAL ANALYSIS:`);
    
    // Count successful predictions (1+ matches)
    const dynamicSuccesses = testResults.dynamicBase.predictions.filter(p => p.matches > 0).length;
    const optimalSuccesses = testResults.optimalFixed.predictions.filter(p => p.matches > 0).length;
    const htmlSuccesses = testResults.htmlFixed.predictions.filter(p => p.matches > 0).length;
    
    const totalTests = testResults.dynamicBase.predictions.length;
    
    console.log(`   Success Rate (1+ matches):`);
    console.log(`   • Dynamic Base: ${dynamicSuccesses}/${totalTests} (${(dynamicSuccesses/totalTests*100).toFixed(1)}%)`);
    console.log(`   • Optimal Fixed: ${optimalSuccesses}/${totalTests} (${(optimalSuccesses/totalTests*100).toFixed(1)}%)`);
    console.log(`   • HTML Fixed: ${htmlSuccesses}/${totalTests} (${(htmlSuccesses/totalTests*100).toFixed(1)}%)`);
    
    // Best individual predictions
    console.log(`\n🎯 BEST INDIVIDUAL PREDICTIONS:`);
    const allPredictions = [
        ...testResults.dynamicBase.predictions.map(p => ({...p, method: 'Dynamic'})),
        ...testResults.optimalFixed.predictions.map(p => ({...p, method: 'Optimal Fixed'})),
        ...testResults.htmlFixed.predictions.map(p => ({...p, method: 'HTML Fixed'}))
    ];
    
    const bestPredictions = allPredictions.filter(p => p.matches >= 2).sort((a, b) => b.matches - a.matches);
    
    if (bestPredictions.length > 0) {
        bestPredictions.slice(0, 5).forEach(pred => {
            console.log(`   ${pred.matches} matches - ${pred.method} on ${pred.date}`);
            console.log(`     Matched: [${pred.matchedNumbers.join(', ')}]`);
        });
    } else {
        console.log(`   No predictions achieved 2+ matches in test period`);
    }
    
    return performances[0]; // Return best performing approach
}

const winner = analyzeResults();

// Provide final recommendation
function provideFinalRecommendation() {
    console.log('\n🎯 FINAL RECOMMENDATION & INSIGHTS');
    console.log('='.repeat(75));
    
    console.log(`\n🏆 WINNER: ${winner.name.toUpperCase()}`);
    console.log(`   Performance: ${winner.avg.toFixed(2)} average matches per prediction`);
    console.log(`   Total matches: ${winner.total} across all tests`);
    
    console.log(`\n🔍 KEY INSIGHTS:`);
    
    if (winner.name === 'Dynamic Base') {
        console.log(`   ✅ Dynamic bases perform better because:`);
        console.log(`      • Adapt to recent winning patterns`);
        console.log(`      • Capture short-term trends and cycles`);
        console.log(`      • Exclude numbers that just appeared (less likely to repeat immediately)`);
        console.log(`      • Provide fresh compatibility relationships`);
        console.log(`   ⚠️  Risk: May be more volatile, sensitive to outliers`);
    } else if (winner.name.includes('Fixed')) {
        console.log(`   ✅ Fixed bases perform better because:`);
        console.log(`      • Stable long-term statistical foundation`);
        console.log(`      • Not influenced by short-term noise`);
        console.log(`      • Consistent compatibility relationships`);
        console.log(`      • Proven historical performance`);
        console.log(`   ⚠️  Risk: May miss emerging patterns and trends`);
    }
    
    console.log(`\n💡 THEORETICAL CONSIDERATIONS:`);
    console.log(`   🔬 Statistical Theory:`);
    console.log(`      • Each TOTO draw is independent (random)`);
    console.log(`      • No mathematical reason why recent results should predict future`);
    console.log(`      • Long-term frequencies should converge to equal probability`);
    
    console.log(`   🎲 Practical Observations:`);
    console.log(`      • Lottery systems may have subtle biases or patterns`);
    console.log(`      • Drawing mechanisms might have slight preferences`);
    console.log(`      • Human psychology affects number selection in some games`);
    
    console.log(`\n🔬 HYBRID APPROACH ANALYSIS:`);
    
    // Test hybrid approach
    const hybridResults = testHybridApproach();
    console.log(`   Hybrid (50% fixed + 50% dynamic): ${hybridResults.avg.toFixed(2)} average matches`);
    
    if (hybridResults.avg > winner.avg) {
        console.log(`   🚀 HYBRID APPROACH WINS! Best of both worlds.`);
    }
    
    console.log(`\n📋 PRACTICAL RECOMMENDATIONS:`);
    
    if (winner.name === 'Dynamic Base' || hybridResults.avg > winner.avg) {
        console.log(`   🎯 RECOMMENDED STRATEGY: Dynamic or Hybrid Base Numbers`);
        console.log(`      1. Use latest winning result as base numbers`);
        console.log(`      2. Update base numbers after each draw`);
        console.log(`      3. Consider hybrid: mix latest result + high-frequency numbers`);
        console.log(`      4. This approach adapts to recent patterns`);
    } else {
        console.log(`   🎯 RECOMMENDED STRATEGY: Optimized Fixed Base Numbers`);
        console.log(`      1. Use historically most frequent numbers as bases`);
        console.log(`      2. Update bases periodically (monthly/quarterly)`);
        console.log(`      3. Provides stability and long-term statistical advantage`);
        console.log(`      4. Less volatile than dynamic approach`);
    }
    
    console.log(`\n🎲 FOR YOUR DECEMBER 29, 2025 PREDICTION:`);
    
    if (winner.name === 'Dynamic Base') {
        console.log(`   ✅ Use Dynamic Bases: [3, 8, 15, 28, 37, 43] (from Dec 25 result)`);
        console.log(`   📊 This approach showed ${winner.avg.toFixed(2)} average matches in testing`);
    } else {
        console.log(`   ✅ Use Optimal Fixed Bases: [${fixedBasesAnalysis.optimalFixed.join(', ')}]`);
        console.log(`   📊 This approach showed ${winner.avg.toFixed(2)} average matches in testing`);
        console.log(`   ⚠️  Consider updating your prediction algorithm to use fixed bases`);
    }
}

// Test hybrid approach
function testHybridApproach() {
    const testDraws = Math.min(10, historical.length - 1);
    let totalMatches = 0;
    
    for (let i = 1; i <= testDraws; i++) {
        const targetDraw = historical[i-1];
        const previousDraw = historical[i];
        const trainingData = historical.slice(i);
        
        // Hybrid: 2 from dynamic + 1 from fixed
        const dynamicBases = previousDraw ? previousDraw.numbers.slice(0, 2) : [16, 22];
        const fixedBase = fixedBasesAnalysis.optimalFixed[0];
        const hybridBases = [...dynamicBases, fixedBase];
        
        const prediction = generatePrediction(trainingData, hybridBases, 20);
        const matches = prediction.filter(n => targetDraw.numbers.includes(n)).length;
        totalMatches += matches;
    }
    
    return { avg: totalMatches / testDraws, total: totalMatches };
}

provideFinalRecommendation();

console.log('\n' + '='.repeat(75));
console.log('🔬 Analysis complete. Data-driven recommendation provided above.');
console.log('='.repeat(75));