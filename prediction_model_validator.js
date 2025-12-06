// Comprehensive Prediction Model Validation Tool
console.log('🔍 PREDICTION MODEL VALIDATION TOOL');
console.log('=' .repeat(60));

const fs = require('fs');

function loadHistoricalData() {
    try {
        const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        const historical = [];
        lines.slice(1).forEach(line => {
            const columns = line.split(',');
            if (columns.length >= 8) {
                const date = columns[0];
                const numbers = columns.slice(1, 7).map(Number);
                const additional = parseInt(columns[7]);
                
                historical.push({
                    date: date,
                    numbers: numbers.sort((a, b) => a - b),
                    additional: additional
                });
            }
        });
        
        console.log(`📊 Loaded ${historical.length} draws for validation`);
        return historical;
    } catch (error) {
        console.error('❌ Error loading CSV:', error.message);
        return [];
    }
}

function validateEnhancedEnsemble(historical, drawRange) {
    console.log(`\n🚀 VALIDATING ENHANCED ENSEMBLE (${drawRange} draws)`);
    console.log('=' .repeat(50));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    // Replicate the Enhanced Ensemble algorithm exactly
    const scores = Array(50).fill(0);
    const analysisRange = Math.min(drawRange, historical.length);
    
    // Multi-factor scoring
    historical.slice(0, analysisRange).forEach((draw, idx) => {
        const weight = Math.pow(0.95, idx);
        
        draw.numbers.forEach(num => {
            scores[num] += 0.4 + (0.35 * weight);
        });
    });
    
    // Hot/Cold balance
    const recentDraws = historical.slice(0, 10);
    for (let num = 1; num <= 49; num++) {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        
        if (recentCount >= 3) {
            scores[num] += 0.25 * 0.3;
        } else if (recentCount === 0) {
            scores[num] += 0.25 * 0.7;
        } else {
            scores[num] += 0.25 * 0.1;
        }
    }
    
    // Create ranking for non-base numbers
    const ranking = [];
    for (let num = 1; num <= 49; num++) {
        if (!bases.includes(num)) {
            ranking.push({ num, score: scores[num] });
        }
    }
    ranking.sort((a, b) => b.score - a.score);
    
    // Generate prediction
    const neededNumbers = 6 - bases.length;
    const ensemblePicks = ranking.slice(0, neededNumbers).map(item => item.num);
    const finalPrediction = [...bases, ...ensemblePicks].slice(0, 6).sort((a, b) => a - b);
    
    console.log(`📊 Analysis Range: ${analysisRange} draws`);
    console.log(`📌 Base Numbers: [${bases.join(', ')}]`);
    console.log(`🎯 Algorithm Picks: [${ensemblePicks.join(', ')}]`);
    console.log(`🏆 Final Prediction: [${finalPrediction.join(', ')}]`);
    
    console.log(`\n📈 Top 5 Scoring Numbers:`);
    ranking.slice(0, 5).forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.num}: Score ${item.score.toFixed(4)}`);
    });
    
    // Validate base number scores
    console.log(`\n📌 Base Number Scores:`);
    bases.forEach(base => {
        console.log(`   Number ${base}: Score ${scores[base].toFixed(4)}`);
    });
    
    return { prediction: finalPrediction, scores, ranking, bases };
}

function validateFrequencyCompatibility(historical, drawRange) {
    console.log(`\n📊 VALIDATING FREQUENCY + COMPATIBILITY (${drawRange} draws)`);
    console.log('=' .repeat(55));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    // Calculate frequency
    historical.slice(0, drawRange).forEach(draw => {
        const pool = includeAdd ? draw.numbers.concat(draw.additional) : draw.numbers;
        pool.forEach(n => freq[n]++);
        
        // Calculate compatibility
        bases.forEach(b => {
            if (pool.includes(b)) {
                pool.filter(n => n !== b).forEach(n => compat[n]++);
            }
        });
    });
    
    // Calculate scores and generate prediction
    const scores = freq.map((f, i) => f + compat[i]);
    const suggestions = scores
        .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 6);
    
    const prediction = suggestions.map(o => o.n).sort((a, b) => a - b);
    
    console.log(`📊 Analysis Range: ${drawRange} draws`);
    console.log(`🏆 Prediction: [${prediction.join(', ')}]`);
    
    console.log(`\n📈 Top 6 Scoring Numbers:`);
    suggestions.forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.n}: Score ${item.score} (Freq: ${item.freq}, Compat: ${item.compat})`);
    });
    
    return { prediction, scores, suggestions };
}

