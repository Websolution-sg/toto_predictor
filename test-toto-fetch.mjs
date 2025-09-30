import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testTotoFetch() {
  console.log('🔍 Testing TOTO data fetch from Singapore Pools...');
  
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx'
  ];

  for (const url of urls) {
    try {
      console.log(`\n📡 Fetching from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 30000
      });

      console.log(`✅ Response Status: ${response.status}`);
      console.log(`📄 Content Length: ${response.data.length}`);
      
      // Save raw HTML for inspection
      const timestamp = Date.now();
      fs.writeFileSync(`toto_fetch_${timestamp}.html`, response.data);
      console.log(`💾 Raw HTML saved as: toto_fetch_${timestamp}.html`);
      
      const $ = cheerio.load(response.data);
      
      // Look for common TOTO result patterns
      console.log('\n🔍 Searching for TOTO patterns...');
      
      // Search for dates
      const datePatterns = [
        /\d{1,2}\s+\w+\s+\d{4}/g,
        /\d{1,2}\/\d{1,2}\/\d{4}/g,
        /\d{1,2}-\w{3}-\d{2}/g
      ];
      
      let foundDates = [];
      for (const pattern of datePatterns) {
        const matches = response.data.match(pattern);
        if (matches) {
          foundDates.push(...matches.slice(0, 5)); // First 5 matches
        }
      }
      console.log(`📅 Found dates: ${foundDates.join(', ')}`);
      
      // Search for number sequences
      const numberSequences = response.data.match(/\b\d{1,2}\b/g);
      if (numberSequences) {
        const validNumbers = numberSequences
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49)
          .slice(0, 20); // First 20 valid numbers
        console.log(`🔢 Found valid numbers: ${validNumbers.join(', ')}`);
      }
      
      // Look for specific selectors
      const selectors = [
        '.winning-numbers',
        '.win-number',
        '.toto-result',
        '.draw-result',
        '[class*="number"]',
        '[class*="result"]',
        'td',
        'span'
      ];
      
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`🎯 Found ${elements.length} elements with selector: ${selector}`);
          if (selector === 'td' || selector === 'span') {
            // For common elements, show only those with numbers
            elements.each((i, el) => {
              const text = $(el).text().trim();
              if (/^\d{1,2}$/.test(text) && parseInt(text) >= 1 && parseInt(text) <= 49) {
                console.log(`   - ${selector} with number: ${text}`);
              }
            });
          } else {
            elements.each((i, el) => {
              if (i < 3) { // Show first 3
                console.log(`   - Element ${i}: ${$(el).text().trim()}`);
              }
            });
          }
        }
      }
      
      // Check page title and main content
      console.log(`📄 Page Title: ${$('title').text()}`);
      console.log(`📝 Main Content Preview: ${$('body').text().substring(0, 300)}...`);
      
      break; // Stop after first successful fetch
      
    } catch (error) {
      console.log(`❌ Error fetching ${url}: ${error.message}`);
    }
  }
}

testTotoFetch().catch(console.error);