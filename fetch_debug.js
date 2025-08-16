// DEBUG FETCH SCRIPT - Shows exactly what we're getting from Singapore Pools
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function debugFetch() {
    console.log('🔍 SINGAPORE POOLS FETCH DEBUG');
    console.log('=====================================\n');
    
    const url = 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx';
    
    try {
        console.log('📡 Fetching from:', url);
        console.log('⏳ Please wait...\n');
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        console.log('📊 Response Status:', response.status, response.statusText);
        console.log('📋 Response Headers:');
        response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log('');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('📄 HTML Content Length:', html.length, 'characters');
        console.log('');
        
        // Show first 500 characters of HTML
        console.log('🔍 HTML Preview (first 500 chars):');
        console.log('=' .repeat(50));
        console.log(html.substring(0, 500));
        console.log('=' .repeat(50));
        console.log('');
        
        // Parse with Cheerio
        const $ = cheerio.load(html);
        console.log('✅ HTML parsed with Cheerio');
        console.log('');
        
        // Look for TOTO-related content
        console.log('🎯 SEARCHING FOR TOTO CONTENT:');
        console.log('===============================');
        
        // Search for various TOTO indicators
        const searches = [
            'toto',
            'TOTO',
            'Toto',
            'draw',
            'Draw',
            'result',
            'Result',
            'winning',
            'Winning',
            'number',
            'Number'
        ];
        
        searches.forEach(term => {
            const found = html.toLowerCase().includes(term.toLowerCase());
            console.log(`📋 "${term}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });
        console.log('');
        
        // Look for specific selectors that might contain results
        const selectors = [
            '.toto-result',
            '.toto-number',
            '.winning-number',
            '.draw-result',
            '[class*="toto"]',
            '[class*="result"]',
            '[class*="winning"]',
            '[id*="toto"]',
            '[id*="result"]'
        ];
        
        console.log('🎯 CHECKING COMMON SELECTORS:');
        console.log('==============================');
        selectors.forEach(selector => {
            const elements = $(selector);
            console.log(`📋 "${selector}": ${elements.length} elements found`);
            if (elements.length > 0) {
                elements.each((i, el) => {
                    if (i < 3) { // Show first 3 matches
                        console.log(`   [${i}]: ${$(el).text().trim().substring(0, 100)}`);
                    }
                });
            }
        });
        console.log('');
        
        // Look for tables (results often in tables)
        const tables = $('table');
        console.log(`🔍 TABLES FOUND: ${tables.length}`);
        tables.each((i, table) => {
            if (i < 3) { // Check first 3 tables
                const tableText = $(table).text().trim();
                console.log(`📊 Table ${i} (first 200 chars): ${tableText.substring(0, 200)}`);
                
                // Look for number patterns in table
                const numberPattern = /\b\d{1,2}\b/g;
                const numbers = tableText.match(numberPattern);
                if (numbers && numbers.length >= 6) {
                    console.log(`   🎯 Potential numbers found: ${numbers.slice(0, 10).join(', ')}`);
                }
            }
        });
        console.log('');
        
        // Look for any elements containing numbers
        console.log('🔢 SEARCHING FOR NUMBER PATTERNS:');
        console.log('==================================');
        
        // Find all text containing 6+ numbers
        const allText = $('*').contents().filter(function() {
            return this.nodeType === 3; // Text nodes only
        }).map(function() {
            return $(this).text().trim();
        }).get();
        
        const numberPattern = /\b\d{1,2}\b/g;
        let foundNumbers = [];
        
        allText.forEach(text => {
            const numbers = text.match(numberPattern);
            if (numbers && numbers.length >= 6) {
                foundNumbers.push({
                    text: text.substring(0, 100),
                    numbers: numbers.slice(0, 8)
                });
            }
        });
        
        if (foundNumbers.length > 0) {
            console.log('🎯 POTENTIAL TOTO RESULTS FOUND:');
            foundNumbers.slice(0, 5).forEach((item, i) => {
                console.log(`[${i}] Text: ${item.text}`);
                console.log(`    Numbers: ${item.numbers.join(', ')}`);
            });
        } else {
            console.log('❌ No number patterns found with 6+ digits');
        }
        console.log('');
        
        // Look for date patterns
        console.log('📅 SEARCHING FOR DATE PATTERNS:');
        console.log('================================');
        const datePatterns = [
            /\d{1,2}\/\d{1,2}\/\d{4}/g,      // DD/MM/YYYY
            /\d{1,2}-\d{1,2}-\d{4}/g,       // DD-MM-YYYY
            /\d{4}-\d{1,2}-\d{1,2}/g,       // YYYY-MM-DD
            /\d{1,2} \w+ \d{4}/g            // DD Month YYYY
        ];
        
        datePatterns.forEach((pattern, i) => {
            const dates = html.match(pattern);
            if (dates) {
                console.log(`📅 Pattern ${i}: ${dates.slice(0, 5).join(', ')}`);
            }
        });
        
    } catch (error) {
        console.log('💥 FETCH ERROR:');
        console.log('================');
        console.log('Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

// Run the debug
(async () => {
    await debugFetch();
    console.log('\n🎉 DEBUG FETCH COMPLETE');
})();
