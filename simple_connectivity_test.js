// Simple connectivity and result test
const https = require('https');

console.log('🔍 SINGAPORE POOLS CONNECTIVITY TEST');
console.log('====================================');
console.log('📅 Date: August 16, 2025');
console.log(`📋 Current CSV: ${require('fs').readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0]}`);
console.log('');

const options = {
  hostname: 'www.singaporepools.com.sg',
  path: '/en/product/sr/Pages/toto_results.aspx',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

console.log('🌐 Connecting to Singapore Pools...');

const req = https.request(options, (res) => {
  console.log(`✅ Connected! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Response received: ${data.length} characters`);
    
    // Check for TOTO content
    const hasToto = data.toLowerCase().includes('toto');
    const hasWinning = data.toLowerCase().includes('winning');
    const hasResult = data.toLowerCase().includes('result');
    const has2025 = data.includes('2025');
    const hasAug = data.includes('Aug');
    
    console.log('\n🔍 CONTENT ANALYSIS:');
    console.log(`   Contains 'TOTO': ${hasToto ? '✅' : '❌'}`);
    console.log(`   Contains 'winning': ${hasWinning ? '✅' : '❌'}`);
    console.log(`   Contains 'result': ${hasResult ? '✅' : '❌'}`);
    console.log(`   Contains '2025': ${has2025 ? '✅' : '❌'}`);
    console.log(`   Contains 'Aug': ${hasAug ? '✅' : '❌'}`);
    
    // Extract numbers in TOTO range
    const numberPattern = /\b(\d{1,2})\b/g;
    const allNumbers = data.match(numberPattern);
    
    if (allNumbers) {
      const validTotoNumbers = allNumbers
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 49);
      
      console.log(`\n🔢 NUMBERS FOUND:`);
      console.log(`   Total numbers 1-49: ${validTotoNumbers.length}`);
      console.log(`   First 30 numbers: ${validTotoNumbers.slice(0, 30).join(', ')}`);
      
      // Look for potential TOTO sequences
      const sequences = [];
      for (let i = 0; i <= validTotoNumbers.length - 6; i++) {
        const sequence = validTotoNumbers.slice(i, i + 7);
        const mainNumbers = sequence.slice(0, 6);
        
        if (new Set(mainNumbers).size === 6) {
          sequences.push(sequence);
        }
      }
      
      console.log(`\n🎯 POTENTIAL TOTO SEQUENCES:`);
      if (sequences.length > 0) {
        console.log(`   Found ${sequences.length} valid sequences`);
        sequences.slice(0, 5).forEach((seq, i) => {
          console.log(`   ${i + 1}. [${seq.join(',')}]`);
        });
        
        if (sequences[0]) {
          const latestResult = sequences[0].join(',');
          console.log(`\n✅ LATEST FETCH RESULT: ${latestResult}`);
          
          // Compare with CSV
          const currentCSV = require('fs').readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
          if (currentCSV === latestResult) {
            console.log('📋 Matches current CSV - system up to date');
          } else {
            console.log('🔄 Different from CSV - update would occur');
            console.log(`   CSV has: ${currentCSV}`);
            console.log(`   Web has: ${latestResult}`);
          }
        }
      } else {
        console.log('   ❌ No valid sequences found');
      }
    } else {
      console.log('\n❌ No numbers found in response');
    }
    
    console.log('\n🎯 WORKFLOW SIMULATION COMPLETE');
    
    // Check if data looks like it contains TOTO results
    if (hasToto && hasResult && validTotoNumbers && validTotoNumbers.length > 20) {
      console.log('✅ Singapore Pools is accessible and contains TOTO data');
      console.log('🚀 Your workflow should be able to fetch results successfully');
    } else {
      console.log('⚠️  Singapore Pools response may not contain expected TOTO data');
      console.log('🔧 Website structure might have changed or results not available');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection failed: ${e.message}`);
  console.log('🔧 Check internet connection or Singapore Pools availability');
});

req.setTimeout(15000, () => {
  console.log('⏰ Request timeout - Singapore Pools taking too long to respond');
  req.destroy();
});

console.log('⏳ Fetching data...');
req.end();
