// Quick accuracy analysis
const fs = require('fs');

console.log('🎯 TOTO PREDICTION ACCURACY ANALYSIS');
console.log('=' .repeat(40));

try {
    const csvData = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvData.trim().split('\n');
    
    console.log('📊 Loaded', lines.length, 'TOTO draws');
    
    const results = lines.slice(0, 10).map(line => {
        const parts = line.split(',');
        return {
            date: parts[0],
            numbers: parts.slice(1, 7).map(n => parseInt(n))
        };
    });
    
    console.log('\nLatest 5 results:');
    results.slice(0, 5).forEach((result, i) => {
        console.log(`${i+1}. ${result.date}: [${result.numbers.join(', ')}]`);
    });
    
    // Frequency analysis
    console.log('\n🔍 FREQUENCY ANALYSIS (Last 20 draws):');
    const frequency = {};
    for (let i = 1; i <= 49; i++) frequency[i] = 0;
    
    lines.slice(0, 20).forEach(line => {
        const parts = line.split(',');
        parts.slice(1, 7).forEach(numStr => {
            const num = parseInt(numStr);
            if (frequency[num] !== undefined) frequency[num]++;
        });
    });
    
    const sortedByFreq = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .map(([num, freq]) => ({ num: parseInt(num), freq }));
    
    console.log('Top 10 most frequent numbers:');
    sortedByFreq.slice(0, 10).forEach(item => {
        console.log(`  ${item.num}: ${item.freq} appearances`);
    });
    
    // Simple prediction test
    const freqPrediction = sortedByFreq.slice(0, 6).map(item => item.num);
    console.log(`\nFrequency-based prediction: [${freqPrediction.join(', ')}]`);
    
    // Test against latest result
    const latest = results[0];
    const matches = freqPrediction.filter(num => latest.numbers.includes(num)).length;
    console.log(`Matches with ${latest.date}: ${matches}/6 numbers`);
    
    // Backtest over multiple draws
    console.log('\n📈 BACKTEST RESULTS:');
    let totalMatches = 0;
    
    for (let i = 1; i < Math.min(8, results.length); i++) {
        const testResult = results[i];
        const testMatches = freqPrediction.filter(num => testResult.numbers.includes(num)).length;
        console.log(`${testResult.date}: ${testMatches}/6 matches`);
        totalMatches += testMatches;
    }
    
    const testCount = Math.min(7, results.length - 1);
    const avgMatches = (totalMatches / testCount).toFixed(2);
    const hitRate = ((totalMatches / (testCount * 6)) * 100).toFixed(1);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Tests conducted: ${testCount} draws`);
    console.log(`Average matches: ${avgMatches}/6 per draw`);
    console.log(`Hit rate: ${hitRate}% (vs 16.7% random)`);
    
    if (parseFloat(avgMatches) > 1.0) {
        console.log('✅ Performance: Better than random!');
    } else {
        console.log('📊 Performance: Within random range');
    }
    
    console.log('\n💡 Notes:');
    console.log('• Random chance averages ~1.0 matches per draw');
    console.log('• 2+ matches per draw = good performance');
    console.log('• 3+ matches per draw = excellent performance');
    
} catch (error) {
    console.log('❌ Error reading CSV:', error.message);
}