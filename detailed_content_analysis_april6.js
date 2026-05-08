// DETAILED ANALYSIS OF FETCHED SINGAPORE POOLS CONTENT
// Enhanced pattern matching for April 6, 2026 and latest results

const fs = require('fs');

console.log('🔍 DETAILED CONTENT ANALYSIS - April 6, 2026 Search');
console.log('==================================================');

function analyzeLatestContent() {
    try {
        // Find the most recent fetched content
        const files = fs.readdirSync('.');
        const contentFiles = files.filter(f => f.startsWith('singapore_pools_content_') && f.endsWith('.html'));
        
        if (contentFiles.length === 0) {
            console.log('❌ No Singapore Pools content files found');
            return;
        }
        
        // Sort by timestamp and get the latest
        const latestFile = contentFiles.sort().pop();
        console.log(`📄 Analyzing latest file: ${latestFile}`);
        
        const content = fs.readFileSync(latestFile, 'utf8');
        console.log(`📊 Content length: ${content.length} characters`);
        console.log('');
        
        // More comprehensive April 6, 2026 search
        console.log('🔍 SEARCHING FOR APRIL 6, 2026 PATTERNS:');
        console.log('========================================');
        
        const april6Patterns = [
            /6[\s\-\/\.]*Apr[\s\-\/\.]*2026/gi,
            /06[\s\-\/\.]*04[\s\-\/\.]*2026/gi,
            /April[\s\-\/\.]*6[\s\-\/\.]*2026/gi,
            /2026[\s\-\/\.]*04[\s\-\/\.]*06/gi,
            /6[\s\-\/\.]*4[\s\-\/\.]*26/gi,
            /Draw[\s]*\d+[\s]*6[\s]*Apr/gi
        ];
        
        let foundApril6 = false;
        april6Patterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                foundApril6 = true;
                console.log(`✅ Pattern ${index + 1} found ${matches.length} matches:`);
                matches.forEach(match => console.log(`   "${match}"`));
            }
        });
        
        if (!foundApril6) {
            console.log('❌ No April 6, 2026 specific patterns found');
        }
        console.log('');
        
        // Search for any recent dates
        console.log('📅 SEARCHING FOR RECENT DATE PATTERNS:');
        console.log('=====================================');
        
        const recentDatePatterns = [
            /\b(0?[1-9]|[12]\d|3[01])[\s\-\/\.](Apr|April|04)[\s\-\/\.](2026|26)\b/gi,
            /\b(Apr|April)[\s\-\/\.](0?[1-9]|[12]\d|3[01])[\s\-\/\.](2026|26)\b/gi,
            /\b(2026|26)[\s\-\/\.](04|Apr|April)[\s\-\/\.](0?[1-9]|[12]\d|3[01])\b/gi
        ];
        
        let recentDates = [];
        recentDatePatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                console.log(`📅 Date pattern ${index + 1} found ${matches.length} matches:`);
                matches.forEach(match => {
                    console.log(`   "${match}"`);
                    recentDates.push(match);
                });
            }
        });
        
        if (recentDates.length === 0) {
            console.log('❌ No recent April 2026 date patterns found');
        }
        console.log('');
        
        // Enhanced number pattern search
        console.log('🔢 ENHANCED NUMBER PATTERN SEARCH:');
        console.log('=================================');
        
        // Look for sequences of 6 numbers in various formats
        const enhancedNumberPatterns = [
            // Standard comma-separated
            /\b([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)\b/g,
            // Bracketed format
            /\[[\s]*([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s]*\]/g,
            // Table cell format
            /<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>[\s]*<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>[\s]*<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>[\s]*<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>[\s]*<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>[\s]*<td[^>]*>[\s]*([1-4]?\d|49)[\s]*<\/td>/gi
        ];
        
        let allPotentialNumbers = [];
        
        enhancedNumberPatterns.forEach((pattern, patternIndex) => {
            let match;
            let matchCount = 0;
            
            while ((match = pattern.exec(content)) !== null && matchCount < 20) { // Limit to prevent infinite loops
                matchCount++;
                const numbers = [];
                
                for (let i = 1; i <= 6; i++) {
                    if (match[i]) {
                        const num = parseInt(match[i]);
                        if (num >= 1 && num <= 49) {
                            numbers.push(num);
                        }
                    }
                }
                
                if (numbers.length === 6) {
                    // Check for duplicates
                    const uniqueNumbers = [...new Set(numbers)];
                    if (uniqueNumbers.length === 6) {
                        const sum = numbers.reduce((a, b) => a + b, 0);
                        if (sum >= 21 && sum <= 279) {
                            allPotentialNumbers.push({
                                numbers: numbers,
                                sum: sum,
                                pattern: `Enhanced Pattern ${patternIndex + 1}`,
                                context: match[0].substring(0, 150)
                            });
                        }
                    }
                }
            }
        });
        
        console.log(`📊 Enhanced search found ${allPotentialNumbers.length} potential number combinations`);
        
        if (allPotentialNumbers.length > 0) {
            console.log('\n🎯 ENHANCED POTENTIAL RESULTS:');
            console.log('=============================');
            
            allPotentialNumbers.forEach((result, index) => {
                console.log(`${index + 1}. [${result.numbers.join(', ')}] (Sum: ${result.sum})`);
                console.log(`   Pattern: ${result.pattern}`);
                console.log(`   Context: ${result.context.replace(/\s+/g, ' ')}...`);
                console.log('');
            });
        }
        
        // Content sampling for manual inspection
        console.log('📄 CONTENT SAMPLING FOR MANUAL INSPECTION:');
        console.log('==========================================');
        
        // Show first 1000 characters
        console.log('📝 First 1000 characters:');
        console.log(content.substring(0, 1000).replace(/\s+/g, ' '));
        console.log('\n...\n');
        
        // Show last 1000 characters
        console.log('📝 Last 1000 characters:');
        console.log(content.substring(Math.max(0, content.length - 1000)).replace(/\s+/g, ' '));
        
        // Look for specific TOTO-related keywords
        console.log('\n🔍 TOTO-RELATED KEYWORD SEARCH:');
        console.log('===============================');
        
        const keywords = ['TOTO', 'winning', 'numbers', 'draw', 'result', 'jackpot', 'prize'];
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            if (matches) {
                console.log(`✅ "${keyword}": ${matches.length} occurrences`);
            } else {
                console.log(`❌ "${keyword}": not found`);
            }
        });
        
        // Save detailed analysis
        const detailedAnalysis = {
            timestamp: new Date().toISOString(),
            filename: latestFile,
            contentLength: content.length,
            april6Found: foundApril6,
            recentDates: recentDates,
            enhancedResults: allPotentialNumbers,
            sampleContent: {
                first1000: content.substring(0, 1000),
                last1000: content.substring(Math.max(0, content.length - 1000))
            }
        };
        
        fs.writeFileSync('detailed_analysis_results.json', JSON.stringify(detailedAnalysis, null, 2));
        console.log('\n💾 Detailed analysis saved to: detailed_analysis_results.json');
        
        return detailedAnalysis;
        
    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
        return null;
    }
}

