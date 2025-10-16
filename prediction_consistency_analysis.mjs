import fs from 'fs';

console.log('🔍 PREDICTION CONSISTENCY ANALYSIS');
console.log('='.repeat(60));
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Read index.html to analyze prediction methods
function analyzeRandomnessInPredictions() {
  console.log('🎯 ANALYZING RANDOMNESS IN PREDICTION METHODS');
  console.log('-'.repeat(50));
  
  try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Find all instances of Math.random()
    const randomMatches = [...htmlContent.matchAll(/Math\.random\(\)/g)];
    console.log(`🎲 Found ${randomMatches.length} Math.random() calls`);
    
    // Find the context of each Math.random() call
    const lines = htmlContent.split('\n');
    const randomContexts = [];
    
    randomMatches.forEach((match, index) => {
      const position = match.index;
      const beforeText = htmlContent.substring(0, position);
      const lineNumber = beforeText.split('\n').length;
      const line = lines[lineNumber - 1];
      
      randomContexts.push({
        lineNumber,
        line: line.trim(),
        context: lines.slice(Math.max(0, lineNumber - 3), lineNumber + 2).join('\n')
      });
    });
    
    console.log('\n📋 RANDOMNESS SOURCES FOUND:');
    randomContexts.forEach((context, i) => {
      console.log(`\n${i + 1}. Line ${context.lineNumber}:`);
      console.log(`   Code: ${context.line}`);
      
      // Analyze if this is problematic
      if (context.line.includes('csvUrl') || context.line.includes('cache')) {
        console.log('   ✅ Cache busting - This is OK (not affecting predictions)');
      } else if (context.line.includes('available') && context.line.includes('filtered')) {
        console.log('   ❌ PREDICTION RANDOMNESS - This causes changing results!');
        console.log('   🔧 Problem: Random selection in pattern filtering');
      } else {
        console.log('   ⚠️ Unknown randomness source - needs investigation');
      }
    });
    
    return randomContexts;
    
  } catch (error) {
    console.log(`❌ Error reading index.html: ${error.message}`);
    return [];
  }
}

// Test prediction consistency
function simulatePredictionConsistency() {
  console.log('\n🧪 PREDICTION CONSISTENCY SIMULATION');
  console.log('-'.repeat(45));
  
  console.log('📋 To test consistency, we need to:');
  console.log('1. Use the same input parameters');
  console.log('2. Use the same historical data');
  console.log('3. Remove all randomness from algorithms');
  console.log('');
  
  console.log('🎯 Current Issues Identified:');
  console.log('• Pattern filtering uses Math.random() for number replacement');
  console.log('• This makes predictions non-deterministic');
  console.log('• Same inputs produce different outputs each time');
  
  console.log('\n💡 SOLUTIONS:');
  console.log('1. Replace random selection with deterministic methods');
  console.log('2. Use scoring/ranking instead of random choices');
  console.log('3. Make pattern adjustments based on rules, not randomness');
}

// Analyze prediction method structure
function analyzePredictionMethods() {
  console.log('\n🔧 PREDICTION METHODS ANALYSIS');
  console.log('-'.repeat(40));
  
  try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Find prediction method functions
    const methodPatterns = [
      /function\s+runEnhancedEnsemblePrediction/,
      /function\s+runFrequencyCompatibilityPrediction/,
      /function\s+runWeightedPrediction/,
      /function\s+runHotColdPrediction/,
      /function\s+applyPatternFilters/
    ];
    
    methodPatterns.forEach(pattern => {
      const match = htmlContent.match(pattern);
      if (match) {
        console.log(`✅ Found: ${match[0]}`);
      } else {
        console.log(`❌ Missing: ${pattern.source}`);
      }
    });
    
    // Check for deterministic vs random elements
    console.log('\n🎲 RANDOMNESS IN METHODS:');
    
    // Check applyPatternFilters function specifically
    const patternFilterMatch = htmlContent.match(/function applyPatternFilters[\s\S]*?(?=function|\z)/);
    if (patternFilterMatch) {
      const filterFunction = patternFilterMatch[0];
      const hasRandom = filterFunction.includes('Math.random()');
      console.log(`• applyPatternFilters: ${hasRandom ? '❌ Uses randomness' : '✅ Deterministic'}`);
      
      if (hasRandom) {
        console.log('  Problem: Random number replacement in pattern adjustments');
        console.log('  Impact: Same inputs give different prediction results');
      }
    }
    
  } catch (error) {
    console.log(`❌ Error analyzing methods: ${error.message}`);
  }
}

// Main analysis function
function runConsistencyAnalysis() {
  console.log('🚀 Starting prediction consistency analysis...\n');
  
  const randomSources = analyzeRandomnessInPredictions();
  simulatePredictionConsistency();
  analyzePredictionMethods();
  
  console.log('\n📊 ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  const problemCount = randomSources.filter(source => 
    !source.line.includes('csvUrl') && !source.line.includes('cache')
  ).length;
  
  if (problemCount > 0) {
    console.log('❌ PREDICTION INCONSISTENCY CONFIRMED');
    console.log(`   • Found ${problemCount} randomness source(s) in prediction logic`);
    console.log('   • This explains why results change every time');
    console.log('   • Main culprit: Random number replacement in pattern filtering');
  } else {
    console.log('✅ NO PREDICTION INCONSISTENCY DETECTED');
    console.log('   • All randomness appears to be for cache busting only');
  }
  
  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('1. Replace Math.random() in pattern filtering with deterministic selection');
  console.log('2. Use highest/lowest scoring numbers instead of random choices');
  console.log('3. Implement consistent ranking algorithms');
  console.log('4. Add seed-based randomness if randomness is truly needed');
  
  console.log('\n💡 IMMEDIATE ACTION:');
  console.log('• Modify applyPatternFilters() to use deterministic number selection');
  console.log('• Test predictions with same inputs to verify consistency');
  console.log('• Consider adding a "consistent mode" toggle for users');
  
  console.log('\n🎯 EXPECTED OUTCOME AFTER FIX:');
  console.log('• Same base numbers + same settings = Same predictions');
  console.log('• Predictions only change when data or settings change');
  console.log('• More reliable and trustworthy prediction system');
}

// Run the analysis
runConsistencyAnalysis();