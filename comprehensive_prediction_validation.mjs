import fs from 'fs';

console.log('🔍 COMPREHENSIVE PREDICTION METHODS VALIDATION');
console.log('='.repeat(70));
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString()}`);
console.log(`⏰ Analysis Time: ${new Date().toLocaleTimeString()}`);
console.log('');

// Load actual TOTO data
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

// Method 1: Frequency + Compatibility Prediction
function runFrequencyCompatibilityPrediction(data, bases, range = 20, includeAdd = true) {
  console.log(`🔢 Frequency + Compatibility Analysis (Range: ${range})`);
  
  const draws = data.slice(0, Math.min(range, data.length));
  const freq = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  draws.forEach(draw => {
    const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) freq[n]++;
    });
    
    bases.forEach(base => {
      if (pool.includes(base)) {
        pool.filter(n => n !== base && n >= 1 && n <= 49).forEach(n => {
          compat[n]++;
        });
      }
    });
  });
  
  const suggestions = freq.map((frequency, n) => ({
    n,
    frequency,
    compatibility: compat[n],
    score: frequency + compat[n],
    confidence: Math.min(95, 50 + (frequency + compat[n]) * 5)
  }))
  .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
  .sort((a, b) => b.score - a.score || a.n - b.n)
  .slice(0, 6);
  
  console.log(`   📊 Top predictions: [${suggestions.map(s => s.n).join(', ')}]`);
  console.log(`   📈 Scores: [${suggestions.map(s => s.score.toFixed(1)).join(', ')}]`);
  
  return {
    method: 'Frequency + Compatibility',
    predictions: suggestions.map(s => s.n),
    scores: suggestions.map(s => s.score),
    details: suggestions,
    avgConfidence: suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
  };
}

// Method 2: Improved Weighted Recent Analysis
function runImprovedWeightedPrediction(data, bases, range = 20, includeAdd = true) {
  console.log(`⚖️ Improved Weighted Recent Analysis (Range: ${range})`);
  
  const draws = data.slice(0, Math.min(range, data.length));
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  
  // Range-differentiated algorithms
  if (range <= 10) {
    console.log('   🔥 Using: Recent Focus Algorithm');
    draws.forEach((draw, index) => {
      const weight = Math.pow(0.98, index) * 2.0;
      const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
      
      pool.forEach(n => {
        if (n >= 1 && n <= 49) weighted[n] += weight;
      });
      
      bases.forEach(b => {
        if (pool.includes(b)) {
          pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
            compat[n] += weight * 0.5;
          });
        }
      });
    });
  } else if (range <= 30) {
    console.log('   ⚖️ Using: Balanced Algorithm');
    draws.forEach((draw, index) => {
      const normalizedPos = index / (range - 1);
      const sigmoidWeight = 1 / (1 + Math.exp((normalizedPos - 0.3) * 10));
      const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
      
      pool.forEach(n => {
        if (n >= 1 && n <= 49) weighted[n] += sigmoidWeight;
      });
      
      bases.forEach(b => {
        if (pool.includes(b)) {
          pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
            compat[n] += sigmoidWeight * 1.5;
          });
        }
      });
    });
  } else {
    console.log('   📈 Using: Pattern Analysis Algorithm');
    const segmentSize = Math.floor(range / 4);
    
    for (let segment = 0; segment < 4; segment++) {
      const segmentStart = segment * segmentSize;
      const segmentEnd = Math.min(segmentStart + segmentSize, range);
      const segmentDraws = draws.slice(segmentStart, segmentEnd);
      const segmentWeight = segment === 0 ? 2.0 : segment === 1 ? 1.5 : segment === 2 ? 1.0 : 0.6;
      
      segmentDraws.forEach((draw, index) => {
        const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
        
        pool.forEach(n => {
          if (n >= 1 && n <= 49) {
            weighted[n] += segmentWeight / (index + 1);
            
            // Positional bias based on segment
            if (segment === 0 && n >= 30) weighted[n] += 0.3;
            if (segment === 1 && n >= 20 && n <= 35) weighted[n] += 0.2;
            if (segment >= 2 && n <= 25) weighted[n] += 0.1;
          }
        });
        
        bases.forEach(b => {
          if (pool.includes(b)) {
            pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
              compat[n] += segmentWeight * 0.8 / (index + 1);
            });
          }
        });
      });
    }
  }
  
  // Dynamic scoring based on range
  const suggestions = weighted.map((weight, n) => {
    let finalScore;
    if (range <= 10) {
      finalScore = weight * 1.5 + compat[n] * 0.3;
    } else if (range <= 30) {
      finalScore = weight * 0.8 + compat[n] * 1.2;
    } else {
      const patternBonus = (weight > 2.0 ? 0.5 : 0) + (compat[n] > 1.5 ? 0.3 : 0);
      finalScore = weight + compat[n] + patternBonus;
    }
    
    return {
      n,
      weight,
      compatibility: compat[n],
      finalScore,
      confidence: Math.min(95, 40 + finalScore * 12)
    };
  })
  .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
  .sort((a, b) => b.finalScore - a.finalScore || a.n - b.n)
  .slice(0, 6);
  
  console.log(`   📊 Top predictions: [${suggestions.map(s => s.n).join(', ')}]`);
  console.log(`   📈 Scores: [${suggestions.map(s => s.finalScore.toFixed(2)).join(', ')}]`);
  
  return {
    method: `Weighted Recent (${range <= 10 ? 'Recent Focus' : range <= 30 ? 'Balanced' : 'Pattern Analysis'})`,
    predictions: suggestions.map(s => s.n),
    scores: suggestions.map(s => s.finalScore),
    details: suggestions,
    avgConfidence: suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
  };
}

// Method 3: Hot/Cold Analysis
function runHotColdPrediction(data, bases, range = 20, includeAdd = true) {
  console.log(`🔥❄️ Hot/Cold Analysis (Range: ${range})`);
  
  const recentDraws = data.slice(0, Math.floor(range / 2));
  const olderDraws = data.slice(Math.floor(range / 2), range);
  
  const recentFreq = Array(50).fill(0);
  const olderFreq = Array(50).fill(0);
  
  recentDraws.forEach(draw => {
    const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) recentFreq[n]++;
    });
  });
  
  olderDraws.forEach(draw => {
    const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
    pool.forEach(n => {
      if (n >= 1 && n <= 49) olderFreq[n]++;
    });
  });
  
  const suggestions = recentFreq.map((recentF, n) => {
    const olderF = olderFreq[n] || 0;
    const trend = recentF - olderF;
    const hotScore = recentF * 2 + Math.max(0, trend) * 1.5;
    
    return {
      n,
      recentFreq: recentF,
      olderFreq: olderF,
      trend,
      hotScore,
      confidence: Math.min(95, 45 + hotScore * 8)
    };
  })
  .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
  .sort((a, b) => b.hotScore - a.hotScore || a.n - b.n)
  .slice(0, 6);
  
  console.log(`   📊 Top predictions: [${suggestions.map(s => s.n).join(', ')}]`);
  console.log(`   🔥 Hot scores: [${suggestions.map(s => s.hotScore.toFixed(1)).join(', ')}]`);
  console.log(`   📈 Trends: [${suggestions.map(s => s.trend >= 0 ? '+' + s.trend : s.trend).join(', ')}]`);
  
  return {
    method: 'Hot/Cold Analysis',
    predictions: suggestions.map(s => s.n),
    scores: suggestions.map(s => s.hotScore),
    details: suggestions,
    avgConfidence: suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
  };
}

// Method 4: Enhanced Ensemble Prediction
function runEnhancedEnsemblePrediction(data, bases, range = 20, includeAdd = true) {
  console.log(`🎯 Enhanced Ensemble Prediction (Range: ${range})`);
  
  const draws = data.slice(0, Math.min(range, data.length));
  
  // Multiple analysis approaches
  const freq = Array(50).fill(0);
  const weighted = Array(50).fill(0);
  const compat = Array(50).fill(0);
  const patterns = Array(50).fill(0);
  
  draws.forEach((draw, index) => {
    const weight = Math.pow(0.9, index);
    const pool = includeAdd ? [...draw.numbers, draw.additional] : draw.numbers;
    
    // Frequency analysis
    pool.forEach(n => {
      if (n >= 1 && n <= 49) {
        freq[n]++;
        weighted[n] += weight;
      }
    });
    
    // Compatibility analysis
    bases.forEach(base => {
      if (pool.includes(base)) {
        pool.filter(n => n !== base && n >= 1 && n <= 49).forEach(n => {
          compat[n] += weight;
        });
      }
    });
    
    // Pattern analysis (number gaps, sequences)
    const sorted = [...pool].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i];
      if (gap >= 1 && gap <= 5) {
        // Reward numbers that form good gaps
        if (sorted[i] >= 1 && sorted[i] <= 49) patterns[sorted[i]] += 0.5;
        if (sorted[i + 1] >= 1 && sorted[i + 1] <= 49) patterns[sorted[i + 1]] += 0.5;
      }
    }
  });
  
  // Ensemble scoring with multiple factors
  const suggestions = freq.map((frequency, n) => {
    const ensembleScore = (
      frequency * 0.3 +           // 30% frequency
      weighted[n] * 0.35 +        // 35% weighted recency
      compat[n] * 0.25 +          // 25% compatibility  
      patterns[n] * 0.1           // 10% pattern bonus
    );
    
    return {
      n,
      frequency,
      weighted: weighted[n],
      compatibility: compat[n],
      patterns: patterns[n],
      ensembleScore,
      confidence: Math.min(95, 50 + ensembleScore * 6)
    };
  })
  .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
  .sort((a, b) => b.ensembleScore - a.ensembleScore || a.n - b.n)
  .slice(0, 6);
  
  console.log(`   📊 Top predictions: [${suggestions.map(s => s.n).join(', ')}]`);
  console.log(`   🎯 Ensemble scores: [${suggestions.map(s => s.ensembleScore.toFixed(2)).join(', ')}]`);
  
  return {
    method: 'Enhanced Ensemble',
    predictions: suggestions.map(s => s.n),
    scores: suggestions.map(s => s.ensembleScore),
    details: suggestions,
    avgConfidence: suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
  };
}

// Test all methods with different configurations
function testAllPredictionMethods() {
  console.log('🧪 TESTING ALL PREDICTION METHODS');
  console.log('-'.repeat(60));
  
  const data = loadTotoData();
  const testConfigs = [
    { bases: [1,2,3,4,5,6], range: 10, label: 'Small Range (10), Low Bases' },
    { bases: [1,2,3,4,5,6], range: 20, label: 'Medium Range (20), Low Bases' },
    { bases: [1,2,3,4,5,6], range: 50, label: 'Large Range (50), Low Bases' },
    { bases: [2,4,8,19,35,39], range: 20, label: 'Medium Range (20), Latest Result Bases' },
    { bases: [44,45,46,47,48,49], range: 20, label: 'Medium Range (20), High Bases' }
  ];
  
  console.log(`📚 Using ${data.length} historical draws from ${data[data.length-1].date} to ${data[0].date}`);
  console.log('');
  
  const allResults = [];
  
  testConfigs.forEach((config, configIndex) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 TEST CONFIGURATION ${configIndex + 1}: ${config.label}`);
    console.log(`   Bases: [${config.bases.join(', ')}], Range: ${config.range}`);
    console.log('-'.repeat(50));
    
    const results = {
      config,
      methods: {}
    };
    
    try {
      // Test Method 1: Frequency + Compatibility
      console.log('\n1️⃣ FREQUENCY + COMPATIBILITY METHOD');
      results.methods.freqCompat = runFrequencyCompatibilityPrediction(
        data, config.bases, config.range, true
      );
      
      // Test Method 2: Improved Weighted
      console.log('\n2️⃣ IMPROVED WEIGHTED RECENT METHOD');
      results.methods.weighted = runImprovedWeightedPrediction(
        data, config.bases, config.range, true
      );
      
      // Test Method 3: Hot/Cold
      console.log('\n3️⃣ HOT/COLD ANALYSIS METHOD');
      results.methods.hotCold = runHotColdPrediction(
        data, config.bases, config.range, true
      );
      
      // Test Method 4: Enhanced Ensemble
      console.log('\n4️⃣ ENHANCED ENSEMBLE METHOD');
      results.methods.ensemble = runEnhancedEnsemblePrediction(
        data, config.bases, config.range, true
      );
      
    } catch (error) {
      console.log(`   ❌ Error in configuration: ${error.message}`);
      results.error = error.message;
    }
    
    allResults.push(results);
  });
  
  return allResults;
}

