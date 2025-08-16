// Test dynamic TOTO parsing without hard-coded values
const { fetchLatestTotoResult } = require('./updateTotoCSV.cjs');

async function testDynamicParsing() {
    console.log('🧪 TESTING DYNAMIC TOTO PARSING');
    console.log('================================\n');
    
    console.log('✅ No hard-coded results - purely dynamic extraction');
    console.log('🌐 Fetching from Singapore Pools website...\n');
    
    try {
        const startTime = Date.now();
        const result = await fetchLatestTotoResult();
        const endTime = Date.now();
        
        console.log(`⏱️  Fetch completed in ${endTime - startTime}ms\n`);
        
        if (result && result.length >= 6) {
            console.log('🎯 DYNAMIC PARSING RESULT:');
            console.log('==========================');
            console.log(`📊 Main numbers: ${result.slice(0, 6).join(', ')}`);
            
            if (result.length === 7) {
                console.log(`➕ Additional number: ${result[6]}`);
            }
            
            console.log(`📋 Full result: [${result.join(', ')}]`);
            
            // Validate the result makes sense
            const validations = validateTotoResult(result);
            console.log('\n🔍 VALIDATION CHECKS:');
            console.log('====================');
            
            validations.forEach(check => {
                console.log(`${check.passed ? '✅' : '❌'} ${check.description}: ${check.result}`);
            });
            
            const allPassed = validations.every(check => check.passed);
            console.log(`\n🎯 Overall validation: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
            
            if (allPassed) {
                console.log('\n🚀 SUCCESS: Dynamic parsing extracted valid TOTO result!');
                return result;
            } else {
                console.log('\n⚠️  WARNING: Result may not be accurate - check parsing logic');
                return null;
            }
            
        } else {
            console.log('❌ FAILED: No valid result returned from dynamic parsing');
            console.log(`   Result: ${result}`);
            return null;
        }
        
    } catch (error) {
        console.error('💥 ERROR during dynamic parsing:', error.message);
        return null;
    }
}

function validateTotoResult(result) {
    const validations = [];
    
    // Check number count
    validations.push({
        description: 'Number count (6 or 7)',
        passed: result.length >= 6 && result.length <= 7,
        result: `${result.length} numbers`
    });
    
    // Check number range
    const invalidNumbers = result.filter(n => n < 1 || n > 49);
    validations.push({
        description: 'All numbers in range 1-49',
        passed: invalidNumbers.length === 0,
        result: invalidNumbers.length === 0 ? 'All valid' : `Invalid: ${invalidNumbers.join(', ')}`
    });
    
    // Check for duplicates in main numbers
    const mainNumbers = result.slice(0, 6);
    const uniqueMain = [...new Set(mainNumbers)];
    validations.push({
        description: 'No duplicates in main numbers',
        passed: uniqueMain.length === 6,
        result: uniqueMain.length === 6 ? 'All unique' : `${6 - uniqueMain.length} duplicates`
    });
    
    // Check reasonable spread
    const sorted = [...mainNumbers].sort((a, b) => a - b);
    const range = sorted[5] - sorted[0];
    validations.push({
        description: 'Reasonable number spread',
        passed: range >= 15 && range <= 48,
        result: `Range: ${range} (${sorted[0]}-${sorted[5]})`
    });
    
    // Check distribution (mix of low/high numbers)
    const lowCount = mainNumbers.filter(n => n <= 25).length;
    const highCount = mainNumbers.filter(n => n > 25).length;
    validations.push({
        description: 'Balanced low/high distribution',
        passed: lowCount >= 1 && highCount >= 1,
        result: `${lowCount} low, ${highCount} high`
    });
    
    // Check additional number (if present)
    if (result.length === 7) {
        const additionalValid = result[6] >= 1 && result[6] <= 49 && !mainNumbers.includes(result[6]);
        validations.push({
            description: 'Additional number valid and unique',
            passed: additionalValid,
            result: additionalValid ? 'Valid' : 'Invalid or duplicate'
        });
    }
    
    return validations;
}

// Run the test
testDynamicParsing().then(result => {
    console.log('\n🏁 DYNAMIC PARSING TEST COMPLETE');
    console.log('================================');
    
    if (result) {
        console.log(`✅ Successfully extracted: [${result.join(', ')}]`);
        console.log('🎯 Ready for production use with dynamic fetching!');
    } else {
        console.log('❌ Dynamic parsing needs refinement');
        console.log('🔧 Check website structure or parsing logic');
    }
}).catch(error => {
    console.error('💥 Test error:', error.message);
});
