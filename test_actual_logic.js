// TEST YOUR ACTUAL SCRIPT LOGIC
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Copy the exact functions from your updateTotoCSV.cjs
async function fetchLatestByDateAnalysis() {
    const urls = [
        'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
        'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0'
    ];
    
    for (const url of urls) {
        console.log(`\n🔍 Testing URL: ${url}`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            console.log(`📊 Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                console.log(`❌ HTTP error: ${response.status}`);
                continue;
            }
            
            const html = await response.text();
            console.log(`📄 HTML length: ${html.length} characters`);
            
            const result = parseLatestResultByMostRecentDate(html);
            console.log(`🎯 Parsing result:`, result);
            
            if (result) {
                console.log(`✅ SUCCESS! Found result: ${result.numbers.join(',')}`);
                console.log(`📅 Date: ${result.date}`);
                return result;
            } else {
                console.log(`❌ No result found from this URL`);
            }
            
        } catch (error) {
            console.log(`💥 Error with ${url}:`, error.message);
        }
    }
    
    console.log(`❌ No results found from any URL`);
    return null;
}

function parseLatestResultByMostRecentDate(html) {
    const $ = cheerio.load(html);
    
    console.log(`\n🔍 Parsing HTML...`);
    
    // Your exact parsing logic
    const totoData = [];
    
    // Method 1: Look for structured TOTO result data
    $('table tr, div[class*="result"], div[class*="draw"]').each((index, element) => {
        const text = $(element).text().trim();
        console.log(`📋 Checking element ${index}: "${text.substring(0, 100)}..."`);
        
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/);
        const numberMatches = text.match(/\b([0-4]?\d)\b/g);
        
        if (dateMatch && numberMatches && numberMatches.length >= 6) {
            console.log(`🎯 Found potential match!`);
            console.log(`   Date: ${dateMatch[0]}`);
            console.log(`   Numbers: ${numberMatches.slice(0, 7).join(', ')}`);
            
            const validNumbers = numberMatches
                .map(n => parseInt(n))
                .filter(n => n >= 1 && n <= 49)
                .slice(0, 7);
            
            if (validNumbers.length >= 6) {
                const date = new Date(dateMatch[0]);
                totoData.push({
                    date: date,
                    dateString: dateMatch[0],
                    numbers: validNumbers.slice(0, 6),
                    additionalNumber: validNumbers[6] || null,
                    rawText: text.substring(0, 200)
                });
            }
        }
    });
    
    console.log(`\n📊 Found ${totoData.length} potential TOTO results`);
    
    if (totoData.length === 0) {
        console.log(`❌ No structured data found`);
        return null;
    }
    
    // Sort by date (most recent first)
    totoData.sort((a, b) => b.date - a.date);
    
    const latest = totoData[0];
    console.log(`\n🎯 Latest result selected:`);
    console.log(`   Date: ${latest.dateString}`);
    console.log(`   Numbers: ${latest.numbers.join(', ')}`);
    console.log(`   Additional: ${latest.additionalNumber}`);
    
    return {
        numbers: latest.numbers,
        additionalNumber: latest.additionalNumber,
        date: latest.dateString
    };
}

// Test the function
console.log('🧪 TESTING YOUR ACTUAL SCRIPT LOGIC');
console.log('===================================');

fetchLatestByDateAnalysis().then(result => {
    console.log('\n🎯 FINAL RESULT:');
    console.log('================');
    if (result) {
        console.log(`✅ Numbers: ${result.numbers.join(',')}`);
        console.log(`📅 Date: ${result.date}`);
        console.log(`➕ Additional: ${result.additionalNumber}`);
    } else {
        console.log(`❌ NULL - No result found`);
        console.log(`📋 This explains why your CSV isn't updating!`);
    }
}).catch(error => {
    console.log('💥 SCRIPT ERROR:', error.message);
});