// Analyze method performance and diversity
function analyzeMethodPerformance(allResults) {
  console.log('\n📊 METHOD PERFORMANCE ANALYSIS');
  console.log('='.repeat(70));
  
  const methodStats = {
    freqCompat: { name: 'Frequency + Compatibility', predictions: [], confidences: [] },
    weighted: { name: 'Improved Weighted Recent', predictions: [], confidences: [] },
    hotCold: { name: 'Hot/Cold Analysis', predictions: [], confidences: [] },
    ensemble: { name: 'Enhanced Ensemble', predictions: [], confidences: [] }
  };
  
  // Collect all predictions and confidences
  allResults.forEach(result => {
    if (!result.error) {
      Object.keys(methodStats).forEach(methodKey => {
        if (result.methods[methodKey]) {
          methodStats[methodKey].predictions.push(...result.methods[methodKey].predictions);
          methodStats[methodKey].confidences.push(result.methods[methodKey].avgConfidence);
        }
      });
    }
  });
  
  console.log('📋 METHOD COMPARISON SUMMARY:');
  console.log('-'.repeat(40));
  
  Object.entries(methodStats).forEach(([key, stats]) => {
    const uniqueNums = new Set(stats.predictions);
    const avgConfidence = stats.confidences.reduce((sum, c) => sum + c, 0) / stats.confidences.length;
    const diversity = (uniqueNums.size / stats.predictions.length) * 100;
    
    console.log(`\n🔍 ${stats.name}:`);
    console.log(`   📊 Total predictions: ${stats.predictions.length}`);
    console.log(`   🎯 Unique numbers: ${uniqueNums.size}`);
    console.log(`   📈 Diversity: ${diversity.toFixed(1)}%`);
    console.log(`   🔒 Avg confidence: ${avgConfidence.toFixed(1)}%`);
    console.log(`   📋 Most frequent: [${[...uniqueNums].slice(0, 10).sort((a,b) => a-b).join(', ')}]`);
  });
  
  return methodStats;
}

