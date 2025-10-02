import axios from 'axios';

console.log('🔍 Checking for TOTO results on Thursday, October 2, 2025');
console.log('='.repeat(60));

async function checkOct2Results() {
  const targetDate = '2-Oct-25';
  console.log(`🎯 Looking for results on: ${targetDate}`);
  
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0',
    'https://www.singaporepools.com.sg/DataFileHandler.ashx?data=toto'
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n📡 Checking: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers['content-type']}`);
      console.log(`📏 Content Length: ${response.data.length} characters`);
      
      const content = response.data;
      
      // Look for October 2025 mentions
      const oct2Patterns = [
        /2-Oct-25/gi,
        /02-Oct-25/gi,
        /2.*Oct.*25/gi,
        /Oct.*2.*2025/gi,
        /October.*2.*2025/gi
      ];
      
      let foundOct2 = false;
      for (const pattern of oct2Patterns) {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`✅ Found October 2 pattern: ${matches.join(', ')}`);
          foundOct2 = true;
        }
      }
      
      if (!foundOct2) {
        console.log('❌ No October 2, 2025 date patterns found');
      }
      
      // Look for any TOTO result patterns around October dates
      const totoPattern = /(\d{1,2}-\w{3}-\d{2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})/g;
      const matches = [...content.matchAll(totoPattern)];
      
      console.log(`🎲 Found ${matches.length} TOTO result patterns`);
      
      // Check for recent results (September/October 2025)
      const recentResults = matches.filter(match => {
        const date = match[1];
        return date.includes('Sept-25') || date.includes('Oct-25');
      });
      
      if (recentResults.length > 0) {
        console.log(`\n🎯 Recent results found (Sept/Oct 2025):`);
        recentResults.forEach((match, i) => {
          const date = match[1];
          const numbers = match.slice(2, 9).map(n => parseInt(n));
          console.log(`${i+1}. ${date}: [${numbers.join(', ')}]`);
          
          if (date === '2-Oct-25' || date === '02-Oct-25') {
            console.log(`🎉 FOUND TARGET DATE: ${date}`);
            console.log(`🎲 Numbers: [${numbers.join(', ')}]`);
            return { date, numbers };
          }
        });
      } else {
        console.log('❌ No recent TOTO results found');
      }
      
      // Also check for any table structures
      if (content.includes('<table') || content.includes('|')) {
        console.log('📋 Found table structures - checking for TOTO data...');
        
        // Look for pipe-separated format (like your workflow uses)
        const pipePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
        const pipeMatches = [...content.matchAll(pipePattern)];
        
        if (pipeMatches.length > 0) {
          console.log(`🔍 Found ${pipeMatches.length} pipe-formatted number patterns:`);
          pipeMatches.slice(0, 3).forEach((match, i) => {
            const numbers = match.slice(1, 7).map(n => parseInt(n));
            console.log(`   ${i+1}. [${numbers.join(', ')}]`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Error with ${url}: ${error.message}`);
    }
  }
  
  // Final check - look for any October mentions in a broader search
  console.log('\n🔍 Final Check: Looking for any October 2025 TOTO activity...');
  
  try {
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const content = response.data.toLowerCase();
    
    if (content.includes('october') || content.includes('oct')) {
      console.log('✅ Found October mentions - may have recent results');
    } else {
      console.log('❌ No October mentions found');
    }
    
    if (content.includes('2025')) {
      console.log('✅ Found 2025 year mentions');
    } else {
      console.log('❌ No 2025 year mentions found');
    }
    
  } catch (error) {
    console.log(`❌ Final check failed: ${error.message}`);
  }
}

// Run the check
checkOct2Results().then(() => {
  console.log('\n📋 Check completed. If no October 2, 2025 results were found,');
  console.log('   the CSV is likely up to date with Sept 29, 2025 being the latest.');
}).catch(error => {
  console.error('❌ Script error:', error.message);
});