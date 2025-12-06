// Hot/Cold Analysis Issue Analysis
console.log('🚨 HOT/COLD ANALYSIS ISSUE ANALYSIS');
console.log('=' .repeat(55));

const expected = {
    20: [13, 15, 19, 22, 31, 34],
    50: [2, 15, 19, 22, 34, 35],
    100: [13, 19, 34, 35, 43, 49]
};

const freqCompat = {
    20: [13, 15, 19, 22, 31, 34],
    50: [2, 15, 19, 22, 34, 35],
    100: [13, 15, 34, 35, 43, 49]
};

const hotCold = {
    20: [18, 25, 32, 34, 47, 49],
    50: [12, 13, 18, 24, 34, 36],
    100: [3, 8, 19, 24, 34, 35]
};

[20, 50, 100].forEach(draws => {
    console.log(`\n📊 ${draws} DRAWS COMPARISON:`);
    console.log(`Expected:     [${expected[draws].join(', ')}]`);
    console.log(`Freq+Compat:  [${freqCompat[draws].join(', ')}]`);
    console.log(`Hot/Cold UI:  [${hotCold[draws].join(', ')}]`);
    
    const expectedSet = new Set(expected[draws]);
    const hotColdSet = new Set(hotCold[draws]);
    const freqCompatSet = new Set(freqCompat[draws]);
    
    const matchesExpected = hotCold[draws].filter(n => expectedSet.has(n)).length;
    const matchesFreqCompat = hotCold[draws].filter(n => freqCompatSet.has(n)).length;
    
    console.log(`✅ Matches Expected: ${matchesExpected}/6`);
    console.log(`✅ Matches Freq+Compat: ${matchesFreqCompat}/6`);
    
    if (matchesExpected === 0 && matchesFreqCompat === 0) {
        console.log(`❌ COMPLETELY DIFFERENT - Hot/Cold algorithm is broken!`);
    } else if (matchesExpected < 3) {
        console.log(`🚨 MAJOR ISSUES - Hot/Cold using wrong algorithm`);
    }
});

console.log('\n🚨 DIAGNOSIS:');
console.log('❌ Hot/Cold Analysis is NOT using Frequency + Compatibility algorithm');
console.log('❌ Results are completely different from validation tool');
console.log('❌ Results don\'t match your working Frequency + Compatibility method');
console.log('');
console.log('🔧 ISSUE: Hot/Cold function is using a different/broken algorithm');
console.log('🔧 FIX NEEDED: Replace Hot/Cold function with correct Frequency + Compatibility logic');

console.log('\n💡 EXPECTED BEHAVIOR:');
console.log('• Hot/Cold should give IDENTICAL numbers to Frequency + Compatibility');
console.log('• Only difference should be temperature display (HOT/COLD/NEUTRAL)');
console.log('• Both methods use: Score = Frequency + Compatibility');
console.log('• Hot/Cold adds temperature indicators for analytics display only');