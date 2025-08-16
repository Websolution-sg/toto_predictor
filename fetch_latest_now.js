// Direct fetch from Singapore Pools
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

console.log('🚀 FETCHING LATEST TOTO RESULTS FROM SINGAPORE POOLS');
console.log('=====================================================');
console.log('📅 Date: August 16, 2025');
console.log('🌐 Target: https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx');
console.log('');

// Get current CSV state
const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
console.log(`📋 Current CSV latest: ${currentCSV}`);
console.log('');

async function fetchLatestTotoFromSingaporePools() {
  console.log('🔍 Connecting to Singapore Pools...');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 20000
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`📄 HTML Content Length: ${html.length} characters`);
    
    // Quick content check
    const contentChecks = {
      'TOTO content': html.toLowerCase().includes('toto'),
      'Results content': html.toLowerCase().includes('result'),
      'Winning content': html.toLowerCase().includes('winning'),
      'Draw content': html.toLowerCase().includes('draw'),
      '2025 date': html.includes('2025'),
      'Aug date': html.includes('Aug') || html.includes('August')
    };
    
    console.log('\n🔍 CONTENT ANALYSIS:');
    Object.entries(contentChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    // Parse the HTML for TOTO numbers
    const $ = cheerio.load(html);
    console.log('\n🎯 PARSING FOR TOTO RESULTS...');
    
    const candidates = [];
    
    // Strategy 1: Look for tables with numbers
    $('table').each((tableIndex, table) => {
      const $table = $(table);
      const tableText = $table.text();
      
      // Skip prize tables
      if (tableText.includes('$') || tableText.includes('Group I') || 
          tableText.includes('Prize') || tableText.includes('Starter')) {
        return;
      }
      
      console.log(`📊 Analyzing table ${tableIndex}...`);
      
      const numbers = [];
      $table.find('td, th').each((i, cell) => {
        const cellText = $(cell).text().trim();
        const num = parseInt(cellText);
        if (!isNaN(num) && num >= 1 && num <= 49 && cellText === num.toString()) {
          numbers.push(num);
        }
      });
      
      if (numbers.length >= 6) {
        console.log(`   🔢 Found ${numbers.length} valid numbers: ${numbers.join(', ')}`);
        
        // Look for sequences of 6-7 numbers
        for (let start = 0; start <= numbers.length - 6; start++) {
          const sequence = numbers.slice(start, start + 7);
          const mainNumbers = sequence.slice(0, 6);
          
          if (new Set(mainNumbers).size === 6) {
            let confidence = 5;
            
            // Check for date indicators
            if (tableText.includes('2025') || tableText.includes('Aug') || tableText.includes('16')) {
              confidence += 3;
              console.log(`   📅 Table contains current date indicators`);
            }
            
            candidates.push({
              numbers: sequence,
              confidence: confidence,
              source: `table-${tableIndex}`,
              context: tableText.substring(0, 100)
            });
            
            console.log(`   ✅ Valid sequence found: [${sequence.join(',')}] confidence: ${confidence}`);
          }
        }
      }
    });
    
    // Strategy 2: Look for div/span elements
    console.log('\n🔄 Checking div/span elements...');
    
    $('div, span, p').each((i, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      if (text.length > 10 && text.length < 200) {
        const numberPattern = /\b(\d{1,2})\b/g;
        const matches = text.match(numberPattern);
        
        if (matches && matches.length >= 6) {
          const validNumbers = matches
            .map(n => parseInt(n))
            .filter(n => n >= 1 && n <= 49);
          
          if (validNumbers.length >= 6) {
            const sequence = validNumbers.slice(0, 7);
            const mainNumbers = sequence.slice(0, 6);
            
            if (new Set(mainNumbers).size === 6) {
              let confidence = 3;
              
              const lowerText = text.toLowerCase();
              if (lowerText.includes('winning') || lowerText.includes('result')) confidence += 2;
              if (text.includes('2025') || text.includes('Aug')) confidence += 2;
              
              candidates.push({
                numbers: sequence,
                confidence: confidence,
                source: 'div-span',
                context: text.substring(0, 80)
              });
              
              console.log(`   📋 Element sequence: [${sequence.join(',')}] confidence: ${confidence}`);
            }
          }
        }
      }
    });
    
    // Find the best result
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.confidence - a.confidence);
      
      console.log('\n📊 ALL CANDIDATES FOUND:');
      candidates.slice(0, 5).forEach((candidate, i) => {
        console.log(`   ${i + 1}. [${candidate.numbers.join(',')}] - confidence: ${candidate.confidence} - source: ${candidate.source}`);
      });
      
      const bestCandidate = candidates[0];
      console.log(`\n🎯 SELECTED BEST RESULT: [${bestCandidate.numbers.join(',')}]`);
      console.log(`📊 Confidence: ${bestCandidate.confidence}`);
      console.log(`📍 Source: ${bestCandidate.source}`);
      
      return bestCandidate.numbers;
      
    } else {
      console.log('\n❌ No valid TOTO sequences found');
      return null;
    }
    
  } catch (error) {
    console.log(`\n❌ FETCH ERROR: ${error.message}`);
    return null;
  }
}

// Run the fetch
async function main() {
  const result = await fetchLatestTotoFromSingaporePools();
  
  console.log('\n🎯 FINAL RESULT');
  console.log('===============');
  
  if (result && result.length >= 6) {
    const resultStr = result.join(',');
    console.log(`✅ LATEST FETCH RESULT: ${resultStr}`);
    
    // Validate the result
    const mainNumbers = result.slice(0, 6);
    const additionalNumber = result[6] || 'N/A';
    
    console.log(`🎲 Main Numbers: ${mainNumbers.join(', ')}`);
    console.log(`🎲 Additional Number: ${additionalNumber}`);
    
    // Compare with current CSV
    const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
    
    if (currentCSV === resultStr) {
      console.log('\n📋 RESULT COMPARISON:');
      console.log('✅ Fetched result MATCHES current CSV');
      console.log('ℹ️  No update needed - system is up to date');
    } else {
      console.log('\n📋 RESULT COMPARISON:');
      console.log(`📤 Current CSV: ${currentCSV}`);
      console.log(`📥 Fetched result: ${resultStr}`);
      console.log('🔄 Results are DIFFERENT - CSV could be updated');
      
      // Ask if user wants to update
      console.log('\n💡 To update CSV with this result:');
      console.log('   1. The main script would automatically update');
      console.log('   2. Or manually replace the first line in totoResult.csv');
    }
    
    // Validation
    const isValid = result.every(n => n >= 1 && n <= 49) && 
                   new Set(result.slice(0, 6)).size === 6;
    
    console.log(`\n📊 VALIDATION: ${isValid ? '✅ VALID' : '❌ INVALID'} TOTO format`);
    
  } else {
    console.log('❌ NO VALID RESULT FETCHED');
    console.log('\nPossible reasons:');
    console.log('   • Singapore Pools website structure changed');
    console.log('   • Network connectivity issues');
    console.log('   • No current draw results available');
    console.log('   • Website temporarily unavailable');
  }
  
  console.log('\n🏁 FETCH COMPLETE!');
}

main().catch(error => {
  console.error('💥 Script failed:', error.message);
});
