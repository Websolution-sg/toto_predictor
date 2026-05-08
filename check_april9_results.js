// CHECK LATEST SINGAPORE POOLS TOTO RESULTS - April 9, 2026
// Enhanced fetcher to check for April 9, 2026 draw results and validate predictions

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

console.log('🌐 CHECKING LATEST SINGAPORE POOLS TOTO RESULTS');
console.log('===============================================');
console.log('📅 Current Date: April 9, 2026');
console.log('🎯 Looking for: April 9, 2026 TOTO draw results');
console.log('📊 Database Status: 177 entries (last: April 6, 2026)');
console.log('');

function fetchLatestResults() {
    console.log('🚀 FETCHING SINGAPORE POOLS DATA:');
    console.log('=================================');
    
    const url = 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx';
    console.log(`🔗 Endpoint: ${url}`);
    
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        timeout: 30000
    };
    
    const req = https.get(url, options, (res) => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Content-Type: ${res.headers['content-type']}`);
        console.log(`🗜️ Encoding: ${res.headers['content-encoding'] || 'none'}`);
        
        if (res.statusCode !== 200) {
            console.log(`❌ Failed with status: ${res.statusCode}`);
            return;
        }
        
        let chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        
        res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log(`✅ Received: ${buffer.length} bytes`);
            
            // Handle decompression
            const encoding = res.headers['content-encoding'];
            
            if (encoding === 'gzip') {
                console.log('🗜️ Decompressing gzip...');
                zlib.gunzip(buffer, (err, decompressed) => {
                    if (err) {
                        console.log('❌ Decompression error:', err.message);
                    } else {
                        console.log(`📄 Decompressed: ${decompressed.length} characters`);
                        analyzeContent(decompressed.toString());
                    }
                });
            } else {
                console.log('📄 Processing uncompressed content...');
                analyzeContent(buffer.toString());
            }
        });
    });
    
    req.on('error', error => {
        console.log(`❌ Request error: ${error.message}`);
    });
    
    req.on('timeout', () => {
        console.log('⏰ Request timeout');
        req.destroy();
    });
}

function analyzeContent(content) {
    console.log('\n🔍 ANALYZING CONTENT FOR LATEST RESULTS:');
    console.log('========================================');
    
    // Save content
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `singapore_pools_${timestamp}.html`;
    fs.writeFileSync(filename, content);
    console.log(`💾 Content saved: ${filename}`);
    console.log(`📊 Length: ${content.length} characters`);
    
    // Search for April 9, 2026 patterns
    console.log('\n📅 SEARCHING FOR APRIL 9, 2026:');
    console.log('===============================');
    
    const april9Patterns = [
        /9[\s\-\/\.]*Apr[\s\-\/\.]*2026/gi,
        /09[\s\-\/\.]*04[\s\-\/\.]*2026/gi,
        /April[\s\-\/\.]*9[\s\-\/\.]*2026/gi,
        /Wed[\s,]*09[\s]*Apr[\s]*2026/gi,
        /2026[\s\-\/\.]*04[\s\-\/\.]*09/gi
    ];
    
    let april9Found = false;
    let april9Context = [];
    
    april9Patterns.forEach((pattern, index) => {
        let matches;
        while ((matches = pattern.exec(content)) !== null) {
            april9Found = true;
            const context = content.substring(
                Math.max(0, matches.index - 150),
                Math.min(content.length, matches.index + matches[0].length + 150)
            );
            
            console.log(`✅ April 9 pattern found: "${matches[0]}"`);
            console.log(`   Context: ${context.replace(/\s+/g, ' ')}`);
            april9Context.push(context);
        }
    });
    
    if (!april9Found) {
        console.log('❌ No April 9, 2026 patterns found');
        
        // Check for other recent dates
        console.log('\n📅 SEARCHING FOR OTHER RECENT DATES:');
        console.log('====================================');
        
        const recentPatterns = [
            /\d{1,2}[\s]*Apr[\s]*2026/gi,
            /Apr[\s]*\d{1,2}[\s]*2026/gi,
            /2026[\s\-\/\.]*04[\s\-\/\.]*\d{1,2}/gi
        ];
        
        let otherDates = [];
        recentPatterns.forEach(pattern => {
            let matches;
            while ((matches = pattern.exec(content)) !== null) {
                if (!otherDates.includes(matches[0])) {
                    otherDates.push(matches[0]);
                    console.log(`📅 Found date: "${matches[0]}"`);
                }
            }
        });
        
        if (otherDates.length === 0) {
            console.log('❌ No recent April 2026 dates found');
        }
    }
    
    // Search for TOTO number patterns
    console.log('\n🔢 SEARCHING FOR TOTO RESULTS:');
    console.log('==============================');
    
    const numberPatterns = [
        // HTML table format (most reliable)
        /<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*class='win\d+'[^>]*>(\d{1,2})<\/td>/gi,
        
        // Simple table cell format
        /<td[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*>(\d{1,2})<\/td>[\s]*<td[^>]*>(\d{1,2})<\/td>/gi,
        
        // Array/bracket format
        /\[(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2})\]/g,
        
        // Comma-separated format
        /(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2})/g
    ];
    
    let potentialResults = [];
    
    numberPatterns.forEach((pattern, patternIndex) => {
        let match;
        let matchCount = 0;
        
        while ((match = pattern.exec(content)) !== null && matchCount < 15) {
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
            
            if (numbers.length === 6 && new Set(numbers).size === 6) {
                const sum = numbers.reduce((a, b) => a + b, 0);
                if (sum >= 21 && sum <= 294) {
                    
                    // Look for additional number in surrounding context
                    const contextStart = Math.max(0, match.index - 200);
                    const contextEnd = Math.min(content.length, match.index + 400);
                    const surroundingContext = content.substring(contextStart, contextEnd);
                    
                    const additionalMatch = surroundingContext.match(/additional[\s:]*(\d{1,2})/i) ||
                                          surroundingContext.match(/\+[\s]*(\d{1,2})/);
                    
                    const additional = additionalMatch ? parseInt(additionalMatch[1]) : null;
                    
                    potentialResults.push({
                        numbers: numbers,
                        additional: (additional && additional >= 1 && additional <= 49) ? additional : null,
                        sum: sum,
                        pattern: `Pattern ${patternIndex + 1}`,
                        context: match[0],
                        fullContext: surroundingContext
                    });
                    
                    console.log(`🎯 Potential: [${numbers.join(', ')}]${additional ? ' + ' + additional : ''} (Sum: ${sum})`);
                    console.log(`   Pattern: ${patternIndex + 1}, Context: "${match[0].substring(0, 100)}..."`);
                }
            }
        }
    });
    
    if (potentialResults.length > 0) {
        console.log(`\n✅ FOUND ${potentialResults.length} POTENTIAL RESULTS`);
        validateResults(potentialResults);
    } else {
        console.log('\n❌ NO TOTO RESULTS FOUND');
        console.log('💡 Possible reasons:');
        console.log('   1. April 9, 2026 draw has not occurred yet');
        console.log('   2. Results not published online yet');
        console.log('   3. Different website structure or format');
        
        showContentSample(content);
    }
}

function validateResults(results) {
    console.log('\n🔍 VALIDATING AGAINST DATABASE:');
    console.log('===============================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        console.log(`📊 Current database: ${lines.length} entries`);
        console.log(`📅 Latest: ${lines[0]}`);
        
        let newResults = [];
        
        results.forEach((result, index) => {
            console.log(`\n🔍 Result ${index + 1}: [${result.numbers.join(', ')}]${result.additional ? ' + ' + result.additional : ''}`);
            
            // Check if exists in database
            const exists = lines.some(line => {
                const parts = line.split(',');
                const existingNumbers = parts.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b);
                const resultNumbers = [...result.numbers].sort((a, b) => a - b);
                
                return existingNumbers.length === 6 && 
                       existingNumbers.every((num, idx) => num === resultNumbers[idx]);
            });
            
            if (!exists) {
                console.log(`   🆕 NEW RESULT!`);
                console.log(`   📊 Sum: ${result.sum}, Even/Odd: ${result.numbers.filter(n => n % 2 === 0).length}/${result.numbers.filter(n => n % 2 === 1).length}`);
                
                // Validate if this could be April 9, 2026
                if (result.sum >= 60 && result.sum <= 250) {
                    newResults.push(result);
                }
            } else {
                console.log(`   ✅ Already in database`);
            }
        });
        
        if (newResults.length > 0) {
            console.log(`\n🎉 Found ${newResults.length} new result(s) - likely April 9, 2026!`);
            processNewResults(newResults);
        } else {
            console.log('\n⏳ No new results found - April 9, 2026 may not be available yet');
        }
        
    } catch (error) {
        console.log(`❌ Database error: ${error.message}`);
    }
}

function processNewResults(newResults) {
    console.log('\n📝 PROCESSING NEW RESULTS:');
    console.log('==========================');
    
    // Assume the first new result is April 9, 2026
    const april9Result = newResults[0];
    
    console.log(`🎯 April 9, 2026 Result: [${april9Result.numbers.join(', ')}]${april9Result.additional ? ' + ' + april9Result.additional : ''}`);
    console.log(`📊 Sum: ${april9Result.sum}, Pattern: ${april9Result.pattern}`);
    
    // Add to database
    addToDatabase(april9Result);
    
    // Validate our predictions
    validateOurPredictions(april9Result);
}

function addToDatabase(result) {
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        // Create backup
        const backupName = `totoResult_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        fs.writeFileSync(backupName, csvData);
        
        // Add new entry
        const additional = result.additional || 0;
        const newEntry = `9-Apr-26,${result.numbers.join(',')},${additional},,,,,`;
        
        lines.unshift(newEntry);
        
        fs.writeFileSync('totoResult.csv', lines.join('\n'));
        
        console.log('\n✅ APRIL 9, 2026 ADDED TO DATABASE!');
        console.log(`🎯 Entry: ${newEntry}`);
        console.log(`📊 Database: ${lines.length} entries`);
        console.log(`💾 Backup: ${backupName}`);
        
    } catch (error) {
        console.log(`❌ Database update error: ${error.message}`);
    }
}

