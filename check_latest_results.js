const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function checkLatestTotoResults() {
  console.log('🔍 CHECKING LATEST TOTO RESULTS - Real-time validation');
  console.log('📅 Current date:', new Date().toLocaleString());
  console.log('');
  
  try {
    console.log('🌐 Fetching Singapore Pools TOTO results page...');
    
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000
    });
    
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`📄 Content length: ${html.length} characters`);
    
    // Check if content contains TOTO data
    const hasContent = html.toLowerCase().includes('toto');
    console.log(`🎯 Contains TOTO content: ${hasContent ? '✅' : '❌'}`);
    
    if (!hasContent) {
      console.log('⚠️ No TOTO content found - possible redirect or blocking');
      console.log('📄 First 500 characters of response:');
      console.log(html.substring(0, 500));
      return;
    }
    
    // Look for the latest result using multiple approaches
    console.log('');
    console.log('🔍 SEARCHING FOR LATEST RESULTS...');
    
    // Method 1: Look for recent dates
    console.log('📅 Method 1: Date-based search...');
    const currentYear = new Date().getFullYear();
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/gi
    ];
    
    const foundDates = [];
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        try {
          let date;
          if (match[0].includes('/')) {
            date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
            const months = {'jan':0,'feb':1,'mar':2,'apr':3,'may':4,'jun':5,'jul':6,'aug':7,'sep':8,'oct':9,'nov':10,'dec':11};
            if (match[2] && match[3]) {
              date = new Date(parseInt(match[3]), months[match[1].toLowerCase()], parseInt(match[2]));
            } else {
              date = new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
            }
          }
          
          if (date.getFullYear() === currentYear) {
            foundDates.push({
              date: date,
              dateString: match[0],
              position: match.index
            });
          }
        } catch (err) {
          // Skip invalid dates
        }
      }
    }
    
    foundDates.sort((a, b) => b.date - a.date);
    console.log(`   Found ${foundDates.length} dates in ${currentYear}`);
    
    if (foundDates.length > 0) {
      console.log(`   Most recent date: ${foundDates[0].dateString} (${foundDates[0].date.toDateString()})`);
      
      // Look for numbers around the most recent date
      const recentDatePos = foundDates[0].position;
      const contextStart = Math.max(0, recentDatePos - 1000);
      const contextEnd = Math.min(html.length, recentDatePos + 2000);
      const context = html.substring(contextStart, contextEnd);
      
      console.log('   Searching for numbers near most recent date...');
      const numbers = extractTotoNumbers(context);
      if (numbers) {
        console.log(`   ✅ Found TOTO result near ${foundDates[0].dateString}: [${numbers.join(', ')}]`);
      }
    }
    
    // Method 2: Use Cheerio to parse structure
    console.log('');
    console.log('📊 Method 2: HTML structure parsing...');
    const $ = cheerio.load(html);
    
    // Look for tables
    const tables = $('table');
    console.log(`   Found ${tables.length} tables`);
    
    for (let i = 0; i < Math.min(tables.length, 5); i++) {
      const table = $(tables[i]);
      const tableText = table.text().toLowerCase();
      
      if (tableText.includes('toto') || tableText.includes('winning') || tableText.includes('result')) {
        console.log(`   📊 Table ${i + 1} contains TOTO content`);
        
        const rows = table.find('tr');
        for (let j = 0; j < Math.min(rows.length, 10); j++) {
          const row = $(rows[j]);
          const numbers = [];
          
          row.find('td, th').each((index, cell) => {
            const text = $(cell).text().trim();
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          if (numbers.length >= 7) {
            const result = numbers.slice(0, 7);
            console.log(`   ✅ Table ${i + 1}, Row ${j + 1}: [${result.join(', ')}]`);
          }
        }
      }
    }
    
    // Method 3: Look for div/span structures
    console.log('');
    console.log('🔍 Method 3: Div/span structure search...');
    
    const divs = $('div, span').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('winning') || text.includes('result') || text.includes('toto');
    });
    
    console.log(`   Found ${divs.length} relevant div/span elements`);
    
    divs.each((i, div) => {
      if (i < 5) { // Check first 5 relevant divs
        const text = $(div).text();
        const numbers = extractTotoNumbers(text);
        if (numbers) {
          console.log(`   ✅ Div/Span ${i + 1}: [${numbers.join(', ')}]`);
        }
      }
    });
    
    // Method 4: Raw text search for number patterns
    console.log('');
    console.log('🔍 Method 4: Raw text pattern search...');
    
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const textResult = extractTotoNumbers(cleanText);
    if (textResult) {
      console.log(`   ✅ Raw text search: [${textResult.join(', ')}]`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 DNS resolution failed - check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Request timed out - server may be slow');
    }
  }
}

function extractTotoNumbers(text) {
  // Look for sequences of 7 numbers between 1-49
  const numbers = [];
  const words = text.split(/\s+/);
  
  for (const word of words) {
    const num = parseInt(word);
    if (!isNaN(num) && num >= 1 && num <= 49) {
      numbers.push(num);
      
      if (numbers.length >= 7) {
        // Check if we have a valid TOTO sequence
        const sequence = numbers.slice(-7);
        const mainNumbers = sequence.slice(0, 6);
        
        // Check for unique main numbers
        if (new Set(mainNumbers).size === 6) {
          return sequence;
        }
      }
    } else if (!/^\d+$/.test(word)) {
      // Reset if we hit a non-number word
      numbers.length = 0;
    }
  }
  
  return null;
}

// Run the check
checkLatestTotoResults().then(() => {
  console.log('');
  console.log('🎯 Real-time check completed');
}).catch(err => {
  console.error('💥 Check failed:', err.message);
});
