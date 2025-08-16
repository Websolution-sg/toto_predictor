// Debug the dynamic parsing to see what's happening
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function debugDynamicParsing() {
    console.log('🐛 DEBUG: Dynamic TOTO Parsing');
    console.log('===============================\n');
    
    try {
        console.log('1️⃣ Fetching HTML from Singapore Pools...');
        const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log(`✅ HTML fetched: ${html.length} characters\n`);
        
        const $ = cheerio.load(html);
        
        console.log('2️⃣ Analyzing page structure...');
        
        // Check for basic TOTO indicators
        const indicators = ['toto', 'TOTO', 'winning', 'result', 'draw', 'number'];
        indicators.forEach(term => {
            const count = (html.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
            console.log(`   "${term}": ${count} occurrences`);
        });
        
        console.log('\n3️⃣ Searching for tables...');
        const tables = $('table');
        console.log(`📊 Found ${tables.length} tables`);
        
        tables.each((i, table) => {
            if (i < 5) { // Check first 5 tables
                const $table = $(table);
                const cells = $table.find('td, th');
                const numbers = [];
                
                cells.each((j, cell) => {
                    const text = $(cell).text().trim();
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 1 && num <= 49 && text === num.toString()) {
                        numbers.push(num);
                    }
                });
                
                console.log(`   Table ${i}: ${numbers.length} valid numbers`);
                if (numbers.length > 0) {
                    console.log(`      Numbers: ${numbers.slice(0, 10).join(', ')}${numbers.length > 10 ? '...' : ''}`);
                }
            }
        });
        
        console.log('\n4️⃣ Looking for number sequences in divs/spans...');
        const numberElements = [];
        
        $('div, span, td').each((i, element) => {
            const text = $(element).text().trim();
            
            if (text.length < 5) { // Short text that might be a single number
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 49 && text === num.toString()) {
                    const parent = $(element).parent();
                    const parentText = parent.text().trim();
                    
                    if (!parentText.includes('$') && !parentText.includes('Prize') && 
                        !parentText.includes('Group') && parentText.length < 200) {
                        
                        numberElements.push({
                            number: num,
                            element: element.tagName,
                            parentContext: parentText.substring(0, 50)
                        });
                    }
                }
            }
        });
        
        console.log(`📊 Found ${numberElements.length} potential number elements`);
        
        if (numberElements.length > 0) {
            // Group numbers that appear close together
            const sequences = [];
            let currentSeq = [numberElements[0]];
            
            for (let i = 1; i < Math.min(numberElements.length, 50); i++) {
                // If numbers are close in value or context, group them
                const prevNum = currentSeq[currentSeq.length - 1].number;
                const currNum = numberElements[i].number;
                const prevContext = currentSeq[currentSeq.length - 1].parentContext;
                const currContext = numberElements[i].parentContext;
                
                if (Math.abs(currNum - prevNum) < 30 || 
                    prevContext === currContext ||
                    prevContext.includes(currContext.substring(0, 20))) {
                    currentSeq.push(numberElements[i]);
                } else {
                    if (currentSeq.length >= 6) {
                        sequences.push(currentSeq.map(el => el.number));
                    }
                    currentSeq = [numberElements[i]];
                }
            }
            
            if (currentSeq.length >= 6) {
                sequences.push(currentSeq.map(el => el.number));
            }
            
            console.log(`🎯 Found ${sequences.length} potential sequences:`);
            sequences.forEach((seq, i) => {
                console.log(`   Sequence ${i + 1}: ${seq.slice(0, 7).join(', ')}`);
            });
            
            if (sequences.length > 0) {
                return sequences[0].slice(0, 7);
            }
        }
        
        console.log('\n5️⃣ Fallback: Looking for any number patterns...');
        
        // Extract all text and look for number patterns
        const bodyText = $('body').text();
        const numberPattern = /\b(\d{1,2})\b/g;
        const allMatches = bodyText.match(numberPattern);
        
        if (allMatches) {
            const validNumbers = allMatches
                .map(n => parseInt(n))
                .filter(n => n >= 1 && n <= 49);
            
            console.log(`📊 Found ${validNumbers.length} valid numbers in text`);
            console.log(`   First 20: ${validNumbers.slice(0, 20).join(', ')}`);
            
            // Look for sequences of 6-7 consecutive valid numbers
            for (let i = 0; i <= validNumbers.length - 6; i++) {
                const sequence = validNumbers.slice(i, i + 7);
                const unique = [...new Set(sequence.slice(0, 6))];
                
                if (unique.length === 6) {
                    console.log(`🎯 Found potential sequence at position ${i}: ${sequence.join(', ')}`);
                    return sequence;
                }
            }
        }
        
        console.log('\n❌ No valid TOTO sequences found');
        return null;
        
    } catch (error) {
        console.error('💥 Debug error:', error.message);
        return null;
    }
}

// Run debug
debugDynamicParsing().then(result => {
    console.log('\n🏁 DEBUG COMPLETE');
    console.log('=================');
    
    if (result) {
        console.log(`✅ Debug found sequence: [${result.join(', ')}]`);
    } else {
        console.log('❌ Debug could not extract valid sequence');
        console.log('🔧 The website structure may have changed or need different parsing approach');
    }
});
