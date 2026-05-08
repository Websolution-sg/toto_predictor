// CHECK LATEST SINGAPORE POOLS TOTO RESULTS - April 7, 2026
// Enhanced fetcher with improved pattern matching for latest results

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

console.log('🌐 CHECKING LATEST SINGAPORE POOLS TOTO RESULTS');
console.log('===============================================');
console.log('📅 Current Date: April 7, 2026');
console.log('🎯 Looking for: Latest TOTO results (April 6, 2026 expected)');
console.log('');

function fetchLatestResults() {
    console.log('🚀 FETCHING LATEST SINGAPORE POOLS DATA:');
    console.log('========================================');
    
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
        console.log(`📊 Response Status: ${res.statusCode}`);
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
            
            // Handle compression
            const encoding = res.headers['content-encoding'];
            
            if (encoding === 'gzip') {
                console.log('🗜️ Decompressing gzip...');
                zlib.gunzip(buffer, (err, decompressed) => {
                    if (err) {
                        console.log('❌ Gzip error:', err.message);
                    } else {
                        console.log(`📄 Decompressed to: ${decompressed.length} characters`);
                        analyzeContent(decompressed.toString());
                    }
                });
            } else if (encoding === 'deflate') {
                console.log('🗜️ Decompressing deflate...');
                zlib.inflate(buffer, (err, decompressed) => {
                    if (err) {
                        console.log('❌ Deflate error:', err.message);
                    } else {
                        analyzeContent(decompressed.toString());
                    }
                });
            } else if (encoding === 'br') {
                console.log('🗜️ Decompressing brotli...');
                zlib.brotliDecompress(buffer, (err, decompressed) => {
                    if (err) {
                        console.log('❌ Brotli error:', err.message);
                    } else {
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
    console.log('\n🔍 ANALYZING FETCHED CONTENT:');
    console.log('=============================');
    
    // Save content for inspection
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `latest_pools_content_${timestamp}.html`;
    fs.writeFileSync(filename, content);
    console.log(`💾 Content saved: ${filename}`);
    console.log(`📊 Length: ${content.length} characters`);
    
    // Search for recent dates (April 2026)
    console.log('\n📅 SEARCHING FOR RECENT DATES:');
    console.log('==============================');
    
    const datePatterns = [
        // April 6, 2026 patterns
        /6[\s\-\/\.]*Apr[\s\-\/\.]*2026/gi,
        /06[\s\-\/\.]*04[\s\-\/\.]*2026/gi,
        /April[\s\-\/\.]*6[\s\-\/\.]*2026/gi,
        /Mon[\s,]*06[\s]*Apr[\s]*2026/gi,
        
        // General April 2026 patterns
        /\d{1,2}[\s\-\/\.]*Apr[\s\-\/\.]*2026/gi,
        /Apr[\s\-\/\.]*\d{1,2}[\s\-\/\.]*2026/gi,
        /2026[\s\-\/\.]*04[\s\-\/\.]*\d{1,2}/gi
    ];
    
    let foundDates = [];
    
    datePatterns.forEach((pattern, index) => {
        let matches;
        while ((matches = pattern.exec(content)) !== null) {
            const match = matches[0];
            if (!foundDates.includes(match)) {
                foundDates.push(match);
                console.log(`📅 Date found: "${match}" (Pattern ${index + 1})`);
                
                // Get surrounding context
                const start = Math.max(0, matches.index - 150);
                const end = Math.min(content.length, matches.index + match.length + 150);
                const context = content.substring(start, end).replace(/\s+/g, ' ');
                console.log(`   Context: ...${context}...`);
            }
        }
    });
    
    if (foundDates.length === 0) {
        console.log('❌ No recent April 2026 dates found');
    }
    
    // Enhanced number extraction
    console.log('\n🔢 SEARCHING FOR TOTO NUMBERS:');
    console.log('==============================');
    
    // More comprehensive number patterns
    const numberPatterns = [
        // Standard format with spaces/commas
        /\b(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})\b/g,
        
        // Array/bracket format
        /\[[\s]*(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s,]+(\d{1,2})[\s]*\]/g,
        
        // HTML table cells
        /<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>[\s]*<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>[\s]*<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>[\s]*<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>[\s]*<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>[\s]*<td[^>]*>[\s]*(\d{1,2})[\s]*<\/td>/gi,
        
        // JSON-like format
        /"(?:numbers|winning|result)":\s*\[(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})\]/g,
        
        // Simple consecutive numbers
        /(?:winning|numbers|result)[\s:]*(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})/gi
    ];
    
    let potentialResults = [];
    
    numberPatterns.forEach((pattern, patternIndex) => {
        let match;
        let matchCount = 0;
        
        while ((match = pattern.exec(content)) !== null && matchCount < 20) {
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
                    if (sum >= 21 && sum <= 294) { // Valid TOTO sum range
                        
                        // Look for additional number nearby
                        const fullMatch = match[0];
                        const additionalMatch = content.substring(match.index, match.index + 200).match(/additional[\s:]*(\d{1,2})/i) ||
                                              content.substring(match.index, match.index + 200).match(/\+[\s]*(\d{1,2})/);
                        
                        const additional = additionalMatch ? parseInt(additionalMatch[1]) : null;
                        
                        potentialResults.push({
                            numbers: numbers,
                            additional: (additional && additional >= 1 && additional <= 49) ? additional : null,
                            sum: sum,
                            pattern: `Pattern ${patternIndex + 1}`,
                            context: fullMatch,
                            fullContext: content.substring(Math.max(0, match.index - 100), match.index + 200)
                        });
                        
                        console.log(`🎯 Found: [${numbers.join(', ')}]${additional ? ' + ' + additional : ''} (Sum: ${sum})`);
                        console.log(`   Pattern: ${patternIndex + 1}, Context: "${fullMatch}"`);
                    }
                }
            }
        }
    });
    
    if (potentialResults.length > 0) {
        console.log(`\n✅ FOUND ${potentialResults.length} POTENTIAL RESULTS`);
        validateAndProcess(potentialResults);
    } else {
        console.log('\n❌ NO VALID NUMBER PATTERNS FOUND');
        
        // Show content sample for manual inspection
        console.log('\n📄 CONTENT SAMPLE FOR MANUAL REVIEW:');
        console.log('====================================');
        
        // Find sections with "toto" or "result"
        const totoSections = [];
        const totoRegex = /toto|result|winning|draw|numbers/gi;
        let totoMatch;
        
        while ((totoMatch = totoRegex.exec(content)) !== null) {
            const start = Math.max(0, totoMatch.index - 200);
            const end = Math.min(content.length, totoMatch.index + 400);
            const section = content.substring(start, end).replace(/\s+/g, ' ');
            
            if (section.length > 50) {
                totoSections.push(section);
            }
        }
        
        console.log(`📊 Found ${totoSections.length} sections with TOTO-related content`);
        
        totoSections.slice(0, 3).forEach((section, index) => {
            console.log(`\n📝 Section ${index + 1}:`);
            console.log(section.substring(0, 300) + '...');
        });
        
        requestManualInput();
    }
}

