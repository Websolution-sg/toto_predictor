// VALIDATION ANALYSIS: February 23, 2026 TOTO Results vs Balanced Strategy Predictions
// Actual Result: [24, 26, 30, 32, 37, 47] + 2
// Testing: Did removing high sum bias and adding balanced strategies work?
// Analysis Date: February 26, 2026

const actualResult = [24, 26, 30, 32, 37, 47];
const additionalNumber = 2;
const drawDate = "February 23, 2026";

// Our balanced predictions for February 23, 2026 (from enhanced_predictions_feb23_2026.js)
const feb23Predictions = [
    { rank: 1, algorithm: "📊 Frequency Pattern Analyzer", numbers: [5, 9, 12, 20, 34, 43], confidence: 5, type: "frequency_balanced" },
    { rank: 2, algorithm: "⚡ Even-Favored Balanced", numbers: [12, 18, 26, 28, 38, 43], confidence: 5, type: "even_enhanced" },
    { rank: 3, algorithm: "📈 Range Distribution 2-1-3", numbers: [5, 10, 23, 35, 39, 42], confidence: 5, type: "range_optimized" },
    { rank: 4, algorithm: "🧠 Volatility Smart Adaptive", numbers: [6, 23, 31, 45, 46, 48], confidence: 4, type: "volatility_enhanced" },
    { rank: 5, algorithm: "🎯 Consecutive Pattern Hunter", numbers: [8, 20, 22, 23, 40, 47], confidence: 5, type: "pattern_based" },
    { rank: 6, algorithm: "⚖️ Balanced Sum Optimizer", numbers: [19, 20, 24, 26, 30, 34], confidence: 4, type: "sum_balanced" },
    { rank: 7, algorithm: "🔥 Even Preference Pro", numbers: [6, 8, 27, 28, 40, 49], confidence: 4, type: "even_enhanced" },
    { rank: 8, algorithm: "🔍 Distribution Master", numbers: [5, 7, 23, 35, 37, 43], confidence: 4, type: "range_optimized" },
    { rank: 9, algorithm: "🎲 Prime Number Focus", numbers: [9, 19, 21, 26, 45, 47], confidence: 4, type: "mathematical" },
    { rank: 10, algorithm: "🌟 Enhanced Frequency", numbers: [22, 23, 26, 27, 30, 38], confidence: 4, type: "frequency_balanced" },
    { rank: 11, algorithm: "💎 Digit Sum Pattern", numbers: [7, 16, 31, 32, 33, 34], confidence: 3, type: "mathematical" },
    { rank: 12, algorithm: "🔮 Pattern Evolution", numbers: [2, 16, 31, 34, 45, 49], confidence: 3, type: "range_optimized" },
    { rank: 13, algorithm: "💫 Enhanced Consecutive", numbers: [1, 4, 15, 16, 17, 41], confidence: 3, type: "pattern_based" },
    { rank: 14, algorithm: "🚀 Advanced Frequency", numbers: [8, 28, 33, 37, 42, 49], confidence: 3, type: "frequency_balanced" },
    { rank: 15, algorithm: "✨ Balanced Sum Elite", numbers: [17, 19, 23, 24, 31, 43], confidence: 3, type: "sum_balanced" }
];

