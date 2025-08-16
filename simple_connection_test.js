// Simple connection test
const https = require('https');

console.log('🔍 Testing Singapore Pools connection...');

const options = {
  hostname: 'www.singaporepools.com.sg',
  path: '/en/product/sr/Pages/toto_results.aspx',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Response status: ${res.statusCode}`);
  console.log(`📄 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Response length: ${data.length} characters`);
    
    // Look for TOTO number patterns
    const numberPattern = /\b(\d{1,2})\b/g;
    const numbers = data.match(numberPattern);
    
    if (numbers) {
      const validNumbers = numbers
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      console.log(`🔢 Found ${validNumbers.length} valid TOTO-range numbers`);
      
      // Look for the expected sequence
      const expectedSequence = [22, 25, 29, 31, 34, 43, 11];
      const expectedStr = expectedSequence.join(',');
      
      if (data.includes('22') && data.includes('25') && data.includes('29') && 
          data.includes('31') && data.includes('34') && data.includes('43')) {
        console.log('✅ Expected numbers found in content!');
        
        // Try to find them in sequence
        let found = false;
        for (let i = 0; i <= validNumbers.length - 6; i++) {
          const sequence = validNumbers.slice(i, i + 7);
          if (sequence.join(',') === expectedStr) {
            console.log(`🎯 EXACT MATCH FOUND: ${sequence.join(',')}`);
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log('🔍 Numbers present but not in expected sequence');
          console.log('First 20 valid numbers:', validNumbers.slice(0, 20).join(','));
        }
      } else {
        console.log('⚠️  Expected numbers not all found in content');
        console.log('First 20 valid numbers found:', validNumbers.slice(0, 20).join(','));
      }
    } else {
      console.log('❌ No numbers found in response');
    }
    
    // Check for key indicators
    if (data.includes('TOTO') || data.includes('toto')) {
      console.log('✅ TOTO content detected');
    } else {
      console.log('⚠️  No TOTO content detected');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.setTimeout(10000, () => {
  console.log('❌ Request timeout');
  req.destroy();
});

req.end();
