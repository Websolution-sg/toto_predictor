// Advanced TOTO Results Extractor
// Tries multiple methods to get latest Singapore Pools TOTO results

const https = require('https');
const fs = require('fs');

// Multiple extraction methods
async function extractTotoResults() {
    console.log('🎯 ADVANCED TOTO RESULTS EXTRACTOR');
    console.log('=====================================');
    
    const urls = [
        'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
        'https://www.singaporepools.com.sg/DataFileArchive/Winning_Numbers/TOTO/toto_result_top_draws_en.html',
        'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx'
    ];
    
    for (const url of urls) {
        console.log(`\n🔍 Trying: ${url}`);
        try {
            const content = await fetchPage(url);
            console.log(`✅ Page loaded: ${content.length} characters`);
            
            const result = await tryAllExtractionMethods(content);
            if (result) {
                console.log('\n🎯 SUCCESS! TOTO RESULTS FOUND:');
                console.log(`📅 Date: ${result.date}`);
                console.log(`🔢 Numbers: [${result.numbers.join(', ')}]`);
                console.log(`➕ Additional: ${result.additional}`);
                return result;
            }
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
    
    console.log('\n❌ No results found with any method');
    return null;
}

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function tryAllExtractionMethods(content) {
    const methods = [
        extractFromTable,
        extractFromDataAttributes,
        extractFromJSON,
        extractFromJavaScript,
        extractFromRegularPattern,
        extractFromCSVPattern,
        extractFromDrawDate
    ];
    
    for (const method of methods) {
        try {
            console.log(`  🔧 Trying method: ${method.name}`);
            const result = method(content);
            if (result && isValidTotoResult(result)) {
                console.log(`  ✅ Success with ${method.name}`);
                return result;
            }
        } catch (error) {
            console.log(`  ❌ ${method.name} failed: ${error.message}`);
        }
    }
    
    return null;
}

function extractFromTable(content) {
    // Look for HTML table structure
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tables = content.match(tableRegex) || [];
    
    for (const table of tables) {
        if (table.includes('toto') || table.includes('winning') || table.includes('result')) {
            const numberRegex = />(\d{1,2})<\/td>/g;
            const numbers = [];
            let match;
            
            while ((match = numberRegex.exec(table)) !== null) {
                const num = parseInt(match[1]);
                if (num >= 1 && num <= 49) {
                    numbers.push(num);
                }
            }
            
            if (numbers.length >= 6) {
                return {
                    date: extractDateFromTable(table),
                    numbers: numbers.slice(0, 6),
                    additional: numbers[6] || null
                };
            }
        }
    }
    return null;
}

function extractFromDataAttributes(content) {
    // Look for data- attributes
    const patterns = [
        /data-drawdate="([^"]*)"[^>]*>.*?data-numbers="([^"]*)".*?data-additional="([^"]*)"/s,
        /data-date="([^"]*)"[^>]*>.*?(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/s
    ];
    
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            if (match[2] && match[2].includes(',')) {
                const numbers = match[2].split(',').map(n => parseInt(n.trim()));
                return {
                    date: match[1],
                    numbers: numbers.slice(0, 6),
                    additional: parseInt(match[3]) || numbers[6]
                };
            } else if (match.length > 8) {
                return {
                    date: match[1],
                    numbers: [match[2], match[3], match[4], match[5], match[6], match[7]].map(n => parseInt(n)),
                    additional: parseInt(match[8])
                };
            }
        }
    }
    return null;
}

function extractFromJSON(content) {
    // Look for JSON data
    const jsonPatterns = [
        /"toto":\s*{[^}]*"numbers":\s*\[([^\]]*)\][^}]*"date":\s*"([^"]*)"/,
        /"results":\s*\[{[^}]*"numbers":\s*\[([^\]]*)\][^}]*"date":\s*"([^"]*)"/,
        /"winning":\s*{[^}]*"numbers":\s*"([^"]*)"[^}]*"date":\s*"([^"]*)"/
    ];
    
    for (const pattern of jsonPatterns) {
        const match = content.match(pattern);
        if (match) {
            const numbers = match[1].split(',').map(n => parseInt(n.trim()));
            return {
                date: match[2],
                numbers: numbers.slice(0, 6),
                additional: numbers[6] || null
            };
        }
    }
    return null;
}

function extractFromJavaScript(content) {
    // Look for JavaScript variables
    const jsPatterns = [
        /var\s+totoNumbers\s*=\s*\[([^\]]*)\]/,
        /var\s+winningNumbers\s*=\s*\[([^\]]*)\]/,
        /toto.*?=.*?\[([^\]]*)\]/i
    ];
    
    for (const pattern of jsPatterns) {
        const match = content.match(pattern);
        if (match) {
            const numbers = match[1].split(',').map(n => parseInt(n.trim()));
            if (numbers.length >= 6) {
                return {
                    date: extractDateFromContext(content, match.index),
                    numbers: numbers.slice(0, 6),
                    additional: numbers[6] || null
                };
            }
        }
    }
    return null;
}

