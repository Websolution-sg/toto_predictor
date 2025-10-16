console.log('🎯 FINAL RANGE-DIFFERENTIATED ALGORITHM TEST');
console.log('='.repeat(60));

// Test the revolutionary range-specific algorithms
function testRangeDifferentiation() {
  // Mock data similar to actual TOTO results
  const mockData = [
    { numbers: [2,4,8,19,35,39], additional: 14 },
    { numbers: [5,31,33,34,38,46], additional: 12 },
    { numbers: [13,14,19,22,31,42], additional: 35 },
    { numbers: [10,15,22,31,42,48], additional: 25 },
    { numbers: [19,22,26,37,40,46], additional: 14 },
    { numbers: [15,16,22,34,35,43], additional: 29 },
    { numbers: [1,6,9,11,29,36], additional: 33 },
    { numbers: [8,15,22,24,43,47], additional: 20 },
    { numbers: [6,8,9,20,45,49], additional: 35 },
    { numbers: [10,19,25,29,33,37], additional: 47 },
    ...Array(50).fill().map((_, i) => ({
      numbers: Array(6).fill().map(() => Math.floor(Math.random()*49)+1),
      additional: Math.floor(Math.random()*49)+1
    }))
  ];
  
  const bases = [1,2,3,4,5,6];
  const testRanges = [5, 10, 15, 25, 35, 50];
  
  console.log('🧪 Testing different algorithms for different ranges:');
  console.log('');
  
  const results = {};
  
  testRanges.forEach(range => {
    console.log(`📊 RANGE ${range}:`);
    
    const draws = mockData.slice(0, range);
    const weighted = Array(50).fill(0);
    const compat = Array(50).fill(0);
    
    if (range <= 10) {
      console.log('   🔥 Algorithm: RECENT FOCUS (gentle decay, double weight)');
      draws.forEach((draw, index) => {
        const weight = Math.pow(0.98, index);
        const pool = [...draw.numbers, draw.additional];
        
        pool.forEach(n => {
          if (n >= 1 && n <= 49) weighted[n] += weight * 2.0;
        });
        
        bases.forEach(b => {
          if (pool.includes(b)) {
            pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
              compat[n] += weight * 0.5;
            });
          }
        });
      });
      
      const predictions = weighted.map((w, n) => ({ 
        n, 
        score: w * 1.5 + compat[n] * 0.3 
      }))
      .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(o => o.n);
      
      results[range] = predictions;
      console.log(`   🎯 Predictions: [${predictions.join(', ')}]`);
      
    } else if (range <= 30) {
      console.log('   ⚖️  Algorithm: BALANCED (sigmoid decay, compatibility boost)');
      draws.forEach((draw, index) => {
        const normalizedPos = index / (range - 1);
        const sigmoidWeight = 1 / (1 + Math.exp((normalizedPos - 0.3) * 10));
        const pool = [...draw.numbers, draw.additional];
        
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
      
      const predictions = weighted.map((w, n) => ({ 
        n, 
        score: w * 0.8 + compat[n] * 1.2 
      }))
      .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
      .sort((a, b) => b.score - a.score);
      
      // Ensure diversity for medium range
      const finalPreds = [];
      for (const candidate of predictions) {
        if (finalPreds.length >= 6) break;
        const tooClose = finalPreds.some(p => Math.abs(p.n - candidate.n) <= 3);
        if (!tooClose || finalPreds.length >= 4) {
          finalPreds.push(candidate.n);
        }
      }
      
      results[range] = finalPreds;
      console.log(`   🎯 Predictions: [${finalPreds.join(', ')}]`);
      
    } else {
      console.log('   📈 Algorithm: PATTERN ANALYSIS (segmented, strategic selection)');
      const segmentSize = Math.floor(range / 4);
      
      for (let segment = 0; segment < 4; segment++) {
        const segmentStart = segment * segmentSize;
        const segmentEnd = Math.min(segmentStart + segmentSize, range);
        const segmentDraws = draws.slice(segmentStart, segmentEnd);
        const segmentWeight = segment === 0 ? 2.0 : segment === 1 ? 1.5 : segment === 2 ? 1.0 : 0.6;
        
        segmentDraws.forEach((draw, index) => {
          const pool = [...draw.numbers, draw.additional];
          
          pool.forEach(n => {
            if (n >= 1 && n <= 49) {
              weighted[n] += segmentWeight / (index + 1);
              
              // Positional bias
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
      
      const scored = weighted.map((w, n) => ({
        n,
        score: w + compat[n] + (w > 2.0 ? 0.5 : 0) + (compat[n] > 1.5 ? 0.3 : 0) + (Math.random() * 0.1)
      }))
      .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
      .sort((a, b) => b.score - a.score);
      
      // Strategic selection
      const topTier = scored.slice(0, 3);
      const midTier = scored.slice(5, 15);
      const lowTier = scored.slice(20, 35);
      
      const predictions = [
        ...topTier.slice(0, 2).map(s => s.n),
        ...midTier.slice(0, 2).map(s => s.n),
        ...lowTier.slice(0, 2).map(s => s.n)
      ];
      
      results[range] = predictions;
      console.log(`   🎯 Predictions: [${predictions.join(', ')}]`);
    }
    
    console.log('');
  });
  
  return results;
}

// Analyze the diversity
function analyzeDiversity(results) {
  console.log('📊 DIVERSITY ANALYSIS:');
  console.log('-'.repeat(40));
  
  console.log('Results by range:');
  Object.entries(results).forEach(([range, preds]) => {
    console.log(`Range ${range.padStart(2)}: [${preds.map(p => p.toString().padStart(2)).join(', ')}]`);
  });
  
  console.log('\nRange-to-range similarity:');
  const ranges = Object.keys(results);
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const r1 = ranges[i], r2 = ranges[j];
      const set1 = new Set(results[r1]);
      const set2 = new Set(results[r2]);
      const common = [...set1].filter(n => set2.has(n));
      const similarity = (common.length / 6) * 100;
      
      console.log(`Range ${r1}-${r2}: ${similarity.toFixed(1)}% similar (${common.length}/6)`);
    }
  }
  
  const allPreds = Object.values(results).flat();
  const unique = new Set(allPreds);
  const diversity = (unique.size / allPreds.length) * 100;
  
  console.log(`\n📈 Overall diversity: ${diversity.toFixed(1)}% (${unique.size}/${allPreds.length})`);
  
  if (diversity > 70) {
    console.log('✅ EXCELLENT: High diversity achieved!');
    return 'EXCELLENT';
  } else if (diversity > 50) {
    console.log('✅ GOOD: Substantial improvement');
    return 'GOOD';
  } else if (diversity > 30) {
    console.log('⚠️  FAIR: Some improvement');
    return 'FAIR';
  } else {
    console.log('❌ POOR: Still needs work');
    return 'POOR';
  }
}

// Run the test
console.log('🚀 Testing range-differentiated algorithm...\n');

const testResults = testRangeDifferentiation();
const performance = analyzeDiversity(testResults);

console.log('\n🏆 FINAL ASSESSMENT:');
console.log('='.repeat(40));
console.log(`Performance: ${performance}`);
console.log(`Status: ${performance === 'EXCELLENT' || performance === 'GOOD' ? 'READY ✅' : 'NEEDS WORK ⚠️'}`);

if (performance === 'EXCELLENT' || performance === 'GOOD') {
  console.log('\n✅ The algorithm now produces truly different results for different ranges!');
  console.log('✅ Users should see clear variation when changing the draw range setting.');
} else {
  console.log('\n⚠️  Algorithm still needs refinement for better range differentiation.');
}