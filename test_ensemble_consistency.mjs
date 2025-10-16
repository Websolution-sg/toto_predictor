// Test Enhanced Ensemble consistency after removing randomization
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

// Simulate Enhanced Ensemble (deterministic version)
function simulateEnhancedEnsemble(range = 50, includeAdd = false, systemType = 6) {
  const bases = [];
  
  // Get predictions from all three methods (simplified for testing)
  const method1Results = [22, 31, 15, 19, 42, 46]; // Top frequency numbers
  const method2Results = [22, 31, 34, 15, 42, 19]; // Top weighted numbers  
  const method3Results = [22, 31, 43, 34, 15, 4];  // Top hot numbers
  
  // Ensemble voting with weights
  const methodWeights = { frequency: 0.4, weighted: 0.35, hotCold: 0.25 };
  const votes = {};
  
  // Initialize votes
  for (let i = 1; i <= 49; i++) {
    if (!bases.includes(i)) votes[i] = 0;
  }
  
  // Weight votes from each method
  method1Results.forEach((num, index) => {
    votes[num] += methodWeights.frequency * (10 - index);
  });
  
  method2Results.forEach((num, index) => {
    votes[num] += methodWeights.weighted * (10 - index);
  });
  
  method3Results.forEach((num, index) => {
    votes[num] += methodWeights.hotCold * (10 - index);
  });
  
  // Get ensemble prediction with deterministic logic
  const sortedCandidates = Object.entries(votes)
    .sort(([,a], [,b]) => b - a);
  
  // Create tiers for selection diversity (DETERMINISTIC VERSION)
  const totalCandidates = sortedCandidates.length;
  const tier1Size = Math.ceil(totalCandidates * 0.15);
  const tier2Size = Math.ceil(totalCandidates * 0.35);
  const tier3Size = Math.ceil(totalCandidates * 0.30);
  
  const tier1 = sortedCandidates.slice(0, tier1Size);
  const tier2 = sortedCandidates.slice(tier1Size, tier1Size + tier2Size);
  const tier3 = sortedCandidates.slice(tier1Size + tier2Size, tier1Size + tier2Size + tier3Size);
  
  // Smart selection with diversity (DETERMINISTIC VERSION)
  let ensemblePrediction = [];
  const neededNumbers = systemType - bases.length;
  
  // Select from tier 1 (60% of picks)
  const tier1Count = Math.min(Math.ceil(neededNumbers * 0.6), tier1.length);
  for (let i = 0; i < tier1Count; i++) {
    if (tier1[i]) {
      ensemblePrediction.push(parseInt(tier1[i][0]));
    }
  }
  
  // Select from tier 2 (30% of picks) - DETERMINISTIC
  const tier2Count = Math.min(Math.ceil(neededNumbers * 0.3), neededNumbers - ensemblePrediction.length);
  const startOffset = Math.floor(tier2.length * 0.1); // Start from 10% into tier2
  for (let i = startOffset; i < tier2Count + startOffset && i < tier2.length; i++) {
    if (tier2[i]) {
      ensemblePrediction.push(parseInt(tier2[i][0]));
    }
  }
  
  // Fill remaining from tier 3 - DETERMINISTIC
  let tier3Index = 0;
  while (ensemblePrediction.length < neededNumbers && tier3Index < tier3.length) {
    const candidate = parseInt(tier3[tier3Index][0]);
    if (!ensemblePrediction.includes(candidate)) {
      ensemblePrediction.push(candidate);
    }
    tier3Index++;
  }
  
  // Combine with base numbers
  let finalPrediction = [...bases, ...ensemblePrediction].slice(0, systemType).sort((a, b) => a - b);
  
  return finalPrediction;
}

console.log('=== TESTING ENHANCED ENSEMBLE CONSISTENCY ===\n');

// Test multiple runs with same parameters
console.log('Testing Enhanced Ensemble with same parameters (5 runs):');
for (let i = 1; i <= 5; i++) {
  const result = simulateEnhancedEnsemble();
  console.log(`Run ${i}: [${result.join(', ')}]`);
}

// Test with different ranges
console.log('\nTesting Enhanced Ensemble with different ranges:');
const testRanges = [20, 30, 50, 80];
for (const range of testRanges) {
  const result = simulateEnhancedEnsemble(range);
  console.log(`Range ${range}: [${result.join(', ')}]`);
}

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('✅ All runs with same parameters should produce IDENTICAL results');
console.log('✅ Different ranges may produce different results (that\'s normal)');
console.log('❌ If same parameters produce different results = randomization still present');