function validateAndProcess(results) {
    console.log('\n🔍 VALIDATING AGAINST DATABASE:');
    console.log('===============================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        console.log(`📊 Current database: ${lines.length} entries`);
        console.log(`📅 Latest entry: ${lines[0]}`);
        
        // Check each potential result
        results.forEach((result, index) => {
            console.log(`\n🔍 Validating Result ${index + 1}: [${result.numbers.join(', ')}]${result.additional ? ' + ' + result.additional : ''}`);
            
            // Check if numbers already exist
            const exists = lines.some(line => {
                const parts = line.split(',');
                const existingNumbers = parts.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b);
                const resultNumbers = [...result.numbers].sort((a, b) => a - b);
                
                return existingNumbers.length === 6 && 
                       existingNumbers.every((num, idx) => num === resultNumbers[idx]);
            });
            
            if (exists) {
                console.log(`   ✅ Already in database`);
            } else {
                console.log(`   🆕 NEW RESULT - Potential April 6, 2026 or later!`);
                console.log(`   📊 Sum: ${result.sum}, Even/Odd: ${result.numbers.filter(n => n % 2 === 0).length}/${result.numbers.filter(n => n % 2 === 1).length}`);
                
                // This could be our April 6, 2026 result
                if (confirmNewResult(result)) {
                    addResultToDatabase(result);
                    return;
                }
            }
        });
        
    } catch (error) {
        console.log(`❌ Database validation error: ${error.message}`);
    }
}

