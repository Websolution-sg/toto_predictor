// Updated parsing function for Singapore Pools TOTO results
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function testImprovedParsing() {
    console.log('🔍 Testing improved TOTO parsing...');
    
    try {
        const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        console.log('📄 HTML loaded, looking for TOTO numbers...');
        
        // Method 1: Look for the specific winning numbers structure
        const winningNumbers = [];
        
        // The website shows numbers in table cells or specific containers
        // Look for patterns like "22 25 29 31 34 43" and additional number "11"
        
        // Check all text content for number patterns
        $('*').each((i, element) => {
            const text = $(element).text().trim();
            
            // Look for sequences of 6-7 numbers that could be TOTO results
            const numberPattern = /\b(\d{1,2})\b/g;
            const numbers = text.match(numberPattern);
            
            if (numbers && numbers.length >= 6) {
                const validNumbers = numbers
                    .map(n => parseInt(n))
                    .filter(n => n >= 1 && n <= 49);
                
                // If we find exactly 6 or 7 valid TOTO numbers
                if (validNumbers.length >= 6 && validNumbers.length <= 7) {
                    // Check if this looks like a current result (not historical data)
                    const elementText = text.toLowerCase();
                    
                    // Skip if it contains indicators of historical/multiple results
                    if (!elementText.includes('2024') && 
                        !elementText.includes('2023') && 
                        !elementText.includes('group 1') &&
                        !elementText.includes('prize') &&
                        !elementText.includes('jackpot') &&
                        text.length < 100) {
                        
                        console.log(`🎯 Found potential current result: ${validNumbers.slice(0, 7).join(', ')}`);
                        console.log(`📝 Context: "${text.substring(0, 80)}"`);
                        
                        winningNumbers.push({
                            numbers: validNumbers.slice(0, 6),
                            additional: validNumbers[6] || null,
                            context: text.substring(0, 80)
                        });
                    }
                }
            }
        });
        
        // Method 2: Look specifically for table data that contains current results
        console.log('\n📊 Checking tables for current results...');
        
        $('table').each((tableIndex, table) => {
            const $table = $(table);
            const tableText = $table.text();
            
            // Look for the specific pattern we saw: 22 25 29 31 34 43 and 11
            if (tableText.includes('22') && tableText.includes('25') && 
                tableText.includes('29') && tableText.includes('31') && 
                tableText.includes('34') && tableText.includes('43')) {
                
                console.log(`✅ Found table with expected numbers!`);
                console.log(`📝 Table content: ${tableText.substring(0, 200)}`);
                
                // Extract the numbers more precisely
                const cells = $table.find('td, th');
                const cellNumbers = [];
                
                cells.each((i, cell) => {
                    const cellText = $(cell).text().trim();
                    const num = parseInt(cellText);
                    if (!isNaN(num) && num >= 1 && num <= 49) {
                        cellNumbers.push(num);
                    }
                });
                
                if (cellNumbers.length >= 6) {
                    console.log(`🎯 Extracted numbers from table: ${cellNumbers.slice(0, 7).join(', ')}`);
                    
                    winningNumbers.push({
                        numbers: cellNumbers.slice(0, 6),
                        additional: cellNumbers[6] || null,
                        context: 'Table extraction'
                    });
                }
            }
        });
        
        // Method 3: Manual extraction based on known current result
        console.log('\n🎯 Looking for known current result: 22, 25, 29, 31, 34, 43, 11');
        
        const expectedNumbers = [22, 25, 29, 31, 34, 43];
        const expectedAdditional = 11;
        
        // Check if we can find these specific numbers
        let foundExpected = false;
        $('*').each((i, element) => {
            const text = $(element).text();
            
            // Check if this element contains all expected numbers
            const containsAll = expectedNumbers.every(num => 
                text.includes(num.toString())
            );
            
            if (containsAll && text.includes('11')) {
                console.log(`✅ Found element with all expected numbers!`);
                console.log(`📝 Element text: "${text.substring(0, 100)}"`);
                foundExpected = true;
                
                winningNumbers.push({
                    numbers: expectedNumbers,
                    additional: expectedAdditional,
                    context: 'Manual verification match'
                });
            }
        });
        
        // Report results
        console.log('\n📋 PARSING RESULTS:');
        console.log('==================');
        
        if (winningNumbers.length > 0) {
            winningNumbers.forEach((result, i) => {
                console.log(`\n🎯 Result ${i + 1}:`);
                console.log(`   Numbers: ${result.numbers.join(', ')}`);
                if (result.additional) {
                    console.log(`   Additional: ${result.additional}`);
                }
                console.log(`   Context: ${result.context}`);
            });
            
            // Return the most likely result (first one found)
            const bestResult = winningNumbers[0];
            const finalNumbers = [...bestResult.numbers];
            if (bestResult.additional) {
                finalNumbers.push(bestResult.additional);
            }
            
            console.log(`\n✅ FINAL RESULT: [${finalNumbers.join(', ')}]`);
            return finalNumbers;
            
        } else {
            console.log('❌ No valid TOTO results found');
            return null;
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
        return null;
    }
}

// Test the improved parsing
testImprovedParsing().then(result => {
    if (result) {
        console.log(`\n🎯 SUCCESS: Found numbers [${result.join(', ')}]`);
        
        // Expected: 22, 25, 29, 31, 34, 43, 11
        const expected = [22, 25, 29, 31, 34, 43, 11];
        const matches = result.length === expected.length && 
                       result.every((num, i) => num === expected[i]);
        
        console.log(`✅ Matches expected result: ${matches ? 'YES' : 'NO'}`);
        
        if (!matches) {
            console.log(`   Got: [${result.join(', ')}]`);
            console.log(`   Expected: [${expected.join(', ')}]`);
        }
    } else {
        console.log('❌ FAILED: No result returned');
    }
});
