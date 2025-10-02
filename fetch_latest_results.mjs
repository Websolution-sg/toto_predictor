import https from 'https';
import fs from 'fs';

console.log('🔍 Fetching latest TOTO results from Singapore Pools...\n');

const options = {
  hostname: 'www.singaporepools.com.sg',
  path: '/DataFileHandler.ashx?data=toto',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📊 Raw Response Length: ${data.length} characters`);
    console.log(`\n🔍 First 500 characters:`);
    console.log(data.substring(0, 500));
    console.log(`\n📝 Checking for TOTO data patterns...`);
    
    // Check for common patterns
    if (data.includes('TOTO') || data.includes('toto')) {
      console.log('✅ Found TOTO mentions');
    }
    if (data.includes(',')) {
      console.log('✅ Found comma separators');
    }
    if (data.match(/\d{2}-\w{3}-\d{2}/)) {
      console.log('✅ Found date patterns');
    }
    
    // Try to extract recent results
    const lines = data.split('\n').filter(line => line.trim());
    console.log(`\n📊 Total lines found: ${lines.length}`);
    
    if (lines.length > 0) {
      console.log(`\n🎯 First 10 lines:`);
      lines.slice(0, 10).forEach((line, i) => {
        console.log(`Line ${i+1}: ${line}`);
      });
    }

    // Check current CSV to compare
    try {
      const currentCsv = fs.readFileSync('totoResult.csv', 'utf8');
      const currentLines = currentCsv.split('\n').filter(line => line.trim());
      const latestInCsv = currentLines[0];
      console.log(`\n📋 Current latest in CSV: ${latestInCsv}`);
      
      // Look for newer results
      if (lines.length > 0) {
        const fetchedLatest = lines[0];
        console.log(`📋 Fetched latest: ${fetchedLatest}`);
        
        if (fetchedLatest !== latestInCsv) {
          console.log('\n🆕 NEW RESULTS FOUND!');
          console.log('Comparison:');
          console.log(`CSV:     ${latestInCsv}`);
          console.log(`Fetched: ${fetchedLatest}`);
        } else {
          console.log('\n✅ CSV is up to date - no new results');
        }
      }
    } catch (error) {
      console.log(`\n❌ Error reading CSV: ${error.message}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.setTimeout(15000, () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.end();