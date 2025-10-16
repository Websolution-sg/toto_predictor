// Test Frequency + Compatibility consistency after removing randomization
import fs from 'fs';

// Load historical data
const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
const lines = csvContent.trim().split('\n');
const historical = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(',');
  if (parts.length >= 8) {
    const numbers = parts.slice(1, 7).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const additional = parseInt(parts[7].trim());
    
    if (numbers.length === 6 && !isNaN(additional)) {
      historical.push({
        numbers: numbers.sort((a, b) => a - b),
        additional: additional
      });
    }
  }
}

console.log(`Loaded ${historical.length} historical draws\n`);

// Cold number identification (exact copy from HTML)
function identifyColdNumbers(includeAdd = false) {
  const recentDraws = historical.slice(0, Math.min(20, historical.length));
  const recentNumbers = new Set();
  
  recentDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) recentNumbers.add(n);
    });
  });
  
  const coldNumbers = [];
  for (let n = 1; n <= 49; n++) {
    if (!recentNumbers.has(n)) {
      coldNumbers.push(n);
    }
  }
  
  return coldNumbers;
}

// Cold number avoidance (exact copy from HTML)
function applyColdNumberAvoidance(candidates, coldNumbers, maxColdAllowed = 1) {
  const filtered = [];
  let coldCount = 0;
  
  for (const candidate of candidates) {
    if (coldNumbers.includes(candidate.n || candidate)) {
      if (coldCount < maxColdAllowed) {
        filtered.push(candidate);
        coldCount++;
      }
    } else {
      filtered.push(candidate);
    }
  }
  
  return filtered;
}

// Simulate Frequency + Compatibility (deterministic version)
function simulateFrequencyCompatibility(range = 50, includeAdd = false) {
  const bases = [];
  const recentDraws = historical.slice(0, Math.min(20, historical.length));
  const historicalDraws = historical.slice(20, Math.min(range + 20, historical.length));
  const allDraws = historical.slice(0, range);
  
  const recentFreq = Array(50).fill(0);
  const historicalFreq = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Recent frequency analysis
  recentDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) recentFreq[n]++;
    });
  });
  
  // Historical frequency
  historicalDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) historicalFreq[n]++;
    });
  });
  
  // Compatibility analysis
  allDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    bases.forEach(b => {
      if (pool.includes(b)) {
        pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => compat[n]++);
      }
    });
  });
  
  // Multi-factor scoring
  const candidates = recentFreq.map((recentCount, n) => {
    const historicalCount = historicalFreq[n];
    const compatScore = compat[n];
    
    const recentRate = recentCount / Math.max(1, recentDraws.length);
    const historicalRate = historicalCount / Math.max(1, historicalDraws.length);
    const compatRate = compatScore / Math.max(1, allDraws.length * bases.length);
    
    const compositeScore = (recentRate * 0.5) + (compatRate * 0.3) + (historicalRate * 0.2);
    
    return {
      n, recentCount, historicalCount, compatScore, compositeScore,
      recentRate: recentRate * 100,
      momentum: recentCount > historicalCount ? '+' : (recentCount === 0 ? '--' : '-')
    };
  })
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.compositeScore - a.compositeScore || a.n - b.n);
  
  // Cold number avoidance
  const coldNumbers = identifyColdNumbers(includeAdd);
  const filteredCandidates = applyColdNumberAvoidance(candidates, coldNumbers, 1);
  
  // Deterministic selection with even/odd balance
  let finalPredictions = [];
  let evenCount = 0, oddCount = 0;
  
  // Tier-based selection
  const tier1Size = Math.ceil(filteredCandidates.length * 0.20);
  const tier2Size = Math.ceil(filteredCandidates.length * 0.35);
  
  const tier1 = filteredCandidates.slice(0, tier1Size);
  const tier2 = filteredCandidates.slice(tier1Size, tier1Size + tier2Size);
  const tier3 = filteredCandidates.slice(tier1Size + tier2Size);
  
  // Select 4 from tier 1 (deterministic)
  for (let i = 0; i < Math.min(4, tier1.length); i++) {
    const candidate = tier1[i];
    const isEven = candidate.n % 2 === 0;
    
    if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || finalPredictions.length >= 4) {
      finalPredictions.push(candidate);
      if (isEven) evenCount++;
      else oddCount++;
    }
  }
  
  // Select 1-2 from tier 2 (deterministic - no randomization)
  const tier2StartOffset = Math.floor(tier2.length * 0.1);
  for (let i = tier2StartOffset; i < Math.min(2 + tier2StartOffset, tier2.length) && finalPredictions.length < 6; i++) {
    const candidate = tier2[i];
    const isEven = candidate.n % 2 === 0;
    
    if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || finalPredictions.length >= 5) {
      finalPredictions.push(candidate);
      if (isEven) evenCount++;
      else oddCount++;
    }
  }
  
  // Fill remaining with balanced selection
  while (finalPredictions.length < 6) {
    const remaining = filteredCandidates.filter(c => !finalPredictions.some(p => p.n === c.n));
    if (remaining.length === 0) break;
    
    let candidate;
    if (evenCount < 3) {
      candidate = remaining.find(c => c.n % 2 === 0) || remaining[0];
    } else if (oddCount < 3) {
      candidate = remaining.find(c => c.n % 2 === 1) || remaining[0];
    } else {
      candidate = remaining[0];
    }
    
    finalPredictions.push(candidate);
    if (candidate.n % 2 === 0) evenCount++;
    else oddCount++;
  }
  
  return finalPredictions.map(p => p.n).sort((a, b) => a - b);
}

console.log('=== TESTING FREQUENCY + COMPATIBILITY CONSISTENCY ===\n');

// Test multiple runs with same parameters
console.log('Testing Frequency + Compatibility with same parameters (5 runs):');
for (let i = 1; i <= 5; i++) {
  const result = simulateFrequencyCompatibility();
  console.log(`Run ${i}: [${result.join(', ')}]`);
}

// Test with different ranges
console.log('\nTesting Frequency + Compatibility with different ranges:');
const testRanges = [20, 30, 50, 80];
for (const range of testRanges) {
  const result = simulateFrequencyCompatibility(range);
  console.log(`Range ${range}: [${result.join(', ')}]`);
}

// Check consistency across multiple runs for each range
console.log('\nConsistency check - multiple runs per range:');
testRanges.forEach(range => {
  const results = [];
  for (let i = 0; i < 3; i++) {
    results.push(simulateFrequencyCompatibility(range));
  }
  
  const uniqueResults = new Set(results.map(r => r.join(',')));
  if (uniqueResults.size === 1) {
    console.log(`✅ Range ${range}: CONSISTENT (all 3 runs identical)`);
  } else {
    console.log(`❌ Range ${range}: INCONSISTENT (${uniqueResults.size} different results)`);
    results.forEach((result, index) => {
      console.log(`   Run ${index + 1}: [${result.join(', ')}]`);
    });
  }
});

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('✅ All runs with same parameters should produce IDENTICAL results');
console.log('✅ Different ranges may produce different results (that\'s normal)');
console.log('❌ If same parameters produce different results = randomization still present');