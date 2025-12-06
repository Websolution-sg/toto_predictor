// Enhanced Ensemble Validation for All Draw Ranges
console.log('🚀 ENHANCED ENSEMBLE VALIDATION - ALL RANGES');
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
        console.log(`📅 Latest: ${historical[0].date} - [${historical[0].numbers.join(', ')}] + ${historical[0].additional}`);
        return historical;
    } catch (error) {
        console.error('❌ Error loading CSV:', error.message);
        return [];
    }
}

function runEnhancedEnsembleValidation(historical, drawRange) {
    const bases = [16, 22, 10]; // Enhanced 3-Base System
    const includeAdd = false;
    
    console.log(`\n🎯 ENHANCED ENSEMBLE - ${drawRange} DRAWS`);
    console.log('=' .repeat(50));
    
    // Initialize scores
    const scores = Array(50).fill(0);
    const analysisRange = Math.min(drawRange, historical.length);
    
    console.log(`📊 Analysis Range: ${analysisRange} draws (requested: ${drawRange})`);
    console.log(`📌 Base Numbers: [${bases.join(', ')}]`);
    console.log(`🔄 Include Additional: ${includeAdd}`);
    
    // Multi-factor scoring
    console.log(`\n📈 Scoring Process:`);
    historical.slice(0, analysisRange).forEach((draw, idx) => {
        const weight = Math.pow(0.95, idx);
        
        // Show first few calculations
        if (idx < 3) {
            console.log(`   Draw ${idx + 1}: Weight ${weight.toFixed(4)} - [${draw.numbers.join(', ')}]`);
        }
        
        draw.numbers.forEach(num => {
            scores[num] += 0.4 + (0.35 * weight);
        });
        
        if (includeAdd && draw.additional) {
            scores[draw.additional] += 0.2 + (0.15 * weight);
        }
    });
    
    // Hot/Cold balance
    const recentDraws = historical.slice(0, 10);
    console.log(`\n🌡️ Hot/Cold Balance (last ${recentDraws.length} draws):`);
    
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
    
    // Sample hot/cold calculations
    [16, 22, 10, 34, 19].forEach(num => {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        
        let status = 'NEUTRAL';
        if (recentCount >= 3) status = 'HOT';
        else if (recentCount === 0) status = 'COLD';
        
        console.log(`   Number ${num}: ${recentCount} recent appearances → ${status} (Score: ${scores[num].toFixed(4)})`);
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
    
    console.log(`\n🎯 PREDICTION ASSEMBLY:`);
    console.log(`   Base Numbers (${bases.length}): [${bases.join(', ')}]`);
    console.log(`   Algorithm Picks (${neededNumbers}): [${ensemblePicks.join(', ')}]`);
    console.log(`   Final Result: [${finalPrediction.join(', ')}]`);
    
    return {
        prediction: finalPrediction,
        scores: scores,
        ranking: ranking,
        analysisRange: analysisRange,
        bases: bases,
        ensemblePicks: ensemblePicks
    };
}

function generateAllValidations() {
    const historical = loadHistoricalData();
    
    if (historical.length === 0) {
        console.log('❌ Cannot validate - no historical data');
        return;
    }
    
    const drawRanges = [20, 50, 100];
    const results = {};
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 ENHANCED ENSEMBLE VALIDATION - ALL RANGES`);
    console.log(`${'='.repeat(70)}`);
    
    // Run validation for each range
    drawRanges.forEach(range => {
        results[range] = runEnhancedEnsembleValidation(historical, range);
    });
    
    // Summary for easy UI comparison
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 UI VALIDATION SUMMARY - ENHANCED ENSEMBLE`);
    console.log(`${'='.repeat(70)}`);
    
    console.log(`\n🎯 EXPECTED UI RESULTS:`);
    drawRanges.forEach(range => {
        console.log(`   ${range} draws: [${results[range].prediction.join(', ')}]`);
    });
    
    console.log(`\n📋 UI TEST INSTRUCTIONS:`);
    console.log(`1. Open your TOTO predictor website`);
    console.log(`2. Set: Prediction Method = "Enhanced Ensemble (Recommended)"`);
    console.log(`3. Test each draw range:`);
    
    drawRanges.forEach(range => {
        console.log(`\n   🧪 TEST ${range} DRAWS:`);
        console.log(`   • Set: Draw Range = "Last ${range} draws"`);
        console.log(`   • Click: "Predict" button`);
        console.log(`   • Expected: [${results[range].prediction.join(', ')}]`);
        console.log(`   • Verify: All 6 numbers match exactly`);
    });
    
    console.log(`\n✅ VALIDATION CHECKLIST:`);
    console.log(`□ 20 draws → [${results[20].prediction.join(', ')}]`);
    console.log(`□ 50 draws → [${results[50].prediction.join(', ')}]`);
    console.log(`□ 100 draws → [${results[100].prediction.join(', ')}]`);
    console.log(`□ All results include base numbers [16, 22, 10]`);
    console.log(`□ All results have exactly 6 numbers`);
    console.log(`□ All numbers are in range 1-49`);
    
    console.log(`\n🚨 IF RESULTS DON'T MATCH:`);
    console.log(`• Check browser console (F12) for JavaScript errors`);
    console.log(`• Verify dropdown selections are correct`);
    console.log(`• Ensure CSV data loaded properly (latest date should be ${historical[0].date})`);
    console.log(`• Check if base numbers [16, 22, 10] appear in all predictions`);
    
    return results;
}

// Run the validation
const validationResults = generateAllValidations();

// Export for manual checking
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validationResults };
}