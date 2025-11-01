// MANUAL PREDICTION ACCURACY CHECKER
// Quick manual test of prediction accuracy using recent results

console.log('🎯 MANUAL PREDICTION ACCURACY CHECKER');
console.log('=' .repeat(45));

// Recent TOTO results for manual checking
const recentResults = [
    { date: '31-Oct-25', numbers: [1, 5, 31, 34, 38, 45], additional: 21 },
    { date: '27-Oct-25', numbers: [4, 12, 14, 24, 36, 38], additional: 17 },
    { date: '24-Oct-25', numbers: [7, 14, 17, 18, 31, 38], additional: 46 },
    { date: '20-Oct-25', numbers: [3, 10, 13, 15, 32, 37], additional: 8 },
    { date: '16-Oct-25', numbers: [2, 4, 8, 19, 35, 39], additional: 7 }
];

console.log('\n📊 RECENT TOTO RESULTS FOR ANALYSIS:');
recentResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.date}: [${result.numbers.join(', ')}] + ${result.additional}`);
});

// Function to test prediction accuracy manually
function testManualAccuracy() {
    console.log('\n🔍 MANUAL ACCURACY TEST INSTRUCTIONS:');
    console.log('=' .repeat(40));
    
    console.log('\n1️⃣ FREQUENCY ANALYSIS TEST:');
    console.log('Looking at the last 5 results, count number frequencies:');
    
    // Count frequencies
    const frequency = {};
    for (let i = 1; i <= 49; i++) frequency[i] = 0;
    
    recentResults.forEach(result => {
        result.numbers.forEach(num => frequency[num]++);
    });
    
    // Get most frequent numbers
    const sortedByFreq = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .map(([num, freq]) => ({ num: parseInt(num), freq }));
    
    console.log('\n📈 Most frequent numbers in last 5 draws:');
    sortedByFreq.slice(0, 10).forEach(item => {
        console.log(`   ${item.num}: appeared ${item.freq} times`);
    });
    
    const topFrequent = sortedByFreq.slice(0, 6).map(item => item.num);
    console.log(`\n🔮 Frequency-based prediction: [${topFrequent.join(', ')}]`);
    
    // Test against most recent result
    const latestResult = recentResults[0];
    const matches = countMatches(topFrequent, latestResult.numbers);
    console.log(`✨ Matches with ${latestResult.date}: ${matches}/6`);
    
    console.log('\n2️⃣ HOT/COLD ANALYSIS:');
    const hot = sortedByFreq.slice(0, 3).map(item => item.num);
    const cold = sortedByFreq.slice(-3).map(item => item.num);
    const hotColdPrediction = [...hot, ...cold];
    console.log(`🔥 Hot numbers: [${hot.join(', ')}]`);
    console.log(`❄️ Cold numbers: [${cold.join(', ')}]`);
    console.log(`🔮 Hot/Cold prediction: [${hotColdPrediction.join(', ')}]`);
    
    const hotColdMatches = countMatches(hotColdPrediction, latestResult.numbers);
    console.log(`✨ Matches with ${latestResult.date}: ${hotColdMatches}/6`);
    
    console.log('\n3️⃣ PATTERN ANALYSIS:');
    console.log('Number range distribution in recent draws:');
    
    const ranges = { '1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-49': 0 };
    recentResults.forEach(result => {
        result.numbers.forEach(num => {
            if (num <= 10) ranges['1-10']++;
            else if (num <= 20) ranges['11-20']++;
            else if (num <= 30) ranges['21-30']++;
            else if (num <= 40) ranges['31-40']++;
            else ranges['41-49']++;
        });
    });
    
    Object.entries(ranges).forEach(([range, count]) => {
        const percentage = ((count / 30) * 100).toFixed(1);
        console.log(`   ${range}: ${count}/30 numbers (${percentage}%)`);
    });
    
    console.log('\n4️⃣ CONSECUTIVE NUMBERS TEST:');
    console.log('Looking for consecutive number patterns:');
    
    recentResults.forEach(result => {
        const sorted = [...result.numbers].sort((a, b) => a - b);
        const consecutives = [];
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                consecutives.push([sorted[i], sorted[i + 1]]);
            }
        }
        console.log(`   ${result.date}: ${consecutives.length > 0 ? consecutives.map(pair => `[${pair.join(',')}]`).join(', ') : 'No consecutives'}`);
    });
    
    console.log('\n5️⃣ SUM ANALYSIS:');
    console.log('Sum of 6 main numbers in each draw:');
    
    recentResults.forEach(result => {
        const sum = result.numbers.reduce((a, b) => a + b, 0);
        console.log(`   ${result.date}: ${sum} (avg: ${(sum/6).toFixed(1)})`);
    });
    
    console.log('\n📊 ACCURACY EVALUATION:');
    console.log('=' .repeat(30));
    console.log('Random chance expectations:');
    console.log('• 0 matches: ~40.9% probability');
    console.log('• 1 match: ~42.1% probability');  
    console.log('• 2 matches: ~14.5% probability');
    console.log('• 3 matches: ~2.3% probability');
    console.log('• 4+ matches: <0.2% probability');
    
    console.log('\n💡 INTERPRETATION:');
    console.log('• 2+ matches = Better than average luck');
    console.log('• 3+ matches = Significant skill or luck');
    console.log('• 4+ matches = Exceptional (lottery level luck)');
    
    return {
        frequencyPrediction: topFrequent,
        frequencyMatches: matches,
        hotColdPrediction: hotColdPrediction,
        hotColdMatches: hotColdMatches,
        testDate: latestResult.date
    };
}

// Helper function
function countMatches(prediction, actual) {
    return prediction.filter(num => actual.includes(num)).length;
}

// Advanced pattern analysis
function analyzePatterns() {
    console.log('\n🔍 ADVANCED PATTERN ANALYSIS');
    console.log('=' .repeat(35));
    
    console.log('\n📈 Number gap analysis (differences between consecutive numbers):');
    recentResults.forEach(result => {
        const sorted = [...result.numbers].sort((a, b) => a - b);
        const gaps = [];
        for (let i = 0; i < sorted.length - 1; i++) {
            gaps.push(sorted[i + 1] - sorted[i]);
        }
        console.log(`${result.date}: Gaps [${gaps.join(', ')}], Avg gap: ${(gaps.reduce((a,b) => a + b, 0) / gaps.length).toFixed(1)}`);
    });
    
    console.log('\n🎯 Even/Odd distribution:');
    recentResults.forEach(result => {
        const even = result.numbers.filter(n => n % 2 === 0).length;
        const odd = 6 - even;
        console.log(`${result.date}: ${even} even, ${odd} odd`);
    });
    
    console.log('\n🔢 Sum analysis vs historical average (~150):');
    recentResults.forEach(result => {
        const sum = result.numbers.reduce((a, b) => a + b, 0);
        const variance = sum - 150;
        console.log(`${result.date}: Sum ${sum} (${variance >= 0 ? '+' : ''}${variance} vs avg)`);
    });
}

// Make functions available globally  
window.testManualAccuracy = testManualAccuracy;
window.analyzePatterns = analyzePatterns;

console.log('\n🚀 MANUAL ACCURACY CHECKER READY!');
console.log('Commands:');
console.log('• testManualAccuracy() - Basic accuracy analysis');
console.log('• analyzePatterns() - Advanced pattern analysis');
console.log('\nRun these in your browser console to analyze prediction accuracy!');