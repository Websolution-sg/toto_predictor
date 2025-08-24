// Singapore Pools 4D Results Fetcher
// Extracts latest 4D winning results from Singapore Pools official website

const https = require('https');
const fs = require('fs');

class SingaporePools4DFetcher {
    constructor() {
        this.baseUrl = 'https://www.singaporepools.com.sg';
        this.resultsUrl = 'https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    }

    async fetch4DResults() {
        console.log('🎯 Singapore Pools 4D Results Fetcher');
        console.log('=====================================\n');
        
        try {
            console.log('🌐 Fetching from Singapore Pools...');
            const htmlContent = await this.fetchWebPage(this.resultsUrl);
            
            console.log('📄 HTML Content Length:', htmlContent.length);
            console.log('🔍 Analyzing page structure...\n');
            
            // Extract draw information
            const drawInfo = this.extractDrawInfo(htmlContent);
            console.log('📊 Draw Information:', drawInfo);
            
            // Extract winning numbers
            const winningNumbers = this.extractWinningNumbers(htmlContent);
            console.log('🎯 Winning Numbers:', winningNumbers);
            
            // Save to file for inspection
            this.saveDebugInfo(htmlContent, drawInfo, winningNumbers);
            
            return {
                drawInfo,
                winningNumbers,
                fetchTime: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error fetching 4D results:', error.message);
            throw error;
        }
    }

    fetchWebPage(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            };

            https.get(url, options, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    extractDrawInfo(html) {
        const drawPatterns = [
            /Draw No\.\s*(\d+)/i,
            /Draw\s*(\d+)/i,
            /(\d+)\s*Draw/i
        ];
        
        const datePatterns = [
            /(\d{1,2}\/\d{1,2}\/\d{4})/,
            /(\d{1,2}-\d{1,2}-\d{4})/,
            /(\w{3},?\s*\d{1,2}\s*\w{3}\s*\d{4})/i
        ];

        let drawNo = null;
        let drawDate = null;

        // Extract draw number
        for (const pattern of drawPatterns) {
            const match = html.match(pattern);
            if (match) {
                drawNo = match[1];
                break;
            }
        }

        // Extract draw date
        for (const pattern of datePatterns) {
            const match = html.match(pattern);
            if (match) {
                drawDate = match[1];
                break;
            }
        }

        return { drawNo, drawDate };
    }

    extractWinningNumbers(html) {
        const results = {
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
        };

        // Common 4D number pattern (4 digits)
        const numberPattern = /\b\d{4}\b/g;
        const allNumbers = html.match(numberPattern) || [];

        console.log('🔢 All 4-digit numbers found:', allNumbers.slice(0, 20)); // Show first 20

        // Look for specific prize sections
        const prizePatterns = {
            first: [
                /(?:1st|first)\s*(?:prize)?.*?(\d{4})/i,
                /prize\s*1.*?(\d{4})/i
            ],
            second: [
                /(?:2nd|second)\s*(?:prize)?.*?(\d{4})/i,
                /prize\s*2.*?(\d{4})/i
            ],
            third: [
                /(?:3rd|third)\s*(?:prize)?.*?(\d{4})/i,
                /prize\s*3.*?(\d{4})/i
            ]
        };

        // Extract main prizes
        for (const [prize, patterns] of Object.entries(prizePatterns)) {
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    results[prize] = match[1];
                    console.log(`🏆 ${prize.toUpperCase()} Prize found: ${match[1]}`);
                    break;
                }
            }
        }

        // Look for starter and consolation prizes
        const starterMatch = html.match(/starter.*?((?:\d{4}.*?){0,10})/i);
        const consolationMatch = html.match(/consolation.*?((?:\d{4}.*?){0,10})/i);

        if (starterMatch) {
            const starterNumbers = starterMatch[1].match(/\d{4}/g) || [];
            results.starter = starterNumbers.slice(0, 10);
            console.log('🎯 Starter prizes found:', results.starter);
        }

        if (consolationMatch) {
            const consolationNumbers = consolationMatch[1].match(/\d{4}/g) || [];
            results.consolation = consolationNumbers.slice(0, 10);
            console.log('🎪 Consolation prizes found:', results.consolation);
        }

        return results;
    }

    saveDebugInfo(html, drawInfo, winningNumbers) {
        const debugData = {
            timestamp: new Date().toISOString(),
            drawInfo,
            winningNumbers,
            htmlLength: html.length,
            sampleHtml: html.substring(0, 2000) // First 2000 characters
        };

        fs.writeFileSync('singapore-pools-debug.json', JSON.stringify(debugData, null, 2));
        console.log('💾 Debug information saved to singapore-pools-debug.json');

        // Save sample HTML for manual inspection
        fs.writeFileSync('singapore-pools-sample.html', html.substring(0, 5000));
        console.log('💾 HTML sample saved to singapore-pools-sample.html');
    }

    async updateCSV(results) {
        if (!results.winningNumbers.first) {
            console.log('⚠️  No valid winning numbers found to update CSV');
            return;
        }

        const csvFile = '4dResult.csv';
        let csvContent = '';

        try {
            csvContent = fs.readFileSync(csvFile, 'utf8');
        } catch (error) {
            console.log('📝 Creating new CSV file...');
            csvContent = 'Date,Draw,1st Prize,2nd Prize,3rd Prize,Starter 1,Starter 2,Consolation 1,Consolation 2,Consolation 3,Consolation 4,Consolation 5,Consolation 6,Consolation 7,Consolation 8,Consolation 9,Consolation 10\n';
        }

        const { drawInfo, winningNumbers } = results;
        const newRow = [
            drawInfo.drawDate || new Date().toLocaleDateString(),
            drawInfo.drawNo || 'Unknown',
            winningNumbers.first || '',
            winningNumbers.second || '',
            winningNumbers.third || '',
            ...(winningNumbers.starter.slice(0, 2).concat(['', '']).slice(0, 2)),
            ...(winningNumbers.consolation.slice(0, 10).concat(Array(10).fill('')).slice(0, 10))
        ].join(',');

        csvContent += newRow + '\n';
        fs.writeFileSync(csvFile, csvContent);
        console.log('✅ CSV updated with new results');
    }
}

// Main execution
async function main() {
    const fetcher = new SingaporePools4DFetcher();
    
    try {
        const results = await fetcher.fetch4DResults();
        
        console.log('\n🎉 EXTRACTION COMPLETE');
        console.log('======================');
        console.log('📊 Results Summary:');
        console.log(`   Draw No: ${results.drawInfo.drawNo || 'Not found'}`);
        console.log(`   Draw Date: ${results.drawInfo.drawDate || 'Not found'}`);
        console.log(`   1st Prize: ${results.winningNumbers.first || 'Not found'}`);
        console.log(`   2nd Prize: ${results.winningNumbers.second || 'Not found'}`);
        console.log(`   3rd Prize: ${results.winningNumbers.third || 'Not found'}`);
        console.log(`   Starter Prizes: ${results.winningNumbers.starter.length} found`);
        console.log(`   Consolation Prizes: ${results.winningNumbers.consolation.length} found`);
        
        // Ask if user wants to update CSV
        console.log('\n💾 Auto-updating CSV with extracted results...');
        await fetcher.updateCSV(results);
        
    } catch (error) {
        console.error('❌ Failed to extract 4D results:', error.message);
        console.log('\n🔧 TROUBLESHOOTING TIPS:');
        console.log('1. Check your internet connection');
        console.log('2. Singapore Pools website might be temporarily unavailable');
        console.log('3. The website structure might have changed');
        console.log('4. Review debug files for manual extraction');
    }
}

if (require.main === module) {
    main();
}

module.exports = SingaporePools4DFetcher;
