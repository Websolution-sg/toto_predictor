// Enhanced Ensemble Simulation for Ranges 20, 50, 100
const fs = require('fs');
const path = require('path');

console.log('🎯 ENHANCED ENSEMBLE SIMULATION');
console.log('=' .repeat(50));

// Read and parse CSV data
function loadCsvData() {
  try {
    const csvPath = path.join(__dirname, 'totoResult.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    return lines.map(line => {
      const parts = line.split(',');
      const date = parts[0];
      const numbers = parts.slice(1, 7).map(n => parseInt(n));
      const additional = parseInt(parts[7]);
      return { date, numbers, additional };
    });
  } catch (error) {
    console.error('Error loading CSV:', error.message);
    return [];
  }
}

// Simulate Enhanced Ensemble algorithm
function simulateEnhancedEnsemble(historical, range) {
  console.log(`\n=== ENHANCED ENSEMBLE SIMULATION - RANGE ${range} ===`);
  
  const slicedData = historical.slice(0, range);
  console.log(`📊 Data entries used: ${slicedData.length} (out of ${historical.length} total)`);
  
  // Calculate frequency distribution
  const freq = Array(50).fill(0);
  slicedData.forEach(draw => {
    draw.numbers.forEach(n => freq[n]++);
  });
  
  // Get sorted candidates (like the real algorithm)
  const sortedCandidates = freq
    .map((count, num) => ({ num, count, score: count }))
    .filter(item => item.num >= 1 && item.num <= 49 && item.count > 0)
    .sort((a, b) => b.score - a.score);
  
  console.log(`🎲 Total candidates: ${sortedCandidates.length}`);
  console.log(`📈 Top 10 frequencies:`, sortedCandidates.slice(0, 10)
    .map(c => `${c.num}(${c.count})`).join(', '));
  
  // Calculate tiers (exact algorithm from index.html)
  const tier1Count = Math.max(1, Math.floor(sortedCandidates.length * 0.15)); // Top 15%
  const tier2Count = Math.max(1, Math.floor(sortedCandidates.length * 0.35)); // Next 35%
  const tier3Count = Math.max(1, Math.floor(sortedCandidates.length * 0.30)); // Next 30%
  
  const tier1 = sortedCandidates.slice(0, tier1Count);
  const tier2 = sortedCandidates.slice(tier1Count, tier1Count + tier2Count);
  const tier3 = sortedCandidates.slice(tier1Count + tier2Count, tier1Count + tier2Count + tier3Count);
  
  console.log(`🏆 Tier 1 (${tier1Count} numbers):`, tier1.map(c => `${c.num}(${c.count})`).join(', '));
  console.log(`🥈 Tier 2 (${tier2Count} numbers):`, tier2.map(c => `${c.num}(${c.count})`).join(', '));
  console.log(`🥉 Tier 3 (${tier3Count} numbers):`, tier3.map(c => `${c.num}(${c.count})`).join(', '));
  
  // Simulate ensemble selection (simplified version of the complex algorithm)
  const ensembleSelection = [];
  
  // Select from Tier 1 (guaranteed picks)
  const tier1Picks = Math.min(2, tier1.length);
  for (let i = 0; i < tier1Picks; i++) {
    ensembleSelection.push(tier1[i].num);
  }
  
  // Select from Tier 2 (balanced picks)
  const tier2Picks = Math.min(3, tier2.length);
  const tier2Start = Math.floor(tier2.length * 0.1); // Start offset like in real algorithm
  for (let i = 0; i < tier2Picks && (tier2Start + i) < tier2.length; i++) {
    ensembleSelection.push(tier2[tier2Start + i].num);
  }
  
  // Select from Tier 3 if needed
  while (ensembleSelection.length < 6 && tier3.length > 0) {
    const tier3Start = Math.floor(tier3.length * 0.1);
    const index = tier3Start + (ensembleSelection.length - tier1Picks - tier2Picks);
    if (index < tier3.length) {
      ensembleSelection.push(tier3[index].num);
    } else {
      break;
    }
  }
  
  // Fill remaining slots from any available candidates
  while (ensembleSelection.length < 6 && sortedCandidates.length > ensembleSelection.length) {
    const nextCandidate = sortedCandidates.find(c => !ensembleSelection.includes(c.num));
    if (nextCandidate) {
      ensembleSelection.push(nextCandidate.num);
    } else {
      break;
    }
  }
  
  const finalPrediction = ensembleSelection.slice(0, 6).sort((a, b) => a - b);
  console.log(`🎯 FINAL PREDICTION: [${finalPrediction.join(', ')}]`);
  
  return {
    range,
    dataEntries: slicedData.length,
    candidates: sortedCandidates.length,
    tier1,
    tier2,
    tier3,
    prediction: finalPrediction
  };
}

