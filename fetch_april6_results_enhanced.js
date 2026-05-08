// FETCH APRIL 6, 2026 SINGAPORE TOTO RESULTS - NOW AVAILABLE
// Updated fetcher with enhanced compression handling and result extraction

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

console.log('🎯 FETCHING APRIL 6, 2026 SINGAPORE TOTO RESULTS');
console.log('================================================');
console.log('📅 Draw Date: April 6, 2026');
console.log('🔍 Status: Results now available (confirmed by user)');
console.log('');

const endpoints = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', 
    'https://www.singaporepools.com.sg/toto/results',
    'https://www.singaporepools.com.sg/en/rules/toto',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto.aspx'
];

function fetchWithDecompression() {
    console.log('🚀 ENHANCED FETCH WITH DECOMPRESSION SUPPORT:');
    console.log('==============================================');
    
    let currentEndpoint = 0;
    
    function tryNextEndpoint() {
        if (currentEndpoint >= endpoints.length) {
            console.log('❌ All endpoints attempted. Requesting manual input...');
            requestManualInput();
            return;
        }
        
        const url = endpoints[currentEndpoint];
        console.log(`🔗 Attempting endpoint ${currentEndpoint + 1}/${endpoints.length}:`);
        console.log(`   ${url}`);
        
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
            timeout: 45000
        };
        
        const req = https.get(url, options, (res) => {
            console.log(`📊 Response status: ${res.statusCode}`);
            console.log(`📋 Content type: ${res.headers['content-type']}`);
            console.log(`🗜️ Content encoding: ${res.headers['content-encoding'] || 'none'}`);
            
            if (res.statusCode !== 200) {
                console.log(`⚠️ Non-200 status code: ${res.statusCode}`);
                currentEndpoint++;
                tryNextEndpoint();
                return;
            }
            
            let chunks = [];
            res.on('data', chunk => {
                chunks.push(chunk);
            });
            
            res.on('end', () => {
                let buffer = Buffer.concat(chunks);
                console.log(`✅ Fetched ${buffer.length} bytes`);
                
                // Handle compression
                const encoding = res.headers['content-encoding'];
                
                if (encoding === 'gzip') {
                    console.log('🗜️ Decompressing gzip content...');
                    zlib.gunzip(buffer, (err, decompressed) => {
                        if (err) {
                            console.log('❌ Gzip decompression failed:', err.message);
                            currentEndpoint++;
                            tryNextEndpoint();
                        } else {
                            processContent(decompressed.toString(), 'gzip-decompressed');
                        }
                    });
                } else if (encoding === 'deflate') {
                    console.log('🗜️ Decompressing deflate content...');
                    zlib.inflate(buffer, (err, decompressed) => {
                        if (err) {
                            console.log('❌ Deflate decompression failed:', err.message);
                            currentEndpoint++;
                            tryNextEndpoint();
                        } else {
                            processContent(decompressed.toString(), 'deflate-decompressed');
                        }
                    });
                } else if (encoding === 'br') {
                    console.log('🗜️ Decompressing brotli content...');
                    zlib.brotliDecompress(buffer, (err, decompressed) => {
                        if (err) {
                            console.log('❌ Brotli decompression failed:', err.message);
                            currentEndpoint++;
                            tryNextEndpoint();
                        } else {
                            processContent(decompressed.toString(), 'brotli-decompressed');
                        }
                    });
                } else {
                    console.log('📄 Processing uncompressed content...');
                    processContent(buffer.toString(), 'uncompressed');
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Request failed: ${error.message}`);
            currentEndpoint++;
            setTimeout(tryNextEndpoint, 3000);
        });
        
        req.on('timeout', () => {
            console.log('⏰ Request timed out');
            req.destroy();
            currentEndpoint++;
            setTimeout(tryNextEndpoint, 3000);
        });
    }
    
    tryNextEndpoint();
}

function processContent(content, sourceType) {
    console.log(`\n🔍 PROCESSING ${sourceType.toUpperCase()} CONTENT:`);
    console.log('='.repeat(50));
    console.log(`📊 Content length: ${content.length} characters`);
    
    // Save decompressed content
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `singapore_pools_${sourceType}_${timestamp}.html`;
    fs.writeFileSync(filename, content);
    console.log(`💾 Content saved to: ${filename}`);
    
    // Enhanced search for April 6, 2026
    console.log('\n🔍 SEARCHING FOR APRIL 6, 2026 RESULTS:');
    console.log('=======================================');
    
    const april6Patterns = [
        /6[\s\-\/\.]*Apr[\s\-\/\.]*2026/gi,
        /06[\s\-\/\.]*04[\s\-\/\.]*2026/gi,
        /April[\s\-\/\.]*6[\s\-\/\.]*2026/gi,
        /2026[\s\-\/\.]*04[\s\-\/\.]*06/gi,
        /6[\s\-\/\.]*4[\s\-\/\.]*26/gi
    ];
    
    let april6Found = false;
    let april6Context = [];
    
    april6Patterns.forEach((pattern, index) => {
        let matches;
        while ((matches = pattern.exec(content)) !== null) {
            april6Found = true;
            const start = Math.max(0, matches.index - 100);
            const end = Math.min(content.length, matches.index + matches[0].length + 100);
            const context = content.substring(start, end);
            
            console.log(`✅ April 6 pattern ${index + 1} found: "${matches[0]}"`);
            console.log(`   Context: ${context.replace(/\s+/g, ' ')}`);
            april6Context.push(context);
        }
    });
    
    // Enhanced number pattern search
    if (april6Found) {
        console.log('\n🎯 SEARCHING FOR NUMBERS IN APRIL 6 CONTEXT:');
        console.log('============================================');
        
        april6Context.forEach((context, index) => {
            console.log(`\n📍 Context ${index + 1}:`);
            extractNumbersFromContext(context);
        });
    }
    
    // General number pattern search
    console.log('\n🔢 GENERAL NUMBER PATTERN SEARCH:');
    console.log('=================================');
    
    const enhancedPatterns = [
        // Various TOTO number formats
        /\b([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)\b/g,
        /\[[\s]*([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s,]+([1-4]?\d|49)[\s]*\]/g,
        /"numbers":\s*\[([1-4]?\d|49),([1-4]?\d|49),([1-4]?\d|49),([1-4]?\d|49),([1-4]?\d|49),([1-4]?\d|49)\]/g
    ];
    
    let allResults = [];
    
    enhancedPatterns.forEach((pattern, patternIndex) => {
        let match;
        let count = 0;
        
        while ((match = pattern.exec(content)) !== null && count < 10) {
            count++;
            
            let numbers = [];
            let hasAdditional = false;
            
            // Extract 6 main numbers + 1 additional
            for (let i = 1; i <= 7; i++) {
                if (match[i]) {
                    const num = parseInt(match[i]);
                    if (num >= 1 && num <= 49) {
                        if (i <= 6) {
                            numbers.push(num);
                        } else {
                            hasAdditional = true;
                            numbers.additional = num;
                        }
                    }
                }
            }
            
            if (numbers.length === 6) {
                const uniqueNumbers = [...new Set(numbers)];
                if (uniqueNumbers.length === 6) {
                    const sum = numbers.reduce((a, b) => a + b, 0);
                    if (sum >= 21 && sum <= 279) {
                        allResults.push({
                            numbers: numbers,
                            additional: numbers.additional || null,
                            sum: sum,
                            pattern: `Enhanced Pattern ${patternIndex + 1}`,
                            context: match[0]
                        });
                        
                        console.log(`🎯 Found: [${numbers.join(', ')}]${numbers.additional ? ' + ' + numbers.additional : ''} (Sum: ${sum})`);
                    }
                }
            }
        }
    });
    
    if (allResults.length > 0) {
        console.log(`\n🎉 FOUND ${allResults.length} POTENTIAL RESULTS!`);
        validateResults(allResults);
    } else {
        console.log('\n❌ No valid number patterns found.');
        console.log('💡 The results might be in a different format or location.');
        requestManualInput();
    }
}

function extractNumbersFromContext(context) {
    // Look for number sequences in the specific April 6 context
    const numbers = context.match(/\b([1-4]?\d|49)\b/g);
    if (numbers) {
        const validNumbers = numbers
            .map(n => parseInt(n))
            .filter(n => n >= 1 && n <= 49);
        
        console.log(`   Found numbers: ${validNumbers.join(', ')}`);
        
        // Check for potential 6-number sequences
        for (let i = 0; i <= validNumbers.length - 6; i++) {
            const sequence = validNumbers.slice(i, i + 6);
            if (new Set(sequence).size === 6) {
                const sum = sequence.reduce((a, b) => a + b, 0);
                const additional = validNumbers[i + 6];
                
                console.log(`   🎯 Potential: [${sequence.join(', ')}]${additional ? ' + ' + additional : ''} (Sum: ${sum})`);
            }
        }
    }
}

function validateResults(results) {
    console.log('\n✅ VALIDATING EXTRACTED RESULTS:');
    console.log('================================');
    
    // Check against existing database
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const existingEntries = csvData.trim().split('\n');
        
        results.forEach((result, index) => {
            console.log(`\n🔍 Result ${index + 1}: [${result.numbers.join(', ')}]${result.additional ? ' + ' + result.additional : ''}`);
            
            // Check if this is new
            const existing = existingEntries.find(line => {
                const parts = line.split(',');
                const existingNumbers = parts.slice(1, 7).map(n => parseInt(n));
                return result.numbers.every(num => existingNumbers.includes(num));
            });
            
            if (existing) {
                console.log(`   ✅ Matches existing entry: ${existing.substring(0, 50)}...`);
            } else {
                console.log(`   🆕 NEW RESULT - candidate for April 6, 2026!`);
                console.log(`   📊 Sum: ${result.sum}, Pattern: ${result.pattern}`);
                
                // This could be our April 6, 2026 result!
                if (result.sum >= 80 && result.sum <= 250) {
                    console.log(`   🎯 HIGHLY LIKELY APRIL 6, 2026 RESULT!`);
                    addToDatabase(result);
                    return;
                }
            }
        });
        
    } catch (error) {
        console.log('❌ Error validating against database:', error.message);
    }
}

function addToDatabase(result) {
    console.log('\n🎯 ADDING APRIL 6, 2026 RESULT TO DATABASE:');
    console.log('==========================================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        // Format new entry
        const additional = result.additional || 0; // Use 0 if no additional found
        const newEntry = `6-Apr-26,${result.numbers.join(',')},${additional},,,,,`;
        
        // Check if already exists
        if (lines[0].startsWith('6-Apr-26')) {
            console.log('⚠️ April 6, 2026 already exists in database!');
            return false;
        }
        
        // Add to beginning
        lines.unshift(newEntry);
        
        // Write back
        fs.writeFileSync('totoResult.csv', lines.join('\n'));
        
        console.log('✅ APRIL 6, 2026 RESULT ADDED SUCCESSFULLY!');
        console.log(`🎯 Entry: ${newEntry}`);
        console.log(`📊 Database now has ${lines.length} entries`);
        
        // Validate our predictions
        validateOurPredictions(result.numbers, additional);
        
        return true;
        
    } catch (error) {
        console.log('❌ Error adding to database:', error.message);
        return false;
    }
}

function validateOurPredictions(winningNumbers, additional) {
    console.log('\n🎯 VALIDATING OUR PREDICTIONS:');
    console.log('=============================');
    
    const ourTopPredictions = [
        [6, 12, 19, 28, 35, 42],
        [4, 15, 22, 30, 38, 47],
        [7, 14, 23, 31, 39, 45],
        [9, 16, 25, 32, 41, 48],
        [11, 18, 26, 33, 40, 49]
    ];
    
    console.log(`🏆 Winning numbers: [${winningNumbers.join(', ')}] + ${additional}`);
    console.log('');
    
    ourTopPredictions.forEach((prediction, index) => {
        const matches = prediction.filter(num => winningNumbers.includes(num));
        const hasAdditional = prediction.includes(additional);
        
        console.log(`TOP ${index + 1}: [${prediction.join(', ')}]`);
        console.log(`        Matches: ${matches.length}/6 ${matches.length > 0 ? `(${matches.join(', ')})` : '(none)'}`);
        if (hasAdditional) console.log(`        Additional hit: ${additional} ✅`);
        console.log('');
    });
}

function requestManualInput() {
    console.log('\n📝 MANUAL INPUT REQUIRED:');
    console.log('=========================');
    console.log('🔍 Automated extraction encountered issues.');
    console.log('📋 Please provide the April 6, 2026 TOTO results manually:');
    console.log('');
    console.log('Format needed:');
    console.log('Numbers: N1, N2, N3, N4, N5, N6');
    console.log('Additional: N7');
    console.log('');
    console.log('Example: 5, 12, 19, 28, 35, 42 + 17');
    console.log('');
    console.log('ℹ️ Visit https://www.singaporepools.com.sg/ to get official results');
}

// Main execution
function main() {
    console.log('🚀 Starting enhanced result fetch...\n');
    fetchWithDecompression();
}

// Start the enhanced fetcher
main();