function validateOurPredictions(result) {
    console.log('\n🎯 VALIDATING OUR APRIL 9, 2026 PREDICTIONS:');
    console.log('===========================================');
    
    const ourPredictions = [
        // TOP 5 ELITE
        { name: 'TOP 1', numbers: [7, 16, 22, 33, 42, 47], tier: 'ELITE' },
        { name: 'TOP 2', numbers: [2, 11, 19, 28, 35, 44], tier: 'ELITE' },
        { name: 'TOP 3', numbers: [5, 13, 24, 31, 38, 46], tier: 'ELITE' },
        { name: 'TOP 4', numbers: [9, 18, 25, 32, 40, 49], tier: 'ELITE' },
        { name: 'TOP 5', numbers: [6, 15, 21, 27, 36, 43], tier: 'ELITE' },
        
        // PREMIUM (first 5 for validation)
        { name: 'PREMIUM 1', numbers: [3, 10, 17, 26, 34, 41], tier: 'PREMIUM' },
        { name: 'PREMIUM 2', numbers: [8, 12, 20, 29, 37, 45], tier: 'PREMIUM' },
        { name: 'PREMIUM 3', numbers: [14, 22, 30, 33, 39, 46], tier: 'PREMIUM' },
        { name: 'PREMIUM 4', numbers: [4, 15, 23, 28, 35, 48], tier: 'PREMIUM' },
        { name: 'PREMIUM 5', numbers: [1, 11, 18, 25, 38, 44], tier: 'PREMIUM' }
    ];
    
    const winningNumbers = result.numbers;
    const additional = result.additional || 0;
    
    console.log(`🏆 Winning: [${winningNumbers.join(', ')}]${additional ? ' + ' + additional : ''}`);
    console.log('');
    
    let bestMatch = { name: '', matches: 0, hasAdditional: false, tier: '' };
    let totalMatches = 0;
    let eliteMatches = 0;
    
    ourPredictions.forEach(prediction => {
        const matches = prediction.numbers.filter(num => winningNumbers.includes(num));
        const hasAdditional = prediction.numbers.includes(additional);
        
        totalMatches += matches.length;
        if (prediction.tier === 'ELITE') eliteMatches += matches.length;
        
        console.log(`${prediction.name}: [${prediction.numbers.join(', ')}]`);
        console.log(`   ${matches.length}/6 matches${matches.length > 0 ? ` (${matches.join(', ')})` : ' (none)'}`);
        if (hasAdditional) console.log(`   ⭐ Additional hit: ${additional} ✅`);
        
        if (matches.length > bestMatch.matches || (matches.length === bestMatch.matches && hasAdditional)) {
            bestMatch = { name: prediction.name, matches: matches.length, hasAdditional, tier: prediction.tier };
        }
        console.log('');
    });
    
    console.log('📊 PERFORMANCE SUMMARY:');
    console.log('=======================');
    console.log(`🏆 Best performer: ${bestMatch.name} (${bestMatch.tier})`);
    console.log(`🎯 Best result: ${bestMatch.matches}/6 matches${bestMatch.hasAdditional ? ' + Additional' : ''}`);
    console.log(`📈 Elite average: ${(eliteMatches / 5).toFixed(1)} matches per prediction`);
    console.log(`📊 Overall average: ${(totalMatches / ourPredictions.length).toFixed(1)} matches per prediction`);
    
    if (bestMatch.matches >= 3) {
        console.log('🎉 EXCELLENT! 3+ matches achieved!');
    } else if (bestMatch.matches >= 2) {
        console.log('✅ GOOD! 2+ matches achieved!');
    } else {
        console.log('📝 Results logged for algorithm enhancement');
    }
}

function showContentSample(content) {
    console.log('\n📄 CONTENT SAMPLE FOR REVIEW:');
    console.log('==============================');
    
    // Look for TOTO-related sections
    const totoMatches = content.match(/toto|result|winning|draw/gi);
    if (totoMatches) {
        console.log(`📊 Found ${totoMatches.length} TOTO-related references`);
    }
    
    // Show first 500 characters
    console.log('📝 Content preview:');
    console.log(content.substring(0, 500).replace(/\s+/g, ' ') + '...');
}

// Main execution
function main() {
    console.log('🚀 Checking for April 9, 2026 results...\n');
    fetchLatestResults();
}

// Start the check
main();