// Load data and run simulations
const historical = loadCsvData();

if (historical.length === 0) {
  console.log('❌ Could not load CSV data. Please ensure totoResult.csv exists.');
  process.exit(1);
}

console.log(`📁 Loaded ${historical.length} historical draws`);
console.log(`📅 Date range: ${historical[historical.length-1].date} to ${historical[0].date}`);

// Run Enhanced Ensemble for ranges 20, 50, 100
const result20 = simulateEnhancedEnsemble(historical, 20);
const result50 = simulateEnhancedEnsemble(historical, 50);
const result100 = simulateEnhancedEnsemble(historical, 100);

// Comparison analysis
console.log('\n' + '=' .repeat(60));
console.log('🔍 COMPREHENSIVE COMPARISON ANALYSIS');
console.log('=' .repeat(60));

console.log('\n📊 DATA UTILIZATION:');
console.log(`Range 20:  ${result20.dataEntries} draws, ${result20.candidates} candidates`);
console.log(`Range 50:  ${result50.dataEntries} draws, ${result50.candidates} candidates`);
console.log(`Range 100: ${result100.dataEntries} draws, ${result100.candidates} candidates`);

console.log('\n🎯 FINAL PREDICTIONS:');
console.log(`Range 20:  [${result20.prediction.join(', ')}]`);
console.log(`Range 50:  [${result50.prediction.join(', ')}]`);
console.log(`Range 100: [${result100.prediction.join(', ')}]`);

console.log('\n🔄 DIFFERENTIATION CHECK:');
const pred20vs50 = JSON.stringify(result20.prediction) !== JSON.stringify(result50.prediction);
const pred50vs100 = JSON.stringify(result50.prediction) !== JSON.stringify(result100.prediction);
const pred20vs100 = JSON.stringify(result20.prediction) !== JSON.stringify(result100.prediction);

console.log(`Range 20 vs 50 different?  ${pred20vs50 ? '✅ YES' : '❌ NO'}`);
console.log(`Range 50 vs 100 different? ${pred50vs100 ? '✅ YES' : '❌ NO'}`);
console.log(`Range 20 vs 100 different? ${pred20vs100 ? '✅ YES' : '❌ NO'}`);

console.log('\n🏆 TIER 1 COMPARISON:');
const tier1_20vs50 = JSON.stringify(result20.tier1.map(t=>t.num)) !== JSON.stringify(result50.tier1.map(t=>t.num));
const tier1_50vs100 = JSON.stringify(result50.tier1.map(t=>t.num)) !== JSON.stringify(result100.tier1.map(t=>t.num));
const tier1_20vs100 = JSON.stringify(result20.tier1.map(t=>t.num)) !== JSON.stringify(result100.tier1.map(t=>t.num));

console.log(`Tier 1 (20 vs 50):  ${tier1_20vs50 ? '✅ DIFFERENT' : '❌ SAME'}`);
console.log(`Tier 1 (50 vs 100): ${tier1_50vs100 ? '✅ DIFFERENT' : '❌ SAME'}`);
console.log(`Tier 1 (20 vs 100): ${tier1_20vs100 ? '✅ DIFFERENT' : '❌ SAME'}`);

if (pred20vs50 && pred50vs100 && pred20vs100) {
  console.log('\n🎉 VALIDATION SUCCESS!');
  console.log('✅ Enhanced Ensemble produces different results for different ranges');
  console.log('✅ Algorithm is working correctly with range differentiation');
} else {
  console.log('\n⚠️  VALIDATION CONCERN!');
  console.log('❌ Some ranges are producing identical results');
  console.log('This suggests the algorithm may not be fully range-sensitive');
}

console.log('\n📝 SUMMARY:');
console.log('The Enhanced Ensemble algorithm SHOULD produce different results');
console.log('for different draw ranges because:');
console.log('• Different data sets are analyzed (20 vs 50 vs 100 draws)');
console.log('• Different frequency distributions emerge');
console.log('• Different tier compositions are calculated');
console.log('• Different candidate pools are available');
console.log('\nIf your browser results are identical, check for:');
console.log('• Browser caching issues (hard refresh with Ctrl+F5)');
console.log('• JavaScript errors in console');
console.log('• Range value not updating properly');