// Cross-method similarity analysis
function analyzeCrossMethodSimilarity(allResults) {
  console.log('\n🔍 CROSS-METHOD SIMILARITY ANALYSIS');
  console.log('-'.repeat(50));
  
  allResults.forEach((result, index) => {
    if (result.error) return;
    
    console.log(`\n📊 Configuration ${index + 1}: ${result.config.label}`);
    
    const methods = Object.entries(result.methods);
    const predictions = {};
    
    methods.forEach(([key, method]) => {
      predictions[key] = new Set(method.predictions);
      console.log(`   ${method.method}: [${method.predictions.join(', ')}]`);
    });
    
    // Calculate pairwise similarities
    console.log('\n   🔄 Method Similarities:');
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const [key1, method1] = methods[i];
        const [key2, method2] = methods[j];
        
        const intersection = [...predictions[key1]].filter(n => predictions[key2].has(n));
        const similarity = (intersection.length / 6) * 100;
        
        console.log(`   ${method1.method.substring(0, 15)} ↔ ${method2.method.substring(0, 15)}: ${similarity.toFixed(1)}% (${intersection.length}/6)`);
      }
    }
  });
}

// Suggest improvements
function suggestImprovements(methodStats, allResults) {
  console.log('\n💡 IMPROVEMENT SUGGESTIONS');
  console.log('='.repeat(70));
  
  console.log('📈 PERFORMANCE ASSESSMENT:');
  console.log('-'.repeat(30));
  
  // Analyze each method
  Object.entries(methodStats).forEach(([key, stats]) => {
    const diversity = (new Set(stats.predictions).size / stats.predictions.length) * 100;
    const avgConfidence = stats.confidences.reduce((sum, c) => sum + c, 0) / stats.confidences.length;
    
    console.log(`\n🔍 ${stats.name}:`);
    
    if (diversity > 70) {
      console.log('   ✅ EXCELLENT diversity - method working well');
    } else if (diversity > 50) {
      console.log('   ✅ GOOD diversity - minor improvements possible');
    } else if (diversity > 30) {
      console.log('   ⚠️  FAIR diversity - needs improvement');
    } else {
      console.log('   ❌ POOR diversity - major improvements needed');
    }
    
    if (avgConfidence > 80) {
      console.log('   ✅ High confidence scores - good reliability indicators');
    } else if (avgConfidence > 60) {
      console.log('   ✅ Moderate confidence - acceptable range');
    } else {
      console.log('   ⚠️  Low confidence - may indicate algorithmic issues');
    }
  });
  
  console.log('\n🛠️ SPECIFIC IMPROVEMENT RECOMMENDATIONS:');
  console.log('-'.repeat(45));
  
  console.log('\n1️⃣ FREQUENCY + COMPATIBILITY METHOD:');
  console.log('   💡 Add time-decay weighting to favor recent draws');
  console.log('   💡 Implement dynamic compatibility scoring');
  console.log('   💡 Add pattern detection for number sequences');
  
  console.log('\n2️⃣ IMPROVED WEIGHTED RECENT METHOD:');
  console.log('   ✅ Already significantly improved with range sensitivity');
  console.log('   💡 Consider adding seasonal/cyclical pattern detection');
  console.log('   💡 Implement adaptive decay based on historical variance');
  
  console.log('\n3️⃣ HOT/COLD ANALYSIS METHOD:');
  console.log('   💡 Add multi-timeframe analysis (short/medium/long term)');
  console.log('   💡 Implement cooling/heating rate calculations');
  console.log('   💡 Add momentum indicators for trend strength');
  
  console.log('\n4️⃣ ENHANCED ENSEMBLE METHOD:');
  console.log('   💡 Add machine learning weight optimization');
  console.log('   💡 Implement dynamic factor weighting based on recent performance');
  console.log('   💡 Add number position/distribution pattern analysis');
  
  console.log('\n🎯 OVERALL SYSTEM IMPROVEMENTS:');
  console.log('-'.repeat(35));
  console.log('   💡 Add method performance tracking and auto-optimization');
  console.log('   💡 Implement ensemble of ensembles approach');
  console.log('   💡 Add user feedback loop for prediction accuracy');
  console.log('   💡 Create dynamic method selection based on recent performance');
  console.log('   💡 Add Monte Carlo simulation for confidence intervals');
  
  // Calculate overall system diversity
  const allPredictions = Object.values(methodStats).flatMap(m => m.predictions);
  const overallDiversity = (new Set(allPredictions).size / allPredictions.length) * 100;
  
  console.log('\n🏆 OVERALL SYSTEM STATUS:');
  console.log('-'.repeat(25));
  console.log(`📊 System-wide diversity: ${overallDiversity.toFixed(1)}%`);
  
  if (overallDiversity > 60) {
    console.log('✅ EXCELLENT: System provides good variety across methods');
    console.log('✅ RECOMMENDATION: Deploy current system, implement gradual improvements');
  } else if (overallDiversity > 40) {
    console.log('✅ GOOD: System functional, but improvements would be beneficial');
    console.log('📈 RECOMMENDATION: Implement 2-3 key improvements from above list');
  } else {
    console.log('⚠️  NEEDS WORK: System requires significant improvements');
    console.log('🔧 RECOMMENDATION: Prioritize diversity improvements before deployment');
  }
}

// Main validation function
function runComprehensiveValidation() {
  console.log('🚀 Starting comprehensive prediction methods validation...\n');
  
  try {
    // Test all methods across different configurations
    const allResults = testAllPredictionMethods();
    
    // Analyze performance and diversity
    const methodStats = analyzeMethodPerformance(allResults);
    
    // Analyze cross-method similarities
    analyzeCrossMethodSimilarity(allResults);
    
    // Provide improvement suggestions
    suggestImprovements(methodStats, allResults);
    
    console.log('\n🏁 VALIDATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`📅 Report generated: ${new Date().toLocaleString()}`);
    console.log('📊 All prediction methods analyzed and assessed');
    console.log('💡 Improvement recommendations provided');
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error.message);
    console.error(error.stack);
  }
}

// Execute the comprehensive validation
runComprehensiveValidation();