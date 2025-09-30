#!/usr/bin/env node
/**
 * 🔍 MANUAL RECOUNT VERIFICATION FOR NUMBER 15
 * Careful manual counting to confirm exact appearances
 */

import fs from 'fs';

console.log('🔍 MANUAL RECOUNT VERIFICATION FOR NUMBER 15');
console.log('============================================');

// Load CSV data
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');

console.log(`📊 Total lines in CSV: ${lines.length}`);

// Parse and display each draw with manual count
const draws = lines.map((line, index) => {
  const parts = line.split(',');
  return {
    index: index + 1,
    date: parts[0],
    numbers: parts.slice(1, 7).map(n => parseInt(n)),
    additional: parseInt(parts[7])
  };
});

console.log('\n📋 LAST 20 DRAWS - MANUAL COUNT FOR NUMBER 15:');
console.log('==============================================');

let count20 = 0;
const last20 = draws.slice(0, 20);

last20.forEach((draw, index) => {
  const drawNumber = index + 1;
  const hasNumber15 = draw.numbers.includes(15);
  
  console.log(`Draw ${drawNumber.toString().padStart(2)} (${draw.date}): [${draw.numbers.join(', ')}] + ${draw.additional}`);
  
  if (hasNumber15) {
    count20++;
    console.log(`         ✅ NUMBER 15 FOUND! (Count: ${count20})`);
  } else {
    console.log(`         ❌ No 15`);
  }
});

console.log(`\n📊 LAST 20 DRAWS TOTAL: ${count20} appearances of number 15`);

console.log('\n📋 LAST 50 DRAWS - MANUAL COUNT FOR NUMBER 15:');
console.log('==============================================');

let count50 = 0;
const last50 = draws.slice(0, 50);

last50.forEach((draw, index) => {
  const drawNumber = index + 1;
  const hasNumber15 = draw.numbers.includes(15);
  
  if (hasNumber15) {
    count50++;
    console.log(`Draw ${drawNumber.toString().padStart(2)} (${draw.date}): [${draw.numbers.join(', ')}] + ${draw.additional} ✅ FOUND #15 (Count: ${count50})`);
  }
});

console.log(`\n📊 LAST 50 DRAWS TOTAL: ${count50} appearances of number 15`);

console.log('\n🔍 VERIFICATION SUMMARY:');
console.log('=======================');
console.log(`Your count - Last 20 draws: 3 appearances`);
console.log(`My count - Last 20 draws: ${count20} appearances`);
console.log(`Match: ${count20 === 3 ? '✅ CONFIRMED' : '❌ DIFFERENT'}`);

console.log(`\nYour count - Last 50 draws: 9 appearances`);
console.log(`My count - Last 50 draws: ${count50} appearances`);
console.log(`Match: ${count50 === 9 ? '✅ CONFIRMED' : '❌ DIFFERENT'}`);

if (count20 !== 3 || count50 !== 9) {
  console.log('\n🔍 DISCREPANCY INVESTIGATION:');
  console.log('============================');
  
  if (count20 !== 3) {
    console.log(`❓ Last 20 draws: You counted 3, I counted ${count20}`);
    console.log('   Possible reasons:');
    console.log('   - Different CSV data');
    console.log('   - Different counting method');
    console.log('   - Different date range');
  }
  
  if (count50 !== 9) {
    console.log(`❓ Last 50 draws: You counted 9, I counted ${count50}`);
    console.log('   Possible reasons:');
    console.log('   - Different CSV data');
    console.log('   - Different counting method');
    console.log('   - Different date range');
  }
  
  // Show the exact draws where I found 15
  console.log('\n📋 EXACT DRAWS WHERE I FOUND NUMBER 15:');
  last50.forEach((draw, index) => {
    if (draw.numbers.includes(15)) {
      const position = draw.numbers.indexOf(15) + 1;
      console.log(`   Draw ${index + 1}: ${draw.date} - Position ${position} in [${draw.numbers.join(', ')}]`);
    }
  });
} else {
  console.log('\n✅ PERFECT MATCH! Your manual count is confirmed.');
}

console.log('\n✅ MANUAL RECOUNT COMPLETED');