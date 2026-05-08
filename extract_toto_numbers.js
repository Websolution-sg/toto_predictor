// TARGETED TOTO RESULTS EXTRACTOR
// Focused search for actual April 2, 2026 TOTO winning numbers

const fs = require('fs');

console.log('🎯 TARGETED TOTO RESULTS EXTRACTOR');
console.log('==================================');
console.log('📅 Target: April 2, 2026 winning numbers');
console.log('🔍 Deep analysis of Singapore Pools content');
console.log('');

function extractTotoNumbers() {
    try {
        const htmlContent = fs.readFileSync('singapore_pools_content.html', 'utf8');
        console.log('📄 Loaded HTML content for analysis');
        console.log('');
        
        // Search for April 2, 2026 specific sections
        console.log('🎯 SEARCHING FOR APRIL 2, 2026 DATA...');
        console.log('======================================');
        
        // Extract sections containing "2 Apr 2026"
        const april2Sections = [];
        const april2Regex = /(2\s*apr\s*2026|april\s*2\s*2026)/gi;
        let match;
        
        while ((match = april2Regex.exec(htmlContent)) !== null) {
            const start = Math.max(0, match.index - 500);
            const end = Math.min(htmlContent.length, match.index + 1000);
            const section = htmlContent.substring(start, end);
            april2Sections.push(section);
        }
        
        console.log(`📅 Found ${april2Sections.length} sections with April 2, 2026 content`);
        
        // Analyze each section for TOTO numbers
        april2Sections.forEach((section, index) => {
            console.log(`\n📊 SECTION ${index + 1} ANALYSIS:`);
            console.log('=======================');
            
            // Look for table data
            const tableMatches = section.match(/<t[rd][^>]*>([^<]+)</gi);
            if (tableMatches) {
                console.log(`📋 Table cells found: ${tableMatches.length}`);
                tableMatches.slice(0, 20).forEach((cell, i) => {
                    const cellContent = cell.replace(/<[^>]+>/g, '').trim();
                    if (cellContent && /\d/.test(cellContent)) {
                        console.log(`   Cell ${i + 1}: "${cellContent}"`);
                    }
                });
            }
            
            // Look for number sequences
            const numbers = section.match(/\b([1-4]?\d)\b/g);
            if (numbers) {
                const validNumbers = numbers
                    .map(n => parseInt(n))
                    .filter(n => n >= 1 && n <= 49);
                
                if (validNumbers.length >= 6) {
                    console.log(`🎲 Valid TOTO numbers found: ${validNumbers.slice(0, 12).join(', ')}`);
                    
                    // Check if we have exactly 6 or 7 consecutive valid numbers
                    if (validNumbers.length >= 6 && validNumbers.length <= 8) {
                        console.log(`✨ POTENTIAL WINNING NUMBERS: [${validNumbers.slice(0, 6).join(', ')}]`);
                        if (validNumbers[6]) {
                            console.log(`   Additional number: ${validNumbers[6]}`);
                        }
                    }
                }
            }
        });
        
        // Alternative approach: Look for specific TOTO results patterns
        console.log('\n🔍 ALTERNATIVE PATTERN SEARCH:');
        console.log('==============================');
        
        // Look for common TOTO results layouts
        const resultPatterns = [
            // Pattern: numbers separated by common delimiters
            /(?:^|\W)([1-4]?\d)[\s,\-\|]+([1-4]?\d)[\s,\-\|]+([1-4]?\d)[\s,\-\|]+([1-4]?\d)[\s,\-\|]+([1-4]?\d)[\s,\-\|]+([1-4]?\d)(?:\W|$)/gm,
            // Pattern: in table cells or spans
            /<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>\s*<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>\s*<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>\s*<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>\s*<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>\s*<(?:td|span)[^>]*>([1-4]?\d)<\/(?:td|span)>/gi
        ];
        
        for (const pattern of resultPatterns) {
            const matches = Array.from(htmlContent.matchAll(pattern));
            if (matches.length > 0) {
                console.log(`🎯 Pattern found ${matches.length} matches:`);
                matches.slice(0, 5).forEach((match, i) => {
                    const numbers = match.slice(1, 7).map(n => parseInt(n)).filter(n => n >= 1 && n <= 49);
                    if (numbers.length === 6) {
                        console.log(`   Match ${i + 1}: [${numbers.join(', ')}]`);
                        
                        // Check if this looks like a realistic TOTO combination
                        const sum = numbers.reduce((a, b) => a + b, 0);
                        const evenCount = numbers.filter(n => n % 2 === 0).length;
                        console.log(`     Sum: ${sum}, Even numbers: ${evenCount}/6`);
                        
                        if (sum >= 100 && sum <= 250 && evenCount >= 2 && evenCount <= 4) {
                            console.log(`     ✅ REALISTIC TOTO PATTERN DETECTED!`);
                        }
                    }
                });
            }
        }
        
        // Search for recent actual TOTO results patterns
        console.log('\n📊 RECENT RESULTS CONTEXT SEARCH:');
        console.log('=================================');
        
        // Look for other recent draw dates to understand the format
        const recentDates = htmlContent.match(/\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*202\d/gi);
        if (recentDates) {
            console.log(`📅 Recent dates found: ${recentDates.slice(0, 10).join(', ')}`);
        }
        
        // Try to find the specific results table structure
        const resultsTableMatch = htmlContent.match(/<table[^>]*toto[^>]*>[\s\S]*?<\/table>/gi);
        if (resultsTableMatch) {
            console.log(`📋 Found ${resultsTableMatch.length} TOTO-specific tables`);
            
            resultsTableMatch.forEach((table, index) => {
                console.log(`\n📊 TOTO TABLE ${index + 1} ANALYSIS:`);
                
                // Extract all numbers from this table
                const allNumbers = table.match(/\b([1-4]?\d)\b/g);
                if (allNumbers) {
                    const validTotoNumbers = allNumbers
                        .map(n => parseInt(n))
                        .filter(n => n >= 1 && n <= 49);
                    
                    console.log(`   🎲 Valid numbers in table: ${validTotoNumbers.join(', ')}`);
                    
                    // Look for groups of 6-7 consecutive numbers
                    for (let i = 0; i <= validTotoNumbers.length - 6; i++) {
                        const group = validTotoNumbers.slice(i, i + 7);
                        const sum = group.slice(0, 6).reduce((a, b) => a + b, 0);
                        
                        if (sum >= 100 && sum <= 250) {
                            console.log(`   🎯 Potential result ${i + 1}: [${group.slice(0, 6).join(', ')}] + ${group[6] || '?'}`);
                        }
                    }
                }
            });
        }
        
        console.log('\n🎉 ANALYSIS COMPLETE');
        console.log('===================');
        console.log('📋 Manual review of the above patterns required');
        console.log('✅ Look for the most realistic 6-number combination');
        console.log('🌐 Cross-verify with Singapore Pools website');
        console.log('📝 Add verified numbers using add_april2_verified_results.js');
        
    } catch (error) {
        console.error('❌ Error in targeted extraction:', error.message);
    }
}

// Run the targeted extraction
extractTotoNumbers();