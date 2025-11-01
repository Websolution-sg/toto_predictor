// Enhanced Ensemble Validation for Different Draw Ranges
// This script validates that Enhanced Ensemble produces different results for ranges 20, 50, 100

console.log('🎯 ENHANCED ENSEMBLE RANGE VALIDATION');
console.log('=' .repeat(50));

console.log('\n📋 VALIDATION INSTRUCTIONS:');
console.log('1. Open index.html in your browser');
console.log('2. Open Developer Console (F12)');
console.log('3. Copy and paste the commands below one by one');
console.log('4. Compare the results to verify differentiation');

console.log('\n🧪 TEST 1: Enhanced Ensemble with Range 20');
console.log('=' .repeat(45));
console.log('Copy and paste these commands:');
console.log('');
console.log('document.getElementById("predictionMethod").value = "enhanced";');
console.log('document.getElementById("drawRange").value = 20;');
console.log('console.log("\\n=== RANGE 20 TEST ===");');
console.log('console.log("Method:", document.getElementById("predictionMethod").value);');
console.log('console.log("Range:", document.getElementById("drawRange").value);');
console.log('predict();');
console.log('console.log("Range 20 result displayed above");');

console.log('\n🧪 TEST 2: Enhanced Ensemble with Range 50');
console.log('=' .repeat(45));
console.log('Copy and paste these commands:');
console.log('');
console.log('document.getElementById("predictionMethod").value = "enhanced";');
console.log('document.getElementById("drawRange").value = 50;');
console.log('console.log("\\n=== RANGE 50 TEST ===");');
console.log('console.log("Method:", document.getElementById("predictionMethod").value);');
console.log('console.log("Range:", document.getElementById("drawRange").value);');
console.log('predict();');
console.log('console.log("Range 50 result displayed above");');

console.log('\n🧪 TEST 3: Enhanced Ensemble with Range 100');
console.log('=' .repeat(45));
console.log('Copy and paste these commands:');
console.log('');
console.log('document.getElementById("predictionMethod").value = "enhanced";');
console.log('document.getElementById("drawRange").value = 100;');
console.log('console.log("\\n=== RANGE 100 TEST ===");');
console.log('console.log("Method:", document.getElementById("predictionMethod").value);');
console.log('console.log("Range:", document.getElementById("drawRange").value);');
console.log('predict();');
console.log('console.log("Range 100 result displayed above");');

console.log('\n🔍 DETAILED ANALYSIS COMMANDS:');
console.log('=' .repeat(35));
console.log('Run these to see internal algorithm differences:');
console.log('');
console.log('// Function to manually test Enhanced Ensemble internals');
console.log('function testEnhancedEnsembleRange(range) {');
console.log('  console.log(`\\n--- Enhanced Ensemble Range ${range} Analysis ---`);');
console.log('  const slicedData = historical.slice(0, range);');
console.log('  console.log(`Data entries used: ${slicedData.length}`);');
console.log('  ');
console.log('  // Calculate frequency like the algorithm does');
console.log('  const freq = Array(50).fill(0);');
console.log('  slicedData.forEach(draw => {');
console.log('    draw.numbers.forEach(n => freq[n]++);');
console.log('  });');
console.log('  ');
console.log('  // Get top candidates');
console.log('  const candidates = freq');
console.log('    .map((count, num) => ({num, count}))');
console.log('    .filter(item => item.num >= 1 && item.num <= 49 && item.count > 0)');
console.log('    .sort((a, b) => b.count - a.count);');
console.log('  ');
console.log('  console.log(`Total candidates: ${candidates.length}`);');
console.log('  console.log("Top 10:", candidates.slice(0, 10).map(c => `${c.num}(${c.count})`).join(", "));');
console.log('  ');
console.log('  // Calculate tiers like Enhanced Ensemble');
console.log('  const tier1Count = Math.max(1, Math.floor(candidates.length * 0.15));');
console.log('  const tier2Count = Math.max(1, Math.floor(candidates.length * 0.35));');
console.log('  const tier3Count = Math.max(1, Math.floor(candidates.length * 0.30));');
console.log('  ');
console.log('  console.log(`Tier sizes - T1: ${tier1Count}, T2: ${tier2Count}, T3: ${tier3Count}`);');
console.log('  ');
console.log('  const tier1 = candidates.slice(0, tier1Count);');
console.log('  const tier2 = candidates.slice(tier1Count, tier1Count + tier2Count);');
console.log('  ');
console.log('  console.log("Tier 1:", tier1.map(c => `${c.num}(${c.count})`).join(", "));');
console.log('  console.log("Tier 2:", tier2.map(c => `${c.num}(${c.count})`).join(", "));');
console.log('  ');
console.log('  return {candidates, tier1, tier2, totalEntries: slicedData.length};');
console.log('}');

console.log('\n// Run the internal analysis for all three ranges');
console.log('const result20 = testEnhancedEnsembleRange(20);');
console.log('const result50 = testEnhancedEnsembleRange(50);');
console.log('const result100 = testEnhancedEnsembleRange(100);');

console.log('\n// Compare results');
console.log('console.log("\\n=== COMPARISON SUMMARY ===");');
console.log('console.log("Range 20 - Data entries:", result20.totalEntries, "Candidates:", result20.candidates.length);');
console.log('console.log("Range 50 - Data entries:", result50.totalEntries, "Candidates:", result50.candidates.length);');
console.log('console.log("Range 100 - Data entries:", result100.totalEntries, "Candidates:", result100.candidates.length);');
console.log('console.log("\\nTier 1 Differences:");');
console.log('console.log("Range 20 vs 50 different?", JSON.stringify(result20.tier1) !== JSON.stringify(result50.tier1));');
console.log('console.log("Range 50 vs 100 different?", JSON.stringify(result50.tier1) !== JSON.stringify(result100.tier1));');
console.log('console.log("Range 20 vs 100 different?", JSON.stringify(result20.tier1) !== JSON.stringify(result100.tier1));');

console.log('\n✅ SUCCESS CRITERIA:');
console.log('=' .repeat(25));
console.log('✓ Each range should produce different numbers in the prediction result');
console.log('✓ Range 20 should use 20 data entries');
console.log('✓ Range 50 should use 50 data entries');
console.log('✓ Range 100 should use 100+ data entries (limited by available data)');
console.log('✓ Tier 1 candidates should be different for each range');
console.log('✓ Final predicted numbers should be different for each range');

console.log('\n❌ FAILURE INDICATORS:');
console.log('=' .repeat(30));
console.log('• All three ranges produce identical numbers');
console.log('• Data entries count is the same for all ranges');
console.log('• Tier 1 candidates are identical across ranges');
console.log('• JavaScript errors in console');
console.log('• No prediction results displayed');

console.log('\n🎯 EXPECTED BEHAVIOR:');
console.log('=' .repeat(25));
console.log('Range 20  → Uses recent 20 draws → Focused on very recent patterns');
console.log('Range 50  → Uses recent 50 draws → Balanced recent + medium-term patterns');
console.log('Range 100 → Uses recent 100+ draws → Comprehensive historical analysis');
console.log('');
console.log('Each should produce DIFFERENT prediction numbers due to:');
console.log('• Different frequency distributions');
console.log('• Different tier compositions');
console.log('• Different candidate pools');

console.log('\n🚀 START VALIDATION:');
console.log('Open index.html and run the tests above in sequence!');