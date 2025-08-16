// DETAILED PARSING FOR COMPLETE 7-NUMBER SEQUENCE
const axios = require('axios');
const cheerio = require('cheerio');

console.log('🔍 DETAILED PARSING FOR COMPLETE TOTO RESULT');
console.log('============================================');

async function findCompleteResult() {
  try {
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('🎯 FOCUSED SEARCH: Looking for 22, 25, 29, 31, 34, 43 + additional number');
    console.log();
    
    // Method 1: Look for the sequence we know exists
    const targetNumbers = [22, 25, 29, 31, 34, 43];
    
    console.log('📊 METHOD 1: Table cell-by-cell analysis');
    $('table').each((tableIndex, table) => {
      const $table = $(table);
      const cells = [];
      
      $table.find('td, th').each((i, cell) => {
        const $cell = $(cell);
        const text = $cell.text().trim();
        const num = parseInt(text);
        
        if (num >= 1 && num <= 49) {
          cells.push({
            number: num,
            text: text,
            html: $cell.html(),
            index: i
          });
        }
      });
      
      console.log(`\nTable ${tableIndex}: Found ${cells.length} number cells`);
      if (cells.length > 0) {
        console.log(`Numbers: [${cells.map(c => c.number).join(', ')}]`);
        
        // Look for our target sequence
        for (let i = 0; i <= cells.length - 6; i++) {
          const sequence = cells.slice(i, i + 6).map(c => c.number);
          if (JSON.stringify(sequence) === JSON.stringify(targetNumbers)) {
            console.log(`✅ FOUND TARGET SEQUENCE at positions ${i}-${i+5}!`);
            
            // Look for 7th number
            if (i + 6 < cells.length) {
              const seventhNumber = cells[i + 6].number;
              console.log(`🎯 POTENTIAL 7TH NUMBER: ${seventhNumber}`);
              console.log(`📍 Complete sequence: [${[...targetNumbers, seventhNumber].join(', ')}]`);
            }
            
            // Check adjacent cells for additional number
            const adjacentCells = cells.slice(Math.max(0, i-2), i+8);
            console.log('🔍 Adjacent cells context:');
            adjacentCells.forEach((cell, idx) => {
              const marker = idx === i ? '→' : idx >= i && idx < i+6 ? '*' : ' ';
              console.log(`  ${marker} Position ${cell.index}: ${cell.number} (${cell.text})`);
            });
          }
        }
      }
    });
    
    // Method 2: Look at the raw HTML around our target numbers
    console.log('\n🔍 METHOD 2: Raw HTML analysis');
    const htmlContent = response.data;
    
    // Find the HTML section containing our numbers
    targetNumbers.forEach(num => {
      const regex = new RegExp(`>\\s*${num}\\s*<`, 'g');
      let match;
      while ((match = regex.exec(htmlContent)) !== null) {
        const start = Math.max(0, match.index - 200);
        const end = Math.min(htmlContent.length, match.index + 200);
        const context = htmlContent.substring(start, end);
        
        console.log(`\n📍 Found ${num} in HTML context:`);
        console.log(context.replace(/\s+/g, ' ').trim());
        console.log('---');
      }
    });
    
    // Method 3: Look for complete 7-number patterns
    console.log('\n🔢 METHOD 3: Complete 7-number pattern search');
    
    const fullPatterns = [
      // Pattern 1: All 7 numbers in sequence
      /\b22\b[,\s\t]+\b25\b[,\s\t]+\b29\b[,\s\t]+\b31\b[,\s\t]+\b34\b[,\s\t]+\b43\b[,\s\t]+\b(\d{1,2})\b/g,
      // Pattern 2: Six numbers, then additional nearby
      /\b22\b[,\s\t]+\b25\b[,\s\t]+\b29\b[,\s\t]+\b31\b[,\s\t]+\b34\b[,\s\t]+\b43\b[\s\S]{0,100}?(?:additional|bonus|extra)[\s\S]{0,50}?\b(\d{1,2})\b/gi,
      // Pattern 3: Flexible whitespace/structure
      /22[\s\S]{0,20}25[\s\S]{0,20}29[\s\S]{0,20}31[\s\S]{0,20}34[\s\S]{0,20}43[\s\S]{0,50}(\d{1,2})/g
    ];
    
    const bodyText = $('body').text();
    
    fullPatterns.forEach((pattern, index) => {
      console.log(`\nPattern ${index + 1}:`);
      let match;
      while ((match = pattern.exec(bodyText)) !== null) {
        const additionalNum = parseInt(match[1]);
        if (additionalNum >= 1 && additionalNum <= 49) {
          console.log(`✅ COMPLETE RESULT FOUND: [22, 25, 29, 31, 34, 43, ${additionalNum}]`);
          
          const contextStart = Math.max(0, match.index - 100);
          const contextEnd = Math.min(bodyText.length, match.index + match[0].length + 100);
          const context = bodyText.substring(contextStart, contextEnd);
          console.log(`📝 Context: "${context.replace(/\s+/g, ' ').trim()}"`);
        }
      }
    });
    
    // Method 4: Manual inspection of likely areas
    console.log('\n🎯 METHOD 4: Manual inspection of result areas');
    
    // Look for elements that might contain the additional number
    const resultKeywords = ['additional', 'bonus', 'extra', 'seventh', '7th', 'supplementary'];
    
    resultKeywords.forEach(keyword => {
      $('*').each((i, element) => {
        const $el = $(element);
        const text = $el.text().toLowerCase();
        
        if (text.includes(keyword)) {
          console.log(`\n🔍 Found "${keyword}" context:`);
          console.log($el.text().trim());
          
          // Look for numbers near this element
          const siblings = $el.siblings();
          siblings.each((j, sibling) => {
            const siblingText = $(sibling).text().trim();
            const num = parseInt(siblingText);
            if (num >= 1 && num <= 49) {
              console.log(`   📍 Number nearby: ${num}`);
            }
          });
        }
      });
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

findCompleteResult();
