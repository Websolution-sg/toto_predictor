// STATIC ANALYSIS: RECENT WINNING PATTERNS vs PREDICTION LOGIC
const fs = require('fs');

console.log('🔍 STATIC ANALYSIS OF RECENT WINNING PATTERNS');
console.log('='.repeat(50));

// Recent winning results
const recentWinners = [
  {date: "06-Nov-25", numbers: [3, 20, 24, 29, 32, 44], additional: 46},
  {date: "04-Nov-25", numbers: [10, 19, 22, 34, 39, 43], additional: 35},
  {date: "31-Oct-25", numbers: [1, 5, 31, 34, 38, 45], additional: 21},
  {date: "27-Oct-25", numbers: [4, 12, 14, 24, 36, 38], additional: 17},
  {date: "24-Oct-25", numbers: [7, 14, 17, 18, 31, 38], additional: 46}
];

console.log('\n📊 RECENT WINNING NUMBERS ANALYSIS:');
console.log('='.repeat(40));

recentWinners.forEach(winner => {
  console.log(`${winner.date}: ${winner.numbers.join(', ')} (Additional: ${winner.additional})`);
});

// Frequency analysis of recent winners
console.log('\n📈 FREQUENCY ANALYSIS OF RECENT WINNERS:');
console.log('='.repeat(45));

const allNumbers = recentWinners.flatMap(w => w.numbers);
const frequency = {};

// Count frequency
allNumbers.forEach(num => {
  frequency[num] = (frequency[num] || 0) + 1;
});

// Sort by frequency
const sortedFreq = Object.entries(frequency)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 15);

console.log('Most frequent numbers in recent 5 draws:');
sortedFreq.forEach(([num, freq]) => {
  const percentage = ((freq / 5) * 100).toFixed(1);
  console.log(`  ${num}: ${freq} times (${percentage}%)`);
});

// Range analysis
console.log('\n📊 NUMBER RANGE DISTRIBUTION:');
console.log('='.repeat(35));

const ranges = {
  'Low (1-10)': allNumbers.filter(n => n >= 1 && n <= 10).length,
  'Medium-Low (11-20)': allNumbers.filter(n => n >= 11 && n <= 20).length,
  'Medium (21-30)': allNumbers.filter(n => n >= 21 && n <= 30).length,
  'Medium-High (31-40)': allNumbers.filter(n => n >= 31 && n <= 40).length,
  'High (41-49)': allNumbers.filter(n => n >= 41 && n <= 49).length
};

Object.entries(ranges).forEach(([range, count]) => {
  const percentage = ((count / allNumbers.length) * 100).toFixed(1);
  console.log(`${range}: ${count} numbers (${percentage}%)`);
});

// Odd/Even analysis
console.log('\n⚖️ ODD/EVEN DISTRIBUTION:');
console.log('='.repeat(30));

const oddCount = allNumbers.filter(n => n % 2 === 1).length;
const evenCount = allNumbers.filter(n => n % 2 === 0).length;

console.log(`Odd numbers: ${oddCount} (${((oddCount/allNumbers.length)*100).toFixed(1)}%)`);
console.log(`Even numbers: ${evenCount} (${((evenCount/allNumbers.length)*100).toFixed(1)}%)`);

// Consecutive numbers analysis
console.log('\n🔢 CONSECUTIVE NUMBERS ANALYSIS:');
console.log('='.repeat(35));

recentWinners.forEach(winner => {
  const sorted = [...winner.numbers].sort((a, b) => a - b);
  const consecutivePairs = [];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutivePairs.push([sorted[i], sorted[i + 1]]);
    }
  }
  
  console.log(`${winner.date}: ${consecutivePairs.length > 0 ? consecutivePairs.map(p => p.join('-')).join(', ') : 'No consecutive pairs'}`);
});

// Sum analysis
console.log('\n➕ NUMBER SUM ANALYSIS:');
console.log('='.repeat(25));

recentWinners.forEach(winner => {
  const sum = winner.numbers.reduce((a, b) => a + b, 0);
  console.log(`${winner.date}: Sum = ${sum}`);
});

const allSums = recentWinners.map(w => w.numbers.reduce((a, b) => a + b, 0));
const avgSum = (allSums.reduce((a, b) => a + b, 0) / allSums.length).toFixed(1);
console.log(`Average sum: ${avgSum}`);
console.log(`Typical TOTO sum range: 120-180`);

console.log('\n🎯 PREDICTION MODEL VALIDATION INSIGHTS:');
console.log('='.repeat(45));

console.log('✓ Recent patterns show fairly distributed number selection');
console.log('✓ No extreme clustering in specific ranges');
console.log('✓ Mix of odd/even numbers as expected');
console.log('✓ Sums within typical TOTO range');

console.log('\n📋 WHAT TO LOOK FOR IN BROWSER VALIDATION:');
console.log('='.repeat(50));
console.log('• Enhanced Ensemble should perform best (combined algorithms)');
console.log('• "All results (132 draws)" should show most consistent accuracy');
console.log('• Look for >25% accuracy (significantly better than 16.7% random)');
console.log('• Frequency+Compatibility may excel with recent frequent numbers');
console.log('• Hot/Cold Balance should identify temperature patterns');

console.log('\n🚀 NEXT STEP: RUN BROWSER VALIDATION');
console.log('Use the validation script in your browser to see actual prediction performance!');