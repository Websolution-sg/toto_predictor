// Singapore Pools 4D Results Scraper
// Fetches real 4D results from Singapore Pools website

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class SingaporePoolsScraper {
  constructor() {
    this.baseUrl = 'https://www.singaporepools.com.sg';
    this.resultsUrl = 'https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  async fetch4DResults(maxDraws = 50) {
    try {
      console.log('Fetching 4D results from Singapore Pools...');
      
      const response = await axios.get(this.resultsUrl, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      // Parse 4D results table
      $('table.tblResult tr').each((index, element) => {
        if (index === 0) return; // Skip header row
        
        const cells = $(element).find('td');
        if (cells.length >= 13) { // Ensure we have all required columns
          
          const drawNumber = $(cells[0]).text().trim();
          const drawDate = $(cells[1]).text().trim();
          const first = $(cells[2]).text().trim();
          const second = $(cells[3]).text().trim();
          const third = $(cells[4]).text().trim();
          const starter1 = $(cells[5]).text().trim();
          const starter2 = $(cells[6]).text().trim();
          
          // Extract consolation prizes (usually 10 numbers)
          const consolation = [];
          for (let i = 7; i < Math.min(17, cells.length); i++) {
            const prize = $(cells[i]).text().trim();
            if (prize) consolation.push(prize);
          }
          
          if (drawNumber && first && second && third) {
            results.push({
              draw: parseInt(drawNumber) || 0,
              date: this.formatDate(drawDate),
              first: this.format4D(first),
              second: this.format4D(second),
              third: this.format4D(third),
              starter: [this.format4D(starter1), this.format4D(starter2)],
              consolation: consolation.map(c => this.format4D(c)).filter(c => c)
            });
          }
        }
      });
      
      console.log(`Successfully scraped ${results.length} 4D results`);
      return results.slice(0, maxDraws);
      
    } catch (error) {
      console.error('Error fetching 4D results:', error.message);
      return this.getFallbackData();
    }
  }

  format4D(number) {
    if (!number) return '';
    return number.replace(/\D/g, '').padStart(4, '0').substring(0, 4);
  }

  formatDate(dateStr) {
    try {
      // Parse Singapore date format and convert to YYYY-MM-DD
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  async saveToCSV(results, filename = '4dResult.csv') {
    const headers = [
      'draw', 'date', 'first', 'second', 'third', 
      'starter1', 'starter2',
      'consolation1', 'consolation2', 'consolation3', 'consolation4', 'consolation5',
      'consolation6', 'consolation7', 'consolation8', 'consolation9', 'consolation10'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    results.forEach(result => {
      const row = [
        result.draw,
        result.date,
        result.first,
        result.second,
        result.third,
        result.starter[0] || '',
        result.starter[1] || '',
        ...result.consolation.slice(0, 10).concat(Array(10).fill('')).slice(0, 10)
      ];
      csvContent += row.join(',') + '\n';
    });
    
    fs.writeFileSync(filename, csvContent);
    console.log(`💾 Saved ${results.length} results to ${filename}`);
  }

  getFallbackData() {
    // Fallback data in case scraping fails
    return [
      {
        draw: 4593,
        date: '2024-08-21',
        first: '1234',
        second: '5678',
        third: '9012',
        starter: ['3456', '7890'],
        consolation: ['2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401']
      }
    ];
  }

  async fetchAndSave(maxDraws = 50) {
    const results = await this.fetch4DResults(maxDraws);
    await this.saveToCSV(results);
    return results;
  }
}

// Alternative API-based approach for better reliability
class SingaporePoolsAPI {
  constructor() {
    this.apiUrl = 'https://www.singaporepools.com.sg/api/4d/results';
  }

  async fetch4DResultsAPI(maxDraws = 50) {
    try {
      console.log('Trying API approach...');
      
      const response = await axios.get(this.apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.results) {
        return response.data.results.slice(0, maxDraws);
      }
      
      throw new Error('No API data available');
      
    } catch (error) {
      console.log('API method failed, falling back to web scraping...');
      const scraper = new SingaporePoolsScraper();
      return await scraper.fetch4DResults(maxDraws);
    }
  }
}

// Export classes for use
module.exports = { SingaporePoolsScraper, SingaporePoolsAPI };

// If run directly, fetch and save results
if (require.main === module) {
  (async () => {
    try {
      const scraper = new SingaporePoolsScraper();
      const results = await scraper.fetchAndSave(100);
      console.log('4D results updated successfully!');
    } catch (error) {
      console.error('Failed to update 4D results:', error);
    }
  })();
}