function checkCurrentStatus() {
    console.log('\n📋 CURRENT DATABASE STATUS:');
    console.log('===========================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        console.log(`📊 Total entries: ${lines.length}`);
        console.log('📅 Most recent 3 entries:');
        
        lines.slice(0, 3).forEach((line, index) => {
            const parts = line.split(',');
            const date = parts[0];
            const numbers = parts.slice(1, 7).join(', ');
            const additional = parts[7];
            console.log(`${index + 1}. ${date}: [${numbers}] + ${additional}`);
        });
        
        // Check if we need to look for April 6, 2026
        const latestDate = lines[0].split(',')[0];
        console.log(`\n🕐 Latest database date: ${latestDate}`);
        console.log('📅 Today: April 6, 2026');
        
        if (latestDate === '6-Apr-26') {
            console.log('✅ April 6, 2026 results already in database!');
        } else if (latestDate === '2-Apr-26') {
            console.log('⏳ Looking for April 6, 2026 results (not yet in database)');
        } else {
            console.log('🔍 Checking for any results newer than database');
        }
        
    } catch (error) {
        console.log(`❌ Error reading database: ${error.message}`);
    }
}

// Main execution
function main() {
    console.log('🚀 Starting detailed content analysis...\n');
    
    checkCurrentStatus();
    const analysis = analyzeLatestContent();
    
    if (analysis) {
        console.log('\n🎯 ANALYSIS SUMMARY:');
        console.log('===================');
        console.log(`📄 Content analyzed: ${analysis.contentLength} characters`);
        console.log(`📅 April 6 found: ${analysis.april6Found ? 'YES' : 'NO'}`);
        console.log(`🎯 Potential results: ${analysis.enhancedResults.length}`);
        console.log(`📅 Recent dates found: ${analysis.recentDates.length}`);
        
        if (analysis.enhancedResults.length === 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            console.log('===================');
            console.log('1. 🕐 April 6, 2026 draw may not have occurred yet');
            console.log('2. 🌐 Website structure may have changed');
            console.log('3. 🔄 Try alternative Singapore Pools endpoints');
            console.log('4. ⏰ Check again later in the day');
        } else {
            console.log('\n🎉 Found potential new results! Review detailed analysis.');
        }
        
    } else {
        console.log('❌ Analysis failed');
    }
}

// Run the detailed analysis
main();