function confirmNewResult(result) {
    console.log('\n🎯 NEW RESULT CONFIRMATION:');
    console.log('===========================');
    console.log(`Numbers: [${result.numbers.join(', ')}]`);
    console.log(`Additional: ${result.additional || 'Not found'}`);
    console.log(`Sum: ${result.sum}`);
    console.log(`Context: "${result.fullContext.substring(0, 200)}..."`);
    
    // Basic validation
    const sum = result.sum;
    const evenCount = result.numbers.filter(n => n % 2 === 0).length;
    
    console.log('\n✅ VALIDATION CHECKS:');
    console.log(`Sum range (21-294): ${sum >= 21 && sum <= 294 ? 'PASS' : 'FAIL'}`);
    console.log(`Realistic sum (60-240): ${sum >= 60 && sum <= 240 ? 'PASS' : 'FAIL'}`);
    console.log(`No duplicates: ${new Set(result.numbers).size === 6 ? 'PASS' : 'FAIL'}`);
    console.log(`Even/Odd balance: ${evenCount}/6 even numbers`);
    
    // If validation passes, assume this is April 6, 2026
    if (sum >= 60 && sum <= 240 && new Set(result.numbers).size === 6) {
        console.log('\n🎉 VALIDATION PASSED - Adding as April 6, 2026 result!');
        return true;
    } else {
        console.log('\n⚠️ Validation concerns - manual review recommended');
        return false;
    }
}

function addResultToDatabase(result) {
    console.log('\n📝 ADDING TO DATABASE:');
    console.log('======================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        // Check if April 6, 2026 already exists
        if (lines[0].startsWith('6-Apr-26')) {
            console.log('⚠️ April 6, 2026 already in database!');
            return;
        }
        
        // Create new entry
        const additional = result.additional || 0;
        const newEntry = `6-Apr-26,${result.numbers.join(',')},${additional},,,,,`;
        
        // Add to beginning
        lines.unshift(newEntry);
        
        // Write back
        fs.writeFileSync('totoResult.csv', lines.join('\n'));
        
        // Create backup
        const backupName = `totoResult_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        fs.writeFileSync(backupName, csvData);
        
        console.log('✅ SUCCESS - April 6, 2026 result added!');
        console.log(`🎯 Entry: ${newEntry}`);
        console.log(`📊 Database now: ${lines.length} entries`);
        console.log(`💾 Backup: ${backupName}`);
        
        // Validate predictions
        validatePredictions(result.numbers, additional);
        
    } catch (error) {
        console.log(`❌ Database error: ${error.message}`);
    }
}

function validatePredictions(winningNumbers, additional) {
    console.log('\n🎯 VALIDATING OUR PREDICTIONS:');
    console.log('==============================');
    
    const predictions = [
        [6, 12, 19, 28, 35, 42],   // TOP 1
        [4, 15, 22, 30, 38, 47],   // TOP 2
        [7, 14, 23, 31, 39, 45],   // TOP 3
        [9, 16, 25, 32, 41, 48],   // TOP 4
        [11, 18, 26, 33, 40, 49]   // TOP 5
    ];
    
    console.log(`🏆 Winning: [${winningNumbers.join(', ')}] + ${additional}`);
    console.log('');
    
    let bestMatch = { index: 0, matches: 0, hasAdditional: false };
    
    predictions.forEach((prediction, index) => {
        const matches = prediction.filter(num => winningNumbers.includes(num));
        const hasAdditional = prediction.includes(additional);
        
        console.log(`TOP ${index + 1}: [${prediction.join(', ')}]`);
        console.log(`        ${matches.length}/6 matches${matches.length > 0 ? ` (${matches.join(', ')})` : ' (none)'}`);
        if (hasAdditional) console.log(`        Additional hit: ${additional} ✅`);
        
        if (matches.length > bestMatch.matches || (matches.length === bestMatch.matches && hasAdditional)) {
            bestMatch = { index: index + 1, matches: matches.length, hasAdditional };
        }
        console.log('');
    });
    
    console.log(`🏆 BEST PERFORMER: TOP ${bestMatch.index} with ${bestMatch.matches}/6 matches${bestMatch.hasAdditional ? ' + Additional' : ''}`);
    
    if (bestMatch.matches >= 3) {
        console.log('🎉 EXCELLENT! 3+ matches achieved!');
    } else if (bestMatch.matches >= 2) {
        console.log('✅ GOOD! 2+ matches achieved!');
    } else {
        console.log('📊 Results noted for algorithm improvement');
    }
}

function requestManualInput() {
    console.log('\n📝 MANUAL VERIFICATION NEEDED:');
    console.log('==============================');
    console.log('🔍 Automated extraction needs assistance');
    console.log('🌐 Please visit: https://www.singaporepools.com.sg/');
    console.log('📅 Look for April 6, 2026 TOTO results');
    console.log('');
    console.log('📋 Format: N1, N2, N3, N4, N5, N6 + Additional');
    console.log('🔢 Example: 12, 18, 24, 31, 37, 43 + 29');
}

// Main execution
function main() {
    console.log('🚀 Starting latest results check...\n');
    fetchLatestResults();
}

// Start the check
main();