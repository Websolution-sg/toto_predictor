const https = require('https');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class ServerTOTOFetcher {
  constructor() {
    this.baseUrl = 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx';
    this.csvPath = path.join(__dirname, 'totoResult.csv');
  }

  async fetchResults() {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      };

      https.get(this.baseUrl, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const results = this.parseResults(data);
            if (results) {
              this.updateCSV(results);
              resolve(results);
            } else {
              reject(new Error('Failed to parse results'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  parseResults(html) {
    try {
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Find and extract draw date
      const drawDateElement = doc.querySelector('.table-striped td:first-child');
      const winningNumbersElement = doc.querySelector('.win-numbers');
      const additionalNumberElement = doc.querySelector('.additional-number');

      if (!drawDateElement || !winningNumbersElement || !additionalNumberElement) {
        throw new Error('Required elements not found in page');
      }

      const drawDate = this.parseDrawDate(drawDateElement.textContent);
      const winningNumbers = Array.from(
        winningNumbersElement.querySelectorAll('.win-number')
      ).map(el => el.textContent.trim());
      const additionalNumber = additionalNumberElement.textContent.trim();

      if (winningNumbers.length !== 6) {
        throw new Error('Invalid number of winning numbers');
      }

      return {
        drawDate,
        winningNumbers,
        additionalNumber
      };

    } catch (error) {
      console.error('Error parsing TOTO results:', error);
      return null;
    }
  }

  parseDrawDate(dateStr) {
    try {
      const cleaned = dateStr.trim().replace(/\s+/g, ' ');
      const date = new Date(cleaned);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing draw date:', error);
      return null;
    }
  }

  updateCSV(results) {
    try {
      // Create CSV row
      const csvRow = [
        results.drawDate,
        ...results.winningNumbers,
        results.additionalNumber
      ].join(',');

      // Read existing CSV if it exists
      let existingContent = '';
      if (fs.existsSync(this.csvPath)) {
        existingContent = fs.readFileSync(this.csvPath, 'utf8');
      }

      // Check if result already exists
      if (!existingContent.includes(csvRow)) {
        // Append new result
        const newContent = existingContent + 
          (existingContent && !existingContent.endsWith('\\n') ? '\\n' : '') + 
          csvRow + '\\n';
        
        // Write updated content
        fs.writeFileSync(this.csvPath, newContent, 'utf8');
        console.log('✅ CSV file updated successfully');
        return true;
      } else {
        console.log('ℹ️ Result already exists in CSV');
        return false;
      }
    } catch (error) {
      console.error('Error updating CSV:', error);
      throw error;
    }
  }
}

// Run the fetcher
const fetcher = new ServerTOTOFetcher();
fetcher.fetchResults()
  .then(results => {
    console.log('Successfully fetched TOTO results:', results);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fetching TOTO results:', error);
    process.exit(1);
  });
