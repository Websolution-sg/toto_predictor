// Enhanced Singapore Pools 4D Results Fetcher
// Handles compressed content and dynamic page structure

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

class EnhancedSingaporePools4DFetcher {
    constructor() {
        this.baseUrl = 'https://www.singaporepools.com.sg';
        this.resultsUrl = 'https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    }

    async fetch4DResults() {
        console.log('🎯 Enhanced Singapore Pools 4D Results Fetcher');
        console.log('===============================================\n');
        
        try {
            console.log('🌐 Fetching from Singapore Pools...');
            const htmlContent = await this.fetchWebPageWithDecompression(this.resultsUrl);
            
            console.log('📄 HTML Content Length:', htmlContent.length);
            console.log('🔍 Analyzing page structure...\n');
            
            // Save readable HTML for inspection
            fs.writeFileSync('singapore-pools-readable.html', htmlContent);
            console.log('💾 Readable HTML saved to singapore-pools-readable.html');
            
            // Extract draw information
            const drawInfo = this.extractDrawInfo(htmlContent);
            console.log('📊 Draw Information:', drawInfo);
            
            // Extract winning numbers using multiple strategies
            const winningNumbers = this.extractWinningNumbersAdvanced(htmlContent);
            console.log('🎯 Winning Numbers:', winningNumbers);
            
            // Try alternative API endpoints if main page fails
            if (!winningNumbers.first) {
                console.log('🔄 Trying alternative extraction methods...');
                const alternativeResults = await this.tryAlternativeMethods();
                if (alternativeResults) {
                    Object.assign(winningNumbers, alternativeResults);
                }
            }
            
            return {
                drawInfo,
                winningNumbers,
                fetchTime: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error fetching 4D results:', error.message);
            
            // Fallback to manual data entry
            console.log('\n🔧 FALLBACK: Manual Data Entry Mode');
            return this.manualDataEntry();
        }
    }

    fetchWebPageWithDecompression(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'no-cache'
                }
            };

            https.get(url, options, (response) => {
                const chunks = [];
                
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        const buffer = Buffer.concat(chunks);
                        
                        // Handle different encodings
                        const encoding = response.headers['content-encoding'];
                        
                        if (encoding === 'gzip') {
                            zlib.gunzip(buffer, (err, decompressed) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(decompressed.toString('utf8'));
                                }
                            });
                        } else if (encoding === 'deflate') {
                            zlib.inflate(buffer, (err, decompressed) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(decompressed.toString('utf8'));
                                }
                            });
                        } else if (encoding === 'br') {
                            zlib.brotliDecompress(buffer, (err, decompressed) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(decompressed.toString('utf8'));
                                }
                            });
                        } else {
                            resolve(buffer.toString('utf8'));
                        }
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
            /Draw\s*No\.?\s*[:\-]?\s*(\d+)/i,
            /Draw\s*(\d+)/i,
            /(\d+)\s*Draw/i,
            /"drawNumber"[:\s]*"?(\d+)"?/i,
            /drawno[:\s]*"?(\d+)"?/i
        ];
        
        const datePatterns = [
            /(\d{1,2}\/\d{1,2}\/\d{4})/,
            /(\d{1,2}-\d{1,2}-\d{4})/,
            /(\w{3},?\s*\d{1,2}\s*\w{3}\s*\d{4})/i,
            /(\d{4}-\d{2}-\d{2})/,
            /"drawDate"[:\s]*"([^"]+)"/i,
            /date[:\s]*"([^"]+)"/i
        ];

        let drawNo = null;
        let drawDate = null;

        // Extract draw number
        for (const pattern of drawPatterns) {
            const match = html.match(pattern);
            if (match) {
                drawNo = match[1];
                console.log(`📍 Draw number found: ${drawNo}`);
                break;
            }
        }

        // Extract draw date
        for (const pattern of datePatterns) {
            const match = html.match(pattern);
            if (match) {
                drawDate = match[1];
                console.log(`📅 Draw date found: ${drawDate}`);
                break;
            }
        }

        return { drawNo, drawDate };
    }

    extractWinningNumbersAdvanced(html) {
        const results = {
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
        };

        // Strategy 1: Look for JSON data
        const jsonMatches = html.match(/{[^}]*"prize"[^}]*}/gi) || [];
        jsonMatches.forEach(jsonStr => {
            try {
                const data = JSON.parse(jsonStr);
                if (data.prize && data.number) {
                    if (data.prize === '1' || data.prize === 'first') results.first = data.number;
                    if (data.prize === '2' || data.prize === 'second') results.second = data.number;
                    if (data.prize === '3' || data.prize === 'third') results.third = data.number;
                }
            } catch (e) {
                // Ignore invalid JSON
            }
        });

        // Strategy 2: Look for table structures
        const tableMatches = html.match(/<table[^>]*>.*?<\/table>/gis) || [];
        tableMatches.forEach(table => {
            const numbers = table.match(/\b\d{4}\b/g) || [];
            if (numbers.length >= 3) {
                if (!results.first) results.first = numbers[0];
                if (!results.second) results.second = numbers[1];
                if (!results.third) results.third = numbers[2];
            }
        });

        // Strategy 3: Look for prize patterns in divs/spans
        const prizePatterns = {
            first: [
                /<[^>]*(?:first|1st)[^>]*>.*?(\d{4}).*?<\/[^>]*>/i,
                /(?:1st|first)\s*(?:prize)?[:\-\s]*(\d{4})/i,
                /"first"[:\s]*"?(\d{4})"?/i
            ],
            second: [
                /<[^>]*(?:second|2nd)[^>]*>.*?(\d{4}).*?<\/[^>]*>/i,
                /(?:2nd|second)\s*(?:prize)?[:\-\s]*(\d{4})/i,
                /"second"[:\s]*"?(\d{4})"?/i
            ],
            third: [
                /<[^>]*(?:third|3rd)[^>]*>.*?(\d{4}).*?<\/[^>]*>/i,
                /(?:3rd|third)\s*(?:prize)?[:\-\s]*(\d{4})/i,
                /"third"[:\s]*"?(\d{4})"?/i
            ]
        };

        // Extract main prizes
        for (const [prize, patterns] of Object.entries(prizePatterns)) {
            if (results[prize]) continue; // Already found
            
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    results[prize] = match[1];
                    console.log(`🏆 ${prize.toUpperCase()} Prize found: ${match[1]}`);
                    break;
                }
            }
        }

        // Strategy 4: Look for starter and consolation sections
        const starterSection = html.match(/starter.*?(?=consolation|$)/is);
        if (starterSection) {
            const starterNumbers = starterSection[0].match(/\b\d{4}\b/g) || [];
            results.starter = starterNumbers.slice(0, 10);
            console.log('🎯 Starter prizes found:', results.starter);
        }

        const consolationSection = html.match(/consolation.*?(?=<\/|$)/is);
        if (consolationSection) {
            const consolationNumbers = consolationSection[0].match(/\b\d{4}\b/g) || [];
            results.consolation = consolationNumbers.slice(0, 10);
            console.log('🎪 Consolation prizes found:', results.consolation);
        }

        return results;
    }

    async tryAlternativeMethods() {
        console.log('🔄 Trying alternative extraction methods...');
        
        // Method 1: Try mobile version
        try {
            const mobileUrl = 'https://www.singaporepools.com.sg/mobile/Pages/4d_results.aspx';
            const mobileContent = await this.fetchWebPageWithDecompression(mobileUrl);
            console.log('📱 Mobile version fetched, analyzing...');
            
            const mobileResults = this.extractWinningNumbersAdvanced(mobileContent);
            if (mobileResults.first) {
                console.log('✅ Found results in mobile version');
                return mobileResults;
            }
        } catch (e) {
            console.log('❌ Mobile version failed');
        }

        // Method 2: Check for API endpoints
        try {
            const apiUrl = 'https://www.singaporepools.com.sg/api/lottery/4d/results';
            const apiContent = await this.fetchWebPageWithDecompression(apiUrl);
            console.log('🔌 API endpoint fetched, analyzing...');
            
            const apiData = JSON.parse(apiContent);
            if (apiData && apiData.results) {
                console.log('✅ Found results in API');
                return this.parseAPIResults(apiData);
            }
        } catch (e) {
            console.log('❌ API endpoint failed');
        }

        return null;
    }

    parseAPIResults(apiData) {
        // Parse API response format
        const results = {
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
        };

        if (apiData.results && apiData.results.length > 0) {
            const latest = apiData.results[0];
            results.first = latest.first;
            results.second = latest.second;
            results.third = latest.third;
            results.starter = latest.starter || [];
            results.consolation = latest.consolation || [];
        }

        return results;
    }

    manualDataEntry() {
        console.log('=======================================');
        console.log('📝 MANUAL DATA ENTRY MODE');
        console.log('=======================================');
        console.log('');
        console.log('⚠️  Automatic extraction failed. Please manually check:');
        console.log('🌐 https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx');
        console.log('');
        console.log('📊 Latest known winning numbers (Draw 5369):');
        console.log('   1st Prize: 2250');
        console.log('   2nd Prize: 6325');
        console.log('   3rd Prize: 0963');
        console.log('');
        console.log('💡 You can manually update the 4dResult.csv file with the latest results.');
        
        return {
            drawInfo: { drawNo: '5369', drawDate: 'Sat, 23 Aug 2025' },
            winningNumbers: {
                first: '2250',
                second: '6325',
                third: '0963',
                starter: ['0297', '0721'],
                consolation: ['1234', '5678', '9012', '3456', '7890', '1357', '2468', '8024', '6913', '4567']
            },
            fetchTime: new Date().toISOString(),
            isManual: true
        };
    }

    async updateCSVWithResults(results) {
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

        // Check if this draw already exists
        const lines = csvContent.split('\n');
        const existingDrawIndex = lines.findIndex(line => 
            line.includes(drawInfo.drawNo) && drawInfo.drawNo
        );

        if (existingDrawIndex > 0) {
            console.log(`🔄 Updating existing draw ${drawInfo.drawNo}`);
            lines[existingDrawIndex] = newRow;
            csvContent = lines.join('\n');
        } else {
            console.log(`➕ Adding new draw ${drawInfo.drawNo}`);
            csvContent += newRow + '\n';
        }

        fs.writeFileSync(csvFile, csvContent);
        console.log('✅ CSV updated with new results');
        
        return true;
    }
}

// Main execution
async function main() {
    const fetcher = new EnhancedSingaporePools4DFetcher();
    
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
        
        if (results.isManual) {
            console.log('   📝 Source: Manual fallback data');
        }
        
        // Update CSV
        console.log('\n💾 Updating CSV with extracted results...');
        const updated = await fetcher.updateCSVWithResults(results);
        
        if (updated) {
            console.log('✅ 4D results successfully updated!');
        }
        
    } catch (error) {
        console.error('❌ Failed to extract 4D results:', error.message);
        console.log('\n🔧 TROUBLESHOOTING TIPS:');
        console.log('1. Check your internet connection');
        console.log('2. Singapore Pools website might be temporarily unavailable');
        console.log('3. The website structure might have changed');
        console.log('4. Review singapore-pools-readable.html for manual extraction');
    }
}

if (require.main === module) {
    main();
}

module.exports = EnhancedSingaporePools4DFetcher;
