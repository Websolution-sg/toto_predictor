// Simple fetch using Node.js built-in modules
const https = require('https');
const fs = require('fs');

console.log('🚀 FETCHING FROM SINGAPORE POOLS (Built-in HTTPS)');
console.log('=================================================');

const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
console.log(`📋 Current: ${currentCSV}`);
console.log('🌐 Fetching...');

const options = {
  hostname: 'www.singaporepools.com.sg',
  path: '/en/product/sr/Pages/toto_results.aspx',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Data length: ${data.length} chars`);
    
    // Extract TOTO numbers
    const numberPattern = /\b(\d{1,2})\b/g;
    const allNumbers = data.match(numberPattern);
    
    if (allNumbers) {
      const validNumbers = allNumbers
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      console.log(`🔢 Valid numbers found: ${validNumbers.length}`);
      
      // Find valid TOTO sequences
      const sequences = [];
      for (let i = 0; i <= validNumbers.length - 6; i++) {
        const seq = validNumbers.slice(i, i + 7);
        const main = seq.slice(0, 6);
        
        if (new Set(main).size === 6) {
          sequences.push(seq);
        }
      }
      
      if (sequences.length > 0) {
        console.log(`🎯 Valid sequences: ${sequences.length}`);
        const latest = sequences[0];
        const resultStr = latest.join(',');
        
        console.log(`✅ FETCHED: ${resultStr}`);
        
        if (currentCSV === resultStr) {
          console.log('📋 MATCHES current CSV - up to date');
        } else {
          console.log('🔄 DIFFERENT from CSV - new result available');
          console.log(`   Current: ${currentCSV}`);
          console.log(`   Fetched: ${resultStr}`);
        }
      } else {
        console.log('❌ No valid sequences found');
      }
    } else {
      console.log('❌ No numbers found');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.end();
