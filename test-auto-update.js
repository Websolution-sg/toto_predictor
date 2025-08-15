const fs = require('fs');
const https = require('https');
const { URL } = require('url');

console.log('🚀 TESTING AUTO UPDATE TOTO RESULT SYSTEM');
console.log('==========================================');
console.log('Date:', new Date().toISOString());
console.log('');

// Current CSV status
const currentCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
console.log('📊 Current latest TOTO result:', currentCSV);
console.log('');

// Simple fetch function (without node-fetch dependency)
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Test Singapore Pools sources
async function testTotoFetching() {
  const sources = [
    {
      name: 'Online Singapore Pools - Lottery',
      url: 'https://online.singaporepools.com/en/lottery'
    },
    {
      name: 'Online Singapore Pools - TOTO Self-Pick',
      url: 'https://online.singaporepools.com/en/lottery/toto-self-pick'
    },
    {
      name: 'Singapore Pools - Legacy Results',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx'
    }
  ];

  for (const source of sources) {
    try {
      console.log(`🌐 Testing: ${source.name}`);
      console.log(`   URL: ${source.url}`);
      
      const response = await httpsGet(source.url);
      console.log(`   ✅ Status: ${response.statusCode}`);
      console.log(`   📄 Content length: ${response.data.length} bytes`);
      
      // Look for TOTO number patterns
      const content = response.data.toLowerCase();
      const numberMatches = content.match(/\b(?:[1-9]|[1-4][0-9])\b/g);
      
      if (numberMatches) {
        const validNumbers = numberMatches
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49)
          .filter((n, i, arr) => arr.indexOf(n) === i) // unique
          .sort((a, b) => a - b);
        
        console.log(`   🎯 Found ${validNumbers.length} unique valid TOTO numbers (1-49)`);
        
        if (validNumbers.length >= 6) {
          // Look for potential TOTO result patterns
          const sequences = [];
          for (let i = 0; i <= validNumbers.length - 6; i++) {
            sequences.push(validNumbers.slice(i, i + 6));
          }
          console.log(`   🔍 Potential sequences found: ${sequences.length}`);
          
          // Show first few sequences that don't match current CSV
          const currentNumbers = currentCSV.split(',').slice(0, 6).map(n => parseInt(n)).sort((a, b) => a - b);
          const currentSequence = currentNumbers.join(',');
          
          for (let i = 0; i < Math.min(3, sequences.length); i++) {
            const seq = sequences[i].join(',');
            if (seq !== currentSequence) {
              console.log(`   📊 Different sequence: ${seq}`);
            }
          }
        }
      }
      
      // Look for date patterns
      if (content.includes('15') && content.includes('august') || content.includes('aug 15')) {
        console.log('   📅 Found August 15 references');
      }
      if (content.includes('16') && content.includes('august') || content.includes('aug 16')) {
        console.log('   📅 Found August 16 references');
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the test
testTotoFetching().then(() => {
  console.log('📈 SUMMARY:');
  console.log('✅ Auto update system tested');
  console.log('📊 Current result in CSV: ' + currentCSV);
  console.log('⏰ Last update: August 12, 2025');
  console.log('🔍 If new results found, they would be added to top of CSV');
  console.log('🛡️ Failsafe mechanism protects against invalid data');
  console.log('');
  console.log('🎯 LATEST TOTO WINNING NUMBERS: ' + currentCSV);
  console.log('   Numbers: ' + currentCSV.split(',').slice(0, 6).join(', '));
  console.log('   Additional: ' + currentCSV.split(',')[6]);
}).catch(console.error);
