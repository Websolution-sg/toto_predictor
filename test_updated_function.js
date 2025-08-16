// Test the updated parsing function
const { fetchLatestTotoResult } = require('./updateTotoCSV.cjs');

async function testUpdatedFunction() {
    console.log('🧪 Testing updated TOTO parsing function...\n');
    
    try {
        const result = await fetchLatestTotoResult();
        
        console.log('\n📋 RESULT:');
        console.log('==========');
        
        if (result && result.length >= 6) {
            console.log(`✅ Successfully fetched: [${result.join(', ')}]`);
            console.log(`🎯 Main numbers: ${result.slice(0, 6).join(', ')}`);
            if (result[6]) {
                console.log(`➕ Additional number: ${result[6]}`);
            }
            
            // Expected based on website: 22, 25, 29, 31, 34, 43, 11
            const expected = [22, 25, 29, 31, 34, 43, 11];
            console.log(`🎯 Expected: ${expected.slice(0, 6).join(', ')} + ${expected[6]}`);
            
            const mainMatch = result.slice(0, 6).every((num, i) => num === expected[i]);
            const additionalMatch = result[6] === expected[6];
            
            console.log(`\n✅ Main numbers match: ${mainMatch ? 'YES' : 'NO'}`);
            console.log(`✅ Additional number match: ${additionalMatch ? 'YES' : 'NO'}`);
            console.log(`🎯 Overall match: ${mainMatch && additionalMatch ? 'PERFECT ✅' : 'NEEDS FIXING ❌'}`);
            
        } else {
            console.log('❌ No valid result returned');
            console.log('Result:', result);
        }
        
    } catch (error) {
        console.error('💥 Error testing function:', error.message);
        console.error('Stack:', error.stack);
    }
}

testUpdatedFunction();
