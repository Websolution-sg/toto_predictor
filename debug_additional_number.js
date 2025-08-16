const axios = require('axios');
const cheerio = require('cheerio');

async function debugAdditionalNumber() {
  try {
    console.log('🔍 Debugging Additional Number Detection...');
    
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Look for text containing "Additional Number" or similar
    console.log('\n🔍 Searching for "Additional Number" context...');
    $('*').each((i, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      if (text.toLowerCase().includes('additional') || 
          text.toLowerCase().includes('bonus') ||
          text.toLowerCase().includes('extra')) {
        console.log(`📋 Found additional context: "${text}"`);
        
        // Look for numbers near this text
        const numbers = text.match(/\d{1,2}/g);
        if (numbers) {
          console.log(`   Numbers in context: [${numbers.join(', ')}]`);
        }
      }
    });
    
    // Look for the main numbers and see what comes after
    console.log('\n🔍 Looking for main numbers [22,25,29,31,34,43] and surrounding context...');
    $('*').each((i, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      // Check if this contains our main numbers
      if (text.includes('22') && text.includes('25') && text.includes('29') && 
          text.includes('31') && text.includes('34') && text.includes('43')) {
        console.log(`📋 Found main numbers context: "${text}"`);
        
        // Extract all numbers from this context
        const allNumbers = text.match(/\d{1,2}/g);
        if (allNumbers) {
          const validNumbers = allNumbers.map(n => parseInt(n)).filter(n => n >= 1 && n <= 49);
          console.log(`   All valid numbers: [${validNumbers.join(', ')}]`);
          
          // Check if 7th number follows the pattern
          if (validNumbers.length >= 7) {
            console.log(`   🎯 Potential 7th number: ${validNumbers[6]}`);
          }
        }
      }
    });
    
    // Look for structured table data specifically
    console.log('\n🔍 Analyzing table structure for additional number...');
    $('table').each((tableIndex, table) => {
      const $table = $(table);
      const tableText = $table.text();
      
      if (tableText.includes('22') && tableText.includes('25')) {
        console.log(`\n📋 Table ${tableIndex} contains main numbers:`);
        
        $table.find('tr').each((rowIndex, row) => {
          const $row = $(row);
          const rowText = $row.text().trim();
          
          if (rowText.includes('22') || rowText.includes('25')) {
            console.log(`   Row ${rowIndex}: "${rowText}"`);
            
            // Get all cells in this row
            $row.find('td, th').each((cellIndex, cell) => {
              const $cell = $(cell);
              const cellText = $cell.text().trim();
              const number = parseInt(cellText);
              
              if (number >= 1 && number <= 49) {
                console.log(`     Cell ${cellIndex}: ${number}`);
              }
            });
          }
        });
      }
    });
    
    // Look for specific patterns that might indicate additional number
    console.log('\n🔍 Looking for specific additional number patterns...');
    const patterns = [
      /(\d{1,2})\s*\+\s*(\d{1,2})/,  // "22 + 11" format
      /Additional.*?(\d{1,2})/i,      // "Additional Number: 11"
      /Bonus.*?(\d{1,2})/i,           // "Bonus: 11"
      /Extra.*?(\d{1,2})/i            // "Extra: 11"
    ];
    
    patterns.forEach((pattern, index) => {
      const match = response.data.match(pattern);
      if (match) {
        console.log(`   Pattern ${index} match: "${match[0]}" -> Number: ${match[1] || match[2]}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAdditionalNumber();
