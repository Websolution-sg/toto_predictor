#!/usr/bin/env node
/**
 * 🔍 CSV FREQUENCY VERIFICATION
 * Checks frequency calculations against actual CSV data
 */

import fs from 'fs';

console.log('🔍 CSV FREQUENCY VERIFICATION');
console.log('============================');

// Load and parse CSV data
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
console.log(`📊 Total lines in CSV: ${lines.length}`);

// Parse each line and validate
const parsedData = [];
let parseErrors = 0;

lines.forEach((line, index) => {
  const parts = line.split(',');
  
  if (parts.length === 8) {
    const date = parts[0];
    const numbers = parts.slice(1, 7).map(n => parseInt(n));
    const additional = parseInt(parts[7]);
    
    // Validate numbers
    const invalidNumbers = numbers.filter(n => isNaN(n) || n < 1 || n > 49);
    if (invalidNumbers.length > 0 || isNaN(additional) || additional < 1 || additional > 49) {
      console.log(`⚠️ Line ${index + 1}: Invalid numbers detected`);
      parseErrors++;
    } else {
      parsedData.push({
        line: index + 1,
        date: date,
        numbers: numbers,
        additional: additional
      });
    }
  } else {
    console.log(`⚠️ Line ${index + 1}: Wrong format (${parts.length} parts instead of 8)`);
    parseErrors++;
  }
});

console.log(`✅ Successfully parsed: ${parsedData.length} draws`);
console.log(`❌ Parse errors: ${parseErrors}`);

// Calculate frequency for ALL numbers (1-49)
console.log('\n📊 FREQUENCY ANALYSIS - ALL NUMBERS');
console.log('===================================');

const frequency = {};
for (let i = 1; i <= 49; i++) {
  frequency[i] = { main: 0, additional: 0, total: 0 };
}

// Count occurrences
parsedData.forEach(draw => {
  // Count main numbers
  draw.numbers.forEach(num => {
    frequency[num].main++;
    frequency[num].total++;
  });
  
  // Count additional number
  frequency[draw.additional].additional++;
  frequency[draw.additional].total++;
});

// Display results for verification
console.log('\nFrequency breakdown (Number: Main + Additional = Total):');
console.log('======================================================');

// Sort by total frequency
const sortedNumbers = Object.entries(frequency)
  .map(([num, freq]) => ({
    number: parseInt(num),
    main: freq.main,
    additional: freq.additional,
    total: freq.total,
    mainPercent: (freq.main / parsedData.length * 100).toFixed(1),
    totalPercent: (freq.total / parsedData.length * 100).toFixed(1)
  }))
  .sort((a, b) => b.total - a.total);

// Show top 20 most frequent
console.log('\n🔥 TOP 20 MOST FREQUENT NUMBERS:');
sortedNumbers.slice(0, 20).forEach(item => {
  console.log(`${item.number.toString().padStart(2)}: ${item.main.toString().padStart(2)} + ${item.additional.toString().padStart(2)} = ${item.total.toString().padStart(2)} (${item.totalPercent}%)`);
});

// Show bottom 10 least frequent
console.log('\n❄️ BOTTOM 10 LEAST FREQUENT NUMBERS:');
sortedNumbers.slice(-10).forEach(item => {
  console.log(`${item.number.toString().padStart(2)}: ${item.main.toString().padStart(2)} + ${item.additional.toString().padStart(2)} = ${item.total.toString().padStart(2)} (${item.totalPercent}%)`);
});

// Specific check for number 15 (from previous analysis)
const num15 = frequency[15];
console.log('\n🔍 SPECIFIC VERIFICATION - NUMBER 15:');
console.log('====================================');
console.log(`Main appearances: ${num15.main}`);
console.log(`Additional appearances: ${num15.additional}`);
console.log(`Total appearances: ${num15.total}`);
console.log(`Main percentage: ${(num15.main / parsedData.length * 100).toFixed(1)}%`);
console.log(`Total percentage: ${(num15.total / parsedData.length * 100).toFixed(1)}%`);

// Manual verification for last 20 draws
console.log('\n🔍 MANUAL VERIFICATION - LAST 20 DRAWS:');
console.log('======================================');
const last20 = parsedData.slice(0, 20);
console.log(`Checking last 20 draws: ${last20[19].date} to ${last20[0].date}`);

// Count number 15 in last 20 draws
let count15Main = 0;
let count15Additional = 0;
let appearances = [];

last20.forEach((draw, index) => {
  const hasMain = draw.numbers.includes(15);
  const hasAdditional = draw.additional === 15;
  
  if (hasMain) {
    count15Main++;
    appearances.push(`Draw ${index + 1} (${draw.date}) - Main`);
  }
  if (hasAdditional) {
    count15Additional++;
    appearances.push(`Draw ${index + 1} (${draw.date}) - Additional`);
  }
});

console.log(`Number 15 in last 20 draws:`);
console.log(`Main: ${count15Main}/20 (${(count15Main/20*100).toFixed(1)}%)`);
console.log(`Additional: ${count15Additional}/20 (${(count15Additional/20*100).toFixed(1)}%)`);
console.log(`Total: ${count15Main + count15Additional}/20 (${((count15Main + count15Additional)/20*100).toFixed(1)}%)`);

if (appearances.length > 0) {
  console.log(`Appearances:`);
  appearances.forEach(app => console.log(`  ${app}`));
}

// Check if website calculations would be correct
console.log('\n🎯 WEBSITE CALCULATION VERIFICATION:');
console.log('===================================');

// Simulate what the website would calculate for last 50 draws
const last50 = parsedData.slice(0, 50);
const websiteFreq = {};
for (let i = 1; i <= 49; i++) websiteFreq[i] = 0;

last50.forEach(draw => {
  draw.numbers.forEach(num => websiteFreq[num]++);
});

console.log(`Website frequency calculation (last 50 draws, main numbers only):`);
console.log(`Number 15: ${websiteFreq[15]} appearances in last 50 draws`);
console.log(`Number 15 percentage: ${(websiteFreq[15]/50*100).toFixed(1)}%`);

// Show top 10 for comparison
const websiteTop10 = Object.entries(websiteFreq)
  .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
  .sort((a, b) => b.frequency - a.frequency)
  .slice(0, 10);

console.log(`\nTop 10 numbers (last 50 draws, website calculation):`);
websiteTop10.forEach(item => {
  console.log(`${item.number}: ${item.frequency} times (${(item.frequency/50*100).toFixed(1)}%)`);
});

console.log('\n✅ FREQUENCY VERIFICATION COMPLETED');
console.log('===================================');