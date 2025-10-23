// Quick TOTO Results Checker - Get Latest Winning Numbers
// Date: October 23, 2025

console.log('🎯 SINGAPORE POOLS TOTO RESULTS CHECKER');
console.log('=====================================');
console.log('📅 Checking latest TOTO winning numbers...\n');

async function fetchLatestTotoResults() {
  try {
    console.log('🌐 Connecting to Singapore Pools...');
    
    // Try the main TOTO results page
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('✅ Successfully connected to Singapore Pools');
    console.log(`📄 Page loaded: ${html.length} characters\n`);

    // Look for TOTO winning numbers patterns
    const patterns = [
      /winning numbers[^:]*:?\s*(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})(?:[,\s]+(\d{1,2}))?/gi,
      /toto.{0,50}?(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})(?:[,\s]+(\d{1,2}))?/gi,
      /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})(?:[,\s]+(\d{1,2}))?/g
    ];

    // Look for date patterns
    const datePatterns = [
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/gi,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g
    ];

    let foundResults = [];

    console.log('🔍 Searching for TOTO winning numbers...');
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(html)) !== null && foundResults.length < 5) {
        const numbers = [];
        for (let j = 1; j <= 7; j++) {
          if (match[j] && !isNaN(parseInt(match[j]))) {
            const num = parseInt(match[j]);
            if (num >= 1 && num <= 49) {
              numbers.push(num);
            }
          }
        }
        
        if (numbers.length >= 6) {
          foundResults.push({
            pattern: i + 1,
            numbers: numbers,
            fullMatch: match[0].trim()
          });
        }
      }
    }

    console.log(`📊 Found ${foundResults.length} potential TOTO number sets:\n`);

    if (foundResults.length === 0) {
      console.log('❌ No TOTO winning numbers found on the page');
      console.log('🔍 This could mean:');
      console.log('   • The page structure has changed');
      console.log('   • The numbers are loaded dynamically via JavaScript');
      console.log('   • The page requires different access methods\n');
      
      // Try to find any numbers at all
      const anyNumbers = html.match(/\b([1-4]?[0-9])\b/g);
      if (anyNumbers) {
        const validNumbers = anyNumbers
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49)
          .slice(0, 20);
        
        if (validNumbers.length > 0) {
          console.log(`🔢 Found some valid numbers (1-49) on page: ${validNumbers.join(', ')}`);
        }
      }
      
      return null;
    }

    // Display results
    foundResults.forEach((result, index) => {
      console.log(`🎯 Result ${index + 1} (Pattern ${result.pattern}):`);
      console.log(`   Numbers: ${result.numbers.join(', ')}`);
      console.log(`   Count: ${result.numbers.length} numbers`);
      console.log(`   Source: "${result.fullMatch}"`);
      console.log('');
    });

    // Find the most likely result (6 or 7 numbers)
    const validResults = foundResults.filter(r => r.numbers.length === 6 || r.numbers.length === 7);
    
    if (validResults.length > 0) {
      const latest = validResults[0];
      console.log('🏆 MOST LIKELY LATEST TOTO RESULT:');
      console.log(`   Winning Numbers: ${latest.numbers.slice(0, 6).join(', ')}`);
      if (latest.numbers.length === 7) {
        console.log(`   Additional Number: ${latest.numbers[6]}`);
      }
      console.log(`   Total Numbers Found: ${latest.numbers.length}`);
      
      return latest;
    }

    return foundResults[0] || null;

  } catch (error) {
    console.error('❌ Error fetching TOTO results:', error.message);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('• Check internet connection');
    console.log('• Singapore Pools website might be temporarily unavailable');
    console.log('• Website structure may have changed');
    return null;
  }
}

// Also check our local CSV file for the latest stored result
async function checkLocalResults() {
  try {
    console.log('📁 Checking local TOTO results file...');
    
    const fs = await import('fs');
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length > 1) {
      const latestLine = lines[lines.length - 1];
      const parts = latestLine.split(',');
      
      if (parts.length >= 8) {
        const date = parts[0];
        const numbers = parts.slice(1, 7).map(n => parseInt(n.trim()));
        const additional = parseInt(parts[7].trim());
        
        console.log('📊 LATEST STORED RESULT (from local CSV):');
        console.log(`   Draw Date: ${date}`);
        console.log(`   Winning Numbers: ${numbers.join(', ')}`);
        console.log(`   Additional Number: ${additional}`);
        console.log(`   Total entries in CSV: ${lines.length - 1}`);
        return { date, numbers, additional };
      }
    }
  } catch (error) {
    console.log('❌ Could not read local CSV file:', error.message);
  }
  return null;
}

// Main execution
async function main() {
  // Check local results first
  const localResult = await checkLocalResults();
  
  console.log('\n' + '='.repeat(50));
  
  // Then try to fetch latest from website
  const webResult = await fetchLatestTotoResults();
  
  console.log('\n🎯 SUMMARY:');
  console.log('='.repeat(20));
  
  if (localResult) {
    console.log(`📁 Local CSV Latest: ${localResult.numbers.join(', ')} + ${localResult.additional} (${localResult.date})`);
  }
  
  if (webResult) {
    console.log(`🌐 Website Latest: ${webResult.numbers.join(', ')}`);
  }
  
  if (!webResult && !localResult) {
    console.log('❌ No TOTO results found from any source');
  }
  
  console.log('\n✅ TOTO Results Check Complete');
}

// Run the check
main().catch(console.error);