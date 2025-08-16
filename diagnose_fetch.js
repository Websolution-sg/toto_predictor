// FETCH RESULT DIAGNOSTIC - Check what we're actually getting
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function diagnoseFetchResults() {
    console.log('🔍 FETCH RESULT DIAGNOSTIC');
    console.log('==========================\n');
    
    const url = 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx';
    
    try {
        console.log('📡 Fetching from Singapore Pools...');
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`📄 HTML Content Length: ${html.length} characters\n`);
        
        // Parse with Cheerio
        const $ = cheerio.load(html);
        
        // Look for TOTO content indicators
        console.log('🔍 SEARCHING FOR TOTO CONTENT:');
        console.log('==============================');
        
        const indicators = ['toto', 'TOTO', 'draw', 'Draw', 'result', 'Result', 'winning', 'number'];
        indicators.forEach(term => {
            const found = html.toLowerCase().includes(term.toLowerCase());
            console.log(`📋 "${term}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });
        
        console.log('\n🔢 LOOKING FOR NUMBER PATTERNS:');
        console.log('================================');
        
        // Look for tables first
        const tables = $('table');
        console.log(`📊 Tables found: ${tables.length}`);
        
        tables.each((i, table) => {
            if (i < 3) { // Check first 3 tables
                const tableText = $(table).text().trim();
                console.log(`\n📋 Table ${i} content (first 200 chars):`);
                console.log(tableText.substring(0, 200));
                
                // Look for number patterns
                const numberPattern = /\b([1-4]?\d)\b/g;
                const numbers = tableText.match(numberPattern);
                if (numbers && numbers.length >= 6) {
                    const validNumbers = numbers
                        .map(n => parseInt(n))
                        .filter(n => n >= 1 && n <= 49);
                    
                    if (validNumbers.length >= 6) {
                        console.log(`🎯 Potential TOTO numbers: ${validNumbers.slice(0, 7).join(', ')}`);
                    }
                }
            }
        });
        
        // Look for date patterns
        console.log('\n📅 LOOKING FOR DATES:');
        console.log('=====================');
        
        const datePatterns = [
            /\d{1,2}\/\d{1,2}\/\d{4}/g,      // DD/MM/YYYY
            /\d{1,2}-\d{1,2}-\d{4}/g,       // DD-MM-YYYY
            /\d{4}-\d{1,2}-\d{1,2}/g,       // YYYY-MM-DD
            /\d{1,2}\s+\w+\s+\d{4}/g        // DD Month YYYY
        ];
        
        datePatterns.forEach((pattern, i) => {
            const dates = html.match(pattern);
            if (dates && dates.length > 0) {
                console.log(`📅 Pattern ${i + 1}: ${dates.slice(0, 5).join(', ')}`);
            }
        });
        
        // Test your actual parsing function
        console.log('\n🧪 TESTING YOUR PARSING LOGIC:');
        console.log('==============================');
        
        const result = parseLatestResultByMostRecentDate(html);
        if (result) {
            console.log(`✅ Your parser found: [${result.join(', ')}]`);
        } else {
            console.log(`❌ Your parser returned: null`);
        }
        
        // Try alternative parsing
        console.log('\n🔄 ALTERNATIVE PARSING ATTEMPT:');
        console.log('===============================');
        
        const alternativeResult = tryAlternativeParsing($);
        if (alternativeResult) {
            console.log(`✅ Alternative parser found: [${alternativeResult.join(', ')}]`);
        } else {
            console.log(`❌ Alternative parser returned: null`);
        }
        
    } catch (error) {
        console.log('💥 FETCH ERROR:', error.message);
    }
}

// Copy your actual parsing function
function parseLatestResultByMostRecentDate(html) {
    const $ = cheerio.load(html);
    
    // Find all potential TOTO result data with dates
    const totoData = [];
    
    // Method 1: Look for structured TOTO result data
    $('table tr, div[class*="result"], div[class*="draw"]').each((index, element) => {
        const text = $(element).text().trim();
        
        // Look for date patterns and numbers
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/);
        const numberMatches = text.match(/\b([0-4]?\d)\b/g);
        
        if (dateMatch && numberMatches && numberMatches.length >= 6) {
            const validNumbers = numberMatches
                .map(n => parseInt(n))
                .filter(n => n >= 1 && n <= 49)
                .slice(0, 7);
            
            if (validNumbers.length >= 6) {
                const date = new Date(dateMatch[0]);
                totoData.push({
                    date: date,
                    numbers: validNumbers.slice(0, 6),
                    additionalNumber: validNumbers[6] || null,
                    rawText: text.substring(0, 100)
                });
            }
        }
    });
    
    if (totoData.length === 0) {
        console.log('❌ No date-based TOTO data found');
        return null;
    }
    
    // Sort by date (most recent first)
    totoData.sort((a, b) => b.date - a.date);
    
    const latest = totoData[0];
    console.log(`📅 Latest result found: ${latest.date.toDateString()}`);
    console.log(`📋 Raw text: ${latest.rawText}`);
    
    // Return 7 numbers (6 main + 1 additional)
    return [...latest.numbers, latest.additionalNumber].filter(n => n !== null);
}

// Alternative parsing method
function tryAlternativeParsing($) {
    console.log('🔍 Trying alternative parsing methods...');
    
    // Method 1: Look for specific TOTO result classes/IDs
    const selectors = [
        '[class*="toto"]',
        '[class*="result"]',
        '[class*="winning"]',
        '[class*="number"]',
        '[id*="toto"]',
        '[id*="result"]',
        '.draw-result',
        '.winning-numbers'
    ];
    
    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            console.log(`🎯 Found ${elements.length} elements with selector: ${selector}`);
            elements.each((i, el) => {
                if (i < 3) {
                    const text = $(el).text().trim();
                    console.log(`   [${i}]: ${text.substring(0, 100)}`);
                }
            });
        }
    }
    
    // Method 2: Look for recent draws or current results
    const allText = $('*').contents().filter(function() {
        return this.nodeType === 3; // Text nodes only
    }).map(function() {
        return $(this).text().trim();
    }).get();
    
    for (const text of allText) {
        if (text.length > 10 && text.length < 200) {
            const numberPattern = /\b([1-4]?\d)\b/g;
            const numbers = text.match(numberPattern);
            
            if (numbers && numbers.length >= 6) {
                const validNumbers = numbers
                    .map(n => parseInt(n))
                    .filter(n => n >= 1 && n <= 49);
                
                if (validNumbers.length >= 6) {
                    console.log(`🎯 Potential numbers in text: "${text.substring(0, 100)}"`);
                    console.log(`   Numbers: ${validNumbers.slice(0, 7).join(', ')}`);
                    return validNumbers.slice(0, 7);
                }
            }
        }
    }
    
    return null;
}

// Run the diagnostic
diagnoseFetchResults().then(() => {
    console.log('\n🎯 DIAGNOSTIC COMPLETE');
    console.log('Check the results above to see what your script is actually fetching');
});
