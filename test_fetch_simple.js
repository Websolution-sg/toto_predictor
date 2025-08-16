// Simple test to see what we're actually getting
const { fetchLatestTotoResult } = require('./updateTotoCSV.cjs');

async function testFetch() {
    console.log('Testing TOTO fetch...');
    
    try {
        const result = await fetchLatestTotoResult();
        console.log('✅ Result from fetchLatestTotoResult:', result);
        
        if (result && result.length >= 6) {
            console.log(`🎯 Numbers: ${result.slice(0, 6).join(', ')}`);
            if (result[6]) {
                console.log(`➕ Additional: ${result[6]}`);
            }
        } else {
            console.log('❌ No valid result returned');
        }
        
        // Expected from website: 22, 25, 29, 31, 34, 43 + 11
        const expected = [22, 25, 29, 31, 34, 43, 11];
        console.log(`🎯 Expected: ${expected.slice(0, 6).join(', ')} + ${expected[6]}`);
        
        if (result && result.length >= 6) {
            const matches = result.slice(0, 6).every((num, i) => num === expected[i]);
            console.log(`✅ Match with expected: ${matches ? 'YES' : 'NO'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFetch();
