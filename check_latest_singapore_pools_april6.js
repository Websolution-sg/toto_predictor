// CHECK LATEST SINGAPORE POOLS TOTO RESULTS - April 6, 2026
// Updated fetcher to check for new results and April 6, 2026 draw

const https = require('https');
const fs = require('fs');

console.log('🌐 CHECKING LATEST SINGAPORE POOLS TOTO RESULTS');
console.log('===============================================');
console.log('📅 Current Date: April 6, 2026');
console.log('🔍 Looking for: Latest draw results and April 6, 2026 draw');
console.log('');

const endpoints = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', 
    'https://www.singaporepools.com.sg/toto/results',
    'https://www.singaporepools.com.sg/en/rules/toto',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto.aspx',
    'https://www.singaporepools.com.sg/DataFileArchive/Winning_History/toto/toto_result.aspx',
    'https://www.singaporepools.com.sg/en/pages/toto_results.aspx'
];

function fetchSingaporePools() {
    console.log('🚀 STARTING SINGAPORE POOLS DATA FETCH...');
    console.log('==========================================');
    
    let currentEndpoint = 0;
    
    function tryNextEndpoint() {
        if (currentEndpoint >= endpoints.length) {
            console.log('❌ All endpoints failed. Unable to fetch latest results.');
            return;
        }
        
        const url = endpoints[currentEndpoint];
        console.log(`🔗 Attempting endpoint ${currentEndpoint + 1}/${endpoints.length}:`);
        console.log(`   ${url}`);
        
        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 30000
        };
        
        const req = https.get(url, options, (res) => {
            console.log(`📊 Response status: ${res.statusCode}`);
            console.log(`📋 Content type: ${res.headers['content-type']}`);
            
            if (res.statusCode !== 200) {
                console.log(`⚠️ Non-200 status code: ${res.statusCode}`);
                currentEndpoint++;
                tryNextEndpoint();
                return;
            }
            
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`✅ Successfully fetched ${data.length} characters`);
                
                // Save the fetched content
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `singapore_pools_content_${timestamp}.html`;
                
                fs.writeFileSync(filename, data);
                console.log(`💾 Content saved to: ${filename}`);
                console.log('');
                
                // Analyze the content immediately
                analyzeContent(data, filename);
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Request failed: ${error.message}`);
            currentEndpoint++;
            setTimeout(tryNextEndpoint, 2000);
        });
        
        req.on('timeout', () => {
            console.log('⏰ Request timed out');
            req.destroy();
            currentEndpoint++;
            setTimeout(tryNextEndpoint, 2000);
        });
    }
    
    tryNextEndpoint();
}

function analyzeContent(content, filename) {
    console.log('🔍 ANALYZING FETCHED CONTENT FOR LATEST RESULTS:');
    console.log('===============================================');
    
    // Check for April 6, 2026 specifically
    const april6Patterns = [
        /6.{0,5}Apr.{0,5}2026/gi,
        /6.{0,5}April.{0,5}2026/gi,
        /06.{0,5}04.{0,5}2026/gi,
        /2026.{0,5}04.{0,5}06/gi
    ];
    
    let april6Found = false;
    april6Patterns.forEach(pattern => {
        if (pattern.test(content)) {
            april6Found = true;
            console.log(`✅ Found April 6, 2026 reference with pattern: ${pattern}`);
        }
    });
    
    if (!april6Found) {
        console.log('⚠️ No April 6, 2026 references found in content');
    }
    
    // Look for general TOTO result patterns
    const numberPatterns = [
        /\b([1-9]|[1-4][0-9])\b[\s,]+\b([1-9]|[1-4][0-9])\b[\s,]+\b([1-9]|[1-4][0-9])\b[\s,]+\b([1-9]|[1-4][0-9])\b[\s,]+\b([1-9]|[1-4][0-9])\b[\s,]+\b([1-9]|[1-4][0-9])\b/g,
        /\[([1-9]|[1-4][0-9]),\s*([1-9]|[1-4][0-9]),\s*([1-9]|[1-4][0-9]),\s*([1-9]|[1-4][0-9]),\s*([1-9]|[1-4][0-9]),\s*([1-9]|[1-4][0-9])\]/g
    ];
    
    console.log('🔍 Searching for TOTO number patterns...');
    
    let potentialResults = [];
    
    numberPatterns.forEach((pattern, index) => {
        let matches;
        while ((matches = pattern.exec(content)) !== null) {
            if (matches.length >= 6) {
                const numbers = [];
                for (let i = 1; i <= 6; i++) {
                    if (matches[i]) {
                        const num = parseInt(matches[i]);
                        if (num >= 1 && num <= 49) {
                            numbers.push(num);
                        }
                    }
                }
                
                if (numbers.length === 6) {
                    const sum = numbers.reduce((a, b) => a + b, 0);
                    if (sum >= 21 && sum <= 279) { // Realistic TOTO sum range
                        potentialResults.push({
                            numbers: numbers,
                            sum: sum,
                            pattern: `Pattern ${index + 1}`,
                            context: matches[0]
                        });
                    }
                }
            }
        }
    });
    
    console.log(`📊 Found ${potentialResults.length} potential TOTO number combinations`);
    
    if (potentialResults.length > 0) {
        console.log('\n🎯 POTENTIAL RESULTS FOUND:');
        console.log('===========================');
        
        potentialResults.slice(0, 10).forEach((result, index) => {
            console.log(`${index + 1}. [${result.numbers.join(', ')}] (Sum: ${result.sum}) - ${result.pattern}`);
            console.log(`   Context: ${result.context.substring(0, 100)}...`);
            console.log('');
        });
    } else {
        console.log('❌ No valid TOTO number patterns found');
    }
    
    // Check for table structures
    const tableMatches = content.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
    if (tableMatches) {
        console.log(`📋 Found ${tableMatches.length} table structures`);
        
        // Analyze first few tables for TOTO data
        tableMatches.slice(0, 3).forEach((table, index) => {
            console.log(`\n📊 Table ${index + 1} analysis:`);
            const cellMatches = table.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
            if (cellMatches) {
                console.log(`   - ${cellMatches.length} cells found`);
                
                // Look for number patterns in table cells
                cellMatches.forEach(cell => {
                    const cellText = cell.replace(/<[^>]*>/g, '').trim();
                    if (/^\d{1,2}$/.test(cellText)) {
                        const num = parseInt(cellText);
                        if (num >= 1 && num <= 49) {
                            console.log(`   - Potential TOTO number: ${num}`);
                        }
                    }
                });
            }
        });
    }
    
    // Save analysis results
    const analysis = {
        timestamp: new Date().toISOString(),
        filename: filename,
        contentLength: content.length,
        april6Found: april6Found,
        potentialResults: potentialResults,
        tableCount: tableMatches ? tableMatches.length : 0
    };
    
    fs.writeFileSync('latest_analysis_results.json', JSON.stringify(analysis, null, 2));
    console.log('\n💾 Analysis results saved to: latest_analysis_results.json');
    
    // Check against our database
    checkAgainstDatabase(potentialResults);
}

function checkAgainstDatabase(potentialResults) {
    console.log('\n🔍 CHECKING AGAINST CURRENT DATABASE:');
    console.log('====================================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        console.log(`📊 Current database entries: ${lines.length}`);
        console.log(`📅 Latest entry: ${lines[0]}`);
        
        // Check if any potential results are new
        const existingResults = lines.map(line => {
            const parts = line.split(',');
            return parts.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b);
        });
        
        potentialResults.forEach(result => {
            const sortedNumbers = [...result.numbers].sort((a, b) => a - b);
            const exists = existingResults.some(existing => 
                existing.length === 6 && 
                existing.every((num, index) => num === sortedNumbers[index])
            );
            
            if (!exists) {
                console.log(`🆕 NEW POTENTIAL RESULT: [${result.numbers.join(', ')}] (Sum: ${result.sum})`);
            } else {
                console.log(`✅ Known result: [${result.numbers.join(', ')}]`);
            }
        });
        
    } catch (error) {
        console.log(`❌ Error reading database: ${error.message}`);
    }
}

// Main execution
function main() {
    console.log('🚀 Starting latest Singapore Pools check...\n');
    fetchSingaporePools();
}

// Run the fetcher
main();