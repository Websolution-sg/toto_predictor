/**
 * Enhanced TOTO Results Fetcher
 * Fetches latest TOTO results directly from Singapore Pools
 * Handles rate limiting, retries, and error recovery
 */

class TOTOFetcher {
  constructor() {
    this.proxyUrls = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://bypass-cors.vercel.app/?url='
    ];
    this.baseUrl = 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx';
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds between retries
  }

  /**
   * Fetches TOTO results using multiple CORS proxies with retry logic
   */
  async fetchLatestResults() {
    let lastError = null;
    
    // Try each proxy in sequence
    for (const proxyUrl of this.proxyUrls) {
      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        try {
          console.log(`Attempting to fetch TOTO results using proxy ${proxyUrl} (attempt ${attempt + 1})`);
          
          const response = await fetch(proxyUrl + encodeURIComponent(this.baseUrl), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();
          console.log('📄 Raw HTML fetched, parsing TOTO results...');

          const results = this.parseResults(html);
          
          if (results) {
            console.log('✅ Successfully extracted TOTO results:', results);
            await this.updateCSV(results);
            return results;
          }
          
        } catch (error) {
          console.error(`Error with proxy ${proxyUrl} attempt ${attempt + 1}:`, error);
          lastError = error;
          
          if (attempt < this.retryAttempts - 1) {
            console.log(`Waiting ${this.retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          }
        }
      }
    }

    throw new Error(`All proxies and attempts failed. Last error: ${lastError?.message}`);
  }

  /**
   * Parses TOTO results from the HTML content
   */
  parseResults(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find the results table/elements
      const drawDateElement = doc.querySelector('.table-striped td:first-child');
      const winningNumbersElement = doc.querySelector('.win-numbers');
      const additionalNumberElement = doc.querySelector('.additional-number');

      if (!drawDateElement || !winningNumbersElement) {
        throw new Error('Could not find required elements in the page');
      }

      // Extract draw date
      const drawDate = this.parseDrawDate(drawDateElement.textContent);

      // Extract winning numbers
      const winningNumbers = Array.from(
        winningNumbersElement.querySelectorAll('.win-number')
      ).map(el => el.textContent.trim());

      // Extract additional number
      const additionalNumber = additionalNumberElement ? 
        additionalNumberElement.textContent.trim() : null;

      if (winningNumbers.length !== 6 || !additionalNumber) {
        throw new Error('Invalid number of results extracted');
      }

      return {
        drawDate,
        winningNumbers,
        additionalNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing TOTO results:', error);
      return null;
    }
  }

  /**
   * Parses the draw date string into a standardized format
   */
  parseDrawDate(dateStr) {
    try {
      // Handle various date formats
      const cleaned = dateStr.trim().replace(/\s+/g, ' ');
      const date = new Date(cleaned);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error('Error parsing draw date:', error);
      return null;
    }
  }

  /**
   * Updates the CSV file with new results
   */
  async updateCSV(results) {
    try {
      // Prepare CSV row
      const csvRow = [
        results.drawDate,
        ...results.winningNumbers,
        results.additionalNumber
      ].join(',');

      // Read existing CSV
      const response = await fetch('totoResult.csv');
      const existingContent = await response.text();
      
      // Check if result already exists
      if (!existingContent.includes(csvRow)) {
        // Append new result
        const newContent = existingContent + '\\n' + csvRow;
        
        // Save using local file API if available
        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: 'totoResult.csv',
              types: [{
                description: 'CSV Files',
                accept: {'text/csv': ['.csv']},
              }],
            });
            
            const writable = await handle.createWritable();
            await writable.write(newContent);
            await writable.close();
            
            console.log('✅ CSV file updated successfully');
          } catch (error) {
            console.error('Error saving CSV file:', error);
          }
        } else {
          // Fallback to download
          const blob = new Blob([newContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'totoResult.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        console.log('ℹ️ Result already exists in CSV');
      }
    } catch (error) {
      console.error('Error updating CSV:', error);
      throw error;
    }
  }
}

// Initialize fetcher
const totoFetcher = new TOTOFetcher();

// Auto-refresh function
async function autoRefreshResults() {
  try {
    const results = await totoFetcher.fetchLatestResults();
    console.log('Auto-refresh completed:', results);
    
    // Update UI if needed
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="latest-draw">
          <h3>Latest Draw (${results.drawDate})</h3>
          <div class="winning-numbers">
            ${results.winningNumbers.map(num => 
              `<span class="number">${num}</span>`
            ).join('')}
            <span class="additional-number">${results.additionalNumber}</span>
          </div>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Auto-refresh failed:', error);
  }
}

// Run initial fetch
autoRefreshResults();

// Set up auto-refresh interval (every 15 minutes)
setInterval(autoRefreshResults, 15 * 60 * 1000);
