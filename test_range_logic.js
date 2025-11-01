// Testing draw range differentiation logic
console.log('Testing draw range differentiation logic...');

// Simulate CSV data
const historical = [
  {numbers: [1,5,31,34,38,45], additional: 21, date: '31-Oct-25'},
  {numbers: [8,17,23,29,35,42], additional: 15, date: '24-Oct-25'},
  {numbers: [3,12,19,27,33,41], additional: 7, date: '17-Oct-25'},
  {numbers: [6,14,22,28,36,44], additional: 18, date: '10-Oct-25'},
  {numbers: [2,9,16,25,32,39], additional: 11, date: '03-Oct-25'},
  {numbers: [4,13,20,30,37,46], additional: 24, date: '26-Sep-25'},
  {numbers: [7,15,21,26,34,40], additional: 3, date: '19-Sep-25'},
  {numbers: [1,11,18,29,35,43], additional: 8, date: '12-Sep-25'},
  {numbers: [5,12,24,31,38,47], additional: 16, date: '05-Sep-25'},
  {numbers: [9,17,23,32,39,48], additional: 2, date: '29-Aug-25'}
];

function testRangeCalculation(range) {
  console.log('\n--- Testing Range:', range, '---');
  const sliced = historical.slice(0, range);
  console.log('Data entries used:', sliced.length);
  
  // Test frequency calculation
  const freq = Array(50).fill(0);
  sliced.forEach(draw => {
    draw.numbers.forEach(n => freq[n]++);
  });
  
  const topNumbers = freq
    .map((count, num) => ({num, count}))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  console.log('Top frequent numbers:', topNumbers.map(item => `${item.num}(${item.count})`).join(', '));
  
  return topNumbers;
}

const range10 = testRangeCalculation(10);
const range5 = testRangeCalculation(5);
const range3 = testRangeCalculation(3);

console.log('\n=== COMPARISON ===');
console.log('Range 10 vs Range 5 - Different?', JSON.stringify(range10) !== JSON.stringify(range5));
console.log('Range 5 vs Range 3 - Different?', JSON.stringify(range5) !== JSON.stringify(range3));

// Test Enhanced Ensemble tier calculation differences
console.log('\n=== ENHANCED ENSEMBLE TIER TESTING ===');

function simulateEnhancedEnsemble(range) {
  console.log(`\nEnhanced Ensemble with range ${range}:`);
  
  // Simulate frequency calculation
  const freq = Array(50).fill(0);
  historical.slice(0, range).forEach(draw => {
    draw.numbers.forEach(n => freq[n]++);
  });
  
  // Get top candidates
  const sortedCandidates = freq
    .map((count, num) => ({num, count, score: count}))
    .filter(item => item.num >= 1 && item.num <= 49 && item.count > 0)
    .sort((a, b) => b.score - a.score);
    
  console.log('Total candidates:', sortedCandidates.length);
  
  // Tier calculation (from the actual algorithm)
  const tier1Count = Math.max(1, Math.floor(sortedCandidates.length * 0.15)); // Top 15%
  const tier2Count = Math.max(1, Math.floor(sortedCandidates.length * 0.35)); // Next 35%
  const tier3Count = Math.max(1, Math.floor(sortedCandidates.length * 0.30)); // Next 30%
  
  const tier1 = sortedCandidates.slice(0, tier1Count);
  const tier2 = sortedCandidates.slice(tier1Count, tier1Count + tier2Count);
  const tier3 = sortedCandidates.slice(tier1Count + tier2Count, tier1Count + tier2Count + tier3Count);
  
  console.log(`Tier 1 (${tier1Count}):`, tier1.map(c => `${c.num}(${c.count})`).join(', '));
  console.log(`Tier 2 (${tier2Count}):`, tier2.map(c => `${c.num}(${c.count})`).join(', '));
  console.log(`Tier 3 (${tier3Count}):`, tier3.map(c => `${c.num}(${c.count})`).join(', '));
  
  return {tier1, tier2, tier3, sortedCandidates};
}

const ensemble10 = simulateEnhancedEnsemble(10);
const ensemble5 = simulateEnhancedEnsemble(5);
const ensemble3 = simulateEnhancedEnsemble(3);

console.log('\n=== ENHANCED ENSEMBLE COMPARISON ===');
console.log('Range 10 vs 5 - Different tier1?', JSON.stringify(ensemble10.tier1) !== JSON.stringify(ensemble5.tier1));
console.log('Range 5 vs 3 - Different tier1?', JSON.stringify(ensemble5.tier1) !== JSON.stringify(ensemble3.tier1));