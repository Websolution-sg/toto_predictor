import fs from 'fs';

console.log('🔍 WEIGHTED RECENT ANALYSIS VALIDATION');
console.log('='.repeat(60));
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Load CSV data for analysis
function loadTotoData() {
  const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const parts = line.split(',');
    return {
      date: parts[0],
      numbers: parts.slice(1, 7).map(n => parseInt(n)),
      additional: parseInt(parts[7])
    };
  });
}

// Simulate the weighted prediction method with debugging
function simulateWeightedPrediction(data, bases = [1,2,3,4,5,6], ranges = [10, 20, 50, 100]) {
  console.log('🧮 SIMULATING WEIGHTED PREDICTION METHOD');
  console.log('-'.repeat(50));
  
  console.log(`📊 Using bases: [${bases.join(', ')}]`);
  console.log(`📏 Total historical data: ${data.length} draws`);
  console.log('');
  
  ranges.forEach(range => {
    console.log(`\n🔍 TESTING RANGE: ${range} draws`);
    console.log('-'.repeat(30));
    
    const draws = data.slice(0, range);
    console.log(`   Actual draws used: ${draws.length}`);
    
    if (draws.length === 0) {
      console.log('   ❌ No draws available for this range');
      return;
    }
    
    // Simulate the exact algorithm from the code
    const weighted = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    draws.forEach((draw, index) => {
      const weight = 1 / (index + 1); // Linear decay as in the code
      const pool = draw.numbers; // Not including additional for this test
      
      console.log(`   Draw ${index + 1}: ${draw.date} [${pool.join(',')}] weight: ${weight.toFixed(3)}`);
      
      pool.forEach(n => {
        weighted[n] += weight;
      });
      
      bases.forEach(b => {
        if (pool.includes(b)) {
          pool.filter(n => n !== b).forEach(n => {
            compat[n] += weight;
          });
        }
      });
    });
    
    // Calculate scores and find top predictions
    const suggestions = weighted.map((weight, n) => ({ 
      n, 
      weight: weight.toFixed(3), 
      compat: compat[n].toFixed(3),
      score: (weight + compat[n]).toFixed(3)
    }))
      .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
      .slice(0, 10);
    
    console.log(`\n   📊 Top 10 predictions for range ${range}:`);
    suggestions.forEach((suggestion, i) => {
      console.log(`   ${i+1}. Number ${suggestion.n}: Score ${suggestion.score} (Weight: ${suggestion.weight}, Compat: ${suggestion.compat})`);
    });
    
    // Check for issues
    const uniqueScores = new Set(suggestions.map(s => s.score));
    if (uniqueScores.size < suggestions.length) {
      console.log(`   ⚠️  WARNING: ${suggestions.length - uniqueScores.size} duplicate scores detected!`);
    }
    
    const zeroScores = suggestions.filter(s => parseFloat(s.score) === 0).length;
    if (zeroScores > 0) {
      console.log(`   ⚠️  WARNING: ${zeroScores} numbers with zero scores!`);
    }
    
    // Check weight distribution
    const maxWeight = Math.max(...weighted.filter(w => w > 0));
    const minWeight = Math.min(...weighted.filter(w => w > 0));
    console.log(`   📈 Weight range: ${minWeight.toFixed(3)} to ${maxWeight.toFixed(3)}`);
  });
}

