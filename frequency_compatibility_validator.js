// Frequency + Compatibility Validation for All Draw Ranges
console.log('📊 FREQUENCY + COMPATIBILITY VALIDATION - ALL RANGES');
console.log('=' .repeat(65));

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

function runFrequencyCompatibilityValidation(historical, drawRange) {
    const bases = [16, 22, 10]; // Base numbers for compatibility
    const includeAdd = false;
    
    console.log(`\n📊 FREQUENCY + COMPATIBILITY - ${drawRange} DRAWS`);
    console.log('=' .repeat(55));
    
    const analysisRange = Math.min(drawRange, historical.length);
    
    console.log(`📊 Analysis Range: ${analysisRange} draws (requested: ${drawRange})`);
    console.log(`📌 Base Numbers: [${bases.join(', ')}] (for compatibility calculation)`);
    console.log(`🔄 Include Additional: ${includeAdd}`);
    
    // Initialize arrays
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    console.log(`\n📈 Calculation Process:`);
    
    // Calculate frequency and compatibility
    console.log(`   Analyzing first 3 draws for demonstration:`);
    historical.slice(0, Math.min(3, analysisRange)).forEach((draw, idx) => {
        const pool = includeAdd ? draw.numbers.concat(draw.additional) : draw.numbers;
        console.log(`      Draw ${idx + 1}: [${pool.join(', ')}]`);
        
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
    
    // Complete calculation for all draws
    historical.slice(0, analysisRange).forEach(draw => {
        const pool = includeAdd ? draw.numbers.concat(draw.additional) : draw.numbers;
        
        // Count frequency
        pool.forEach(n => {
            if (n >= 1 && n <= 49) {
                freq[n]++;
            }
        });
        
        // Calculate compatibility
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
    
    // Show sample calculations
    console.log(`\n📈 Sample Results:`);
    const sampleNumbers = [2, 15, 19, 22, 34, 35];
    sampleNumbers.forEach(num => {
        const totalScore = freq[num] + compat[num];
        console.log(`   Number ${num}: Frequency ${freq[num]}, Compatibility ${compat[num]}, Total Score ${totalScore}`);
    });
    
    // Calculate total scores and create suggestions
    const scores = freq.map((f, i) => f + compat[i]);
    const suggestions = scores
        .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 6);
    
    const prediction = suggestions.map(o => o.n).sort((a, b) => a - b);
    
    console.log(`\n🏆 Top 10 Numbers by Score:`);
    scores
        .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
        .filter(o => o.n >= 1 && o.n <= 49)
        .sort((a, b) => b.score - a.score || a.n - b.n)
        .slice(0, 10)
        .forEach((item, i) => {
            console.log(`   ${i+1}. Number ${item.n}: Score ${item.score} (Freq: ${item.freq}, Compat: ${item.compat})`);
        });
    
    console.log(`\n🎯 PREDICTION ASSEMBLY:`);
    console.log(`   Top 6 Numbers: [${suggestions.map(o => o.n).join(', ')}]`);
    console.log(`   Sorted Result: [${prediction.join(', ')}]`);
    
    return {
        prediction: prediction,
        freq: freq,
        compat: compat,
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
    console.log(`📊 FREQUENCY + COMPATIBILITY VALIDATION - ALL RANGES`);
    console.log(`${'='.repeat(70)}`);
    
    // Run validation for each range
    drawRanges.forEach(range => {
        results[range] = runFrequencyCompatibilityValidation(historical, range);
    });
    
    // Summary for easy UI comparison
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 UI VALIDATION SUMMARY - FREQUENCY + COMPATIBILITY`);
    console.log(`${'='.repeat(70)}`);
    
    console.log(`\n🎯 EXPECTED UI RESULTS:`);
    drawRanges.forEach(range => {
        console.log(`   ${range} draws: [${results[range].prediction.join(', ')}]`);
    });
    
    console.log(`\n📋 UI TEST INSTRUCTIONS:`);
    console.log(`1. Open your TOTO predictor website`);
    console.log(`2. Set: Prediction Method = "Frequency + Compatibility"`);
    console.log(`3. Test each draw range:`);
    
    drawRanges.forEach(range => {
        console.log(`\n   🧪 TEST ${range} DRAWS:`);
        console.log(`   • Set: Draw Range = "Last ${range} draws"`);
        console.log(`   • Click: "Predict" button`);
        console.log(`   • Expected: [${results[range].prediction.join(', ')}]`);
        console.log(`   • Verify: All 6 numbers match exactly`);
        
        // Show breakdown
        console.log(`   • Top scorers:`);
        results[range].suggestions.slice(0, 3).forEach((item, i) => {
            console.log(`     ${i+1}. Number ${item.n}: ${item.score} (Freq:${item.freq} + Compat:${item.compat})`);
        });
    });
    
    console.log(`\n✅ VALIDATION CHECKLIST:`);
    console.log(`□ 20 draws → [${results[20].prediction.join(', ')}]`);
    console.log(`□ 50 draws → [${results[50].prediction.join(', ')}]`);
    console.log(`□ 100 draws → [${results[100].prediction.join(', ')}]`);
    console.log(`□ All results based purely on frequency + compatibility scores`);
    console.log(`□ All results have exactly 6 numbers`);
    console.log(`□ All numbers are in range 1-49`);
    
    console.log(`\n🚨 IF RESULTS DON'T MATCH:`);
    console.log(`• Check browser console (F12) for JavaScript errors`);
    console.log(`• Verify dropdown: "Frequency + Compatibility" is selected`);
    console.log(`• Ensure CSV data loaded properly (latest date should be ${historical[0].date})`);
    console.log(`• Verify frequency counting logic (should count appearances in draws)`);
    console.log(`• Check compatibility logic (co-occurrence with base numbers [16,22,10])`);
    
    console.log(`\n🔍 ALGORITHM DETAILS:`);
    console.log(`• Frequency = How often each number appears in the selected draw range`);
    console.log(`• Compatibility = How often each number appears WITH base numbers [16,22,10]`);
    console.log(`• Final Score = Frequency + Compatibility`);
    console.log(`• Top 6 scoring numbers become the prediction`);
    
    return results;
}

// Run the validation
const validationResults = generateAllValidations();

// Export for manual checking
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validationResults };
}