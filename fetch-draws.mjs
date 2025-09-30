import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchDrawResults(drawNumber, date) {
  console.log(`\n🎯 Fetching Draw ${drawNumber} (${date})...`);
  
  try {
    const url = `https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?sppl=RHJhd051bWJlcj00${drawNumber.toString().padStart(3, '0')}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000
    });

    console.log(`✅ Response Status: ${response.status}`);
    
    const $ = cheerio.load(response.data);
    
    // Extract winning numbers from table cells
    const numberCells = [];
    $('td').each((i, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49) {
        numberCells.push(num);
      }
    });
    
    if (numberCells.length >= 7) {
      const winningNumbers = numberCells.slice(0, 6);
      const additionalNumber = numberCells[6];
      
      console.log(`📅 Date: ${date}`);
      console.log(`🎯 Winning Numbers: ${winningNumbers.join(', ')}`);
      console.log(`➕ Additional Number: ${additionalNumber}`);
      
      return {
        date,
        winningNumbers,
        additionalNumber,
        drawNumber
      };
    } else {
      console.log('❌ Could not extract enough numbers from the page');
      
      // Try alternative extraction methods
      console.log('🔍 Trying alternative extraction...');
      
      // Look for specific patterns in the HTML
      const htmlContent = response.data;
      
      // Search for winning numbers pattern
      const numberPattern = /winning.*?numbers?.*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2})/i;
      const match = htmlContent.match(numberPattern);
      
      if (match) {
        const numbers = [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => parseInt(n));
        console.log(`🎯 Found pattern: ${numbers.join(', ')}`);
      }
      
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error fetching draw ${drawNumber}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🎯 Fetching specific TOTO draw results...');
  
  // Based on the previous output:
  // Draw 4115 = Mon, 22 Sep 2025
  // Draw 4116 = Thu, 25 Sep 2025
  
  const draws = [
    { number: 4115, date: '22-Sept-25' },
    { number: 4116, date: '25-Sept-25' }
  ];
  
  const results = [];
  
  for (const draw of draws) {
    const result = await fetchDrawResults(draw.number, draw.date);
    if (result) {
      results.push(result);
    }
  }
  
  if (results.length > 0) {
    console.log('\n📋 Summary of fetched results:');
    results.forEach(result => {
      console.log(`${result.date}: ${result.winningNumbers.join(',')} + ${result.additionalNumber}`);
    });
    
    // Format for CSV
    console.log('\n📄 CSV format:');
    results.forEach(result => {
      console.log(`${result.date},${result.winningNumbers.join(',')},${result.additionalNumber}`);
    });
  } else {
    console.log('\n❌ No results could be fetched');
  }
}

main().catch(console.error);