// Test different scenarios
function testDifferentScenarios(data) {
  console.log('\n🎯 TESTING DIFFERENT SCENARIOS');
  console.log('-'.repeat(40));
  
  const testCases = [
    { bases: [1,2,3,4,5,6], label: 'Low numbers' },
    { bases: [44,45,46,47,48,49], label: 'High numbers' },
    { bases: [10,20,30,40,41,42], label: 'Mixed numbers' },
    { bases: [15,22,26,37,40,46], label: 'Recent result numbers' }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n🧪 TEST CASE: ${testCase.label}`);
    console.log(`   Bases: [${testCase.bases.join(', ')}]`);
    
    const range = 20; // Fixed range for comparison
    const draws = data.slice(0, range);
    const weighted = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    draws.forEach((draw, index) => {
      const weight = 1 / (index + 1);
      const pool = draw.numbers;
      
      pool.forEach(n => weighted[n] += weight);
      
      testCase.bases.forEach(b => {
        if (pool.includes(b)) {
          pool.filter(n => n !== b).forEach(n => compat[n] += weight);
        }
      });
    });
    
    const top3 = weighted.map((weight, n) => ({ n, score: weight + compat[n] }))
      .filter(o => o.n >= 1 && o.n <= 49 && !testCase.bases.includes(o.n))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    console.log(`   Top 3: ${top3.map(t => `${t.n}(${t.score.toFixed(2)})`).join(', ')}`);
  });
}

// Analyze weight decay function
function analyzeWeightDecay() {
  console.log('\n📉 WEIGHT DECAY ANALYSIS');
  console.log('-'.repeat(30));
  
  console.log('Current weight formula: weight = 1 / (index + 1)');
  console.log('Weight progression:');
  
  for (let i = 0; i < 10; i++) {
    const weight = 1 / (i + 1);
    console.log(`   Draw ${i + 1}: weight = ${weight.toFixed(4)}`);
  }
  
  console.log('\n💡 Analysis:');
  console.log('• Most recent draw gets weight 1.0000');
  console.log('• 2nd recent gets weight 0.5000 (50% less)');
  console.log('• 3rd recent gets weight 0.3333 (33% of original)');
  console.log('• Weight drops very quickly - might be too aggressive');
  
  console.log('\n🔧 Potential Issues:');
  console.log('1. Linear decay might be too steep');
  console.log('2. Older draws become almost irrelevant');
  console.log('3. Small datasets might show similar patterns');
  console.log('4. Limited discrimination between numbers');
}

// Check for algorithm problems
function diagnoseAlgorithmIssues(data) {
  console.log('\n🔍 ALGORITHM DIAGNOSTIC');
  console.log('-'.repeat(30));
  
  // Test with a controlled dataset
  const testRanges = [5, 10, 20, 50];
  const bases = [1,2,3,4,5,6];
  
  console.log('Testing prediction consistency across different ranges...\n');
  
  const results = {};
  
  testRanges.forEach(range => {
    const draws = data.slice(0, Math.min(range, data.length));
    const weighted = Array(50).fill(0);
    
    draws.forEach((draw, index) => {
      const weight = 1 / (index + 1);
      draw.numbers.forEach(n => weighted[n] += weight);
    });
    
    const topNumbers = weighted.map((weight, n) => ({ n, weight }))
      .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6)
      .map(o => o.n);
    
    results[range] = topNumbers;
    console.log(`Range ${range}: [${topNumbers.join(', ')}]`);
  });
  
  // Check for similarities
  console.log('\n📊 Similarity Analysis:');
  const similarities = {};
  
  Object.keys(results).forEach(range1 => {
    Object.keys(results).forEach(range2 => {
      if (range1 !== range2) {
        const intersection = results[range1].filter(n => results[range2].includes(n));
        const similarity = (intersection.length / 6 * 100).toFixed(1);
        similarities[`${range1}-${range2}`] = { intersection, similarity };
      }
    });
  });
  
  Object.entries(similarities).forEach(([key, value]) => {
    console.log(`   ${key}: ${value.similarity}% similar (${value.intersection.length}/6 common numbers)`);
  });
  
  // If similarity is very high across all ranges, that's the problem
  const avgSimilarity = Object.values(similarities).reduce((sum, val) => sum + parseFloat(val.similarity), 0) / Object.values(similarities).length;
  
  if (avgSimilarity > 80) {
    console.log(`\n❌ HIGH SIMILARITY DETECTED (${avgSimilarity.toFixed(1)}% average)`);
    console.log('   This explains why results are the same across ranges!');
    console.log('   Issue: Weight decay is too aggressive or algorithm is flawed');
  } else {
    console.log(`\n✅ NORMAL VARIATION (${avgSimilarity.toFixed(1)}% average similarity)`);
  }
}

// Main validation function
function runWeightedAnalysisValidation() {
  console.log('🚀 Starting weighted recent analysis validation...\n');
  
  try {
    const data = loadTotoData();
    console.log(`📚 Loaded ${data.length} historical draws`);
    console.log(`📅 Date range: ${data[data.length-1].date} to ${data[0].date}\n`);
    
    simulateWeightedPrediction(data);
    testDifferentScenarios(data);
    analyzeWeightDecay();
    diagnoseAlgorithmIssues(data);
    
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log('If the weighted prediction method is showing the same results');
    console.log('for all ranges, the likely causes are:');
    console.log('');
    console.log('1. ❌ Weight decay too aggressive (1/(index+1))');
    console.log('2. ❌ Recent draws dominate completely');
    console.log('3. ❌ Insufficient variation in historical data');
    console.log('4. ❌ Algorithm not considering range parameter properly');
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('• Use gentler decay: Math.exp(-index * 0.1) or Math.pow(0.9, index)');
    console.log('• Ensure range parameter affects weight calculation');
    console.log('• Add minimum weight threshold');
    console.log('• Test with different base number combinations');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
}

// Run the validation
runWeightedAnalysisValidation();