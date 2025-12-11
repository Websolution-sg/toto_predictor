const fs = require('fs');

console.log('🎯 TOTO Prediction Match Analysis');
console.log('='.repeat(50));

// Your winning ticket
const yourNumbers = [12, 15, 23, 30, 42, 43].sort((a,b) => a-b);
const actualResult = [9, 12, 15, 23, 27, 47].sort((a,b) => a-b);

console.log(`Your Numbers:    [${yourNumbers.join(', ')}]`);
console.log(`Actual Result:   [${actualResult.join(', ')}]`);

// Check matches with actual result
const matches = yourNumbers.filter(n => actualResult.includes(n));
console.log(`Matches: ${matches.length}/6 [${matches.join(', ')}]`);

// Determine prize group
let prizeGroup = 'No Prize';
if (matches.length === 3) prizeGroup = 'Group 7 ($10)';
else if (matches.length === 4) prizeGroup = 'Group 6 ($25)';
else if (matches.length === 5) prizeGroup = 'Group 5 ($50)';
else if (matches.length === 6) prizeGroup = 'Group 4+ (Major Prize)';

console.log(`Prize: ${prizeGroup} ✅`);

console.log('\n📊 Analysis of Your Numbers:');
console.log(`   Sum: ${yourNumbers.reduce((a,b) => a+b, 0)}`);
console.log(`   Even/Odd: ${yourNumbers.filter(n => n % 2 === 0).length}/${yourNumbers.filter(n => n % 2 === 1).length}`);
console.log(`   Range: ${Math.min(...yourNumbers)} - ${Math.max(...yourNumbers)}`);

// Check if these numbers could have come from the prediction system
console.log('\n🤖 Could This Be From Your Prediction System?');

// Check base numbers
const baseNumbers = [16, 22, 10];
const hasBaseNumbers = yourNumbers.some(n => baseNumbers.includes(n));
console.log(`   Base numbers (${baseNumbers.join(', ')}): ${hasBaseNumbers ? '❌ Contains base numbers' : '✅ No base numbers'}`);

// Check sum range (typical 100-150)
const sum = yourNumbers.reduce((a,b) => a+b, 0);
const inSumRange = sum >= 100 && sum <= 150;
console.log(`   Sum range (100-150): ${inSumRange ? '✅' : '❌'} Sum = ${sum}`);

// Check even/odd balance
const evenCount = yourNumbers.filter(n => n % 2 === 0).length;
const goodBalance = evenCount === 3;
console.log(`   Even/Odd balance: ${goodBalance ? '✅ Perfect 3/3' : `⚠️ ${evenCount}/${6-evenCount}`}`);

// Check against recent frequency data
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const recent20 = lines.slice(1, 21); // Previous 20 draws before the latest

const freq = Array(50).fill(0);
recent20.forEach(line => {
    const numbers = line.split(',').slice(1, 7).map(n => parseInt(n));
    numbers.forEach(n => freq[n]++);
});

console.log('\n📈 Frequency Analysis of Your Numbers:');
yourNumbers.forEach(n => {
    const frequency = freq[n];
    const status = frequency >= 3 ? '🔥 Hot' : frequency === 0 ? '🧊 Cold' : '🌡️ Warm';
    console.log(`   ${n}: ${frequency} times (${status})`);
});

// Overall assessment
console.log('\n' + '='.repeat(50));
console.log('🎯 PREDICTION SYSTEM ASSESSMENT:');
console.log('='.repeat(50));

const systemLikely = !hasBaseNumbers && inSumRange && (evenCount === 2 || evenCount === 3 || evenCount === 4);

if (systemLikely) {
    console.log('✅ LIKELY FROM YOUR PREDICTION SYSTEM');
    console.log('   - No base numbers (follows exclusion rule)');
    console.log('   - Sum in optimal range');
    console.log('   - Reasonable even/odd distribution');
    console.log('   - Mix of frequency patterns');
    
    // Guess which model
    const hotNumbers = yourNumbers.filter(n => freq[n] >= 3).length;
    const coldNumbers = yourNumbers.filter(n => freq[n] === 0).length;
    
    console.log('\n🔍 Most Likely Prediction Model:');
    if (hotNumbers >= 3) {
        console.log('   🔥 HOT/COLD ANALYSIS - High hot number content');
    } else if (evenCount === 3 && sum >= 120 && sum <= 140) {
        console.log('   ⚡ ENHANCED ENSEMBLE - Balanced approach');
    } else if (hotNumbers + coldNumbers <= 2) {
        console.log('   📊 FREQUENCY+COMPATIBILITY - Moderate frequency');
    } else {
        console.log('   ⏱️ WEIGHTED RECENT - Recent trend focus');
    }
    
} else {
    console.log('❌ UNLIKELY FROM YOUR PREDICTION SYSTEM');
    if (hasBaseNumbers) console.log('   - Contains base numbers (system excludes these)');
    if (!inSumRange) console.log('   - Sum outside optimal range');
    console.log('   - May be manual selection or different system');
}

console.log('\n🎉 CONGRATULATIONS on your $10 win!');
console.log(`You matched ${matches.length} numbers: [${matches.join(', ')}]`);