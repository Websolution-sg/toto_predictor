#!/usr/bin/env node
/**
 * 🔍 WEBSITE vs CSV FREQUENCY DISCREPANCY ANALYSIS
 * Identifies where the frequency calculations might differ
 */

import fs from 'fs';

console.log('🔍 WEBSITE vs CSV FREQUENCY DISCREPANCY ANALYSIS');
console.log('================================================');

// Load CSV data exactly as the website does
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const historical = csvContent.trim().split('\n').map(line => {
  const parts = line.split(',');
  return {
    date: parts[0],
    numbers: parts.slice(1, 7).map(Number),
    additional: Number(parts[7])
  };
});

console.log(`📊 Total draws loaded: ${historical.length}`);

// Test different scenarios that might cause discrepancies

console.log('\n🔍 SCENARIO 1: Standard frequency calculation (last 50 draws, main numbers only)');
console.log('=============================================================================');

const range = 50;
const includeAdd = false;
const draws = historical.slice(0, range);

// Simulate website calculation exactly
const freq = Array(50).fill(0);
draws.forEach(draw => {
  const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
  pool.forEach(n => freq[n]++);
});

console.log(`Using last ${range} draws, includeAdd: ${includeAdd}`);
console.log('Top 10 most frequent numbers (website calculation):');
const topNumbers = freq.map((count, n) => ({ number: n, frequency: count }))
  .filter(item => item.number >= 1 && item.number <= 49)
  .sort((a, b) => b.frequency - a.frequency)
  .slice(0, 10);

topNumbers.forEach(item => {
  console.log(`Number ${item.number}: ${item.frequency} times (${(item.frequency/range*100).toFixed(1)}%)`);
});

console.log(`\nSpecific check - Number 15: ${freq[15]} appearances (${(freq[15]/range*100).toFixed(1)}%)`);

console.log('\n🔍 SCENARIO 2: With additional numbers included');
console.log('==============================================');

const freqWithAdd = Array(50).fill(0);
draws.forEach(draw => {
  const pool = draw.numbers.concat(draw.additional); // Always include additional
  pool.forEach(n => freqWithAdd[n]++);
});

console.log(`Number 15 with additional: ${freqWithAdd[15]} appearances (${(freqWithAdd[15]/range*100).toFixed(1)}%)`);

console.log('\n🔍 SCENARIO 3: Different range (last 20 draws)');
console.log('==============================================');

const range20 = 20;
const draws20 = historical.slice(0, range20);
const freq20 = Array(50).fill(0);

draws20.forEach(draw => {
  const pool = draw.numbers; // Main numbers only
  pool.forEach(n => freq20[n]++);
});

console.log(`Number 15 (last 20): ${freq20[15]} appearances (${(freq20[15]/range20*100).toFixed(1)}%)`);

console.log('\n🔍 SCENARIO 4: Manual count verification');
console.log('=======================================');

// Manual count for verification
let manualCount15 = 0;
let manualCountLast20 = 0;

console.log('Manual verification of number 15 in last 50 draws:');
draws.forEach((draw, index) => {
  if (draw.numbers.includes(15)) {
    manualCount15++;
    console.log(`Draw ${index + 1} (${draw.date}): Found 15 in ${draw.numbers.join(',')}`);
  }
});

console.log(`Manual count (last 50): ${manualCount15} appearances`);

console.log('\nManual verification of number 15 in last 20 draws:');
draws20.forEach((draw, index) => {
  if (draw.numbers.includes(15)) {
    manualCountLast20++;
    console.log(`Draw ${index + 1} (${draw.date}): Found 15 in ${draw.numbers.join(',')}`);
  }
});

console.log(`Manual count (last 20): ${manualCountLast20} appearances`);

console.log('\n🔍 POTENTIAL ISSUES CHECK');
console.log('========================');

// Check for potential issues
let issues = [];

// Issue 1: Array indexing (should be 1-49, not 0-48)
if (freq[0] > 0) {
  issues.push('Array index 0 has values (should be empty)');
}

// Issue 2: Numbers outside 1-49 range
let outOfRangeNumbers = [];
historical.slice(0, 10).forEach(draw => {
  [...draw.numbers, draw.additional].forEach(num => {
    if (num < 1 || num > 49) {
      outOfRangeNumbers.push(num);
    }
  });
});

if (outOfRangeNumbers.length > 0) {
  issues.push(`Numbers outside 1-49 range: ${[...new Set(outOfRangeNumbers)].join(', ')}`);
}

// Issue 3: Data format inconsistencies
let formatIssues = [];
historical.slice(0, 10).forEach((draw, index) => {
  if (draw.numbers.length !== 6) {
    formatIssues.push(`Draw ${index + 1}: ${draw.numbers.length} main numbers instead of 6`);
  }
  if (isNaN(draw.additional)) {
    formatIssues.push(`Draw ${index + 1}: Invalid additional number`);
  }
});

if (formatIssues.length > 0) {
  issues.push(`Format issues: ${formatIssues.join('; ')}`);
}

// Issue 4: Include additional flag behavior
console.log('\nInclude Additional Number behavior test:');
const testDraw = historical[0];
console.log(`Test draw: ${testDraw.numbers.join(',')} + ${testDraw.additional}`);

const poolWithoutAdd = testDraw.numbers;
const poolWithAdd = testDraw.numbers.concat(testDraw.additional);

console.log(`Pool without additional: [${poolWithoutAdd.join(',')}] (${poolWithoutAdd.length} numbers)`);
console.log(`Pool with additional: [${poolWithAdd.join(',')}] (${poolWithAdd.length} numbers)`);

if (issues.length === 0) {
  console.log('✅ No obvious issues detected with data format or calculations');
} else {
  console.log('⚠️ Potential issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
}

console.log('\n📊 SUMMARY COMPARISON');
console.log('====================');
console.log(`Website calculation (last 50, main only): Number 15 = ${freq[15]} times`);
console.log(`Manual verification (last 50, main only): Number 15 = ${manualCount15} times`);
console.log(`Match: ${freq[15] === manualCount15 ? '✅ YES' : '❌ NO'}`);

console.log(`\nWebsite calculation (last 20, main only): Number 15 = ${freq20[15]} times`);
console.log(`Manual verification (last 20, main only): Number 15 = ${manualCountLast20} times`);
console.log(`Match: ${freq20[15] === manualCountLast20 ? '✅ YES' : '❌ NO'}`);

console.log('\n💡 RECOMMENDATION');
console.log('=================');
if (freq[15] === manualCount15 && freq20[15] === manualCountLast20) {
  console.log('✅ Frequency calculations appear correct');
  console.log('💡 The discrepancy might be:');
  console.log('   - Different range settings (20 vs 50 vs 100 draws)');
  console.log('   - Different include additional number settings');
  console.log('   - Display formatting differences');
  console.log('   - Caching issues with CSV updates');
} else {
  console.log('❌ Frequency calculation mismatch detected');
  console.log('🔧 Suggested investigation areas:');
  console.log('   - Array indexing (0-based vs 1-based)');
  console.log('   - Data parsing logic');
  console.log('   - Pool creation logic');
}

console.log('\n✅ ANALYSIS COMPLETED');