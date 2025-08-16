// SINGAPORE POOLS LATEST RESULT VERIFICATION
const axios = require('axios');
const cheerio = require('cheerio');

console.log('🔍 SINGAPORE POOLS LATEST RESULT VERIFICATION');
console.log('==============================================');
console.log(`📅 Current Date: ${new Date().toLocaleDateString()}`);
console.log();

async function verifyLatestResult() {
  try {
    console.log('📡 Connecting to Singapore Pools...');
    
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`✅ Connection successful (${response.status})`);
    console.log(`📄 Content length: ${response.data.length} characters`);
    
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text();
    
    console.log('\n🔍 SEARCHING FOR LATEST RESULTS...');
    
    // Method 1: Look for recent dates in August 2025
    console.log('\n📅 METHOD 1: Date-based search');
    const datePatterns = [
      /(?:august|aug)\s+(\d{1,2}),?\s+2025/gi,
      /(\d{1,2})\s+(?:august|aug)\s+2025/gi,
      /16[\s\-\/](?:08|august|aug)[\s\-\/]2025/gi,
      /15[\s\-\/](?:08|august|aug)[\s\-\/]2025/gi,
      /12[\s\-\/](?:08|august|aug)[\s\-\/]2025/gi
    ];
    
    datePatterns.forEach((pattern, index) => {
      const matches = bodyText.match(pattern);
      if (matches) {
        console.log(`✅ Date pattern ${index + 1} found: ${matches.slice(0, 3).join(', ')}`);
      }
    });
    
    // Method 2: Look for number sequences near date indicators
    console.log('\n🔢 METHOD 2: Number sequence analysis');
    
    // Find all potential TOTO number sequences
    const numberSequences = [];
    
    // Pattern for 6-7 numbers in sequence
    const totoPattern = /\b(\d{1,2})\b[,\s\t]+\b(\d{1,2})\b[,\s\t]+\b(\d{1,2})\b[,\s\t]+\b(\d{1,2})\b[,\s\t]+\b(\d{1,2})\b[,\s\t]+\b(\d{1,2})\b(?:[,\s\t]+\b(\d{1,2})\b)?/g;
    
    let match;
    while ((match = totoPattern.exec(bodyText)) !== null) {
      const numbers = match.slice(1).filter(n => n).map(n => parseInt(n));
      
      // Validate: all numbers 1-49, 6-7 numbers, no duplicates in main 6
      if (numbers.length >= 6 && 
          numbers.every(n => n >= 1 && n <= 49) &&
          new Set(numbers.slice(0, 6)).size === 6) {
        
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(bodyText.length, match.index + 200);
        const context = bodyText.substring(contextStart, contextEnd);
        
        numberSequences.push({
          numbers: numbers,
          context: context.replace(/\s+/g, ' ').trim(),
          position: match.index
        });
      }
    }
    
    console.log(`✅ Found ${numberSequences.length} valid number sequences`);
    
    // Method 3: Look for table structures
    console.log('\n📊 METHOD 3: Table analysis');
    
    $('table').each((index, table) => {
      const $table = $(table);
      const tableText = $table.text();
      
      // Check if table contains dates from August 2025
      if (tableText.includes('2025') || tableText.includes('Aug') || tableText.includes('16')) {
        console.log(`\n🔍 Table ${index} contains date indicators:`);
        
        // Extract numbers from this table
        const tableNumbers = [];
        $table.find('td, th').each((i, cell) => {
          const cellText = $(cell).text().trim();
          const num = parseInt(cellText);
          if (num >= 1 && num <= 49) {
            tableNumbers.push(num);
          }
        });
        
        console.log(`   Numbers found: [${tableNumbers.join(', ')}]`);
        
        // Check for 6-7 consecutive valid numbers
        for (let i = 0; i <= tableNumbers.length - 6; i++) {
          const sequence = tableNumbers.slice(i, i + 7);
          if (sequence.length >= 6 && new Set(sequence.slice(0, 6)).size === 6) {
            console.log(`   ✅ Valid sequence: [${sequence.join(', ')}]`);
          }
        }
      }
    });
    
    // Method 4: Current vs Historical comparison
    console.log('\n📈 METHOD 4: Sequence ranking by context');
    
    numberSequences.forEach((seq, index) => {
      let score = 0;
      const context = seq.context.toLowerCase();
      
      // Positive indicators
      if (context.includes('winning')) score += 3;
      if (context.includes('result')) score += 2;
      if (context.includes('draw')) score += 2;
      if (context.includes('2025')) score += 2;
      if (context.includes('aug') || context.includes('august')) score += 2;
      if (context.includes('16') || context.includes('15') || context.includes('12')) score += 1;
      
      // Negative indicators
      if (context.includes('previous')) score -= 2;
      if (context.includes('last')) score -= 1;
      if (context.includes('prize')) score -= 1;
      
      console.log(`\n🎯 Sequence ${index + 1}: [${seq.numbers.join(', ')}]`);
      console.log(`   Score: ${score}`);
      console.log(`   Context: "${seq.context.substring(0, 150)}..."`);
    });
    
    // Final recommendation
    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log('===================');
    
    if (numberSequences.length > 0) {
      const bestSequence = numberSequences.reduce((best, current) => {
        const bestScore = calculateScore(best.context);
        const currentScore = calculateScore(current.context);
        return currentScore > bestScore ? current : best;
      });
      
      console.log(`🏆 MOST LIKELY LATEST RESULT: [${bestSequence.numbers.join(', ')}]`);
      console.log(`📝 Context: "${bestSequence.context.substring(0, 200)}..."`);
      
      // Check current CSV
      const fs = require('fs');
      try {
        const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
        const currentLatest = csvContent.trim().split('\n')[0].split(',').map(n => parseInt(n));
        
        console.log(`\n📊 CURRENT CSV LATEST: [${currentLatest.join(', ')}]`);
        
        const isMatch = arraysEqual(bestSequence.numbers.slice(0, 6), currentLatest.slice(0, 6));
        console.log(`${isMatch ? '✅' : '❌'} CSV matches website: ${isMatch ? 'YES' : 'NO'}`);
        
        if (!isMatch) {
          console.log('⚠️  CSV may need updating with: [' + bestSequence.numbers.join(', ') + ']');
        }
        
      } catch (error) {
        console.log('❌ Could not read CSV for comparison');
      }
      
    } else {
      console.log('❌ No valid TOTO sequences found');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

function calculateScore(context) {
  let score = 0;
  const lower = context.toLowerCase();
  
  if (lower.includes('winning')) score += 3;
  if (lower.includes('result')) score += 2;
  if (lower.includes('draw')) score += 2;
  if (lower.includes('2025')) score += 2;
  if (lower.includes('aug') || lower.includes('august')) score += 2;
  if (lower.includes('16') || lower.includes('15') || lower.includes('12')) score += 1;
  if (lower.includes('previous')) score -= 2;
  if (lower.includes('last')) score -= 1;
  if (lower.includes('prize')) score -= 1;
  
  return score;
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

console.log('🚀 Starting verification...\n');
verifyLatestResult().then(() => {
  console.log('\n✅ Verification completed!');
}).catch(error => {
  console.log('\n❌ Verification failed:', error.message);
});
