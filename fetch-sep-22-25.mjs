import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchSpecificDraw(drawNumber, date) {
  console.log(`\n🎯 Fetching Draw ${drawNumber} (${date})...`);
  
  try {
    // Use the proper query string format from the archive
    const queryStrings = {
      4115: 'RHJhd051bWJlcj00MTE1', // Mon, 22 Sep 2025
      4116: 'RHJhd051bWJlcj00MTE2'  // Thu, 25 Sep 2025
    };
    
    const url = `https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?sppl=${queryStrings[drawNumber]}`;
    
    console.log(`📡 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.singaporepools.com.sg/'
      },
      timeout: 30000
    });

    console.log(`✅ Response Status: ${response.status}`);
    
    // Save the HTML for inspection
    const fs = await import('fs');
    fs.writeFileSync(`draw_${drawNumber}_${Date.now()}.html`, response.data);
    
    const $ = cheerio.load(response.data);
    
    // Look for the specific draw date in the content to verify we got the right page
    const pageContent = response.data;
    if (pageContent.includes(date.replace('-', ' ').replace('Sept', 'Sep'))) {
      console.log('✅ Confirmed correct draw page');
    } else {
      console.log('⚠️ May not be the correct draw page');
    }
    
    // Extract winning numbers
    let numbers = [];
    
    // Method 1: Look for winning numbers in table cells
    $('td').each((i, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49 && numbers.length < 7) {
        numbers.push(num);
      }
    });
    
    if (numbers.length >= 7) {
      const winningNumbers = numbers.slice(0, 6);
      const additionalNumber = numbers[6];
      
      console.log(`📅 Date: ${date}`);
      console.log(`🎯 Winning Numbers: ${winningNumbers.join(', ')}`);
      console.log(`➕ Additional Number: ${additionalNumber}`);
      
      return {
        date,
        winningNumbers,
        additionalNumber,
        drawNumber
      };
    }
    
    // Method 2: Look for numbers in spans or divs
    numbers = [];
    $('span, div').each((i, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49 && numbers.length < 7) {
        // Check if this number is likely a winning number (not part of other data)
        const parent = $(el).parent();
        const parentClass = parent.attr('class') || '';
        const parentText = parent.text();
        
        if (!parentText.includes('Group') && !parentText.includes('Prize') && !parentText.includes('Share')) {
          numbers.push(num);
        }
      }
    });
    
    if (numbers.length >= 7) {
      // Remove duplicates and take first 7
      numbers = [...new Set(numbers)].slice(0, 7);
      
      if (numbers.length >= 7) {
        const winningNumbers = numbers.slice(0, 6);
        const additionalNumber = numbers[6];
        
        console.log(`📅 Date: ${date} (Method 2)`);
        console.log(`🎯 Winning Numbers: ${winningNumbers.join(', ')}`);
        console.log(`➕ Additional Number: ${additionalNumber}`);
        
        return {
          date,
          winningNumbers,
          additionalNumber,
          drawNumber
        };
      }
    }
    
    // Method 3: Pattern matching in HTML
    console.log('🔍 Trying pattern matching...');
    
    // Look for specific patterns
    const patterns = [
      /winning.*?numbers?.*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2})/gi,
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/g
    ];
    
    for (const pattern of patterns) {
      const matches = pageContent.matchAll(pattern);
      for (const match of matches) {
        const nums = [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => parseInt(n));
        if (nums.every(n => n >= 1 && n <= 49)) {
          console.log(`🎯 Pattern found: ${nums.join(', ')}`);
          // This might be our winning numbers, but we need the additional number too
        }
      }
    }
    
    console.log('❌ Could not extract complete results from this page');
    return null;
    
  } catch (error) {
    console.error(`❌ Error fetching draw ${drawNumber}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🎯 Fetching TOTO results for September 22 and 25, 2025...');
  
  const results = [];
  
  // Fetch both draws
  const draw22 = await fetchSpecificDraw(4115, '22-Sept-25');
  if (draw22) results.push(draw22);
  
  const draw25 = await fetchSpecificDraw(4116, '25-Sept-25');
  if (draw25) results.push(draw25);
  
  if (results.length > 0) {
    console.log('\n📋 RESULTS SUMMARY:');
    console.log('=' + '='.repeat(50));
    
    results.forEach(result => {
      console.log(`${result.date}: ${result.winningNumbers.join(', ')} + ${result.additionalNumber}`);
    });
    
    console.log('\n📄 CSV FORMAT (for adding to totoResult.csv):');
    results.forEach(result => {
      console.log(`${result.date},${result.winningNumbers.join(',')},${result.additionalNumber}`);
    });
    
    return results;
  } else {
    console.log('\n❌ Could not fetch the requested results');
    console.log('This might be due to:');
    console.log('- Website changes or protection mechanisms');
    console.log('- Different URL structure than expected');
    console.log('- The draws may not have occurred on those dates');
    return null;
  }
}

main().catch(console.error);