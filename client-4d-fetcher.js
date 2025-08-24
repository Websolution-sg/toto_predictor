/**
 * Client-Side 4D Results Fetcher
 * Fetches latest 4D results directly from Singapore Pools
 * Works in the browser without server-side dependencies
 */

class Client4DFetcher {
  constructor() {
    this.proxyUrl = 'https://api.allorigins.win/raw?url=';
    this.baseUrl = 'https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx';
    this.csvPath = '4dResult.csv';
  }

  /**
   * Fetch latest 4D results using a CORS proxy
   */
  async fetchLatest4DResults() {
    try {
      console.log('🚀 Starting client-side 4D results fetch...');
      
      // Use CORS proxy to fetch Singapore Pools page
      const response = await fetch(this.proxyUrl + encodeURIComponent(this.baseUrl), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      console.log('📄 Page content retrieved, parsing results...');
      
      // Parse the HTML to extract 4D results
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const results = this.parseResults(doc);
      
      if (results && results.length > 0) {
        console.log('✅ Successfully extracted results:', results[0]);
        return results;
      } else {
        throw new Error('No results found in page content');
      }
      
    } catch (error) {
      console.error('❌ Error fetching 4D results:', error);
      
      // Fallback: try alternative proxy
      return this.fetchWithAlternativeProxy();
    }
  }

  /**
   * Alternative proxy method
   */
  async fetchWithAlternativeProxy() {
    try {
      console.log('🔄 Trying alternative proxy method...');
      
      const altProxyUrl = 'https://corsproxy.io/?';
      const response = await fetch(altProxyUrl + encodeURIComponent(this.baseUrl));
      
      if (!response.ok) {
        throw new Error('Alternative proxy failed');
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      return this.parseResults(doc);
      
    } catch (error) {
      console.error('❌ Alternative proxy also failed:', error);
      return null;
    }
  }

  /**
   * Parse 4D results from HTML document
   */
  parseResults(doc) {
    const results = [];
    
    try {
      // Look for tables containing draw data
      const tables = doc.querySelectorAll('table, .table');
      console.log(`Found ${tables.length} tables to analyze`);
      
      let currentResult = null;
      
      tables.forEach((table, index) => {
        const tableText = table.textContent || table.innerText || '';
        
        // Check for draw number pattern
        const drawMatch = tableText.match(/Draw\s+No\.?\s*(\d{4})/i);
        if (drawMatch) {
          console.log(`Found draw number: ${drawMatch[1]} in table ${index}`);
          
          // Start new result object
          if (currentResult && currentResult.draw) {
            results.push(currentResult);
          }
          
          currentResult = {
            draw: parseInt(drawMatch[1]),
            date: this.extractDate(tableText),
            first: null,
            second: null,
            third: null,
            starter: [],
            consolation: []
          };
          
          // Extract main prizes from current table
          this.extractMainPrizes(table, currentResult);
        }
        
        // Check for starter prizes
        if (tableText.includes('Starter') && currentResult) {
          currentResult.starter = this.extractNumbers(table, 10);
          console.log(`Extracted ${currentResult.starter.length} starter prizes`);
        }
        
        // Check for consolation prizes
        if (tableText.includes('Consolation') && currentResult) {
          currentResult.consolation = this.extractNumbers(table, 10);
          console.log(`Extracted ${currentResult.consolation.length} consolation prizes`);
        }
      });
      
      // Add the last result if complete
      if (currentResult && currentResult.draw) {
        results.push(currentResult);
      }
      
      // Sort by draw number (newest first)
      results.sort((a, b) => b.draw - a.draw);
      
      console.log(`Parsed ${results.length} complete results`);
      return results;
      
    } catch (error) {
      console.error('Error parsing results:', error);
      return [];
    }
  }

  /**
   * Extract date from table text
   */
  extractDate(text) {
    // Look for date patterns like "Saturday, 23 August 2025"
    const dateMatch = text.match(/(\w+day),?\s+(\d{1,2})\s+(\w+)\s+(\d{4})/i);
    if (dateMatch) {
      const [, dayOfWeek, dayNumber, month, year] = dateMatch;
      const monthNames = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
      };
      const monthNum = monthNames[month.toLowerCase()] || '01';
      const formattedDate = `${year}-${monthNum}-${dayNumber.padStart(2, '0')}`;
      
      // Validate the date
      const testDate = new Date(formattedDate);
      if (!isNaN(testDate.getTime())) {
        return formattedDate;
      }
    }
    
    // Fallback to current date
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Extract main prizes (1st, 2nd, 3rd) from table
   */
  extractMainPrizes(table, result) {
    const cells = table.querySelectorAll('td, th');
    const numbers = [];
    
    cells.forEach(cell => {
      const text = (cell.textContent || '').trim();
      if (/^\d{4}$/.test(text)) {
        numbers.push(text);
      }
    });
    
    // Assign first three 4-digit numbers as main prizes
    if (numbers.length >= 3) {
      result.first = numbers[0];
      result.second = numbers[1];
      result.third = numbers[2];
    }
  }

  /**
   * Extract numbers from table (for starter/consolation)
   */
  extractNumbers(table, maxCount = 10) {
    const numbers = [];
    const cells = table.querySelectorAll('td, th');
    
    cells.forEach(cell => {
      const text = (cell.textContent || '').trim();
      if (/^\d{4}$/.test(text) && numbers.length < maxCount) {
        numbers.push(text);
      }
    });
    
    // Ensure we have exactly the expected count
    while (numbers.length < maxCount) {
      numbers.push('0000');
    }
    
    return numbers.slice(0, maxCount);
  }

  /**
   * Update CSV file with new results
   */
  async updateCSV(newResults) {
    try {
      // Read existing CSV
      const csvResponse = await fetch(this.csvPath + '?nocache=' + Date.now());
      let csvContent = '';
      
      if (csvResponse.ok) {
        csvContent = await csvResponse.text();
      }
      
      const lines = csvContent.trim().split('\n');
      const header = lines[0] || 'Draw,Date,1st,2nd,3rd,starter1,starter2,starter3,starter4,starter5,starter6,starter7,starter8,starter9,starter10,consolation1,consolation2,consolation3,consolation4,consolation5,consolation6,consolation7,consolation8,consolation9,consolation10';
      
      // Get existing data
      const existingData = lines.slice(1).map(line => {
        const values = line.split(',');
        return parseInt(values[0]);
      });
      
      // Add new results that don't exist
      const newLines = [];
      newResults.forEach(result => {
        if (!existingData.includes(result.draw)) {
          const line = [
            result.draw,
            result.date,
            result.first || '0000',
            result.second || '0000',
            result.third || '0000',
            ...result.starter,
            ...result.consolation
          ].join(',');
          newLines.push(line);
        }
      });
      
      if (newLines.length > 0) {
        const updatedCSV = [header, ...newLines, ...lines.slice(1)].join('\n');
        
        // Note: Browser can't directly write files for security reasons
        // This would need to be handled by a service worker or server endpoint
        console.log('📊 New CSV content ready for update:', newLines.length, 'new entries');
        return {
          success: true,
          newEntries: newLines.length,
          csvContent: updatedCSV
        };
      } else {
        console.log('ℹ️ No new results to add');
        return { success: true, newEntries: 0 };
      }
      
    } catch (error) {
      console.error('Error updating CSV:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test the fetcher
   */
  async test() {
    console.log('🧪 Testing client-side 4D fetcher...');
    
    try {
      const results = await this.fetchLatest4DResults();
      
      if (results && results.length > 0) {
        console.log('✅ Test successful! Latest result:');
        console.log(results[0]);
        return true;
      } else {
        console.log('❌ Test failed - no results retrieved');
        return false;
      }
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      return false;
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Client4DFetcher;
} else {
  window.Client4DFetcher = Client4DFetcher;
}
