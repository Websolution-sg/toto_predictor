console.log('🧪 QUICK RANGE-SENSITIVE TEST');
console.log('='.repeat(40));

// Simulate the improved algorithm logic
function testRangeSensitiveAlgorithm() {
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
    ...Array(40).fill().map((_, i) => ({
      numbers: Array(6).fill().map(() => Math.floor(Math.random()*49)+1),
      additional: Math.floor(Math.random()*49)+1
    }))
  ];
  
  const bases = [1,2,3,4,5,6];
  const testRanges = [5, 10, 20, 50];
  
  testRanges.forEach(range => {
    console.log(`\n📊 Testing Range: ${range}`);
    
    const draws = mockData.slice(0, range);
    const weighted = Array(50).fill(0);
    const compat = Array(50).fill(0);
    const recency = Array(50).fill(0);
    
    draws.forEach((draw, index) => {
      // Multi-tier weighting (matching new HTML logic)
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
      
      const pool = [...draw.numbers, draw.additional];
      
      pool.forEach(n => {
        if (n >= 1 && n <= 49) {
          weighted[n] += finalWeight;
          recency[n] += (1.0 / (index + 1)) * (range / 50);
        }
      });
      
      bases.forEach(b => {
        if (pool.includes(b)) {
          pool.filter(n => n !== b && n >= 1 && n <= 49).forEach(n => {
            compat[n] += finalWeight * 0.8;
          });
        }
      });
    });
    
    // Dynamic scoring
    const suggestions = weighted.map((weight, n) => {
      let dynamicScore = weight + compat[n] + recency[n];
      
      if (range <= 10) {
        dynamicScore += weight * 0.5;
      } else if (range <= 30) {
        dynamicScore += compat[n] * 0.3;
      } else {
        dynamicScore += (weight * 0.2) + (recency[n] * 0.4);
      }
      
      return { n, dynamicScore };
    })
    .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
    .sort((a, b) => b.dynamicScore - a.dynamicScore)
    .slice(0, 6);
    
    const predictions = suggestions.map(s => s.n);
    console.log(`   Predictions: [${predictions.join(', ')}]`);
    console.log(`   Scores: [${suggestions.map(s => s.dynamicScore.toFixed(2)).join(', ')}]`);
  });
  
  console.log('\n✅ Test Complete - Check if predictions vary by range!');
}

testRangeSensitiveAlgorithm();