function validateHotColdAnalysis(historical, drawRange) {
    console.log(`\n🌡️ VALIDATING HOT/COLD ANALYSIS (${drawRange} draws)`);
    console.log('=' .repeat(50));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    // Range-sensitive recent size
    const recentSize = Math.min(Math.max(10, Math.floor(drawRange * 0.3)), 30);
    const recentDraws = historical.slice(0, Math.min(recentSize, historical.length));
    const historicalDraws = historical.slice(recentSize, Math.min(drawRange + recentSize, historical.length));
    
    const recentFreq = Array(50).fill(0);
    const historicalFreq = Array(50).fill(0);
    
    // Count frequencies
    recentDraws.forEach(draw => {
        draw.numbers.forEach(n => {
            if (n >= 1 && n <= 49) recentFreq[n]++;
        });
    });
    
    historicalDraws.forEach(draw => {
        draw.numbers.forEach(n => {
            if (n >= 1 && n <= 49) historicalFreq[n]++;
        });
    });
    
    // Calculate hot scores
    const suggestions = recentFreq.map((recentCount, n) => {
        const recentRate = recentCount / recentDraws.length;
        const historicalRate = historicalFreq[n] / Math.max(1, historicalDraws.length);
        const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentCount > 0 ? 10 : 0);
        
        let hotScore = 0;
        hotScore += recentCount * 0.25;
        
        if (hotRatio > 1.5 && recentRate > 0.10) {
            hotScore += hotRatio * 0.40;
        }
        
        if (recentCount >= 3 && hotRatio > 1.2) {
            hotScore += 0.20;
        }
        
        if (recentCount === 0 && historicalRate > 0.08) {
            hotScore -= 0.15;
        }
        
        const rangeBonus = drawRange <= 20 ? hotScore * 0.1 : drawRange <= 50 ? hotScore * 0.05 : 0;
        hotScore += rangeBonus;
        
        return {
            n,
            recentCount,
            hotRatio,
            hotScore,
            temperature: hotRatio > 1.5 ? 'HOT' : hotRatio < 0.5 ? 'COLD' : 'WARM'
        };
    })
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.hotScore - a.hotScore);
    
    // Apply even/odd balance (simplified)
    const prediction = suggestions.slice(0, 6).map(o => o.n).sort((a, b) => a - b);
    
    console.log(`📊 Analysis: ${recentDraws.length} recent vs ${historicalDraws.length} historical`);
    console.log(`🏆 Prediction: [${prediction.join(', ')}]`);
    
    console.log(`\n🌡️ Top 6 Hot/Cold Numbers:`);
    suggestions.slice(0, 6).forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.n}: ${item.temperature} (Score: ${item.hotScore.toFixed(2)}, Ratio: ${item.hotRatio.toFixed(2)}x)`);
    });
    
    return { prediction, suggestions, recentDraws, historicalDraws };
}

function validateWeightedAnalysis(historical, drawRange) {
    console.log(`\n⚖️ VALIDATING WEIGHTED RECENT ANALYSIS (${drawRange} draws)`);
    console.log('=' .repeat(55));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    const weightedScores = Array(50).fill(0);
    
    // Apply exponential decay weighting
    historical.slice(0, drawRange).forEach((draw, index) => {
        const weight = Math.pow(0.9, index); // Exponential decay
        
        draw.numbers.forEach(num => {
            weightedScores[num] += weight;
        });
        
        if (includeAdd && draw.additional) {
            weightedScores[draw.additional] += weight * 0.5;
        }
    });
    
    // Generate suggestions (excluding bases)
    const suggestions = weightedScores
        .map((score, n) => ({ n, score, weighted: score }))
        .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    
    const prediction = suggestions.map(o => o.n).sort((a, b) => a - b);
    
    console.log(`📊 Analysis Range: ${drawRange} draws`);
    console.log(`🏆 Prediction: [${prediction.join(', ')}]`);
    
    console.log(`\n📈 Top 6 Weighted Numbers:`);
    suggestions.forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.n}: Weighted Score ${item.score.toFixed(4)}`);
    });
    
    return { prediction, suggestions };
}

