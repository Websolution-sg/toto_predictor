// Hot/Cold Analysis Validation for All Draw Ranges
console.log('🌡️ HOT/COLD ANALYSIS VALIDATION - ALL RANGES');
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

function runHotColdValidation(historical, drawRange) {
    const bases = [16, 22, 10]; // Base numbers for compatibility
    const includeAdd = false;
    
    console.log(`\n🌡️ HOT/COLD ANALYSIS - ${drawRange} DRAWS`);
    console.log('=' .repeat(50));
    
    const analysisRange = Math.min(drawRange, historical.length);
    
    console.log(`📊 Analysis Range: ${analysisRange} draws (requested: ${drawRange})`);
    console.log(`📌 Base Numbers: [${bases.join(', ')}] (for compatibility calculation)`);
    console.log(`🔄 Include Additional: ${includeAdd}`);
    
    // Calculate frequency and compatibility (same as Frequency+Compatibility method)
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    console.log(`\n📈 Calculation Process:`);
    
    // Calculate frequency and compatibility
    historical.slice(0, analysisRange).forEach(draw => {
        const pool = includeAdd ? draw.numbers.concat(draw.additional) : draw.numbers;
        
        // Count frequency
        pool.forEach(n => {
            if (n >= 1 && n <= 49) {
                freq[n]++;
            }
        });
        
        // Calculate compatibility with base numbers
        bases.forEach(b => {
            if (pool.includes(b)) {
                pool.filter(n => n !== b).forEach(n => {
                    if (n >= 1 && n <= 49) {
                        compat[n]++;
                    }
                });
            }
        });
    });
    
    // Hot/Cold classification (last 10 draws for temperature)
    const recentDraws = historical.slice(0, 10);
    console.log(`🌡️ Hot/Cold Temperature Analysis (last ${recentDraws.length} draws):`);
    
    const temperature = Array(50).fill(0);
    for (let num = 1; num <= 49; num++) {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        
        if (recentCount >= 3) {
            temperature[num] = 'HOT';
        } else if (recentCount === 0) {
            temperature[num] = 'COLD';
        } else {
            temperature[num] = 'NEUTRAL';
        }
    }
    
    // Show sample temperature calculations
    [2, 15, 19, 22, 34, 35].forEach(num => {
        const recentCount = recentDraws.reduce((count, draw) => {
            return count + (draw.numbers.includes(num) ? 1 : 0);
        }, 0);
        console.log(`   Number ${num}: ${recentCount} recent appearances → ${temperature[num]}`);
    });
    
    // Calculate total scores (Frequency + Compatibility) - same as Frequency+Compatibility
    const scores = freq.map((f, i) => f + compat[i]);
    const suggestions = scores
        .map((score, n) => ({ 
            n, 
            score, 
            freq: freq[n], 
            compat: compat[n], 
            temp: temperature[n] 
        }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 6);
    
    const prediction = suggestions.map(o => o.n).sort((a, b) => a - b);
    
    console.log(`\n🏆 Top 10 Numbers by Score (Freq + Compat):`);
    scores
        .map((score, n) => ({ 
            n, 
            score, 
            freq: freq[n], 
            compat: compat[n], 
            temp: temperature[n] 
        }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 10)
        .forEach((item, i) => {
            console.log(`   ${i+1}. Number ${item.n}: Score ${item.score} (Freq: ${item.freq}, Compat: ${item.compat}) - ${item.temp}`);
        });
    
    console.log(`\n🎯 PREDICTION ASSEMBLY:`);
    console.log(`   Top 6 Numbers: [${suggestions.map(o => o.n).join(', ')}]`);
    console.log(`   Sorted Result: [${prediction.join(', ')}]`);
    console.log(`   Temperature Mix: ${suggestions.map(o => `${o.n}(${o.temp})`).join(', ')}`);
    
    return {
        prediction: prediction,
        freq: freq,
        compat: compat,
        temperature: temperature,
        suggestions: suggestions,
        analysisRange: analysisRange
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
    console.log(`🌡️ HOT/COLD ANALYSIS VALIDATION - ALL RANGES`);
    console.log(`${'='.repeat(70)}`);
    
    // Run validation for each range
    drawRanges.forEach(range => {
        results[range] = runHotColdValidation(historical, range);
    });
    
    // Summary for easy UI comparison
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 UI VALIDATION SUMMARY - HOT/COLD ANALYSIS`);
    console.log(`${'='.repeat(70)}`);
    
    console.log(`\n🎯 EXPECTED UI RESULTS:`);
    drawRanges.forEach(range => {
        console.log(`   ${range} draws: [${results[range].prediction.join(', ')}]`);
    });
    
    console.log(`\n📋 UI TEST INSTRUCTIONS:`);
    console.log(`1. Open your TOTO predictor website`);
    console.log(`2. Set: Prediction Method = "Hot/Cold Number Analysis"`);
    console.log(`3. Test each draw range:`);
    
    drawRanges.forEach(range => {
        console.log(`\n   🧪 TEST ${range} DRAWS:`);
        console.log(`   • Set: Draw Range = "Last ${range} draws"`);
        console.log(`   • Click: "Predict" button`);
        console.log(`   • Expected: [${results[range].prediction.join(', ')}]`);
        console.log(`   • Verify: All 6 numbers match exactly`);
        
        // Show temperature breakdown
        console.log(`   • Temperature mix:`);
        results[range].suggestions.forEach((item, i) => {
            console.log(`     ${i+1}. Number ${item.n}: ${item.temp} (Score: ${item.score})`);
        });
    });
    
    console.log(`\n✅ VALIDATION CHECKLIST:`);
    console.log(`□ 20 draws → [${results[20].prediction.join(', ')}]`);
    console.log(`□ 50 draws → [${results[50].prediction.join(', ')}]`);
    console.log(`□ 100 draws → [${results[100].prediction.join(', ')}]`);
    console.log(`□ Results should be IDENTICAL to Frequency + Compatibility`);
    console.log(`□ Hot/Cold temperature is for display only (doesn't affect scoring)`);
    console.log(`□ All results have exactly 6 numbers`);
    
    console.log(`\n🚨 IF RESULTS DON'T MATCH:`);
    console.log(`• Hot/Cold should give SAME results as Frequency + Compatibility`);
    console.log(`• Only difference is temperature display (HOT/COLD/NEUTRAL)`);
    console.log(`• Check browser console (F12) for JavaScript errors`);
    console.log(`• Verify dropdown: "Hot/Cold Number Analysis" is selected`);
    
    console.log(`\n🔍 ALGORITHM DETAILS:`);
    console.log(`• Hot/Cold Analysis uses same scoring as Frequency + Compatibility`);
    console.log(`• Temperature classification: HOT (≥3 recent), COLD (0 recent), NEUTRAL (1-2 recent)`);
    console.log(`• Temperature is for display/analytics only - doesn't affect prediction`);
    console.log(`• Final prediction = Top 6 scoring numbers by Frequency + Compatibility`);
    
    return results;
}

// Run the validation
const validationResults = generateAllValidations();

// Export for manual checking
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validationResults };
}