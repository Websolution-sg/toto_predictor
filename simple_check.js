// SUPER SIMPLE UI CHECKER
console.log('🎯 SIMPLE UI CHECKER - Just copy your UI numbers here!');
console.log('='.repeat(60));

function quickCheck(uiNumbers) {
    // Expected results for most common settings
    const expected = {
        'Enhanced Ensemble 50': [2, 10, 16, 19, 22, 34],
        'Enhanced Ensemble 20': [10, 16, 19, 22, 31, 34],
        'Enhanced Ensemble 100': [10, 16, 19, 22, 34, 49],
        'Frequency+Compatibility 50': [2, 15, 19, 22, 34, 35],
        'Hot/Cold 50': [2, 15, 19, 22, 34, 35],
        'Weighted 50': [2, 15, 19, 22, 34, 35]
    };
    
    console.log(`Your UI numbers: [${uiNumbers.join(', ')}]`);
    console.log('');
    
    let found = false;
    for (let [method, expectedNums] of Object.entries(expected)) {
        if (JSON.stringify(uiNumbers.sort()) === JSON.stringify(expectedNums.sort())) {
            console.log(`✅ MATCH! Your UI is correct for: ${method}`);
            found = true;
        }
    }
    
    if (!found) {
        console.log('❌ No match found. Here are the expected results:');
        console.log('');
        for (let [method, expectedNums] of Object.entries(expected)) {
            console.log(`${method}: [${expectedNums.join(', ')}]`);
        }
    }
}

// INSTRUCTIONS:
console.log('📋 SUPER SIMPLE STEPS:');
console.log('1. Go to your website');
console.log('2. Pick any method + draw range');
console.log('3. Click Predict');
console.log('4. Copy the 6 numbers');
console.log('5. Replace the numbers below and run this:');
console.log('');
console.log('quickCheck([1,2,3,4,5,6]); // Replace with your numbers');
console.log('');

// Example test
console.log('🧪 EXAMPLE:');
quickCheck([2, 10, 16, 19, 22, 34]); // Should match Enhanced Ensemble 50

// Make function available globally
global.quickCheck = quickCheck;