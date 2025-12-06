// Hot/Cold Analytics Validation Test
console.log('🌡️ HOT/COLD ANALYSIS VALIDATION TEST');
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
        
        console.log(`📊 Loaded ${historical.length} draws`);
        return historical;
    } catch (error) {
        console.error('❌ Error loading CSV:', error.message);
        return [];
    }
}

function testHotColdAnalytics(historical, drawRange) {
    console.log(`\n🔍 TESTING HOT/COLD ANALYTICS (${drawRange} draws)`);
    
    const bases = [16, 22, 10];
    const includeAdd = false;
    
    // Replicate the Hot/Cold analysis logic
    const recentSize = Math.min(Math.max(10, Math.floor(drawRange * 0.3)), 30);
    const recentDraws = historical.slice(0, Math.min(recentSize, historical.length));
    const historicalDraws = historical.slice(recentSize, Math.min(drawRange + recentSize, historical.length));
    
    console.log(`📈 Recent window: ${recentDraws.length} draws`);
    console.log(`📊 Historical window: ${historicalDraws.length} draws`);
    
    const recentFreq = Array(50).fill(0);
    const historicalFreq = Array(50).fill(0);
    
    // Count recent frequencies
    recentDraws.forEach(draw => {
        draw.numbers.forEach(n => {
            if (n >= 1 && n <= 49) recentFreq[n]++;
        });
    });
    
    // Count historical frequencies
    historicalDraws.forEach(draw => {
        draw.numbers.forEach(n => {
            if (n >= 1 && n <= 49) historicalFreq[n]++;
        });
    });
    
    // Calculate hot ratios and create suggestions
    const suggestions = [];
    for (let n = 1; n <= 49; n++) {
        if (!bases.includes(n)) {
            const recentRate = recentFreq[n] / recentDraws.length;
            const historicalRate = historicalFreq[n] / Math.max(1, historicalDraws.length);
            const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentFreq[n] > 0 ? 10 : 0);
            
            let hotScore = 0;
            hotScore += recentFreq[n] * 0.25;
            
            if (hotRatio > 1.5 && recentRate > 0.10) {
                hotScore += hotRatio * 0.40;
            }
            
            if (recentFreq[n] >= 3 && hotRatio > 1.2) {
                hotScore += 0.20;
            }
            
            if (recentFreq[n] === 0 && historicalRate > 0.08) {
                hotScore -= 0.15;
            }
            
            const rangeBonus = drawRange <= 20 ? hotScore * 0.1 : drawRange <= 50 ? hotScore * 0.05 : 0;
            hotScore += rangeBonus;
            
            suggestions.push({
                n,
                recentCount: recentFreq[n],
                recentRate: recentRate * 100,
                historicalRate: historicalRate * 100,
                hotRatio,
                hotScore,
                trend: recentFreq[n] > historicalFreq[n] / Math.max(1, historicalDraws.length) * recentDraws.length ? '+' : (recentFreq[n] === 0 ? '--' : '-'),
                temperature: hotRatio > 1.5 ? 'hot' : hotRatio < 0.5 ? 'cold' : 'warm'
            });
        }
    }
    
    suggestions.sort((a, b) => b.hotScore - a.hotScore);
    
    console.log('\n🌡️ Top 10 Hot/Cold Rankings:');
    suggestions.slice(0, 10).forEach((item, i) => {
        console.log(`  ${i+1}. Number ${item.n}: Score ${item.hotScore.toFixed(4)} (${item.temperature.toUpperCase()}) Ratio: ${item.hotRatio.toFixed(2)}x`);
    });
    
    // Test analytics data calculation
    console.log('\n📋 ANALYTICS DATA VALIDATION:');
    
    // Calculate proper frequency for analytics (total frequency over range)
    const freq = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    historical.slice(0, drawRange).forEach(draw => {
        draw.numbers.forEach(n => freq[n]++);
        bases.forEach(b => {
            if (draw.numbers.includes(b)) {
                draw.numbers.filter(n => n !== b).forEach(n => compat[n]++);
            }
        });
    });
    
    // Show sample analytics for top 3 numbers
    const top3 = suggestions.slice(0, 3);
    top3.forEach((item, i) => {
        console.log(`\n${i+1}. Number ${item.n} Analytics:`);
        console.log(`   📈 Hot/Cold Score: ${item.hotScore.toFixed(1)}`);
        console.log(`   🔢 Total Frequency: ${freq[item.n]} (${((freq[item.n] / drawRange) * 100).toFixed(1)}%)`);
        console.log(`   🤝 Compatibility: ${compat[item.n]} co-appearances`);
        console.log(`   🌡️ Temperature: ${item.temperature.toUpperCase()} (${item.hotRatio.toFixed(2)}x ratio)`);
        console.log(`   📊 Recent: ${item.recentCount}/${recentDraws.length}, Historical: ${historicalFreq[item.n]}/${historicalDraws.length}`);
    });
    
    return { suggestions, freq, compat, recentDraws, historicalDraws };
}

// Run tests
const historical = loadHistoricalData();

if (historical.length > 0) {
    [20, 50, 100].forEach(range => {
        console.log('\n' + '='.repeat(60));
        console.log(`🌡️ HOT/COLD ANALYSIS TEST - ${range} DRAWS`);
        console.log('='.repeat(60));
        
        testHotColdAnalytics(historical, range);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ HOT/COLD ANALYTICS VALIDATION COMPLETE');
    console.log('='.repeat(60));
    console.log('📋 Key fixes applied:');
    console.log('• Fixed frequency data to show total occurrences over selected range');
    console.log('• Fixed compatibility data to show co-appearances with base numbers');
    console.log('• Added temperature extraData for proper hot/cold display');
    console.log('• Corrected analytics data indexing for sorted display');
}