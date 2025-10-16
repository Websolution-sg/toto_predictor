// Comprehensive test to check if HTML implementation still has identical results
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

// WEIGHTED RECENT ANALYSIS (exact copy from HTML with current improvements)
function simulateWeightedRecent(range, includeAdd = false) {
  const bases = [];
  const draws = historical.slice(0, range);
  
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  if (range <= 8) {
    draws.forEach((draw, index) => {
      const weight = Math.pow(0.98, index);
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      pool.forEach(n => weighted[n] += weight * 2.0);
    });
  } else if (range <= 35) {
    draws.forEach((draw, index) => {
      const normalizedPos = index / (range - 1);
      const sigmoidWeight = 1 / (1 + Math.exp((normalizedPos - 0.3) * 10));
      
      // ENHANCED RANDOMIZATION: Stronger random factor for more diversity
      const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3 multiplier (wider range)
      
      // Additional range-specific bias for differentiation
      const rangeBias = range <= 15 ? 1.2 : 0.8; // Small ranges get boost, larger get reduction
      
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      
      pool.forEach(n => {
        weighted[n] += sigmoidWeight * randomFactor * rangeBias;
        
        // Range-specific number preferences for differentiation
        if (range <= 15 && n <= 20) weighted[n] += 0.3; // Small-medium ranges prefer low numbers
        if (range > 15 && range <= 25 && n >= 25 && n <= 35) weighted[n] += 0.3; // Mid ranges prefer middle numbers  
        if (range > 25 && n >= 35) weighted[n] += 0.3; // Larger medium ranges prefer high numbers
      });
    });
  } else {
    const segmentSize = Math.floor(range / 4);
    for (let segment = 0; segment < 4; segment++) {
      const segmentStart = segment * segmentSize;
      const segmentEnd = Math.min(segmentStart + segmentSize, range);
      const segmentDraws = draws.slice(segmentStart, segmentEnd);
      
      const segmentWeight = segment === 0 ? 2.0 : segment === 1 ? 1.5 : segment === 2 ? 1.0 : 0.6;
      
      segmentDraws.forEach((draw, index) => {
        const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
        pool.forEach(n => {
          weighted[n] += segmentWeight / (index + 1);
          if (segment === 0 && n >= 30) weighted[n] += 0.3;
          if (segment === 1 && n >= 20 && n <= 35) weighted[n] += 0.2;
          if (segment >= 2 && n <= 25) weighted[n] += 0.1;
        });
      });
    }
  }
  
  const suggestions = weighted.map((weight, n) => {
    let finalScore;
    if (range <= 8) {
      finalScore = weight * 1.5 + compat[n] * 0.3 + (Math.random() * 0.2); // Add randomization
    } else if (range <= 35) {
      const rangeMultiplier = range <= 15 ? 1.1 : (range <= 20 ? 1.0 : 0.9); // Differentiate sub-ranges
      finalScore = weight * 0.8 * rangeMultiplier + compat[n] * 1.2 + (Math.random() * 0.5); // Strong randomization
    } else {
      const patternBonus = (weight > 2.0 ? 0.5 : 0) + (compat[n] > 1.5 ? 0.3 : 0);
      finalScore = weight + compat[n] + patternBonus + (Math.random() * 0.4);
    }
    
    return { n, weight, compat: compat[n], finalScore };
  })
    .filter(o => o.n >= 1 && o.n <= 49)
    .sort((a, b) => b.finalScore - a.finalScore || a.n - b.n);
  
  const coldNumbers = identifyColdNumbers(includeAdd);
  const filteredSuggestions = applyColdNumberAvoidance(suggestions, coldNumbers, 1);
  
  // Enhanced selection with range-specific strategies
  let finalPredictions = [];
  let evenCount = 0, oddCount = 0;
  
  if (range <= 8) {
    // Small range: Top candidates with slight randomization
    const topCandidates = filteredSuggestions.slice(0, 10);
    for (const candidate of topCandidates) {
      if (finalPredictions.length >= 6) break;
      
      const isEven = candidate.n % 2 === 0;
      
      // Add small chance to skip top candidates for diversity
      const skipChance = finalPredictions.length > 0 ? 0.15 : 0;
      if (Math.random() < skipChance) continue;
      
      if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || finalPredictions.length >= 4) {
        finalPredictions.push(candidate);
        if (isEven) evenCount++;
        else oddCount++;
      }
    }
  } else if (range <= 35) {
    // Medium range: Range-specific selection patterns
    const candidates = [...filteredSuggestions];
    const selectionPattern = range <= 15 ? 'conservative' : (range <= 20 ? 'balanced' : 'aggressive');
    
    while (finalPredictions.length < 6 && candidates.length > 0) {
      let nextIndex = 0;
      
      if (selectionPattern === 'conservative') {
        nextIndex = Math.random() < 0.8 ? 0 : Math.min(2, candidates.length - 1);
      } else if (selectionPattern === 'balanced') {
        nextIndex = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * Math.min(4, candidates.length));
      } else {
        nextIndex = Math.floor(Math.random() * Math.min(6, candidates.length));
      }
      
      const next = candidates.splice(nextIndex, 1)[0];
      if (!next) break;
      
      const isEven = next.n % 2 === 0;
      const canAdd = (isEven && evenCount < 3) || (!isEven && oddCount < 3) || (finalPredictions.length >= 4);
      
      if (canAdd) {
        const tooClose = finalPredictions.some(p => Math.abs(p.n - next.n) <= 1);
        if (!tooClose || finalPredictions.length >= 4) {
          finalPredictions.push(next);
          if (isEven) evenCount++;
          else oddCount++;
        }
      }
    }
  } else {
    // Large range: tier-based selection (existing logic)
    const topTier = filteredSuggestions.slice(0, 8);
    const midTier = filteredSuggestions.slice(8, 25);
    const lowTier = filteredSuggestions.slice(25, 45);
    
    const tiers = [
      { candidates: topTier, target: 3 },
      { candidates: midTier, target: 2 },
      { candidates: lowTier, target: 1 }
    ];
    
    for (const tier of tiers) {
      let tierCount = 0;
      for (const candidate of tier.candidates) {
        if (finalPredictions.length >= 6 || tierCount >= tier.target) break;
        const isEven = candidate.n % 2 === 0;
        if ((isEven && evenCount < 3) || (!isEven && oddCount < 3)) {
          finalPredictions.push(candidate);
          tierCount++;
          if (isEven) evenCount++;
          else oddCount++;
        }
      }
    }
  }
  
  return finalPredictions.map(p => p.n).sort((a, b) => a - b);
}

