// UI vs Validation Comparison Diagnostic Tool
console.log('🔍 UI VS VALIDATION DIAGNOSTIC TOOL');
console.log('=' .repeat(50));

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
        
        console.log(`📊 Loaded ${historical.length} draws for diagnostic`);
        return historical;
    } catch (error) {
        console.error('❌ Error loading CSV:', error.message);
        return [];
    }
}

function diagnoseEnhancedEnsemble(historical, drawRange) {
    console.log(`\n🚀 DIAGNOSING ENHANCED ENSEMBLE (${drawRange} draws)`);
    console.log('=' .repeat(55));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    // Step-by-step debugging
    console.log(`📊 Input Parameters:`);
    console.log(`   • Draw Range: ${drawRange}`);
    console.log(`   • Historical Length: ${historical.length}`);
    console.log(`   • Base Numbers: [${bases.join(', ')}]`);
    console.log(`   • Include Additional: ${includeAdd}`);
    
    // Check analysis range calculation
    const analysisRange = Math.min(drawRange, historical.length);
    console.log(`\n🔍 Analysis Range Calculation:`);
    console.log(`   • Math.min(${drawRange}, ${historical.length}) = ${analysisRange}`);
    
    // Initialize and debug scoring
    const scores = Array(50).fill(0);
    console.log(`\n📈 Scoring Process:`);
    
    // Multi-factor scoring with detailed logging
    console.log(`   1. Frequency + Recent Weighting:`);
    historical.slice(0, analysisRange).forEach((draw, idx) => {
        const weight = Math.pow(0.95, idx);
        
        if (idx < 3) { // Show first 3 calculations
            console.log(`      Draw ${idx + 1} (${draw.date}): Weight ${weight.toFixed(4)}`);
            console.log(`         Numbers: [${draw.numbers.join(', ')}]`);
        }
        
        draw.numbers.forEach(num => {
            scores[num] += 0.4 + (0.35 * weight);
        });
    });
    
    // Hot/Cold balance debugging
    const recentDraws = historical.slice(0, 10);
    console.log(`\n   2. Hot/Cold Balance (last ${recentDraws.length} draws):`);
    
    // Sample hot/cold for a few numbers
    const sampleNumbers = [16, 22, 10, 34, 19];
    sampleNumbers.forEach(num => {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        
        let bonus = 0;
        if (recentCount >= 3) {
            bonus = 0.25 * 0.3; // Hot bonus
            console.log(`      Number ${num}: ${recentCount} recent → HOT bonus +${bonus.toFixed(4)}`);
        } else if (recentCount === 0) {
            bonus = 0.25 * 0.7; // Cold bonus
            console.log(`      Number ${num}: ${recentCount} recent → COLD bonus +${bonus.toFixed(4)}`);
        } else {
            bonus = 0.25 * 0.1; // Neutral
            console.log(`      Number ${num}: ${recentCount} recent → NEUTRAL +${bonus.toFixed(4)}`);
        }
        
        scores[num] += bonus;
    });
    
    // Apply hot/cold to all numbers
    for (let num = 1; num <= 49; num++) {
        if (!sampleNumbers.includes(num)) {
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
    }
    
    console.log(`\n📊 Final Scores for Key Numbers:`);
    sampleNumbers.forEach(num => {
        console.log(`   Number ${num}: ${scores[num].toFixed(4)}`);
    });
    
    // Create ranking
    const ranking = [];
    for (let num = 1; num <= 49; num++) {
        if (!bases.includes(num)) {
            ranking.push({ num, score: scores[num] });
        }
    }
    ranking.sort((a, b) => b.score - a.score);
    
    console.log(`\n🏆 Top 10 Algorithm Rankings:`);
    ranking.slice(0, 10).forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.num}: Score ${item.score.toFixed(4)}`);
    });
    
    // Generate final prediction
    const neededNumbers = 6 - bases.length;
    const ensemblePicks = ranking.slice(0, neededNumbers).map(item => item.num);
    const finalPrediction = [...bases, ...ensemblePicks].slice(0, 6).sort((a, b) => a - b);
    
    console.log(`\n🎯 FINAL PREDICTION ASSEMBLY:`);
    console.log(`   • Base Numbers (${bases.length}): [${bases.join(', ')}]`);
    console.log(`   • Algorithm Picks (${neededNumbers}): [${ensemblePicks.join(', ')}]`);
    console.log(`   • Combined & Sorted: [${finalPrediction.join(', ')}]`);
    
    return {
        prediction: finalPrediction,
        scores: scores,
        ranking: ranking,
        analysisRange: analysisRange,
        recentDraws: recentDraws.length
    };
}

function compareWithUIInstructions(validationResult, drawRange) {
    console.log(`\n📋 UI COMPARISON INSTRUCTIONS FOR ${drawRange} DRAWS`);
    console.log('=' .repeat(55));
    
    console.log(`\n🎯 EXPECTED UI RESULT: [${validationResult.prediction.join(', ')}]`);
    
    console.log(`\n🔧 CHECK THESE UI ELEMENTS:`);
    console.log(`1. Prediction Method dropdown = "Enhanced Ensemble (Recommended)"`);
    console.log(`2. Draw Range dropdown = "Last ${drawRange} draws"`);
    console.log(`3. Click "Predict" button`);
    console.log(`4. Check main prediction result`);
    console.log(`5. Open browser console (F12) for any errors`);
    
    console.log(`\n🔍 DIAGNOSTIC CHECKLIST:`);
    console.log(`□ Analysis range should be: ${validationResult.analysisRange} draws`);
    console.log(`□ Base numbers should be: [16, 22, 10]`);
    console.log(`□ Recent draws for hot/cold: ${validationResult.recentDraws}`);
    console.log(`□ Top algorithm pick should be: Number ${validationResult.ranking[0].num}`);
    console.log(`□ Final prediction should be: [${validationResult.prediction.join(', ')}]`);
    
    console.log(`\n⚠️ COMMON ISSUES TO CHECK:`);
    console.log(`• CSV data loading properly (check latest date)`);
    console.log(`• JavaScript errors in console`);
    console.log(`• Dropdown values being read correctly`);
    console.log(`• Analysis range calculation (should be Math.min(${drawRange}, historical.length))`);
    console.log(`• Base numbers hardcoded as [16, 22, 10]`);
    console.log(`• includeAdd = false (additional numbers excluded)`);
    
    console.log(`\n📊 ANALYTICS VERIFICATION:`);
    console.log(`Expected analytics should show:`);
    [16, 22, 10, validationResult.ranking[0].num, validationResult.ranking[1].num].forEach(num => {
        if (validationResult.scores[num]) {
            console.log(`• Number ${num}: Score ≈ ${validationResult.scores[num].toFixed(1)}`);
        }
    });
}

function diagnoseFrequencyCompatibility(historical, drawRange) {
    console.log(`\n📊 DIAGNOSING FREQUENCY + COMPATIBILITY (${drawRange} draws)`);
    console.log('=' .repeat(60));
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    console.log(`📊 Input Parameters:`);
    console.log(`   • Draw Range: ${drawRange}`);
    console.log(`   • Base Numbers: [${bases.join(', ')}]`);
    console.log(`   • Include Additional: ${includeAdd}`);
    
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    console.log(`\n🔍 Calculation Process:`);
    
    // Debug first few draws
    console.log(`   Frequency Calculation (first 3 draws):`);
    historical.slice(0, Math.min(3, drawRange)).forEach((draw, idx) => {
        console.log(`      Draw ${idx + 1}: [${draw.numbers.join(', ')}]`);
        draw.numbers.forEach(n => freq[n]++);
    });
    
    // Complete frequency calculation
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
    
    // Show sample calculations
    console.log(`\n📈 Sample Frequency Results:`);
    [16, 22, 10, 34, 19].forEach(num => {
        console.log(`   Number ${num}: Frequency ${freq[num]}, Compatibility ${compat[num]}, Score ${freq[num] + compat[num]}`);
    });
    
    // Generate prediction
    const scores = freq.map((f, i) => f + compat[i]);
    const suggestions = scores
        .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 6);
    
    const prediction = suggestions.map(o => o.n).sort((a, b) => a - b);
    
    console.log(`\n🏆 Top 6 Numbers:`);
    suggestions.forEach((item, i) => {
        console.log(`   ${i+1}. Number ${item.n}: Score ${item.score} (Freq: ${item.freq}, Compat: ${item.compat})`);
    });
    
    console.log(`\n🎯 EXPECTED UI RESULT: [${prediction.join(', ')}]`);
    
    return { prediction, freq, compat, suggestions };
}

function runDiagnostic() {
    const historical = loadHistoricalData();
    
    if (historical.length === 0) {
        console.log('❌ Cannot run diagnostic - no historical data');
        return;
    }
    
    console.log(`\n📅 Latest Draw: ${historical[0].date} - [${historical[0].numbers.join(', ')}] + ${historical[0].additional}`);
    
    // Test the most commonly used configuration
    const testDrawRange = 50;
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔬 DIAGNOSTIC FOCUS: ${testDrawRange} DRAWS (Most Common Configuration)`);
    console.log(`${'='.repeat(70)}`);
    
    // Diagnose Enhanced Ensemble
    const enhancedResult = diagnoseEnhancedEnsemble(historical, testDrawRange);
    compareWithUIInstructions(enhancedResult, testDrawRange);
    
    // Quick diagnose of Frequency+Compatibility
    const freqResult = diagnoseFrequencyCompatibility(historical, testDrawRange);
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎯 QUICK COMPARISON SUMMARY`);
    console.log(`${'='.repeat(70)}`);
    
    console.log(`\nFor ${testDrawRange} draws, your UI should show:`);
    console.log(`🚀 Enhanced Ensemble: [${enhancedResult.prediction.join(', ')}]`);
    console.log(`📊 Frequency+Compatibility: [${freqResult.prediction.join(', ')}]`);
    
    console.log(`\n❓ If your UI shows different results:`);
    console.log(`1. Check browser console (F12) for JavaScript errors`);
    console.log(`2. Verify dropdowns are set correctly`);
    console.log(`3. Ensure CSV data loaded (check latest date matches above)`);
    console.log(`4. Check if analysis range calculation is correct`);
    console.log(`5. Verify base numbers are [16, 22, 10] in Enhanced Ensemble`);
    
    return { enhancedResult, freqResult };
}

// Run the diagnostic
runDiagnostic();