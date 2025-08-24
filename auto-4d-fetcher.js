const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SingaporePoolsFetcher = require('./new-4d-fetcher.js');
  constructor() {
    this.csvPath = path.join(__dirname, '4dResult.csv'); // Separate from totoResult.csv
    this.baseUrl = 'https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx';
  }

  async fetchLatest4DResults() {
    let browser;
    try {
      console.log('🚀 Starting Singapore Pools 4D results fetcher...');
      
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log('📡 Navigating to Singapore Pools 4D results page...');
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for results to load
      await page.waitForSelector('.table-responsive, .results-table, table', { timeout: 15000 });

      console.log('🔍 Extracting 4D results data...');
      
      // Extract 4D results data
      const results = await page.evaluate(() => {
        const data = [];
        
        // Look for tables with .table class (found in debug)
        const tables = document.querySelectorAll('.table, table');
        
        for (let table of tables) {
          const rows = table.querySelectorAll('tr');
          
          // Skip if not enough rows
          if (rows.length < 2) continue;
          
          for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td, th');
            
            // Look for patterns that indicate 4D results
            if (cells.length >= 3) {
              const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
              
              // Look for draw number pattern
              const drawMatch = cellTexts.find(text => text.match(/^(\d{4})$/));
              const dateMatch = cellTexts.find(text => text.match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})\s+\d{4}/i));
              
              // Find 4-digit numbers that could be prizes
              const fourDigitNumbers = cellTexts.filter(text => /^\d{4}$/.test(text));
              
              if (fourDigitNumbers.length >= 3 && (drawMatch || dateMatch)) {
                try {
                  // Try to extract draw number from various sources
                  let drawNumber = null;
                  
                  // Method 1: Look for "Draw No. XXXX" pattern
                  const drawNoMatch = table.textContent.match(/Draw\s+No\.?\s+(\d{4})/i);
                  if (drawNoMatch) {
                    drawNumber = parseInt(drawNoMatch[1]);
                  }
                  
                  // Method 2: Look for standalone 4-digit number that could be draw
                  if (!drawNumber && drawMatch) {
                    drawNumber = parseInt(drawMatch);
                  }
                  
                  // Method 3: Use current logic to guess
                  if (!drawNumber && fourDigitNumbers.length > 0) {
                    // Usually the first 4-digit number or highest number
                    const numbers = fourDigitNumbers.map(n => parseInt(n)).sort((a, b) => b - a);
                    drawNumber = numbers[0];
                  }
                  
                  // Extract date
                  let formattedDate = '';
                  if (dateMatch) {
                    try {
                      const date = new Date(dateMatch);
                      if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0];
                      }
                    } catch (e) {
                      // Try parsing manually
                      const parts = dateMatch.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|^\d{1,2})\s+(\d{4})/i);
                      if (parts) {
                        const months = {
                          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                          'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                          'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
                        };
                        const day = parts[1].padStart(2, '0');
                        const month = months[parts[2].toLowerCase()] || parts[2].padStart(2, '0');
                        const year = parts[3];
                        formattedDate = `${year}-${month}-${day}`;
                      }
                    }
                  }
                  
                  if (!formattedDate) {
                    formattedDate = new Date().toISOString().split('T')[0]; // Default to today
                  }
                  
                  // Extract prizes (first 3 four-digit numbers are usually 1st, 2nd, 3rd)
                  const prizes = fourDigitNumbers.slice(0, 3);
                  const remainingNumbers = fourDigitNumbers.slice(3);
                  
                  // Split remaining numbers into starter and consolation
                  const starter = remainingNumbers.slice(0, 10);
                  const consolation = remainingNumbers.slice(10, 20);
                  
                  if (drawNumber && prizes.length >= 3) {
                    data.push({
                      draw: drawNumber,
                      date: formattedDate,
                      first: prizes[0],
                      second: prizes[1],
                      third: prizes[2],
                      starter: starter,
                      consolation: consolation
                    });
                  }
                } catch (error) {
                  console.log('Error parsing row:', error.message);
                }
              }
            }
          }
        }
        
        // Remove duplicates based on draw number
        const uniqueData = [];
        const seenDraws = new Set();
        
        for (const item of data) {
          if (!seenDraws.has(item.draw)) {
            seenDraws.add(item.draw);
            uniqueData.push(item);
          }
        }
        
        return uniqueData;
      });

      await browser.close();
      
      if (results.length > 0) {
        console.log(`✅ Successfully extracted ${results.length} 4D results`);
        await this.updateCSVFile(results);
        return results;
      } else {
        console.log('❌ No 4D results found. The website structure may have changed.');
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching 4D results:', error.message);
      if (browser) await browser.close();
      throw error;
    }
  }

  formatDate(dateString) {
    try {
      // Parse various date formats from Singapore Pools
      let date;
      
      if (dateString.includes('/')) {
        // Format: DD/MM/YYYY or MM/DD/YYYY
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format for Singapore
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else if (dateString.includes('-')) {
        // Format: YYYY-MM-DD
        date = new Date(dateString);
      } else {
        // Try to parse other formats
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      console.log('Date parsing error:', error.message, 'for:', dateString);
      return new Date().toISOString().split('T')[0]; // Fallback to today
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
          // Parse existing data (skip header)
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

      // Merge new results with existing data
      const existingDrawNumbers = new Set(existingData.map(item => item.draw));
      const newUniqueResults = newResults.filter(result => !existingDrawNumbers.has(result.draw));
      
      if (newUniqueResults.length > 0) {
        console.log(`📝 Adding ${newUniqueResults.length} new results to CSV`);
        
        // Combine and sort by draw number (descending - newest first)
        const combinedData = [...newUniqueResults, ...existingData]
          .sort((a, b) => b.draw - a.draw)
          .slice(0, 101); // Keep only latest 101 records
        
        // Generate CSV content
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
        
        // Write updated CSV
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
      console.log('🔍 Testing connection to Singapore Pools...');
      const results = await this.fetchLatest4DResults();
      
      if (results.length > 0) {
        console.log('✅ Connection test successful!');
        console.log('📊 Sample result:', results[0]);
        return true;
      } else {
        console.log('⚠️  Connection established but no data extracted');
        return false;
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }
}

// Export for use in other modules
module.exports = SingaporePoolsFetcher;

// Run directly if called from command line
if (require.main === module) {
  const fetcher = new SingaporePoolsFetcher();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    // Test mode
    fetcher.testConnection()
      .then(success => {
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
      });
  } else {
    // Normal fetch mode
    fetcher.fetchLatest4DResults()
      .then(results => {
        console.log(`🎯 Fetch completed. Retrieved ${results.length} results.`);
        process.exit(0);
      })
      .catch(error => {
        console.error('Fetch failed:', error.message);
        process.exit(1);
      });
  }
}