// HOT/COLD ANALYSIS (exact copy from HTML with current improvements) 
function simulateHotCold(range, includeAdd = false) {
  const bases = [];
  const recentDraws = historical.slice(0, Math.min(20, historical.length));
  const historicalDraws = historical.slice(20, Math.min(range + 20, historical.length));
  
  const recentFreq = Array(50).fill(0);
  const historicalFreq = Array(50).fill(0);
  
  recentDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) recentFreq[n]++;
    });
  });
  
  historicalDraws.forEach(draw => {
    const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) historicalFreq[n]++;
    });
  });
  
  const suggestions = recentFreq.map((recentCount, n) => {
    const recentRate = recentCount / recentDraws.length;
    const historicalRate = historicalFreq[n] / Math.max(1, historicalDraws.length);
    const hotRatio = historicalRate > 0 ? recentRate / historicalRate : (recentCount > 0 ? 10 : 0);
    
    let hotScore = 0;
    hotScore += recentCount * 0.25;
    if (hotRatio > 1.5 && recentRate > 0.10) {
      hotScore += hotRatio * 0.40;
    }
    if (recentCount >= 3 && hotRatio > 1.2) {
      hotScore += 0.20;
    }
    if (recentCount === 0 && historicalRate > 0.08) {
      hotScore -= 0.15;
    }
    
    return {
      n, recentCount, recentRate: recentRate * 100, historicalRate: historicalRate * 100,
      hotRatio, hotScore, trend: recentCount > historicalFreq[n] / Math.max(1, historicalDraws.length) * recentDraws.length ? '+' : (recentCount === 0 ? '--' : '-'),
      confidence: Math.min(95, 50 + hotScore * 20)
    };
  })
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.hotScore - a.hotScore || a.n - b.n);
  
  const coldNumbers = identifyColdNumbers(includeAdd);
  const filteredSuggestions = applyColdNumberAvoidance(suggestions, coldNumbers, 1);
  
  // Simple selection for testing - take top 6 with even/odd balance
  const finalPredictions = [];
  let evenCount = 0, oddCount = 0;
  
  for (const candidate of filteredSuggestions) {
    if (finalPredictions.length >= 6) break;
    const isEven = candidate.n % 2 === 0;
    if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || finalPredictions.length >= 4) {
      finalPredictions.push(candidate);
      if (isEven) evenCount++;
      else oddCount++;
    }
  }
  
  return finalPredictions.map(p => p.n).sort((a, b) => a - b);
}

