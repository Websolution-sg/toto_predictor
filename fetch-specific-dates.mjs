import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function fetchSpecificDateResults() {
  console.log('🔍 Fetching TOTO results for September 22 and 25, 2025...');
  
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/DataFileArchive/Lottery/Output/toto_result_draw_list_en.html'
  ];

  for (const url of urls) {
    try {
      console.log(`\n📡 Fetching from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 30000
      });

      console.log(`✅ Response Status: ${response.status}`);
      
      // Save raw HTML for inspection
      const timestamp = Date.now();
      const filename = url.includes('DataFileArchive') ? `archive_${timestamp}.html` : `results_${timestamp}.html`;
      fs.writeFileSync(filename, response.data);
      console.log(`💾 Raw HTML saved as: ${filename}`);
      
      const $ = cheerio.load(response.data);
      
      // Look for September dates
      console.log('\n🔍 Searching for September 22 and 25 results...');
      
      // Search for date patterns
      const datePatterns = [
        /22 Sep 2025/g,
        /25 Sep 2025/g,
        /Mon, 22 Sep 2025/g,
        /Thu, 25 Sep 2025/g,
        /22-Sep-25/g,
        /25-Sep-25/g
      ];
      
      let foundDates = [];
      for (const pattern of datePatterns) {
        const matches = response.data.match(pattern);
        if (matches) {
          foundDates.push(...matches);
        }
      }
      
      if (foundDates.length > 0) {
        console.log(`📅 Found target dates: ${foundDates.join(', ')}`);
      } else {
        console.log('📅 No target dates found in this source');
      }
      
      // Extract all draw results from the page
      const drawResults = [];
      
      // Method 1: Look for table rows with draw data
      $('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 7) {
          const dateCell = $(cells[0]).text().trim();
          const numbers = [];
          
          for (let j = 1; j <= 7; j++) {
            const cellText = $(cells[j]).text().trim();
            const num = parseInt(cellText);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          }
          
          if (numbers.length === 7 && (dateCell.includes('22 Sep') || dateCell.includes('25 Sep'))) {
            drawResults.push({
              date: dateCell,
              winningNumbers: numbers.slice(0, 6),
              additionalNumber: numbers[6]
            });
          }
        }
      });
      
      // Method 2: Look for structured draw data
      const drawSections = $('[class*="draw"], [class*="result"]').toArray();
      for (const section of drawSections) {
        const sectionText = $(section).text();
        if (sectionText.includes('22 Sep') || sectionText.includes('25 Sep')) {
          console.log(`🎯 Found relevant section: ${sectionText.substring(0, 200)}...`);
          
          // Extract numbers from this section
          const numbers = [];
          $(section).find('*').each((i, el) => {
            const text = $(el).text().trim();
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          if (numbers.length >= 7) {
            console.log(`🔢 Found numbers in section: ${numbers.slice(0, 7).join(', ')}`);
          }
        }
      }
      
      // Display found results
      if (drawResults.length > 0) {
        console.log('\n📋 Found draw results:');
        drawResults.forEach(result => {
          console.log(`   ${result.date}: ${result.winningNumbers.join(', ')} + ${result.additionalNumber}`);
        });
        return drawResults;
      }
      
      // If no structured results found, look for any mentions
      const textContent = response.data;
      if (textContent.includes('22 Sep') || textContent.includes('25 Sep')) {
        console.log('📄 Found mentions of target dates in page content');
        
        // Extract context around the dates
        const sep22Context = textContent.match(/.{0,100}22 Sep.{0,100}/g);
        const sep25Context = textContent.match(/.{0,100}25 Sep.{0,100}/g);
        
        if (sep22Context) {
          console.log('🎯 September 22 context:', sep22Context[0]);
        }
        if (sep25Context) {
          console.log('🎯 September 25 context:', sep25Context[0]);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error fetching ${url}: ${error.message}`);
    }
  }
  
  return null;
}

fetchSpecificDateResults().catch(console.error);