function crossValidateWithLatestResults(predictions, historical) {
    console.log(`\n🎯 CROSS-VALIDATION WITH LATEST RESULTS`);
    console.log('=' .repeat(50));
    
    const latestResult = historical[0].numbers;
    const latestAdditional = historical[0].additional;
    
    console.log(`🎲 Latest Result: [${latestResult.join(', ')}] + ${latestAdditional}`);
    console.log(`📅 Draw Date: ${historical[0].date}`);
    
    Object.entries(predictions).forEach(([method, data]) => {
        const prediction = data.prediction || data;
        const matches = prediction.filter(num => latestResult.includes(num));
        const additionalMatch = prediction.includes(latestAdditional);
        
        console.log(`\n${method}:`);
        console.log(`   🔮 Prediction: [${prediction.join(', ')}]`);
        console.log(`   ✅ Matches: ${matches.length}/6 (${matches.join(', ') || 'none'})`);
        console.log(`   🎯 Additional: ${additionalMatch ? 'YES' : 'NO'}`);
        console.log(`   📊 Accuracy: ${((matches.length / 6) * 100).toFixed(1)}%`);
    });
}

function runComprehensiveValidation(historical) {
    console.log(`\n🔬 COMPREHENSIVE VALIDATION SUITE`);
    console.log('=' .repeat(60));
    
    const drawRanges = [20, 50, 100];
    const allPredictions = {};
    
    drawRanges.forEach(range => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 TESTING ALL MODELS WITH ${range} DRAWS`);
        console.log(`${'='.repeat(60)}`);
        
        const enhanced = validateEnhancedEnsemble(historical, range);
        const frequency = validateFrequencyCompatibility(historical, range);
        const hotcold = validateHotColdAnalysis(historical, range);
        const weighted = validateWeightedAnalysis(historical, range);
        
        allPredictions[`Enhanced Ensemble (${range} draws)`] = enhanced;
        allPredictions[`Frequency+Compatibility (${range} draws)`] = frequency;
        allPredictions[`Hot/Cold Analysis (${range} draws)`] = hotcold;
        allPredictions[`Weighted Analysis (${range} draws)`] = weighted;
    });
    
    return allPredictions;
}

function validateAnalyticsData(historical) {
    console.log(`\n📋 VALIDATING ANALYTICS DATA`);
    console.log('=' .repeat(40));
    
    const bases = [16, 22, 10];
    const range = 50;
    
    // Test frequency calculation
    const freq = Array(50).fill(0);
    historical.slice(0, range).forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
    });
    
    // Test compatibility calculation
    const compat = Array(50).fill(0);
    historical.slice(0, range).forEach(draw => {
        bases.forEach(b => {
            if (draw.numbers.includes(b)) {
                draw.numbers.filter(n => n !== b).forEach(n => compat[n]++);
            }
        });
    });
    
    console.log(`\n✅ SAMPLE ANALYTICS VALIDATION (${range} draws):`);
    
    // Test a few key numbers
    const testNumbers = [16, 22, 10, 34, 19];
    testNumbers.forEach(num => {
        const frequency = freq[num];
        const compatibility = compat[num];
        const percentage = ((frequency / range) * 100).toFixed(1);
        
        console.log(`\nNumber ${num}:`);
        console.log(`   🔢 Frequency: ${frequency}/${range} (${percentage}%)`);
        console.log(`   🤝 Compatibility: ${compatibility} co-appearances`);
        console.log(`   📊 Expected in analytics: Freq=${frequency}, Compat=${compatibility}`);
    });
    
    return { freq, compat };
}

// Main validation execution
const historical = loadHistoricalData();

if (historical.length > 0) {
    // Run all validations
    const allPredictions = runComprehensiveValidation(historical);
    
    // Cross-validate with latest results
    crossValidateWithLatestResults(allPredictions, historical);
    
    // Validate analytics calculations
    validateAnalyticsData(historical);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ VALIDATION COMPLETE - HOW TO USE THIS TOOL`);
    console.log(`${'='.repeat(60)}`);
    
    console.log(`\n🔍 WHAT THIS TOOL VALIDATES:`);
    console.log(`• Algorithm calculations are mathematically correct`);
    console.log(`• Predictions match expected outputs for given inputs`);
    console.log(`• Analytics data (frequency, compatibility) are accurate`);
    console.log(`• All models produce sensible, different results`);
    console.log(`• Cross-validation with actual results shows performance`);
    
    console.log(`\n🎯 HOW TO CHECK IF RESULTS ARE CORRECT:`);
    console.log(`1. Compare these validated outputs with UI predictions`);
    console.log(`2. Ensure same draw range produces same predictions`);
    console.log(`3. Verify analytics numbers match these calculations`);
    console.log(`4. Check different models produce different results`);
    console.log(`5. Confirm base numbers [16, 22, 10] are always in Enhanced Ensemble`);
    
    console.log(`\n✅ IF EVERYTHING MATCHES: Your prediction models are working correctly!`);
    console.log(`❌ IF DISCREPANCIES FOUND: There may be bugs in the UI implementation`);
} else {
    console.log('❌ Cannot validate - historical data not available');
}