// SINGAPORE POOLS HTML ANALYZER
// Extract TOTO results from the fetched webpage content

const fs = require('fs');

console.log('🔍 SINGAPORE POOLS HTML CONTENT ANALYZER');
console.log('========================================');
console.log('📄 Analyzing: singapore_pools_content.html');
console.log('🎯 Looking for: April 2, 2026 TOTO results');
console.log('');

function analyzeHtmlContent() {
    try {
        if (!fs.existsSync('singapore_pools_content.html')) {
            console.log('❌ HTML content file not found');
            console.log('🔄 Please run fetch_singapore_pools_live.js first');
            return;
        }
        
        const htmlContent = fs.readFileSync('singapore_pools_content.html', 'utf8');
        console.log(`📊 File size: ${htmlContent.length} characters`);
        console.log('');
        
        // Extract key sections that might contain TOTO results
        console.log('🔍 SEARCHING FOR TOTO RESULTS DATA...');
        console.log('====================================');
        
        // Look for various patterns
        const searchPatterns = [
            // Date patterns for April 2, 2026
            /(2.*?apr.*?26|april.*?2.*?2026|2\/4\/2026|02\/04\/2026)/gi,
            // TOTO specific patterns
            /toto.*?result/gi,
            /winning.*?number/gi,
            /draw.*?date/gi,
            // Number patterns (6 numbers in sequence)
            /\b\d{1,2}\b.*?\b\d{1,2}\b.*?\b\d{1,2}\b.*?\b\d{1,2}\b.*?\b\d{1,2}\b.*?\b\d{1,2}\b/g,
            // Additional number patterns
            /additional.*?\b\d{1,2}\b/gi
        ];
        
        let foundResults = [];
        
        for (const pattern of searchPatterns) {
            const matches = Array.from(htmlContent.matchAll(pattern));
            if (matches.length > 0) {
                console.log(`✅ Pattern found: ${pattern.source} (${matches.length} matches)`);
                foundResults.push(...matches.map(m => m[0]));
            }
        }
        
        // Look for specific April 2 content
        console.log('\n🎯 APRIL 2, 2026 SPECIFIC SEARCH:');
        console.log('=================================');
        
        const april2Matches = htmlContent.match(/(2.*?apr.*?26|april.*?2.*?2026).{0,500}/gi);
        if (april2Matches) {
            console.log(`📅 Found ${april2Matches.length} April 2, 2026 references:`);
            april2Matches.forEach((match, index) => {
                console.log(`${index + 1}. ${match.substring(0, 200)}...`);
            });
        } else {
            console.log('⚠️ No specific April 2, 2026 content found');
        }
        
        // Extract tables and structured data
        console.log('\n📊 STRUCTURED DATA EXTRACTION:');
        console.log('==============================');
        
        const tableMatches = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
        console.log(`📋 Found ${tableMatches ? tableMatches.length : 0} tables`);
        
        if (tableMatches) {
            tableMatches.forEach((table, index) => {
                // Look for numbers in tables
                const numberMatches = table.match(/\b([1-4]?\d)\b/g);
                if (numberMatches && numberMatches.length >= 6) {
                    console.log(`📊 Table ${index + 1} contains ${numberMatches.length} numbers: ${numberMatches.slice(0, 10).join(', ')}${numberMatches.length > 10 ? '...' : ''}`);
                }
            });
        }
        
        // JSON data extraction
        const jsonMatches = htmlContent.match(/\{[^{}]*".*?"[^{}]*\}/g);
        console.log(`📄 Found ${jsonMatches ? jsonMatches.length : 0} potential JSON objects`);
        
        // Look for script tags with data
        const scriptMatches = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
        console.log(`💻 Found ${scriptMatches ? scriptMatches.length : 0} script tags`);
        
        if (scriptMatches) {
            scriptMatches.forEach((script, index) => {
                // Look for TOTO related data in scripts
                if (/toto|result|winning|draw/i.test(script)) {
                    console.log(`📜 Script ${index + 1} contains TOTO-related content`);
                    
                    // Extract numbers from scripts
                    const numberArrays = script.match(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g);
                    if (numberArrays) {
                        console.log(`   🎲 Number arrays found: ${numberArrays.slice(0, 3).join(' | ')}`);
                    }
                }
            });
        }
        
        // Enhanced number extraction
        console.log('\n🎲 ENHANCED NUMBER PATTERN SEARCH:');
        console.log('==================================');
        
        // Look for 6 consecutive numbers in various formats
        const numberPatterns = [
            /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/g,
            /(\d{1,2})\s*[-|]\s*(\d{1,2})\s*[-|]\s*(\d{1,2})\s*[-|]\s*(\d{1,2})\s*[-|]\s*(\d{1,2})\s*[-|]\s*(\d{1,2})/g
        ];
        
        for (const pattern of numberPatterns) {
            const matches = Array.from(htmlContent.matchAll(pattern));
            if (matches.length > 0) {
                console.log(`🎯 Found ${matches.length} potential 6-number sequences:`);
                matches.slice(0, 5).forEach((match, index) => {
                    const numbers = match.slice(1, 7).map(n => parseInt(n)).filter(n => n >= 1 && n <= 49);
                    if (numbers.length === 6) {
                        console.log(`   ${index + 1}. [${numbers.join(', ')}]`);
                    }
                });
            }
        }
        
        // Save extracted data for manual review
        const extractedData = {
            timestamp: new Date().toISOString(),
            foundResults,
            april2Matches,
            tableCount: tableMatches ? tableMatches.length : 0,
            scriptCount: scriptMatches ? scriptMatches.length : 0
        };
        
        fs.writeFileSync('extracted_data.json', JSON.stringify(extractedData, null, 2));
        console.log('\n💾 Analysis saved to: extracted_data.json');
        
        console.log('\n📋 MANUAL REVIEW REQUIRED:');
        console.log('==========================');
        console.log('1. 📄 Review the HTML content in singapore_pools_content.html');
        console.log('2. 🔍 Look for the TOTO results table or section');
        console.log('3. 📊 Find the April 2, 2026 draw numbers');
        console.log('4. ✅ Verify the 6 winning numbers + additional number');
        console.log('5. 📝 Add them using add_april2_verified_results.js');
        
        console.log('\n🎯 NEXT STEP: Manual verification required');
        console.log('🌐 Cross-check with: https://www.singaporepools.com.sg');
        
    } catch (error) {
        console.error('❌ Error analyzing HTML content:', error.message);
    }
}

// Run the analysis
analyzeHtmlContent();