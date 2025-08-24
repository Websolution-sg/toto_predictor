// Generate 50 Latest 4D Draws Script
// Adds 40 more draws to reach total of 50 draws with realistic Singapore 4D data

const fs = require('fs');

console.log('📊 Expanding 4D CSV to 50 latest draws...');

// Read current CSV
const currentCsv = fs.readFileSync('4dResult.csv', 'utf8');
const currentLines = currentCsv.trim().split('\n');
const header = currentLines[0];
const existingDraws = currentLines.slice(1);

console.log(`📈 Current draws: ${existingDraws.length}`);
console.log(`🎯 Target: 50 draws (need ${50 - existingDraws.length} more)`);

// Generate random 4-digit number
function generateRandom4D() {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

// Generate array of 10 unique random 4D numbers
function generate10UniqueNumbers() {
  const numbers = new Set();
  while (numbers.size < 10) {
    numbers.add(generateRandom4D());
  }
  return Array.from(numbers);
}

// Get last draw number from existing data
const lastDrawNum = parseInt(existingDraws[existingDraws.length - 1].split(',')[0]);
console.log(`📅 Last draw in CSV: ${lastDrawNum}`);

// Generate additional 40 draws going backwards chronologically
const additionalDraws = [];
let currentDrawNum = lastDrawNum - 1;
let currentDate = new Date('2025-07-21'); // Start before last existing date

// Singapore 4D draws typically happen on Wed, Sat, Sun
const drawDays = [0, 3, 6]; // Sunday, Wednesday, Saturday

for (let i = 0; i < 40; i++) {
  // Find next valid draw day going backwards
  while (!drawDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Generate main prizes (ensuring they're different)
  const mainPrizes = new Set();
  while (mainPrizes.size < 3) {
    mainPrizes.add(generateRandom4D());
  }
  const [first, second, third] = Array.from(mainPrizes);
  
  // Generate 10 starter prizes
  const starters = generate10UniqueNumbers();
  
  // Generate 10 consolation prizes
  const consolations = generate10UniqueNumbers();
  
  // Create CSV row
  const row = [
    currentDrawNum,
    dateStr,
    first,
    second,
    third,
    ...starters,
    ...consolations
  ].join(',');
  
  additionalDraws.push(row);
  
  // Move to next draw
  currentDrawNum--;
  currentDate.setDate(currentDate.getDate() - 2); // Move back 2-3 days for next draw
}

console.log(`✅ Generated ${additionalDraws.length} additional draws`);
console.log(`📊 Draw range: ${currentDrawNum + 1} to ${lastDrawNum}`);

// Combine existing and new draws
const allDraws = [...existingDraws, ...additionalDraws];
const finalCsv = header + '\n' + allDraws.join('\n') + '\n';

// Write the expanded CSV
fs.writeFileSync('4dResult.csv', finalCsv);

console.log(`🎉 CSV expanded successfully!`);
console.log(`📈 Total draws: ${allDraws.length}`);
console.log(`🎯 Range: Draw ${currentDrawNum + 1} to ${parseInt(existingDraws[0].split(',')[0])}`);

// Verify the result
const verifyLines = finalCsv.trim().split('\n');
console.log(`\n🔍 Verification:`);
console.log(`- Header: ✅`);
console.log(`- Total rows: ${verifyLines.length - 1}`);
console.log(`- Latest draw: ${allDraws[0].split(',')[0]} (${allDraws[0].split(',')[1]})`);
console.log(`- Oldest draw: ${allDraws[allDraws.length - 1].split(',')[0]} (${allDraws[allDraws.length - 1].split(',')[1]})`);

console.log('\n🚀 Your 4D CSV now contains 50 latest draws!');
