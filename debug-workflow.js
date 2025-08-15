const fs = require('fs');
const https = require('https');

console.log('🔧 DEBUGGING TOTO WORKFLOW ISSUE');
console.log('=================================');
console.log('Date:', new Date().toISOString());
console.log('');

// Test what the current workflow would do
async function debugWorkflow() {
    console.log('📊 Current CSV Status:');
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    console.log(`Latest result: ${lines[0]}`);
    console.log(`Total entries: ${lines.length}`);
    console.log('');
    
    console.log('🌐 Testing Singapore Pools Legacy Page (Priority Source):');
    
    try {
        const url = 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx';
        console.log(`Fetching: ${url}`);
        
        const response = await httpsGet(url);
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📄 Content length: ${response.data.length} bytes`);
        
        // Look for the known working numbers
        const content = response.data;
        const has22 = content.includes('22');
        const has25 = content.includes('25');
        const has29 = content.includes('29');
        const has31 = content.includes('31');
        const has34 = content.includes('34');
        const has43 = content.includes('43');
        const has11 = content.includes('11');
        
        console.log('🔍 Number Detection:');
        console.log(`   22: ${has22 ? '✅' : '❌'}`);
        console.log(`   25: ${has25 ? '✅' : '❌'}`);
        console.log(`   29: ${has29 ? '✅' : '❌'}`);
        console.log(`   31: ${has31 ? '✅' : '❌'}`);
        console.log(`   34: ${has34 ? '✅' : '❌'}`);
        console.log(`   43: ${has43 ? '✅' : '❌'}`);
        console.log(`   11: ${has11 ? '✅' : '❌'}`);
        
        const foundCount = [has22, has25, has29, has31, has34, has43, has11].filter(Boolean).length;
        console.log(`📊 Found ${foundCount}/7 expected numbers in HTML`);
        
        // Look for patterns that might indicate TOTO results
        const numberPattern = /\b(?:[1-9]|[1-4][0-9])\b/g;
        const numbers = [...content.matchAll(numberPattern)]
            .map(match => parseInt(match[0]))
            .filter(n => n >= 1 && n <= 49);
        
        console.log(`🎯 Total valid TOTO numbers (1-49) found: ${numbers.length}`);
        
        // Look for the exact sequence
        const targetSequence = [22, 25, 29, 31, 34, 43, 11];
        let sequenceFound = false;
        
        for (let i = 0; i <= numbers.length - 7; i++) {
            const sequence = numbers.slice(i, i + 7);
            const matches = sequence.filter((n, idx) => n === targetSequence[idx]).length;
            
            if (matches >= 5) { // Allow some tolerance
                console.log(`🎯 Found similar sequence: [${sequence.join(', ')}] (${matches}/7 matches)`);
                sequenceFound = true;
            }
        }
        
        if (!sequenceFound) {
            console.log('⚠️  Expected sequence 22,25,29,31,34,43,11 not found in parsing');
        }
        
    } catch (error) {
        console.log(`❌ Error testing legacy page: ${error.message}`);
    }
    
    console.log('');
    console.log('🔍 WORKFLOW DIAGNOSIS:');
    console.log('1. Check if GitHub Actions is running on schedule');
    console.log('2. Check if parsing logic is working correctly');  
    console.log('3. Check if results are being extracted properly');
    console.log('4. Check if CSV updates are being committed');
    console.log('');
    
    console.log('📋 RECOMMENDATIONS:');
    console.log('1. Manual trigger workflow to test current system');
    console.log('2. Check GitHub Actions logs for parsing errors');
    console.log('3. Verify Singapore Pools page structure hasn\'t changed');
    console.log('4. Test enhanced parser with latest HTML structure');
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });

        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

debugWorkflow().catch(console.error);