// Test both methods across ranges
console.log('=== COMPREHENSIVE RANGE TESTING ===\n');

const testRanges = [5, 10, 15, 20, 30, 50, 80];

console.log('Testing WEIGHTED RECENT ANALYSIS:');
const weightedResults = {};
for (const range of testRanges) {
  const result = simulateWeightedRecent(range);
  weightedResults[range] = result;
    const algorithmType = range <= 8 ? 'Recent Focus' : 
                       range <= 35 ? 'Balanced' : 
                       'Pattern Analysis';
  console.log(`Range ${range.toString().padStart(2)} (${algorithmType.padEnd(15)}): [${result.join(', ')}]`);
}

console.log('\nTesting HOT/COLD ANALYSIS:');
const hotColdResults = {};
for (const range of testRanges) {
  const result = simulateHotCold(range);
  hotColdResults[range] = result;
  console.log(`Range ${range.toString().padStart(2)}: [${result.join(', ')}]`);
}

// Analysis
console.log('\n=== DIVERSITY ANALYSIS ===');

// Check Weighted Recent diversity
const weightedUnique = new Set(Object.values(weightedResults).map(arr => arr.join(',')));
console.log(`Weighted Recent - Unique results: ${weightedUnique.size}/${testRanges.length} (${((weightedUnique.size / testRanges.length) * 100).toFixed(1)}%)`);

// Check Hot/Cold diversity  
const hotColdUnique = new Set(Object.values(hotColdResults).map(arr => arr.join(',')));
console.log(`Hot/Cold Analysis - Unique results: ${hotColdUnique.size}/${testRanges.length} (${((hotColdUnique.size / testRanges.length) * 100).toFixed(1)}%)`);

// Check cross-method similarity
console.log('\n=== CROSS-METHOD SIMILARITY ===');
for (const range of testRanges) {
  const weighted = weightedResults[range];
  const hotCold = hotColdResults[range];
  const intersection = weighted.filter(n => hotCold.includes(n));
  const similarity = (intersection.length / 6) * 100;
  console.log(`Range ${range}: ${similarity.toFixed(1)}% similar (${intersection.length}/6 common) - Common: [${intersection.join(', ')}]`);
}

// Check for identical results within each method
console.log('\n=== IDENTICAL RESULTS CHECK ===');

console.log('Weighted Recent Analysis:');
if (weightedUnique.size === 1) {
  console.log('❌ PROBLEM: ALL ranges producing IDENTICAL results!');
} else {
  const duplicates = [];
  const resultCounts = {};
  Object.entries(weightedResults).forEach(([range, result]) => {
    const key = result.join(',');
    if (!resultCounts[key]) resultCounts[key] = [];
    resultCounts[key].push(range);
  });
  
  Object.entries(resultCounts).forEach(([result, ranges]) => {
    if (ranges.length > 1) {
      console.log(`  Ranges ${ranges.join(', ')} produce identical result: [${result}]`);
    }
  });
}

console.log('Hot/Cold Analysis:');
if (hotColdUnique.size === 1) {
  console.log('❌ PROBLEM: ALL ranges producing IDENTICAL results!');
} else {
  const duplicates = [];
  const resultCounts = {};
  Object.entries(hotColdResults).forEach(([range, result]) => {
    const key = result.join(',');
    if (!resultCounts[key]) resultCounts[key] = [];
    resultCounts[key].push(range);
  });
  
  Object.entries(resultCounts).forEach(([result, ranges]) => {
    if (ranges.length > 1) {
      console.log(`  Ranges ${ranges.join(', ')} produce identical result: [${result}]`);
    }
  });
}