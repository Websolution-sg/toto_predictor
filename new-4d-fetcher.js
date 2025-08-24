const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class Enhanced4DFetcher {
  constructor() {
    this.csvPath = path.join(__dirname, '4dResult.csv');
    this.baseUrl = 'https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx';
  }

  async fetchLatest4DResults() {
    let browser;
    try {
      console.log('🚀 Starting Enhanced Singapore Pools 4D results fetcher...');
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log('📡 Navigating to Singapore Pools 4D results page...');
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('🔍 Extracting 4D results data with enhanced method...');
      
      // Extract data using the correct website structure understanding
      const results = await page.evaluate(() => {
        const data = [];
        
        // The website organizes data in groups of 3 tables per draw:
        // Table N: Main prizes (Draw No, 1st, 2nd, 3rd)
        // Table N+1: Starter prizes (10 numbers in 5x2 grid)
        // Table N+2: Consolation prizes (10 numbers in 5x2 grid)
        
        const tables = document.querySelectorAll('.table, table');
        console.log(`Found ${tables.length} total tables`);
        
        // Find all tables with draw numbers (main prize tables)
        const mainPrizeTables = [];
        tables.forEach((table, index) => {
          const tableText = table.textContent;
          const drawMatch = tableText.match(/Draw\s+No\.?\s+(\d{4})/i);
          if (drawMatch) {
            mainPrizeTables.push({
              index: index,
              drawNumber: parseInt(drawMatch[1]),
              table: table
            });
          }
        });
        
        console.log(`Found ${mainPrizeTables.length} main prize tables`);
        
        // Process each main prize table and its corresponding starter/consolation tables
        mainPrizeTables.forEach(mainTable => {
          const drawNumber = mainTable.drawNumber;
          const tableIndex = mainTable.index;
          
          console.log(`Processing draw ${drawNumber} starting from table ${tableIndex}`);
          
          // Extract main prizes from the main table
          const mainTableText = mainTable.table.textContent;
          const rows = mainTable.table.querySelectorAll('tr');
          
          let first = '', second = '', third = '';
          let formattedDate = new Date().toISOString().split('T')[0]; // Default to today
          
          // Extract date and prizes from main table
          rows.forEach(row => {
            const rowText = row.textContent.trim();
            
            // Extract date
            const dateMatch = rowText.match(/(\w{3},?\s+)?(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
            if (dateMatch) {
              try {
                const months = {
                  'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                  'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
                };
                const day = dateMatch[2];
                const monthName = dateMatch[3];
                const year = dateMatch[4];
                const month = months[monthName.toLowerCase()] || '01';
                formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
              } catch (e) {
                console.log('Date parsing error:', e.message);
              }
            }
            
            // Extract prizes
            if (rowText.includes('1st Prize')) {
              const prizeMatch = rowText.match(/(\d{4})/);
              if (prizeMatch) first = prizeMatch[1];
            } else if (rowText.includes('2nd Prize')) {
              const prizeMatch = rowText.match(/(\d{4})/);
              if (prizeMatch) second = prizeMatch[1];
            } else if (rowText.includes('3rd Prize')) {
              const prizeMatch = rowText.match(/(\d{4})/);
              if (prizeMatch) third = prizeMatch[1];
            }
          });
          
          // Extract starter prizes from the next table (tableIndex + 1)
          const starter = [];
          if (tableIndex + 1 < tables.length) {
            const starterTable = tables[tableIndex + 1];
            const starterTableText = starterTable.textContent;
            
            if (starterTableText.includes('Starter')) {
              const starterNumbers = starterTableText.match(/\b\d{4}\b/g) || [];
              starter.push(...starterNumbers.filter(num => parseInt(num) !== drawNumber && num !== '2025'));
            }
          }
          
          // Extract consolation prizes from the table after starter (tableIndex + 2)
          const consolation = [];
          if (tableIndex + 2 < tables.length) {
            const consolationTable = tables[tableIndex + 2];
            const consolationTableText = consolationTable.textContent;
            
            if (consolationTableText.includes('Consolation')) {
              const consolationNumbers = consolationTableText.match(/\b\d{4}\b/g) || [];
              consolation.push(...consolationNumbers.filter(num => parseInt(num) !== drawNumber && num !== '2025'));
            }
          }
          
          // Clean up and validate data
          const cleanStarter = starter.slice(0, 10).filter(num => num && /^\d{4}$/.test(num));
          const cleanConsolation = consolation.slice(0, 10).filter(num => num && /^\d{4}$/.test(num));
          
          if (first && second && third) {
            data.push({
              draw: drawNumber,
              date: formattedDate,
              first: first,
              second: second,
              third: third,
              starter: cleanStarter,
              consolation: cleanConsolation
            });
            
            console.log(`Extracted: Draw ${drawNumber}, Date ${formattedDate}`);
            console.log(`Prizes: 1st=${first}, 2nd=${second}, 3rd=${third}`);
            console.log(`Starter (${cleanStarter.length}): ${cleanStarter.join(', ')}`);
            console.log(`Consolation (${cleanConsolation.length}): ${cleanConsolation.join(', ')}`);
          }
        });
        
        return data;
      });

      await browser.close();
      
      if (results.length > 0) {
        console.log(`✅ Successfully extracted ${results.length} 4D results`);
        console.log('Results:', results);
        await this.updateCSVFile(results);
        return results;
      } else {
        console.log('❌ No 4D results found with enhanced method');
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching 4D results:', error.message);
      if (browser) await browser.close();
      throw error;
    }
  }

  async updateCSVFile(newResults) {
    try {
      let existingData = [];
      
      // Read existing CSV if it exists
      if (fs.existsSync(this.csvPath)) {
        const csvContent = fs.readFileSync(this.csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        if (lines.length > 1) {
          existingData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
              draw: parseInt(values[0]),
              date: values[1],
              first: values[2],
              second: values[3],
              third: values[4],
              starter: values.slice(5, 15),
              consolation: values.slice(15, 25)
            };
          });
        }
      }

      // Merge new results
      const existingDrawNumbers = new Set(existingData.map(item => item.draw));
      const newUniqueResults = newResults.filter(result => !existingDrawNumbers.has(result.draw));
      
      if (newUniqueResults.length > 0) {
        console.log(`📝 Adding ${newUniqueResults.length} new results to CSV`);
        
        const combinedData = [...newUniqueResults, ...existingData]
          .sort((a, b) => b.draw - a.draw)
          .slice(0, 101);
        
        // Generate CSV
        const header = 'draw,date,first,second,third,starter1,starter2,starter3,starter4,starter5,starter6,starter7,starter8,starter9,starter10,consolation1,consolation2,consolation3,consolation4,consolation5,consolation6,consolation7,consolation8,consolation9,consolation10';
        
        const csvLines = [header];
        combinedData.forEach(item => {
          const starterPadded = [...item.starter, ...Array(10)].slice(0, 10).map(val => val || '');
          const consolationPadded = [...item.consolation, ...Array(10)].slice(0, 10).map(val => val || '');
          
          const line = [
            item.draw,
            item.date,
            item.first,
            item.second,
            item.third,
            ...starterPadded,
            ...consolationPadded
          ].join(',');
          
          csvLines.push(line);
        });
        
        fs.writeFileSync(this.csvPath, csvLines.join('\n'));
        console.log(`✅ CSV updated successfully with ${combinedData.length} total records`);
        return newUniqueResults.length;
      } else {
        console.log('ℹ️  No new results to add. CSV is up to date.');
        return 0;
      }
      
    } catch (error) {
      console.error('❌ Error updating CSV file:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log('🔍 Testing enhanced 4D connection...');
      const results = await this.fetchLatest4DResults();
      
      if (results.length > 0) {
        console.log('✅ Enhanced connection test successful!');
        console.log('📊 Sample result:', results[0]);
        return true;
      } else {
        console.log('⚠️  Connection established but no data extracted');
        return false;
      }
    } catch (error) {
      console.error('❌ Enhanced connection test failed:', error.message);
      return false;
    }
  }
}

// Export for use in other modules
module.exports = Enhanced4DFetcher;

// Run directly if called from command line
if (require.main === module) {
  const fetcher = new Enhanced4DFetcher();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    fetcher.testConnection()
      .then(success => {
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
      });
  } else {
    fetcher.fetchLatest4DResults()
      .then(results => {
        console.log(`🎯 Enhanced fetch completed. Retrieved ${results.length} results.`);
        process.exit(0);
      })
      .catch(error => {
        console.error('Enhanced fetch failed:', error.message);
        process.exit(1);
      });
  }
}
