const fetch = require('node-fetch');

async function quickValidationTest() {
  console.log('🔍 QUICK VALIDATION: Testing Singapore Pools website access...');
  console.log('📅 Current time:', new Date().toLocaleString());
  console.log('');
  
  try {
    console.log('🌐 Attempting to fetch Singapore Pools TOTO results page...');
    
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Content Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`📄 HTML Length: ${html.length} characters`);
      
      // Check for TOTO content
      const hasContent = html.toLowerCase().includes('toto');
      console.log(`🎯 Contains TOTO content: ${hasContent ? '✅ YES' : '❌ NO'}`);
      
      if (hasContent) {
        // Look for recent dates
        const dateMatches = html.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
        if (dateMatches) {
          console.log(`📅 Found dates: ${dateMatches.slice(0, 3).join(', ')}${dateMatches.length > 3 ? '...' : ''}`);
        }
        
        // Look for number patterns
        const numberMatches = html.match(/(\d{1,2})/g);
        if (numberMatches) {
          const validNumbers = numberMatches
            .map(n => parseInt(n))
            .filter(n => n >= 1 && n <= 49);
          console.log(`🔢 Found ${validNumbers.length} valid TOTO numbers (1-49)`);
          
          if (validNumbers.length >= 7) {
            console.log(`🎲 First 7 valid numbers found: [${validNumbers.slice(0, 7).join(', ')}]`);
          }
        }
        
        // Check for winning/result keywords
        const keywords = ['winning', 'result', 'latest', 'draw'];
        const foundKeywords = keywords.filter(word => html.toLowerCase().includes(word));
        console.log(`🔍 Found keywords: ${foundKeywords.join(', ')}`);
        
      } else {
        console.log('⚠️ No TOTO content detected - may be redirected or blocked');
      }
      
    } else {
      console.log(`❌ Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 DNS resolution failed - check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Request timed out - server may be slow');
    }
  }
  
  console.log('');
  console.log('🎯 VALIDATION SUMMARY:');
  console.log('   This test shows what your workflow is trying to fetch');
  console.log('   from the Singapore Pools website in real-time.');
}

quickValidationTest();
