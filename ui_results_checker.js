// Quick UI Results Checker
console.log('🎯 UI RESULTS CHECKER');
console.log('=' .repeat(40));

// Expected results from validation tool
const expectedResults = {
    'Enhanced Ensemble': {
        20: [10, 16, 19, 22, 31, 34],
        50: [2, 10, 16, 19, 22, 34],
        100: [10, 16, 19, 22, 34, 49]
    },
    'Frequency + Compatibility': {
        20: [15, 19, 22, 31, 34, 35],
        50: [2, 15, 19, 22, 34, 35],
        100: [2, 15, 19, 22, 34, 49]
    },
    'Hot/Cold Analysis': {
        20: [4, 15, 19, 31, 34, 35],
        50: [2, 15, 19, 22, 34, 35],
        100: [2, 15, 19, 22, 34, 49]
    },
    'Weighted Recent Analysis': {
        20: [15, 19, 22, 31, 34, 35],
        50: [2, 15, 19, 22, 34, 35],
        100: [2, 15, 19, 22, 34, 49]
    }
};

function checkUIResult(method, drawRange, uiResult) {
    console.log(`\n🔍 Checking: ${method} (${drawRange} draws)`);
    console.log('=' .repeat(50));
    
    const expected = expectedResults[method] && expectedResults[method][drawRange];
    
    if (!expected) {
        console.log(`❌ No expected result for ${method} with ${drawRange} draws`);
        return false;
    }
    
    console.log(`Expected: [${expected.join(', ')}]`);
    console.log(`UI Result: [${uiResult.join(', ')}]`);
    
    const match = JSON.stringify(expected.sort()) === JSON.stringify(uiResult.sort());
    
    if (match) {
        console.log(`✅ PERFECT MATCH! Your UI is working correctly.`);
        return true;
    } else {
        console.log(`❌ MISMATCH DETECTED`);
        
        // Detailed comparison
        const expectedSet = new Set(expected);
        const uiSet = new Set(uiResult);
        
        const missing = expected.filter(n => !uiSet.has(n));
        const extra = uiResult.filter(n => !expectedSet.has(n));
        
        if (missing.length > 0) {
            console.log(`   Missing numbers: [${missing.join(', ')}]`);
        }
        if (extra.length > 0) {
            console.log(`   Extra numbers: [${extra.join(', ')}]`);
        }
        
        return false;
    }
}

function analyzePattern(method, drawRange, uiResult) {
    console.log(`\n🔍 Pattern Analysis for ${method} (${drawRange} draws)`);
    
    const expected = expectedResults[method] && expectedResults[method][drawRange];
    if (!expected) return;
    
    // Check if base numbers are present (for Enhanced Ensemble)
    if (method === 'Enhanced Ensemble') {
        const bases = [16, 22, 10];
        const basesInResult = bases.filter(b => uiResult.includes(b));
        console.log(`   Base numbers [16,22,10] in result: [${basesInResult.join(', ')}] (${basesInResult.length}/3)`);
        
        if (basesInResult.length !== 3) {
            console.log(`   ⚠️ Missing base numbers - check Enhanced Ensemble logic`);
        }
    }
    
    // Check range validity
    const invalidNumbers = uiResult.filter(n => n < 1 || n > 49);
    if (invalidNumbers.length > 0) {
        console.log(`   ❌ Invalid numbers (outside 1-49): [${invalidNumbers.join(', ')}]`);
    }
    
    // Check duplicates
    const unique = [...new Set(uiResult)];
    if (unique.length !== uiResult.length) {
        console.log(`   ❌ Duplicate numbers detected`);
    }
    
    // Check length
    if (uiResult.length !== 6) {
        console.log(`   ❌ Wrong length: ${uiResult.length} numbers (should be 6)`);
    }
}

// Instructions for use
console.log(`\n📋 HOW TO USE THIS CHECKER:`);
console.log(`1. Open your TOTO predictor in browser`);
console.log(`2. Set prediction method and draw range`);
console.log(`3. Click Predict to get UI result`);
console.log(`4. Copy the 6 numbers from UI`);
console.log(`5. Run this check function:`);
console.log(`\n   checkUIResult('Enhanced Ensemble', 50, [2,10,16,19,22,34]);`);
console.log(`   checkUIResult('Frequency + Compatibility', 50, [your,ui,numbers,here]);`);

console.log(`\n🎯 MOST COMMON TEST CASES:`);
console.log(`Enhanced Ensemble + 50 draws should give: [2, 10, 16, 19, 22, 34]`);
console.log(`Frequency+Compatibility + 50 draws should give: [2, 15, 19, 22, 34, 35]`);

console.log(`\n🚨 COMMON ISSUES & FIXES:`);
console.log(`• Different numbers → Check dropdowns, CSV loading, browser console errors`);
console.log(`• Wrong length → Check prediction logic, number filtering`);
console.log(`• Missing base numbers [16,22,10] → Check Enhanced Ensemble implementation`);
console.log(`• Invalid numbers → Check number range validation (1-49)`);

// Export functions for manual use
global.checkUIResult = checkUIResult;
global.analyzePattern = analyzePattern;
global.expectedResults = expectedResults;

console.log(`\n✅ Checker ready! Use checkUIResult() to test your UI results.`);

// Example test calls
console.log(`\n🧪 EXAMPLE TEST CALLS:`);
console.log(`\n// Test Enhanced Ensemble with 50 draws`);
console.log(`checkUIResult('Enhanced Ensemble', 50, [2,10,16,19,22,34]);`);

console.log(`\n// Test if you get different result`);
console.log(`checkUIResult('Enhanced Ensemble', 50, [1,2,3,4,5,6]); // This should show mismatch`);

// Run example tests
console.log(`\n🧪 RUNNING EXAMPLE TESTS:`);
checkUIResult('Enhanced Ensemble', 50, [2,10,16,19,22,34]); // Should match
checkUIResult('Enhanced Ensemble', 50, [1,2,3,4,5,6]); // Should not match