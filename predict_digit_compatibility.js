const fs = require('fs');

const csv = fs.readFileSync('4dResult.csv', 'utf8');
const lines = csv.trim().split('\n');
const header = lines[0].split(',');

const firstIdx = header.indexOf('first');
const secondIdx = header.indexOf('second');
const thirdIdx = header.indexOf('third');

const digitCounts = Array(10).fill(0);
const pairCounts = {};

// Collect digit and pair frequencies
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  [firstIdx, secondIdx, thirdIdx].forEach(idx => {
    const num = parts[idx];
    if (num && num.length === 4 && /^\d{4}$/.test(num)) {
      num.split('').forEach(d => digitCounts[parseInt(d)]++);
      for (let j = 0; j < 3; j++) {
        const pair = num[j] + num[j+1];
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    }
  });
}

// Get top digits and compatible pairs
const topDigits = digitCounts
  .map((count, digit) => ({ digit, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 4)
  .map(item => item.digit);

const topPairs = Object.entries(pairCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([pair]) => pair);

// Generate predictions using digit frequency and compatible pairs
const predictions = [];
for (let i = 0; i < topPairs.length; i++) {
  // Use compatible pairs in positions 1-2, 2-3, or 3-4
  predictions.push(topPairs[i] + topDigits[2] + topDigits[3]);
  predictions.push(topDigits[0] + topPairs[i] + topDigits[3]);
  predictions.push(topDigits[0] + topDigits[1] + topPairs[i]);
}

// Filter to valid 4-digit numbers and select top 6
const validPredictions = predictions.filter(num => num.length === 4).slice(0, 6);

console.log('4D Predictions (Digit Frequency & Compatibility Analysis):');
validPredictions.forEach((num, idx) => {
  console.log(`#${idx + 1}: ${num}`);
});