function extractFromRegularPattern(content) {
    // Look for date followed by 6 numbers pattern
    const patterns = [
        /(19[-\/.](?:Jan|01)[-\/.](?:26|2026))[^0-9]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/,
        /(19[-\/.]01[-\/.]2026)[^0-9]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/,
        /(\d{1,2}[-\/.](?:Jan|01)[-\/.](?:26|2026))[^0-9]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/
    ];
    
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            const numbers = [match[2], match[3], match[4], match[5], match[6], match[7]].map(n => parseInt(n));
            if (numbers.every(n => n >= 1 && n <= 49)) {
                return {
                    date: match[1],
                    numbers: numbers,
                    additional: null
                };
            }
        }
    }
    return null;
}

function extractFromCSVPattern(content) {
    // Look for CSV-like patterns
    const lines = content.split(/[\r\n]+/);
    
    for (const line of lines) {
        if (line.includes('19') && (line.includes('Jan') || line.includes('01')) && line.includes('26')) {
            const numbers = line.match(/\d{1,2}/g)?.map(n => parseInt(n))?.filter(n => n >= 1 && n <= 49);
            if (numbers && numbers.length >= 6) {
                return {
                    date: '19-Jan-26',
                    numbers: numbers.slice(0, 6),
                    additional: numbers[6] || null
                };
            }
        }
    }
    return null;
}

function extractFromDrawDate(content) {
    // Look specifically for draw date patterns with numbers nearby
    const dateMatches = content.matchAll(/(19[-\/.](?:Jan|01)[-\/.](?:26|2026))/g);
    
    for (const dateMatch of dateMatches) {
        const startPos = Math.max(0, dateMatch.index - 500);
        const endPos = Math.min(content.length, dateMatch.index + 500);
        const context = content.substring(startPos, endPos);
        
        const numberMatches = context.matchAll(/(\d{1,2})/g);
        const validNumbers = Array.from(numberMatches)
            .map(m => parseInt(m[1]))
            .filter(n => n >= 1 && n <= 49);
        
        if (validNumbers.length >= 6) {
            return {
                date: dateMatch[1],
                numbers: validNumbers.slice(0, 6),
                additional: validNumbers[6] || null
            };
        }
    }
    return null;
}

function extractDateFromTable(table) {
    const datePatterns = [
        /(\d{1,2}[-\/.](?:Jan|01)[-\/.](?:26|2026))/,
        /(19[-\/.](?:Jan|01)[-\/.](?:26|2026))/
    ];
    
    for (const pattern of datePatterns) {
        const match = table.match(pattern);
        if (match) return match[1];
    }
    return '19-Jan-26'; // Default
}

function extractDateFromContext(content, position) {
    const start = Math.max(0, position - 200);
    const end = Math.min(content.length, position + 200);
    const context = content.substring(start, end);
    
    const dateMatch = context.match(/(\d{1,2}[-\/.](?:Jan|01)[-\/.](?:26|2026))/);
    return dateMatch ? dateMatch[1] : '19-Jan-26';
}

function isValidTotoResult(result) {
    if (!result || !result.numbers || result.numbers.length !== 6) {
        return false;
    }
    
    // Check if all numbers are in valid range (1-49)
    const validNumbers = result.numbers.every(n => 
        Number.isInteger(n) && n >= 1 && n <= 49
    );
    
    // Check if numbers are unique
    const uniqueNumbers = new Set(result.numbers).size === 6;
    
    return validNumbers && uniqueNumbers;
}

// Run the extractor
extractTotoResults().then(result => {
    if (result) {
        console.log('\n🎯 EXTRACTION SUCCESSFUL!');
        console.log('=====================================');
        console.log(`📅 Draw Date: ${result.date}`);
        console.log(`🔢 Winning Numbers: [${result.numbers.join(', ')}]`);
        console.log(`➕ Additional Number: ${result.additional || 'N/A'}`);
        
        // Save to file for CSV update
        const resultData = {
            date: result.date,
            numbers: result.numbers,
            additional: result.additional,
            extracted: new Date().toISOString()
        };
        
        fs.writeFileSync('latest_extraction.json', JSON.stringify(resultData, null, 2));
        console.log('\n📁 Results saved to: latest_extraction.json');
    } else {
        console.log('\n❌ EXTRACTION FAILED');
        console.log('No valid TOTO results found with any method.');
        console.log('The draw may not have occurred yet or results not published.');
    }
}).catch(error => {
    console.error('\n💥 EXTRACTION ERROR:', error.message);
});