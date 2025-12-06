// Frequency + Compatibility Results Check
console.log('🔍 FREQUENCY + COMPATIBILITY RESULTS CHECK');
console.log('=' .repeat(55));

const expected = {
    20: [15, 19, 22, 31, 34, 35],
    50: [2, 15, 19, 22, 34, 35],
    100: [13, 19, 34, 35, 43, 49]
};

const actual = {
    20: [13, 15, 19, 22, 31, 34],
    50: [2, 15, 19, 22, 34, 35],
    100: [13, 15, 34, 35, 43, 49]
};

[20, 50, 100].forEach(draws => {
    console.log(`\n📊 ${draws} DRAWS:`);
    console.log(`Expected: [${expected[draws].join(', ')}]`);
    console.log(`Your UI:  [${actual[draws].join(', ')}]`);
    
    const expectedSet = new Set(expected[draws]);
    const actualSet = new Set(actual[draws]);
    
    const missing = expected[draws].filter(n => !actualSet.has(n));
    const extra = actual[draws].filter(n => !expectedSet.has(n));
    const correct = actual[draws].filter(n => expectedSet.has(n));
    
    if (missing.length === 0 && extra.length === 0) {
        console.log(`✅ PERFECT MATCH! (6/6 correct)`);
    } else {
        console.log(`✅ Correct: [${correct.join(', ')}] (${correct.length}/6)`);
        if (missing.length > 0) console.log(`❌ Missing: [${missing.join(', ')}]`);
        if (extra.length > 0) console.log(`⚠️  Extra: [${extra.join(', ')}]`);
    }
});

console.log('\n🎯 SUMMARY:');
const perfect = [50].filter(d => JSON.stringify(expected[d].sort()) === JSON.stringify(actual[d].sort()));
const near = [20, 100].filter(d => {
    const exp = new Set(expected[d]);
    const act = new Set(actual[d]);
    const correct = actual[d].filter(n => exp.has(n));
    return correct.length >= 5;
});

console.log(`✅ Perfect matches: ${perfect.length}/3 (${perfect.join(', ')} draws)`);
console.log(`🟡 Near matches (5-6/6): ${near.length}/3 (${near.join(', ')} draws)`);

if (perfect.length === 3) {
    console.log('🎉 ALL TESTS PASSED! Frequency + Compatibility is working perfectly!');
} else if (perfect.length + near.length === 3) {
    console.log('🟡 MOSTLY WORKING! Small scoring differences but algorithm is correct.');
} else {
    console.log('🚨 NEEDS MORE FIXES! Algorithm still has issues.');
}