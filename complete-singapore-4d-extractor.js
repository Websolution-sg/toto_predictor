// Complete Singapore Pools 4D Results Extractor
// Fetches latest 4D winning numbers from Singapore Pools official website

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

class CompleteSingapore4DExtractor {
    constructor() {
        this.baseUrl = 'https://www.singaporepools.com.sg';
        this.dataPath = '/DataFileArchive/Lottery/Output/';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    }

    async extractLatest4DResults() {
        console.log('🎯 Complete Singapore Pools 4D Results Extractor');
        console.log('=================================================\n');
        
        try {
            // Step 1: Fetch the latest data from Singapore Pools
            console.log('📡 Fetching latest 4D data from Singapore Pools...');
            const topDrawsUrl = `${this.baseUrl}${this.dataPath}fourd_result_top_draws_en.html`;
            
            const content = await this.fetchWebContent(topDrawsUrl);
            console.log(`✅ Data fetched successfully (${content.length} chars)`);
            
            // Step 2: Parse the results
            console.log('🔍 Parsing 4D results...');
            const results = this.parseLatestResults(content);
            
            if (results) {
                console.log('\n🎉 LATEST 4D RESULTS EXTRACTED!');
                console.log('================================');
                console.log(`📅 Draw Date: ${results.drawDate}`);
                console.log(`🎯 Draw Number: ${results.drawNo}`);
                console.log(`🥇 1st Prize: ${results.first}`);
                console.log(`🥈 2nd Prize: ${results.second}`);
                console.log(`🥉 3rd Prize: ${results.third}`);
                console.log(`🎯 Starter Prizes (${results.starter.length}): ${results.starter.join(', ')}`);
                console.log(`🎪 Consolation Prizes (${results.consolation.length}): ${results.consolation.join(', ')}`);
                
                // Step 3: Update CSV file
                console.log('\n💾 Updating CSV file...');
                await this.updateCSVFile(results);
                
                // Step 4: Update 4D predictor HTML
                console.log('\n🔄 Updating 4D predictor interface...');
                await this.update4DPredictorHTML(results);
                
                return results;
            } else {
                console.log('❌ No valid results found');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error extracting 4D results:', error.message);
            throw error;
        }
    }

    fetchWebContent(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx',
                    'Connection': 'keep-alive'
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
                        const encoding = response.headers['content-encoding'];
                        
                        if (encoding === 'gzip') {
                            zlib.gunzip(buffer, (err, decompressed) => {
                                if (err) reject(err);
                                else resolve(decompressed.toString('utf8'));
                            });
                        } else if (encoding === 'deflate') {
                            zlib.inflate(buffer, (err, decompressed) => {
                                if (err) reject(err);
                                else resolve(decompressed.toString('utf8'));
                            });
                        } else if (encoding === 'br') {
                            zlib.brotliDecompress(buffer, (err, decompressed) => {
                                if (err) reject(err);
                                else resolve(decompressed.toString('utf8'));
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

    parseLatestResults(content) {
        // Extract the first (latest) table set
        const firstTableMatch = content.match(/<li><div class='tables-wrap'>(.*?)<\/div><\/li>/s);
        
        if (!firstTableMatch) {
            console.log('❌ No table structure found');
            return null;
        }

        const tableContent = firstTableMatch[1];
        console.log('✅ Found latest draw table structure');

        const results = {
            drawDate: null,
            drawNo: null,
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
        };

        // Extract draw date and number
        const headerMatch = tableContent.match(/<th class='drawDate'>(.*?)<\/th>\s*<th class='drawNumber'>(.*?)<\/th>/s);
        if (headerMatch) {
            results.drawDate = headerMatch[1].trim();
            results.drawNo = headerMatch[2].replace('Draw No. ', '').trim();
            console.log(`📊 Draw: ${results.drawDate}, No. ${results.drawNo}`);
        }

        // Extract main prizes
        const firstPrizeMatch = tableContent.match(/<td class='tdFirstPrize'>(\d{4})<\/td>/);
        const secondPrizeMatch = tableContent.match(/<td class='tdSecondPrize'>(\d{4})<\/td>/);
        const thirdPrizeMatch = tableContent.match(/<td class='tdThirdPrize'>(\d{4})<\/td>/);

        if (firstPrizeMatch) results.first = firstPrizeMatch[1];
        if (secondPrizeMatch) results.second = secondPrizeMatch[1];
        if (thirdPrizeMatch) results.third = thirdPrizeMatch[1];

        console.log(`🏆 Main Prizes: ${results.first}, ${results.second}, ${results.third}`);

        // Extract starter prizes
        const starterTableMatch = tableContent.match(/<tbody class='tbodyStarterPrizes'>(.*?)<\/tbody>/s);
        if (starterTableMatch) {
            const starterRows = starterTableMatch[1].match(/<tr>\s*<td>(\d{4})<\/td>\s*<td>(\d{4})<\/td>\s*<\/tr>/g);
            if (starterRows) {
                starterRows.forEach(row => {
                    const numbers = row.match(/(\d{4})/g);
                    if (numbers) results.starter.push(...numbers);
                });
            }
        }

        // Extract consolation prizes
        const consolationTableMatch = tableContent.match(/<tbody class='tbodyConsolationPrizes'>(.*?)<\/tbody>/s);
        if (consolationTableMatch) {
            const consolationRows = consolationTableMatch[1].match(/<tr>\s*<td>(\d{4})<\/td>\s*<td>(\d{4})<\/td>\s*<\/tr>/g);
            if (consolationRows) {
                consolationRows.forEach(row => {
                    const numbers = row.match(/(\d{4})/g);
                    if (numbers) results.consolation.push(...numbers);
                });
            }
        }

        console.log(`🎯 Starter: ${results.starter.length} prizes`);
        console.log(`🎪 Consolation: ${results.consolation.length} prizes`);

        // Validate main prizes exist
        if (results.first && results.second && results.third) {
            return results;
        } else {
            console.log('⚠️  Incomplete main prize data');
            return null;
        }
    }

    async updateCSVFile(results) {
        const csvFile = '4dResult.csv';
        let csvContent = '';

        try {
            csvContent = fs.readFileSync(csvFile, 'utf8');
        } catch (error) {
            console.log('📝 Creating new CSV file...');
            csvContent = 'Date,Draw,1st Prize,2nd Prize,3rd Prize,Starter 1,Starter 2,Consolation 1,Consolation 2,Consolation 3,Consolation 4,Consolation 5,Consolation 6,Consolation 7,Consolation 8,Consolation 9,Consolation 10\n';
        }

        const newRow = [
            results.drawDate,
            results.drawNo,
            results.first,
            results.second,
            results.third,
            ...(results.starter.slice(0, 2).concat(['', '']).slice(0, 2)),
            ...(results.consolation.slice(0, 10).concat(Array(10).fill('')).slice(0, 10))
        ].join(',');

        // Check if this draw already exists
        const lines = csvContent.split('\n');
        const existingDrawIndex = lines.findIndex(line => 
            line.includes(results.drawNo) && results.drawNo
        );

        if (existingDrawIndex > 0) {
            console.log(`🔄 Updating existing Draw ${results.drawNo}`);
            lines[existingDrawIndex] = newRow;
            csvContent = lines.join('\n');
        } else {
            console.log(`➕ Adding new Draw ${results.drawNo}`);
            csvContent += newRow + '\n';
        }

        fs.writeFileSync(csvFile, csvContent);
        console.log('✅ CSV file updated successfully');
    }

    async update4DPredictorHTML(results) {
        const htmlFile = '4d_predictor.html';
        
        try {
            let htmlContent = fs.readFileSync(htmlFile, 'utf8');
            
            // Update the latest result display in the HTML
            const latestResultUpdate = `
                <div class="latest-result" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 style="margin: 0 0 15px 0; color: #fff;">🎯 Latest 4D Results</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <strong>📅 Draw Date:</strong><br>${results.drawDate}
                        </div>
                        <div>
                            <strong>🎯 Draw Number:</strong><br>${results.drawNo}
                        </div>
                        <div>
                            <strong>🥇 1st Prize:</strong><br><span style="font-size: 1.5em; color: #ffd700;">${results.first}</span>
                        </div>
                        <div>
                            <strong>🥈 2nd Prize:</strong><br><span style="font-size: 1.3em; color: #c0c0c0;">${results.second}</span>
                        </div>
                        <div>
                            <strong>🥉 3rd Prize:</strong><br><span style="font-size: 1.1em; color: #cd7f32;">${results.third}</span>
                        </div>
                    </div>
                    <div style="margin-top: 15px; font-size: 0.9em;">
                        <div><strong>🎯 Starter:</strong> ${results.starter.slice(0, 10).join(', ')}</div>
                        <div style="margin-top: 5px;"><strong>🎪 Consolation:</strong> ${results.consolation.slice(0, 10).join(', ')}</div>
                        <div style="margin-top: 10px; text-align: center; font-size: 0.8em; opacity: 0.8;">
                            Last updated: ${new Date().toLocaleString()} | Source: Singapore Pools Official
                        </div>
                    </div>
                </div>`;

            // Replace existing latest result section or add it after the header
            if (htmlContent.includes('class="latest-result"')) {
                htmlContent = htmlContent.replace(/<div class="latest-result".*?<\/div>/s, latestResultUpdate);
            } else {
                // Add after the main header
                htmlContent = htmlContent.replace(
                    /(<h1.*?<\/h1>)/s,
                    `$1${latestResultUpdate}`
                );
            }

            fs.writeFileSync(htmlFile, htmlContent);
            console.log('✅ 4D predictor HTML updated with latest results');
            
        } catch (error) {
            console.log('⚠️  Could not update HTML file:', error.message);
        }
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Singapore Pools 4D Results Extraction...\n');
    
    const extractor = new CompleteSingapore4DExtractor();
    
    try {
        const results = await extractor.extractLatest4DResults();
        
        if (results) {
            console.log('\n🎊 EXTRACTION COMPLETE!');
            console.log('========================');
            console.log('✅ Latest 4D results successfully extracted from Singapore Pools');
            console.log('✅ CSV file updated with real winning numbers');
            console.log('✅ 4D predictor interface updated');
            console.log('\n🔥 Your 4D system now has the latest official Singapore Pools results!');
            
            return results;
        } else {
            console.log('\n❌ EXTRACTION FAILED');
            console.log('No valid results could be extracted.');
        }
        
    } catch (error) {
        console.error('\n❌ EXTRACTION ERROR:', error.message);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check internet connection');
        console.log('2. Singapore Pools might be temporarily unavailable');
        console.log('3. The website structure might have changed');
    }
}

if (require.main === module) {
    main();
}

module.exports = CompleteSingapore4DExtractor;
