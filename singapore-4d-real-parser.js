// Singapore Pools 4D Real Data Parser
// Parses the actual current 4D results from Singapore Pools data

const fs = require('fs');

class Singapore4DRealDataParser {
    constructor() {
        this.dataFiles = {
            topDraws: 'singapore-4d-topDraws.html',
            drawList: 'singapore-4d-drawList.html'
        };
    }

    parseRealData() {
        console.log('🎯 Singapore Pools 4D Real Data Parser');
        console.log('======================================\n');
        
        try {
            // Read the top draws file which contains the latest results
            const topDrawsContent = fs.readFileSync(this.dataFiles.topDraws, 'utf8');
            
            console.log('📄 Parsing latest 4D results from Singapore Pools data...');
            
            // Extract the latest draw data (first table in the file)
            const latestResults = this.extractLatestDrawData(topDrawsContent);
            
            if (latestResults) {
                console.log('\n🎉 LIVE 4D RESULTS FOUND!');
                console.log('==========================');
                console.log(`📅 Draw Date: ${latestResults.drawDate}`);
                console.log(`🎯 Draw Number: ${latestResults.drawNo}`);
                console.log(`🥇 1st Prize: ${latestResults.first}`);
                console.log(`🥈 2nd Prize: ${latestResults.second}`);
                console.log(`🥉 3rd Prize: ${latestResults.third}`);
                console.log(`🎯 Starter Prizes: ${latestResults.starter.join(', ')}`);
                console.log(`🎪 Consolation Prizes: ${latestResults.consolation.join(', ')}`);
                
                // Update CSV with real data
                this.updateCSV(latestResults);
                
                return latestResults;
            } else {
                console.log('❌ No valid results found in the data');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error parsing real data:', error.message);
            throw error;
        }
    }

    extractLatestDrawData(content) {
        // Find the first complete table set (latest draw)
        const firstTableMatch = content.match(/<li><div class='tables-wrap'>(.*?)<\/div><\/li>/s);
        
        if (!firstTableMatch) {
            console.log('❌ No table structure found');
            return null;
        }

        const tableContent = firstTableMatch[1];
        console.log('✅ Found table structure for latest draw');

        const results = {
            drawDate: null,
            drawNo: null,
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
        };

        // Extract draw date and number from header
        const headerMatch = tableContent.match(/<th class='drawDate'>(.*?)<\/th>\s*<th class='drawNumber'>(.*?)<\/th>/s);
        if (headerMatch) {
            results.drawDate = headerMatch[1].trim();
            results.drawNo = headerMatch[2].replace('Draw No. ', '').trim();
            console.log(`📊 Found draw info: ${results.drawDate}, Draw ${results.drawNo}`);
        }

        // Extract 1st Prize
        const firstPrizeMatch = tableContent.match(/<td class='tdFirstPrize'>(\d{4})<\/td>/);
        if (firstPrizeMatch) {
            results.first = firstPrizeMatch[1];
            console.log(`🥇 1st Prize: ${results.first}`);
        }

        // Extract 2nd Prize
        const secondPrizeMatch = tableContent.match(/<td class='tdSecondPrize'>(\d{4})<\/td>/);
        if (secondPrizeMatch) {
            results.second = secondPrizeMatch[1];
            console.log(`🥈 2nd Prize: ${results.second}`);
        }

        // Extract 3rd Prize
        const thirdPrizeMatch = tableContent.match(/<td class='tdThirdPrize'>(\d{4})<\/td>/);
        if (thirdPrizeMatch) {
            results.third = thirdPrizeMatch[1];
            console.log(`🥉 3rd Prize: ${results.third}`);
        }

        // Extract Starter Prizes
        const starterTableMatch = tableContent.match(/<tbody class='tbodyStarterPrizes'>(.*?)<\/tbody>/s);
        if (starterTableMatch) {
            const starterRows = starterTableMatch[1].match(/<tr>\s*<td>(\d{4})<\/td>\s*<td>(\d{4})<\/td>\s*<\/tr>/g);
            if (starterRows) {
                starterRows.forEach(row => {
                    const numbers = row.match(/(\d{4})/g);
                    if (numbers) {
                        results.starter.push(...numbers);
                    }
                });
                console.log(`🎯 Starter Prizes: ${results.starter.join(', ')}`);
            }
        }

        // Extract Consolation Prizes
        const consolationTableMatch = tableContent.match(/<tbody class='tbodyConsolationPrizes'>(.*?)<\/tbody>/s);
        if (consolationTableMatch) {
            const consolationRows = consolationTableMatch[1].match(/<tr>\s*<td>(\d{4})<\/td>\s*<td>(\d{4})<\/td>\s*<\/tr>/g);
            if (consolationRows) {
                consolationRows.forEach(row => {
                    const numbers = row.match(/(\d{4})/g);
                    if (numbers) {
                        results.consolation.push(...numbers);
                    }
                });
                console.log(`🎪 Consolation Prizes: ${results.consolation.join(', ')}`);
            }
        }

        // Validate we have the main prizes
        if (results.first && results.second && results.third) {
            return results;
        } else {
            console.log('⚠️  Incomplete prize data found');
            return null;
        }
    }

    updateCSV(results) {
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
            console.log(`🔄 Updating existing draw ${results.drawNo} with real data`);
            lines[existingDrawIndex] = newRow;
            csvContent = lines.join('\n');
        } else {
            console.log(`➕ Adding new draw ${results.drawNo} with real data`);
            csvContent += newRow + '\n';
        }

        fs.writeFileSync(csvFile, csvContent);
        console.log('✅ CSV updated with real Singapore Pools data!');
        
        // Show what was updated
        console.log('\n📊 Updated CSV with:');
        console.log(`   Date: ${results.drawDate}`);
        console.log(`   Draw: ${results.drawNo}`);
        console.log(`   Prizes: ${results.first}, ${results.second}, ${results.third}`);
        console.log(`   Starter: ${results.starter.slice(0, 2).join(', ')}`);
        console.log(`   Consolation: ${results.consolation.slice(0, 10).join(', ')}`);
        
        return true;
    }
}

// Main execution
function main() {
    const parser = new Singapore4DRealDataParser();
    
    try {
        const results = parser.parseRealData();
        
        if (results) {
            console.log('\n🎊 SUCCESS! Real Singapore Pools 4D data extracted and updated!');
            console.log('🔥 This is the actual current winning data from Singapore Pools!');
        } else {
            console.log('\n❌ Failed to parse real data from Singapore Pools files.');
        }
        
    } catch (error) {
        console.error('❌ Failed to parse real data:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = Singapore4DRealDataParser;
