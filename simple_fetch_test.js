// SIMPLE FETCH TEST - Check if we can reach Singapore Pools
const fetch = require('node-fetch');

async function simpleFetchTest() {
    console.log('🔍 SIMPLE FETCH TEST');
    console.log('====================\n');
    
    try {
        console.log('📡 Testing fetch to Singapore Pools...');
        const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ Response received!');
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
        
        const html = await response.text();
        console.log(`📝 Content Length: ${html.length} characters`);
        
        // Quick check for TOTO content
        const hasToto = html.toLowerCase().includes('toto');
        const hasResult = html.toLowerCase().includes('result');
        const hasWinning = html.toLowerCase().includes('winning');
        
        console.log(`🎯 Contains "toto": ${hasToto}`);
        console.log(`🎯 Contains "result": ${hasResult}`);
        console.log(`🎯 Contains "winning": ${hasWinning}`);
        
        // Show a snippet
        console.log('\n📋 First 300 characters:');
        console.log('-'.repeat(50));
        console.log(html.substring(0, 300));
        console.log('-'.repeat(50));
        
        return html;
        
    } catch (error) {
        console.log('💥 ERROR:', error.message);
        return null;
    }
}

// Run immediately
simpleFetchTest().then(html => {
    console.log('\n🎯 Test complete!');
    if (html) {
        console.log('✅ Successfully fetched HTML content');
    } else {
        console.log('❌ Failed to fetch content');
    }
});
