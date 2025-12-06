// Analytics Data Validation Script
console.log('🔍 ANALYTICS DATA VALIDATION');
console.log('=' .repeat(50));

// Load the CSV data
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
        
        console.log(`📊 Loaded ${historical.length} draws`);
        console.log(`📅 Latest draw: ${historical[0].date} - ${historical[0].numbers.join(',')}`);
        return historical;
    } catch (error) {
        console.error('❌ Error loading CSV:', error.message);
        return [];
    }
}

function validateFrequencyCalculation(historical, drawRange) {
    console.log(`\n🔍 VALIDATING FREQUENCY CALCULATION (${drawRange} draws)`);
    
    const analysisData = historical.slice(0, drawRange);
    const freq = Array(50).fill(0);
    
    // Calculate frequency exactly as in the UI
    analysisData.forEach(draw => {
        draw.numbers.forEach(num => {
            freq[num]++;
        });
    });
    
    // Show top 10 most frequent numbers
    const freqRanking = [];
    for (let num = 1; num <= 49; num++) {
        freqRanking.push({ num, freq: freq[num] });
    }
    freqRanking.sort((a, b) => b.freq - a.freq);
    
    console.log('📈 Top 10 Most Frequent Numbers:');
    freqRanking.slice(0, 10).forEach((item, i) => {
        const percentage = ((item.freq / drawRange) * 100).toFixed(1);
        console.log(`  ${i+1}. Number ${item.num}: ${item.freq} times (${percentage}%)`);
    });
    
    return freq;
}

function validateCompatibilityCalculation(historical, drawRange, baseNumbers) {
    console.log(`\n🔍 VALIDATING COMPATIBILITY CALCULATION (${drawRange} draws)`);
    console.log(`📌 Base Numbers: [${baseNumbers.join(', ')}]`);
    
    const analysisData = historical.slice(0, drawRange);
    const compat = Array(50).fill(0);
    
    // Calculate compatibility exactly as in the UI
    analysisData.forEach(draw => {
        baseNumbers.forEach(base => {
            if (draw.numbers.includes(base)) {
                // If base number appears, count all other numbers in that draw
                draw.numbers.filter(n => n !== base).forEach(n => {
                    compat[n]++;
                });
            }
        });
    });
    
    // Show top 10 most compatible numbers
    const compatRanking = [];
    for (let num = 1; num <= 49; num++) {
        if (!baseNumbers.includes(num)) {
            compatRanking.push({ num, compat: compat[num] });
        }
    }
    compatRanking.sort((a, b) => b.compat - a.compat);
    
    console.log('🤝 Top 10 Most Compatible Numbers:');
    compatRanking.slice(0, 10).forEach((item, i) => {
        console.log(`  ${i+1}. Number ${item.num}: ${item.compat} co-appearances`);
    });
    
    return compat;
}

function validateEnhancedEnsembleScoring(historical, drawRange, baseNumbers) {
    console.log(`\n🔍 VALIDATING ENHANCED ENSEMBLE SCORING (${drawRange} draws)`);
    
    const analysisData = historical.slice(0, drawRange);
    const scores = Array(50).fill(0);
    
    // Multi-factor scoring exactly as in UI
    analysisData.forEach((draw, idx) => {
        const weight = Math.pow(0.95, idx); // Recent weighting
        
        // Frequency analysis (40%) + Recent weighting (35%)
        draw.numbers.forEach(num => {
            scores[num] += 0.4 + (0.35 * weight);
        });
    });
    
    // Hot/Cold balance (25%)
    const recentDraws = analysisData.slice(0, 10);
    console.log(`🌡️ Hot/Cold analysis on last ${recentDraws.length} draws`);
    
    for (let num = 1; num <= 49; num++) {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        
        if (recentCount >= 3) {
            scores[num] += 0.25 * 0.3; // Hot bonus
        } else if (recentCount === 0) {
            scores[num] += 0.25 * 0.7; // Cold bonus
        } else {
            scores[num] += 0.25 * 0.1; // Neutral
        }
    }
    
    // Create ranking for non-base numbers
    const ranking = [];
    for (let num = 1; num <= 49; num++) {
        if (!baseNumbers.includes(num)) {
            ranking.push({ num, score: scores[num] });
        }
    }
    ranking.sort((a, b) => b.score - a.score);
    
    console.log('🏆 Top 10 Enhanced Ensemble Rankings:');
    ranking.slice(0, 10).forEach((item, i) => {
        console.log(`  ${i+1}. Number ${item.num}: Score ${item.score.toFixed(4)}`);
    });
    
    // Generate final prediction
    const neededNumbers = 6 - baseNumbers.length;
    const ensemblePicks = ranking.slice(0, neededNumbers).map(item => item.num);
    const finalPrediction = [...baseNumbers, ...ensemblePicks].slice(0, 6).sort((a, b) => a - b);
    
    console.log(`✅ Enhanced Ensemble Prediction: [${finalPrediction.join(', ')}]`);
    
    return { scores, finalPrediction, ranking };
}

function crossValidateWithActualResults(historical, prediction) {
    console.log(`\n🎯 CROSS-VALIDATION WITH LATEST RESULT`);
    console.log(`🔮 Prediction: [${prediction.join(', ')}]`);
    console.log(`🎲 Latest Result: [${historical[0].numbers.join(', ')}] + ${historical[0].additional}`);
    
    const matches = prediction.filter(num => historical[0].numbers.includes(num));
    const additionalMatch = prediction.includes(historical[0].additional);
    
    console.log(`✅ Main Number Matches: ${matches.length}/6`);
    if (matches.length > 0) {
        console.log(`   Matched Numbers: [${matches.join(', ')}]`);
    }
    console.log(`✅ Additional Number Match: ${additionalMatch ? 'YES' : 'NO'}`);
    
    if (additionalMatch) {
        console.log(`   Additional Number ${historical[0].additional} was predicted`);
    }
    
    return { mainMatches: matches.length, additionalMatch };
}

// Run validation
const historical = loadHistoricalData();

if (historical.length > 0) {
    const drawRanges = [20, 50, 100];
    const baseNumbers = [16, 22, 10];
    
    drawRanges.forEach(range => {
        console.log('\n' + '='.repeat(60));
        console.log(`📊 TESTING DRAW RANGE: ${range} draws`);
        console.log('='.repeat(60));
        
        // Validate frequency calculation
        const freq = validateFrequencyCalculation(historical, range);
        
        // Validate compatibility calculation  
        const compat = validateCompatibilityCalculation(historical, range, baseNumbers);
        
        // Validate Enhanced Ensemble scoring
        const { scores, finalPrediction, ranking } = validateEnhancedEnsembleScoring(historical, range, baseNumbers);
        
        // Cross-validate with latest result
        crossValidateWithActualResults(historical, finalPrediction);
        
        // Sample analytics data validation for first few numbers
        console.log(`\n📋 SAMPLE ANALYTICS DATA VALIDATION:`);
        finalPrediction.slice(0, 3).forEach(num => {
            console.log(`  Number ${num}:`);
            console.log(`    📈 Score: ${scores[num].toFixed(4)}`);
            console.log(`    🔢 Frequency: ${freq[num]} (${((freq[num] / range) * 100).toFixed(1)}%)`);
            console.log(`    🤝 Compatibility: ${compat[num]} co-appearances`);
        });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ANALYTICS VALIDATION COMPLETE');
    console.log('='.repeat(60));
    console.log('📋 Check if the displayed analytics data matches the calculations above');
    console.log('🎯 Verify frequency percentages, compatibility scores, and ensemble rankings');
} else {
    console.log('❌ Could not load historical data for validation');
}