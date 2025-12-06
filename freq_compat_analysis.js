// Frequency + Compatibility Mismatch Analysis
console.log('🔍 FREQUENCY + COMPATIBILITY MISMATCH ANALYSIS');
console.log('=' .repeat(60));

const expected = {
    20: [15, 19, 22, 31, 34, 35],
    50: [2, 15, 19, 22, 34, 35],
    100: [13, 19, 34, 35, 43, 49]
};

const actual = {
    20: [19, 24, 31, 34, 36, 43],
    50: [3, 8, 19, 31, 34, 35],
    100: [18, 19, 24, 31, 34, 35]
};

[20, 50, 100].forEach(draws => {
    console.log(`\n📊 ${draws} DRAWS COMPARISON:`);
    console.log(`Expected: [${expected[draws].join(', ')}]`);
    console.log(`Your UI:  [${actual[draws].join(', ')}]`);
    
    const expectedSet = new Set(expected[draws]);
    const actualSet = new Set(actual[draws]);
    
    const missing = expected[draws].filter(n => !actualSet.has(n));
    const extra = actual[draws].filter(n => !expectedSet.has(n));
    const correct = actual[draws].filter(n => expectedSet.has(n));
    
    console.log(`✅ Correct: [${correct.join(', ')}] (${correct.length}/6)`);
    if (missing.length > 0) console.log(`❌ Missing: [${missing.join(', ')}]`);
    if (extra.length > 0) console.log(`⚠️  Extra: [${extra.join(', ')}]`);
});

console.log('\n🚨 DIAGNOSIS:');
console.log('Your Frequency + Compatibility algorithm has bugs in:');
console.log('• Frequency counting logic');
console.log('• Compatibility calculation with base numbers [16,22,10]');
console.log('• Score calculation (Frequency + Compatibility)');
console.log('• Top 6 selection/sorting');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Check browser console (F12) for JavaScript errors');
console.log('2. Verify the Frequency + Compatibility function in index.html');
console.log('3. Check if it\'s using the correct base numbers [16,22,10]');
console.log('4. Verify frequency counting is working properly');
console.log('5. Check compatibility calculation logic');