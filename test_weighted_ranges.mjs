// Test Weighted Recent Analysis across different ranges
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

console.log(`Loaded ${historical.length} historical draws`);

// Simulate weighted prediction for different ranges
function simulateWeightedPrediction(range, includeAdd = false) {
  const bases = []; // No base numbers for testing
  const draws = historical.slice(0, range);
  
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Apply the same range-differentiated algorithm as in HTML
  if (range <= 10) {
    // SMALL RANGE: Focus on immediate recent patterns
    draws.forEach((draw, index) => {
      const weight = Math.pow(0.98, index); // Very gentle decay
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      
      pool.forEach(n => weighted[n] += weight * 2.0); // Double weight for recency
    });
    
  } else if (range <= 30) {
    // MEDIUM RANGE: Balanced frequency + compatibility
    draws.forEach((draw, index) => {
      // Sigmoid-like decay that emphasizes middle positions
      const normalizedPos = index / (range - 1);
      const sigmoidWeight = 1 / (1 + Math.exp((normalizedPos - 0.3) * 10));
      
      const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
      
      pool.forEach(n => weighted[n] += sigmoidWeight);
    });
    
  } else {
    // LARGE RANGE: Historical pattern analysis
    const segmentSize = Math.floor(range / 4);
    
    for (let segment = 0; segment < 4; segment++) {
      const segmentStart = segment * segmentSize;
      const segmentEnd = Math.min(segmentStart + segmentSize, range);
      const segmentDraws = draws.slice(segmentStart, segmentEnd);
      
      const segmentWeight = segment === 0 ? 2.0 :   // Most recent segment gets double
                           segment === 1 ? 1.5 :   // Recent gets 1.5x
                           segment === 2 ? 1.0 :   // Medium gets 1x
                           0.6;                    // Oldest gets 0.6x
      
      segmentDraws.forEach((draw, index) => {
        const pool = includeAdd && draw.numbers.length === 6 ? draw.numbers.concat(draw.additional) : draw.numbers;
        
        pool.forEach(n => {
          weighted[n] += segmentWeight / (index + 1);
          
          // Add positional bias based on segment
          if (segment === 0 && n >= 30) weighted[n] += 0.3; // Recent prefers high numbers
          if (segment === 1 && n >= 20 && n <= 35) weighted[n] += 0.2; // Mid-range balance
          if (segment >= 2 && n <= 25) weighted[n] += 0.1; // Historical prefers low numbers
        });
      });
    }
  }
  
  // RANGE-SPECIFIC SCORING ALGORITHMS
  const suggestions = weighted.map((weight, n) => {
    let finalScore;
    
    if (range <= 10) {
      finalScore = weight * 1.5 + compat[n] * 0.3;
    } else if (range <= 30) {
      finalScore = weight * 0.8 + compat[n] * 1.2;
    } else {
      const patternBonus = (weight > 2.0 ? 0.5 : 0) + (compat[n] > 1.5 ? 0.3 : 0);
      finalScore = weight + compat[n] + patternBonus + (Math.random() * 0.1);
    }
    
    return { 
      n, 
      weight, 
      compat: compat[n],
      finalScore,
      confidence: Math.min(95, 40 + (finalScore * 12))
    };
  })
    .filter(o => o.n >= 1 && o.n <= 49)
    .sort((a, b) => b.finalScore - a.finalScore || a.n - b.n);
  
  // Get top 6 for comparison
  return suggestions.slice(0, 6).map(s => s.n);
}

// Test different ranges
const testRanges = [5, 10, 15, 20, 30, 50, 80, 100];

console.log('\n=== WEIGHTED RECENT ANALYSIS RANGE TEST ===');
console.log('Testing if different ranges produce different results...\n');

const results = {};
for (const range of testRanges) {
  const prediction = simulateWeightedPrediction(range);
  results[range] = prediction;
  
  const algorithmType = range <= 10 ? 'Recent Focus' : 
                       range <= 30 ? 'Balanced' : 
                       'Pattern Analysis';
  
  console.log(`Range ${range.toString().padStart(3)} (${algorithmType.padEnd(15)}): [${prediction.join(', ')}]`);
}

// Check for identical results
console.log('\n=== DIVERSITY ANALYSIS ===');
const uniqueResults = new Set();
const resultStrings = Object.values(results).map(arr => arr.join(','));

resultStrings.forEach(result => uniqueResults.add(result));

console.log(`Total test ranges: ${testRanges.length}`);
console.log(`Unique predictions: ${uniqueResults.size}`);
console.log(`Diversity percentage: ${((uniqueResults.size / testRanges.length) * 100).toFixed(1)}%`);

if (uniqueResults.size === 1) {
  console.log('❌ PROBLEM: All ranges producing IDENTICAL results!');
} else if (uniqueResults.size < testRanges.length * 0.5) {
  console.log('⚠️  WARNING: Low diversity - many ranges producing similar results');
} else {
  console.log('✅ GOOD: Ranges producing diverse results');
}

// Check specific range pairs for similarity
console.log('\n=== RANGE PAIR SIMILARITY ===');
for (let i = 0; i < testRanges.length - 1; i++) {
  const range1 = testRanges[i];
  const range2 = testRanges[i + 1];
  const result1 = results[range1];
  const result2 = results[range2];
  
  const intersection = result1.filter(n => result2.includes(n));
  const similarity = (intersection.length / 6) * 100;
  
  console.log(`Range ${range1} vs ${range2}: ${similarity.toFixed(1)}% similar (${intersection.length}/6 common numbers)`);
}

// Compare with actual winning patterns analysis
console.log('\n=== ALIGNMENT WITH ACTUAL DATA ===');
console.log('Checking if predictions align with known hot numbers...');

// Known hot numbers from actual data analysis (number 22 was 4.7x hotter)
const knownHotNumbers = [22]; // From our actual data analysis
const recentWinners = [];

// Get numbers from most recent 20 draws
historical.slice(0, 20).forEach(draw => {
  recentWinners.push(...draw.numbers);
});

const recentFreq = {};
recentWinners.forEach(n => {
  recentFreq[n] = (recentFreq[n] || 0) + 1;
});

const hotNumbers = Object.entries(recentFreq)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([n]) => parseInt(n));

console.log('Current hot numbers (recent 20 draws):', hotNumbers);

// Check if our predictions include hot numbers
testRanges.forEach(range => {
  const prediction = results[range];
  const hotInPrediction = prediction.filter(n => hotNumbers.slice(0, 5).includes(n));
  const hotPercentage = (hotInPrediction.length / prediction.length) * 100;
  
  console.log(`Range ${range}: ${hotInPrediction.length}/6 hot numbers (${hotPercentage.toFixed(1)}%) - ${hotInPrediction.join(', ')}`);
});