function validateFeb23BalancedPredictions() {
    console.log(`🎯 FEBRUARY 23, 2026 BALANCED STRATEGY VALIDATION`);
    console.log(`📅 Draw Date: ${drawDate}`);
    console.log(`🎲 Actual Result: [${actualResult.join(', ')}] + ${additionalNumber}`);
    console.log(`💰 Prize Pool: $1,787,436 (2 Group 1 winners - $893,718 each!)`);
    console.log(`🔄 Testing: Did balanced strategies outperform high sum bias?`);
    console.log(`📊 Strategy Test: Frequency + Pattern + Mathematical vs High Sum`);
    console.log(`==================================================================`);

    const results = [];
    let totalMatches = 0;
    let bestMatch = { matches: 0, algorithms: [] };

    feb23Predictions.forEach(pred => {
        const matches = pred.numbers.filter(num => actualResult.includes(num));
        const matchCount = matches.length;
        const hasAdditional = pred.numbers.includes(additionalNumber);
        
        totalMatches += matchCount;
        
        if (matchCount > bestMatch.matches) {
            bestMatch = { matches: matchCount, algorithms: [pred.algorithm] };
        } else if (matchCount === bestMatch.matches && matchCount > 0) {
            bestMatch.algorithms.push(pred.algorithm);
        }

        results.push({
            algorithm: pred.algorithm,
            rank: pred.rank,
            confidence: pred.confidence,
            type: pred.type,
            numbers: pred.numbers,
            matches: matches,
            matchCount: matchCount,
            hasAdditional: hasAdditional,
            percentage: ((matchCount / 6) * 100).toFixed(1)
        });
    });

    // Display detailed results sorted by performance
    console.log(`📊 DETAILED BALANCED STRATEGY PERFORMANCE:`);
    console.log(`------------------------------------------------------------------`);
    
    results
        .sort((a, b) => b.matchCount - a.matchCount || a.rank - b.rank)
        .forEach((result, index) => {
            const stars = '⭐'.repeat(Math.max(1, result.matchCount));
            const additionalIcon = result.hasAdditional ? ' 🎯' : '';
            const trophy = result.matchCount >= 4 ? ' 🏆' : result.matchCount >= 3 ? ' 🥇' : result.matchCount >= 2 ? ' 🥈' : '';
            const strategyIcon = result.matchCount > 0 ? ' ✅' : ' ❌';
            
            console.log(`${(index + 1).toString().padStart(2)}. ${result.algorithm.replace(/📊|⚡|📈|🧠|🎯|⚖️|🔥|🔍|🎲|🌟|💎|🔮|💫|🚀|✨/g, '')}${trophy}${strategyIcon}`);
            console.log(`    Predicted: [${result.numbers.join(', ')}]`);
            console.log(`    ✅ Matches: [${result.matches.join(', ')}] (${result.matchCount}/6 = ${result.percentage}%)${additionalIcon} ${stars}`);
            console.log(`    Strategy: ${result.type.replace(/_/g, ' ').toUpperCase()}`);
            console.log('');
        });

    // Performance summary
    const averageMatches = (totalMatches / feb23Predictions.length).toFixed(2);
    const predictionsWithMatches = results.filter(r => r.matchCount > 0).length;
    const successRate = ((predictionsWithMatches / feb23Predictions.length) * 100).toFixed(1);
    const twoOrMoreMatches = results.filter(r => r.matchCount >= 2).length;
    const threeOrMoreMatches = results.filter(r => r.matchCount >= 3).length;
    const fourOrMoreMatches = results.filter(r => r.matchCount >= 4).length;

    console.log(`📈 BALANCED STRATEGY PERFORMANCE SUMMARY:`);
    console.log(`========================================`);
    console.log(`🏆 Best Performance: ${bestMatch.matches}/6 matches (${((bestMatch.matches / 6) * 100).toFixed(1)}%)`);
    if (bestMatch.matches > 0) {
        console.log(`🥇 Top Performers (${bestMatch.matches}/6): ${bestMatch.algorithms.length} algorithms`);
    }
    console.log(`📊 Average Matches: ${averageMatches}/6 per prediction`);
    console.log(`✅ Success Rate: ${predictionsWithMatches}/${feb23Predictions.length} predictions with matches (${successRate}%)`);
    console.log(`🎯 Additional Number Hits: ${results.filter(r => r.hasAdditional).length}/15 algorithms`);
    console.log(`🥈 Good Performance (2+ matches): ${twoOrMoreMatches}/15 predictions`);
    console.log(`🥇 Strong Performance (3+ matches): ${threeOrMoreMatches}/15 predictions`);
    if (fourOrMoreMatches > 0) {
        console.log(`🏆 Excellent Performance (4+ matches): ${fourOrMoreMatches}/15 predictions`);
    }

    // Compare with previous performances
    console.log(`\n🔄 STRATEGY EVOLUTION COMPARISON:`);
    console.log(`===============================`);
    console.log(`📉 Feb 16 (High Sum Convergent): 0/15 with matches (0.0% success) - COMPLETE MISS`);
    console.log(`📈 Feb 19 (Adaptive Diversified): 11/15 with matches (73.3% success) - RECOVERY`);
    console.log(`📊 Feb 23 (Balanced Strategies): ${predictionsWithMatches}/15 with matches (${successRate}% success) - ${parseFloat(successRate) >= 73.3 ? 'IMPROVEMENT ✅' : parseFloat(successRate) >= 50 ? 'MAINTAINED 📊' : 'DECLINED ⚠️'}`);
    
    const feb19Comparison = parseFloat(successRate) - 73.3;
    console.log(`📊 vs Feb 19: ${feb19Comparison >= 0 ? '+' : ''}${feb19Comparison.toFixed(1)} percentage points`);

    // Strategy type performance analysis
    console.log(`\n🔍 BALANCED STRATEGY TYPE PERFORMANCE:`);
    console.log(`=====================================`);
    const strategyTypes = {
        'frequency_balanced': { total: 0, matches: 0, count: 0, best: 0 },
        'even_enhanced': { total: 0, matches: 0, count: 0, best: 0 },
        'range_optimized': { total: 0, matches: 0, count: 0, best: 0 },
        'volatility_enhanced': { total: 0, matches: 0, count: 0, best: 0 },
        'pattern_based': { total: 0, matches: 0, count: 0, best: 0 },
        'sum_balanced': { total: 0, matches: 0, count: 0, best: 0 },
        'mathematical': { total: 0, matches: 0, count: 0, best: 0 }
    };

    results.forEach(result => {
        const type = result.type;
        if (strategyTypes[type]) {
            strategyTypes[type].total += result.matchCount;
            strategyTypes[type].count++;
            if (result.matchCount > 0) strategyTypes[type].matches++;
            if (result.matchCount > strategyTypes[type].best) {
                strategyTypes[type].best = result.matchCount;
            }
        }
    });

    Object.keys(strategyTypes).forEach(type => {
        const data = strategyTypes[type];
        if (data.count > 0) {
            const avgMatches = (data.total / data.count).toFixed(2);
            const successRate = ((data.matches / data.count) * 100).toFixed(1);
            const typeLabel = type.replace(/_/g, ' ').toUpperCase();
            console.log(`${typeLabel}: ${avgMatches} avg, ${successRate}% success, best: ${data.best}/6`);
        }
    });

    // Actual result pattern analysis
    console.log(`\n💡 FEBRUARY 23 WINNING PATTERN ANALYSIS:`);
    console.log(`================================================`);
    const lowRange = actualResult.filter(n => n <= 16).length;
    const midRange = actualResult.filter(n => n >= 17 && n <= 33).length;
    const highRange = actualResult.filter(n => n >= 34).length;
    const evenNumbers = actualResult.filter(n => n % 2 === 0).length;
    const oddNumbers = 6 - evenNumbers;
    const sum = actualResult.reduce((a, b) => a + b, 0);
    const range = Math.max(...actualResult) - Math.min(...actualResult);
    
    console.log(`🎯 Winning Numbers: [${actualResult.join(', ')}]`);
    console.log(`📐 Range Distribution: ${lowRange}-${midRange}-${highRange} (Low-Mid-High)`);
    console.log(`⚫ Even/Odd Split: ${evenNumbers}/${oddNumbers}`);
    console.log(`🔢 Sum: ${sum}`);
    console.log(`📏 Range Spread: ${range}`);
    console.log(`➕ Additional: ${additionalNumber}`);

    // Strategy effectiveness analysis
    console.log(`\n🧪 BALANCED STRATEGY EFFECTIVENESS:`);
    console.log(`==================================`);
    
    // Test balanced sum hypothesis
    console.log(`⚖️ Balanced Sum Hypothesis (120-160): ${sum >= 120 && sum <= 160 ? 'VALIDATED ✅' : 'MISSED ❌'} - Actual sum: ${sum}`);
    
    // Test even preference
    console.log(`⚫ Even Preference Hypothesis: ${evenNumbers}/6 numbers even (${evenNumbers >= 4 ? 'Strong' : evenNumbers >= 3 ? 'Moderate' : 'Weak'} validation)`);
    
    // Test frequency approach
    const frequencyPredictionsWithMatches = results.filter(r => r.type === 'frequency_balanced' && r.matchCount > 0).length;
    console.log(`📊 Frequency Strategy: ${frequencyPredictionsWithMatches}/${results.filter(r => r.type === 'frequency_balanced').length} success - ${frequencyPredictionsWithMatches > 1 ? 'EFFECTIVE ✅' : 'MODERATE 📊'}`);
    
    // Test mathematical approaches
    const mathPredictionsWithMatches = results.filter(r => r.type === 'mathematical' && r.matchCount > 0).length;
    console.log(`🔢 Mathematical Strategy: ${mathPredictionsWithMatches}/${results.filter(r => r.type === 'mathematical').length} success - ${mathPredictionsWithMatches > 0 ? 'WORKING ✅' : 'FAILED ❌'}`);

    return {
        bestPerformance: bestMatch,
        averageMatches: averageMatches,
        successRate: successRate,
        feb19Comparison: feb19Comparison,
        strategyAnalysis: strategyTypes,
        balancedSumValidation: sum >= 120 && sum <= 160,
        actualSum: sum,
        evenCount: evenNumbers
    };
}

// Run the validation
console.log('🚀 Running February 23, 2026 Balanced Strategy Validation...\n');
const analysis = validateFeb23BalancedPredictions();

console.log(`\n✨ BALANCED STRATEGY VALIDATION COMPLETE!`);
console.log(`📋 Strategy Performance: ${parseFloat(analysis.successRate) >= 70 ? 'EXCELLENT' : parseFloat(analysis.successRate) >= 50 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
console.log(`📊 vs Feb 19: ${analysis.feb19Comparison >= 0 ? 'IMPROVED' : 'DECLINED'} by ${Math.abs(analysis.feb19Comparison).toFixed(1)}%`);
console.log(`⚖️ Balanced Sum Strategy: ${analysis.balancedSumValidation ? 'VALIDATED' : 'INVALIDATED'} (Sum: ${analysis.actualSum})`);
console.log(`🎯 Next Focus: ${analysis.bestPerformance.matches >= 3 ? 'Refine winning strategies' : 'Enhance prediction models'}`);
console.log(`🔄 Ready to analyze and improve for next draws with these insights!`);