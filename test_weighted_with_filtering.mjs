// Test the HTML implementation's weighted analysis
// This simulates exactly what happens in the browser

// Load historical data
import fs from 'fs';

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

// Cold number identification function (same as HTML)
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

// Cold number avoidance function (same as HTML)
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

// Complete weighted prediction simulation (matching HTML exactly)
function simulateWeightedWithFiltering(range, includeAdd = false) {
  const bases = [];
  const draws = historical.slice(0, range);
  
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Same algorithm as HTML
  if (range <= 10) {
    draws.forEach((draw, index) => {
      const weight = Math.pow(0.98, index);
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      pool.forEach(n => weighted[n] += weight * 2.0);
    });
  } else if (range <= 30) {
    draws.forEach((draw, index) => {
      const normalizedPos = index / (range - 1);
      const sigmoidWeight = 1 / (1 + Math.exp((normalizedPos - 0.3) * 10));
      
      // ADD RANDOMIZATION: Small random factor for diversity
      const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1 multiplier
      
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      pool.forEach(n => weighted[n] += sigmoidWeight * randomFactor);
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
    if (range <= 10) {
      finalScore = weight * 1.5 + compat[n] * 0.3;
    } else if (range <= 30) {
      finalScore = weight * 0.8 + compat[n] * 1.2;
    } else {
      const patternBonus = (weight > 2.0 ? 0.5 : 0) + (compat[n] > 1.5 ? 0.3 : 0);
      finalScore = weight + compat[n] + patternBonus + (Math.random() * 0.3); // Increased randomization
    }
    
    return { 
      n, 
      weight, 
      compat: compat[n],
      finalScore,
      confidence: Math.min(95, 40 + (finalScore * 12))
    };
  })
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.finalScore - a.finalScore || a.n - b.n);
  
  // Apply cold number avoidance (this is the new part)
  const coldNumbers = identifyColdNumbers(includeAdd);
  const filteredSuggestions = applyColdNumberAvoidance(suggestions, coldNumbers, 1);
  
  console.log(`Range ${range}: Cold numbers found: [${coldNumbers.join(', ')}]`);
  console.log(`Range ${range}: Filtered ${suggestions.length} to ${filteredSuggestions.length} candidates`);
  
  // Enhanced selection with even/odd balance
  let finalPredictions = [];
  let evenCount = 0, oddCount = 0;
  
  if (range <= 10) {
    for (const candidate of filteredSuggestions) {
      if (finalPredictions.length >= 6) break;
      const isEven = candidate.n % 2 === 0;
      if ((isEven && evenCount < 3) || (!isEven && oddCount < 3) || (finalPredictions.length >= 4)) {
        finalPredictions.push(candidate);
        if (isEven) evenCount++;
        else oddCount++;
      }
    }
  } else if (range <= 30) {
    const candidates = [...filteredSuggestions];
    while (finalPredictions.length < 6 && candidates.length > 0) {
      const next = candidates.shift();
      const isEven = next.n % 2 === 0;
      const canAdd = (isEven && evenCount < 3) || (!isEven && oddCount < 3) || (finalPredictions.length >= 4);
      
      if (canAdd) {
        const tooClose = finalPredictions.some(p => Math.abs(p.n - next.n) <= 2);
        if (!tooClose || finalPredictions.length >= 4) {
          finalPredictions.push(next);
          if (isEven) evenCount++;
          else oddCount++;
        }
      }
    }
  } else {
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
        // STRICT: Enforce even/odd balance
        if ((isEven && evenCount < 3) || (!isEven && oddCount < 3)) {
          finalPredictions.push(candidate);
          tierCount++;
          if (isEven) evenCount++;
          else oddCount++;
        }
      }
    }
  }
  
  // ENHANCED: Fill remaining slots with strict balance enforcement
  while (finalPredictions.length < 6) {
    const remaining = filteredSuggestions.filter(s => !finalPredictions.some(p => p.n === s.n));
    if (remaining.length === 0) break;
    
    // STRICT: Only add numbers that maintain 3/3 balance
    let candidate;
    if (evenCount < 3 && oddCount < 3) {
      const evenCandidates = remaining.filter(c => c.n % 2 === 0);
      const oddCandidates = remaining.filter(c => c.n % 2 === 1);
      
      if (evenCandidates.length > 0 && oddCandidates.length > 0) {
        candidate = evenCandidates[0].finalScore > oddCandidates[0].finalScore ? evenCandidates[0] : oddCandidates[0];
      } else {
        candidate = evenCandidates[0] || oddCandidates[0] || remaining[0];
      }
    } else if (evenCount < 3) {
      candidate = remaining.find(c => c.n % 2 === 0);
      if (!candidate) break;
    } else if (oddCount < 3) {
      candidate = remaining.find(c => c.n % 2 === 1);
      if (!candidate) break;
    } else {
      break;
    }
    
    if (candidate) {
      finalPredictions.push(candidate);
      if (candidate.n % 2 === 0) evenCount++;
      else oddCount++;
    } else {
      break;
    }
  }
  
  const result = finalPredictions.map(p => p.n).sort((a, b) => a - b);
  console.log(`Range ${range}: Even/Odd = ${evenCount}/${oddCount}, Result = [${result.join(', ')}]`);
  return result;
}

console.log('=== TESTING WEIGHTED ANALYSIS WITH ALL FILTERING ===\n');

// Test multiple runs for same range to see randomization effect
console.log('Testing Range 15 multiple times for randomization:');
for (let i = 1; i <= 5; i++) {
  const result = simulateWeightedWithFiltering(15);
  console.log(`Run ${i}: [${result.join(', ')}]`);
}

console.log('\nTesting Range 50 multiple times for randomization:');
for (let i = 1; i <= 5; i++) {
  const result = simulateWeightedWithFiltering(50);
  console.log(`Run ${i}: [${result.join(', ')}]`);
}