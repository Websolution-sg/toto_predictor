// SINGAPORE POOLS TOTO RESULTS FETCHER
// Automatically fetch latest TOTO results from official Singapore Pools website

const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

console.log('🌐 SINGAPORE POOLS TOTO RESULTS FETCHER');
console.log('=======================================');
console.log('🔗 Fetching from: https://www.singaporepools.com.sg');
console.log('📅 Looking for: April 2, 2026 results');
console.log('⏳ Connecting...\n');

// Function to fetch webpage content
function fetchWebpage(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'identity',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        };

        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = client.request(options, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: data
                });
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
        
        request.end();
    });
}

// Function to extract TOTO results from HTML
function extractTotoResults(html) {
    console.log('🔍 ANALYZING WEBPAGE CONTENT...');
    console.log('==============================');
    
    // Look for TOTO results patterns in the HTML
    const patterns = [
        // Common patterns for TOTO results
        /toto.*?(\d{1,2}-\w{3}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?additional.*?(\d{1,2})/gi,
        /(\d{1,2}-\w{3}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}).*?toto.*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2})/gi,
        // Date patterns for April 2, 2026
        /(2-apr-26|02-apr-26|april.*?2.*?2026|2\/4\/2026)/gi
    ];
    
    const results = [];
    
    // Search for results using various patterns
    for (const pattern of patterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            results.push(match);
        }
    }
    
    console.log(`📊 Found ${results.length} potential result patterns`);
    
    // Look specifically for April 2, 2026 data
    const april2Patterns = [
        /2.*?apr.*?26/gi,
        /april.*?2.*?2026/gi,
        /2\/4\/2026/gi,
        /04\/02\/2026/gi
    ];
    
    let foundApril2 = false;
    for (const pattern of april2Patterns) {
        if (pattern.test(html)) {
            foundApril2 = true;
            console.log('✅ Found April 2, 2026 reference in webpage');
            break;
        }
    }
    
    if (!foundApril2) {
        console.log('⚠️ No specific April 2, 2026 reference found');
    }
    
    return { results, foundApril2, contentLength: html.length };
}

// Function to try alternative TOTO results endpoints
async function tryMultipleEndpoints() {
    const endpoints = [
        'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
        'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
        'https://www.singaporepools.com.sg/toto',
        'https://www.singaporepools.com.sg/en/toto',
        'https://www.singaporepools.com.sg/en/lottery/toto',
        'https://www.singaporepools.com.sg/lottery/toto/results',
        'https://www.singaporepools.com.sg/en/product/sr/Pages/toto.aspx'
    ];
    
    for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        console.log(`🔗 Trying endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
        
        try {
            const response = await fetchWebpage(endpoint);
            console.log(`📊 Response: ${response.statusCode} | Size: ${response.body.length} bytes`);
            
            if (response.statusCode === 200 && response.body.length > 1000) {
                console.log('✅ Successfully retrieved webpage content');
                
                // Extract results
                const extracted = extractTotoResults(response.body);
                
                if (extracted.foundApril2 || extracted.results.length > 0) {
                    console.log('🎯 Potentially found TOTO results data!');
                    return { success: true, data: response.body, extracted };
                }
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                console.log(`🔄 Redirect detected: ${response.statusCode}`);
                if (response.headers.location) {
                    console.log(`   Redirect to: ${response.headers.location}`);
                }
            } else {
                console.log(`⚠️ Unexpected response: ${response.statusCode}`);
            }
            
        } catch (error) {
            console.log(`❌ Error with endpoint ${i + 1}: ${error.message}`);
        }
        
        // Wait between requests to be respectful
        if (i < endpoints.length - 1) {
            console.log('⏳ Waiting before next attempt...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    return { success: false };
}

// Function to simulate realistic April 2, 2026 results based on patterns
function generateRealisticResults() {
    console.log('🎲 GENERATING REALISTIC APRIL 2, 2026 SIMULATION');
    console.log('================================================');
    console.log('⚠️ Note: These are simulated results for testing purposes');
    console.log('');
    
    // Based on recent March patterns and hot numbers
    const march30Numbers = [12, 22, 28, 33, 40, 46];
    const march27Numbers = [4, 7, 22, 29, 33, 46];
    const hotNumbers = [22, 33, 46, 12, 28, 40]; // Most frequent in March
    
    // Generate realistic numbers using pattern analysis
    const candidates = [];
    
    // Include some hot numbers
    candidates.push(...hotNumbers.slice(0, 3));
    
    // Add some numbers from previous draws
    candidates.push(...march30Numbers.slice(0, 2));
    
    // Fill with realistic range
    while (candidates.length < 6) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!candidates.includes(num)) {
            candidates.push(num);
        }
    }
    
    const numbers = candidates.slice(0, 6).sort((a, b) => a - b);
    const additional = Math.floor(Math.random() * 49) + 1;
    
    return {
        date: '2-Apr-26',
        numbers: numbers,
        additional: additional,
        isSimulated: true
    };
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting Singapore Pools fetch...');
        
        // Try to fetch real results
        const fetchResult = await tryMultipleEndpoints();
        
        if (fetchResult.success) {
            console.log('\n🎉 SUCCESSFULLY RETRIEVED DATA FROM SINGAPORE POOLS!');
            console.log('===================================================');
            console.log('📝 Manual analysis required to extract exact numbers');
            console.log('💡 Webpage content retrieved - ready for processing');
            
            // Save the fetched content for analysis
            fs.writeFileSync('singapore_pools_content.html', fetchResult.data);
            console.log('💾 Webpage content saved to: singapore_pools_content.html');
            
        } else {
            console.log('\n⚠️ UNABLE TO FETCH LIVE DATA FROM SINGAPORE POOLS');
            console.log('=================================================');
            console.log('🔍 Possible reasons:');
            console.log('   • Website structure changed');
            console.log('   • Network connectivity issues');
            console.log('   • Anti-scraping protection');
            console.log('   • Results not yet published');
            console.log('');
            
            console.log('🎯 ALTERNATIVE: PATTERN-BASED SIMULATION');
            console.log('========================================');
            
            const simulatedResults = generateRealisticResults();
            console.log(`📅 Simulated Date: ${simulatedResults.date}`);
            console.log(`🎲 Simulated Numbers: [${simulatedResults.numbers.join(', ')}]`);
            console.log(`⭐ Simulated Additional: ${simulatedResults.additional}`);
            console.log('');
            console.log('❗ IMPORTANT: These are SIMULATED results for testing only!');
            console.log('🔗 Always verify with: https://www.singaporepools.com.sg');
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('==============');
        console.log('1. 🌐 Manually verify results at Singapore Pools website');
        console.log('2. 📝 Add verified results using the add_april2_verified_results.js script');
        console.log('3. 🎯 Validate your predictions against real results');
        console.log('');
        console.log('🔗 Official verification: https://www.singaporepools.com.sg');
        
    } catch (error) {
        console.error('\n❌ FETCH ERROR:', error.message);
        console.log('🔄 Please try again or check manually at Singapore Pools website');
    }
}

// Run the fetcher
main();