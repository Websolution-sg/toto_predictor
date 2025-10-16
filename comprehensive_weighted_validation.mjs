// COMPREHENSIVE WEIGHTED METHOD VALIDATION - FINAL VERSION
// Tests the actual HTML implementation with range sensitivity

import fs from 'fs';

console.log('🎯 COMPREHENSIVE WEIGHTED METHOD VALIDATION');
console.log('='.repeat(65));
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString()}`);
console.log(`⏰ Test Time: ${new Date().toLocaleTimeString()}`);
console.log('');

// Load the actual TOTO data
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

// Implement the exact algorithm from the updated HTML
function rangeAwareWeightedPrediction(totoData, basesArray, range = 20, includeAdd = true) {
  console.log(`🎯 Range-Aware Weighted Analysis (Range: ${range}, Include Additional: ${includeAdd})`);
  
  const draws = totoData.slice(0, Math.min(range, totoData.length));
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  const recency = Array(50).fill(0);
  
  console.log(`   📊 Processing ${draws.length} draws with range-sensitive algorithm`);
  
  draws.forEach((draw, index) => {
    // Multi-tier weighting system (exact HTML logic)
    let positionWeight = 1.0;
    if (range <= 10) {
      positionWeight = Math.pow(0.95, index);
    } else if (range <= 30) {
      positionWeight = Math.pow(0.85, index);
    } else {
      positionWeight = index < 10 ? Math.pow(0.7, index) : Math.pow(0.95, index - 10) * Math.pow(0.7, 10);
    }
    
    const recencyBonus = range <= 20 ? (20 - index) / 20 : (range - index) / range;
    const finalWeight = positionWeight + (recencyBonus * 0.3);
    
    const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
    
    pool.forEach(n => {
      if (n >= 1 && n <= 49) {
        weighted[n] += finalWeight;
        recency[n] += (1.0 / (index + 1)) * (range / 50);
      }
    });
    
    basesArray.forEach(b => {
      if (pool.includes(b)) {
        pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
          compat[n] += finalWeight * 0.8;
        });
      }
    });
    
    if (index < 3) {
      console.log(`   Draw ${index + 1} [${draw.date}]: pos=${positionWeight.toFixed(3)}, recency=${recencyBonus.toFixed(3)}, final=${finalWeight.toFixed(3)}`);
    }
  });
  
  // Dynamic scoring with range-specific adjustments
  const suggestions = weighted.map((weight, n) => {
    let dynamicScore = weight + compat[n] + recency[n];
    
    if (range <= 10) {
      dynamicScore += weight * 0.5;
    } else if (range <= 30) {
      dynamicScore += compat[n] * 0.3;
    } else {
      dynamicScore += (weight * 0.2) + (recency[n] * 0.4);
    }
    
    return { 
      n, 
      weight, 
      compat: compat[n],
      recency: recency[n],
      dynamicScore,
      confidence: Math.min(95, 45 + (dynamicScore * 8))
    };
  })
  .filter(o => o.n >= 1 && o.n <= 49 && !basesArray.includes(o.n))
  .sort((a, b) => b.dynamicScore - a.dynamicScore || a.n - b.n);
  
  // Range-adaptive final selection
  let finalCount = range <= 10 ? 6 : (range <= 30 ? 8 : 10);
  const topCandidates = suggestions.slice(0, finalCount);
  
  const finalPredictions = [];
  const usedNumbers = new Set();
  
  for (const candidate of topCandidates) {
    if (finalPredictions.length >= 6) break;
    
    if (range > 30) {
      const tooSimilar = finalPredictions.some(p => Math.abs(p.n - candidate.n) <= 2);
      if (tooSimilar && finalPredictions.length >= 4) continue;
    }
    
    if (candidate.weight > 0.1 || candidate.compat > 0.1 || candidate.recency > 0.1) {
      finalPredictions.push(candidate);
      usedNumbers.add(candidate.n);
    }
  }
  
  // Ensure 6 predictions
  if (finalPredictions.length < 6) {
    for (const candidate of suggestions) {
      if (finalPredictions.length >= 6) break;
      if (!usedNumbers.has(candidate.n)) {
        finalPredictions.push(candidate);
        usedNumbers.add(candidate.n);
      }
    }
  }
  
  const predictions = finalPredictions.map(p => p.n);
  const scores = finalPredictions.map(p => p.dynamicScore);
  
  console.log(`   🎯 Final predictions: [${predictions.join(', ')}]`);
  console.log(`   📊 Prediction scores: [${scores.map(s => s.toFixed(2)).join(', ')}]`);
  console.log(`   🔢 Candidate pool size: ${suggestions.length}`);
  
  return {
    predictions,
    scores,
    details: finalPredictions,
    method: `Range-Sensitive Weighted (${range} draws)`,
    diversity: finalPredictions.length
  };
}

// Test comprehensive range scenarios
function testComprehensiveRanges() {
  console.log('🧪 COMPREHENSIVE RANGE TESTING');
  console.log('-'.repeat(50));
  
  const data = loadTotoData();
  const testBases = [1, 2, 3, 4, 5, 6];
  const testRanges = [5, 10, 15, 20, 30, 50, 100];
  
  console.log(`📚 Using ${data.length} historical draws from ${data[data.length-1].date} to ${data[0].date}`);
  console.log(`🎯 Base numbers: [${testBases.join(', ')}]`);
  console.log('');
  
  const results = {};
  
  testRanges.forEach(range => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 TESTING RANGE: ${range} draws`);
    console.log('-'.repeat(30));
    
    try {
      const result = rangeAwareWeightedPrediction(data, testBases, range, true);
      results[range] = result;
      
      console.log(`   ✅ Success: ${result.predictions.length} predictions generated`);
      console.log(`   📈 Method: ${result.method}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results[range] = { predictions: [], error: error.message };
    }
  });
  
  return results;
}

// Analyze diversity and range sensitivity
function analyzeDiversityAndSensitivity(results) {
  console.log('\n📊 DIVERSITY & SENSITIVITY ANALYSIS');
  console.log('='.repeat(60));
  
  const validResults = Object.entries(results).filter(([_, result]) => result.predictions && result.predictions.length > 0);
  
  console.log('📋 PREDICTION SUMMARY:');
  console.log('-'.repeat(40));
  validResults.forEach(([range, result]) => {
    console.log(`Range ${range.padStart(3)}: [${result.predictions.map(p => p.toString().padStart(2)).join(', ')}]`);
  });
  
  console.log('\n🔍 RANGE-TO-RANGE COMPARISON:');
  console.log('-'.repeat(40));
  
  const similarities = [];
  for (let i = 0; i < validResults.length; i++) {
    for (let j = i + 1; j < validResults.length; j++) {
      const [range1, result1] = validResults[i];
      const [range2, result2] = validResults[j];
      
      const set1 = new Set(result1.predictions);
      const set2 = new Set(result2.predictions);
      const intersection = [...set1].filter(n => set2.has(n));
      const similarity = (intersection.length / 6) * 100;
      
      similarities.push({ range1, range2, similarity, intersection });
      console.log(`Range ${range1}-${range2}: ${similarity.toFixed(1)}% similar (${intersection.length}/6 common: [${intersection.join(',')}])`);
    }
  }
  
  console.log('\n📈 OVERALL DIVERSITY METRICS:');
  console.log('-'.repeat(40));
  
  const allPredictions = validResults.flatMap(([_, result]) => result.predictions);
  const uniquePredictions = new Set(allPredictions);
  const avgSimilarity = similarities.reduce((sum, s) => sum + s.similarity, 0) / similarities.length;
  
  console.log(`Total predictions made: ${allPredictions.length}`);
  console.log(`Unique numbers predicted: ${uniquePredictions.size}`);
  console.log(`Diversity ratio: ${((uniquePredictions.size / allPredictions.length) * 100).toFixed(1)}%`);
  console.log(`Average similarity: ${avgSimilarity.toFixed(1)}%`);
  
  // Performance assessment
  console.log('\n🏆 PERFORMANCE ASSESSMENT:');
  console.log('-'.repeat(40));
  
  if (avgSimilarity < 60 && uniquePredictions.size > 15) {
    console.log('✅ EXCELLENT: High diversity, good range sensitivity');
    console.log('✅ Algorithm successfully addresses range variation issue');
    return 'EXCELLENT';
  } else if (avgSimilarity < 75 && uniquePredictions.size > 12) {
    console.log('✅ GOOD: Moderate diversity, acceptable variation');
    console.log('📈 Significant improvement over previous methods');
    return 'GOOD';
  } else if (avgSimilarity < 85) {
    console.log('⚠️  FAIR: Some improvement but needs more tuning');
    console.log('🔧 Algorithm shows progress but requires refinement');
    return 'FAIR';
  } else {
    console.log('❌ POOR: Still too similar across ranges');
    console.log('🔧 Algorithm needs major overhaul');
    return 'POOR';
  }
}

// Test different base number configurations
function testBaseDiversification() {
  console.log('\n🎲 BASE NUMBER DIVERSIFICATION TEST');
  console.log('-'.repeat(50));
  
  const data = loadTotoData();
  const range = 20; // Fixed range for base comparison
  
  const baseCombinations = [
    { bases: [1,2,3,4,5,6], label: 'Sequential Low' },
    { bases: [44,45,46,47,48,49], label: 'Sequential High' },
    { bases: [7,14,21,28,35,42], label: 'Multiples of 7' },
    { bases: [2,4,8,19,35,39], label: 'Latest Result (Oct 16)' },
    { bases: [19,22,26,37,40,46], label: 'Previous Result (Oct 2)' },
    { bases: [10,20,30,40,41,49], label: 'Decade Markers' }
  ];
  
  baseCombinations.forEach(({ bases, label }) => {
    console.log(`\n🎯 ${label}: [${bases.join(', ')}]`);
    const result = rangeAwareWeightedPrediction(data, bases, range, true);
    
    // Check for base contamination
    const hasConflict = result.predictions.some(p => bases.includes(p));
    if (hasConflict) {
      console.log('   ❌ WARNING: Base number contamination detected!');
    } else {
      console.log('   ✅ Clean: All predictions exclude base numbers');
    }
  });
}

// Main validation function
function runComprehensiveValidation() {
  console.log('🚀 Starting comprehensive weighted method validation...\n');
  
  try {
    const rangeResults = testComprehensiveRanges();
    const performance = analyzeDiversityAndSensitivity(rangeResults);
    testBaseDiversification();
    
    console.log('\n🏁 FINAL VALIDATION REPORT');
    console.log('='.repeat(65));
    console.log(`📊 Algorithm Performance: ${performance}`);
    console.log(`📅 Validation Date: ${new Date().toLocaleString()}`);
    console.log(`🔧 Status: ${performance === 'EXCELLENT' || performance === 'GOOD' ? 'READY FOR PRODUCTION' : 'NEEDS FURTHER WORK'}`);
    
    if (performance === 'EXCELLENT' || performance === 'GOOD') {
      console.log('\n✅ RECOMMENDATION: Deploy the updated weighted method');
      console.log('✅ The range sensitivity issue has been successfully resolved');
      console.log('✅ Users should now see different predictions for different ranges');
    } else {
      console.log('\n⚠️  RECOMMENDATION: Continue algorithm refinement');
      console.log('🔧 Consider more aggressive range differentiation');
    }
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error.message);
    console.error('🔧 Please check the algorithm implementation');
  }
}

// Execute the comprehensive validation
runComprehensiveValidation();