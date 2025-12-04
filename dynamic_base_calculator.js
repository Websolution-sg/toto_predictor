// Dynamic Base Numbers Calculator - For Future Refresh Strategy
// This script calculates optimal base numbers dynamically from current data

const fs = require('fs');

function calculateOptimalBaseNumbers() {
  console.log('🔄 DYNAMIC BASE NUMBERS CALCULATOR');
  console.log('=' * 45);
  
  try {
    // Load latest CSV data
    const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
    const historical = csvContent.trim().split('\n').map(line => {
      const [date, ...nums] = line.split(',');
      return {
        date,
        numbers: nums.slice(0, 6).map(n => parseInt(n)),
        additional: parseInt(nums[6])
      };
    });

    console.log(`📊 Analyzing ${historical.length} draws for optimal base numbers\n`);

    // 1. Overall frequency analysis
    const frequency = Array(50).fill(0);
    historical.forEach(draw => {
      draw.numbers.forEach(num => frequency[num]++);
    });

    // 2. Recent performance (last 30 draws)
    const recentFreq = Array(50).fill(0);
    historical.slice(0, 30).forEach(draw => {
      draw.numbers.forEach(num => recentFreq[num]++);
    });

    // 3. Stability score (consistent performance)
    const stabilityScore = Array(50).fill(0);
    for (let num = 1; num <= 49; num++) {
      const allTime = frequency[num] / historical.length;
      const recent = recentFreq[num] / 30;
      // Penalty for big differences between recent and all-time
      stabilityScore[num] = allTime * (1 - Math.abs(allTime - recent));
    }

    // 4. Create comprehensive ranking
    const ranking = [];
    for (let num = 1; num <= 49; num++) {
      const freq = frequency[num];
      const recentCount = recentFreq[num];
      const stability = stabilityScore[num];
      
      // Composite score: 50% frequency + 30% recent + 20% stability
      const compositeScore = (freq * 0.5) + (recentCount * 0.3) + (stability * 100 * 0.2);
      
      ranking.push({
        num,
        freq,
        recentCount,
        stability: stability.toFixed(4),
        compositeScore: compositeScore.toFixed(2),
        allTimeRank: 0,
        recentRank: 0
      });
    }

    // Sort by composite score
    ranking.sort((a, b) => b.compositeScore - a.compositeScore);

    // Add ranking positions
    ranking.forEach((item, index) => {
      item.compositeRank = index + 1;
    });

    // Sort by frequency for all-time ranking
    const freqRanking = [...ranking].sort((a, b) => b.freq - a.freq);
    freqRanking.forEach((item, index) => {
      const original = ranking.find(r => r.num === item.num);
      original.allTimeRank = index + 1;
    });

    // Sort by recent for recent ranking
    const recentRanking = [...ranking].sort((a, b) => b.recentCount - a.recentCount);
    recentRanking.forEach((item, index) => {
      const original = ranking.find(r => r.num === item.num);
      original.recentRank = index + 1;
    });

    console.log('🏆 TOP 10 OPTIMAL BASE NUMBER CANDIDATES:');
    console.log('=' * 50);
    console.log('Rank | Num | Composite | All-Time | Recent | Stability');
    console.log('-' * 50);
    
    ranking.slice(0, 10).forEach((item, i) => {
      const current = (item.num === 16 || item.num === 22) ? ' ⭐' : '';
      console.log(`${(i+1).toString().padStart(4)} | ${item.num.toString().padStart(3)} | ${item.compositeScore.padEnd(9)} | ${item.allTimeRank.toString().padStart(8)} | ${item.recentRank.toString().padStart(6)} | ${item.stability}${current}`);
    });

    // Get current base positions
    const pos16 = ranking.findIndex(item => item.num === 16) + 1;
    const pos22 = ranking.findIndex(item => item.num === 22) + 1;

    console.log('\n🎯 CURRENT BASE NUMBERS ANALYSIS:');
    console.log('=' * 40);
    console.log(`16: Composite Rank #${pos16}`);
    console.log(`22: Composite Rank #${pos22}`);

    // Recommendation logic
    const topTwo = ranking.slice(0, 2);
    const currentBases = [16, 22];
    
    console.log('\n🤖 DYNAMIC RECOMMENDATION:');
    console.log('=' * 30);
    
    if (pos16 <= 5 && pos22 <= 5) {
      console.log('✅ KEEP CURRENT: [16, 22] still optimal');
      console.log('   Both bases rank in top 5 composite scores');
      return { recommendation: 'KEEP', bases: [16, 22], reason: 'Still optimal' };
    } else if (pos16 <= 10 && pos22 <= 10) {
      console.log('⚠️  MONITOR: [16, 22] acceptable but watch');
      console.log('   Both bases rank in top 10 but declining');
      return { recommendation: 'MONITOR', bases: [16, 22], reason: 'Acceptable performance' };
    } else {
      console.log('🔄 UPDATE RECOMMENDED: New optimal pair found');
      console.log(`   New optimal: [${topTwo[0].num}, ${topTwo[1].num}]`);
      console.log(`   Composite scores: ${topTwo[0].compositeScore}, ${topTwo[1].compositeScore}`);
      return { 
        recommendation: 'UPDATE', 
        bases: [topTwo[0].num, topTwo[1].num], 
        reason: `Better composite scores`,
        oldRanks: [pos16, pos22]
      };
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return { recommendation: 'ERROR', bases: [16, 22], reason: error.message };
  }
}

// Function to update files with new base numbers (if needed)
function updateBaseNumbers(newBases) {
  console.log('\n🔧 UPDATING BASE NUMBERS IN FILES:');
  console.log('=' * 40);
  
  const filesToUpdate = [
    'next_draw_10_predictions.js',
    'prediction_performance_analysis.js'
    // Note: index.html would need separate handling due to HTML context
  ];
  
  console.log(`🎯 Would update [${newBases.join(', ')}] in:`);
  filesToUpdate.forEach(file => console.log(`   • ${file}`));
  
  console.log('\n⚠️  Manual update required for index.html');
  console.log('🔄 This would be automated in production version');
}

// Export for use in other scripts
if (require.main === module) {
  // Run as standalone script
  const result = calculateOptimalBaseNumbers();
  
  console.log('\n' + '=' * 60);
  console.log('📋 REFRESH STRATEGY SUMMARY');
  console.log('=' * 60);
  
  console.log(`Current Status: ${result.recommendation}`);
  console.log(`Recommended Bases: [${result.bases.join(', ')}]`);
  console.log(`Reason: ${result.reason}`);
  
  if (result.recommendation === 'UPDATE') {
    console.log('\n🔄 TO IMPLEMENT UPDATE:');
    console.log('1. Review new base numbers performance');
    console.log('2. Test with historical data');
    console.log('3. Update prediction files');
    console.log('4. Update website HTML');
    console.log('5. Document change reasoning');
    updateBaseNumbers(result.bases);
  }
  
  console.log('\n✅ Use this script monthly to check for optimal refresh timing');
} else {
  // Export for use in other modules
  module.exports = { calculateOptimalBaseNumbers, updateBaseNumbers };
}