import https from 'https';
import fs from 'fs';
import zlib from 'zlib';

console.log('🔍 Fetching latest TOTO results from Singapore Pools...\n');

const options = {
  hostname: 'www.singaporepools.com.sg',
  path: '/DataFileHandler.ashx?data=toto',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  
  let chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`📊 Raw Response Length: ${buffer.length} bytes`);
    
    // Check if response is gzip compressed
    const isGzipped = res.headers['content-encoding'] === 'gzip';
    console.log(`🗜️ Content-Encoding: ${res.headers['content-encoding'] || 'none'}`);
    
    if (isGzipped) {
      console.log('📦 Decompressing gzip data...');
      zlib.gunzip(buffer, (err, decompressed) => {
        if (err) {
          console.error('❌ Decompression error:', err.message);
          return;
        }
        
        const data = decompressed.toString('utf8');
        console.log(`✅ Decompressed to ${data.length} characters\n`);
        
        processData(data);
      });
    } else {
      const data = buffer.toString('utf8');
      processData(data);
    }
  });
});

function processData(data) {
  console.log(`🔍 First 500 characters:`);
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

  // Look for TOTO result patterns
  const totoPattern = /(\d{2}-\w{3}-\d{2}),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/;
  const totoResults = [];
  
  lines.forEach(line => {
    const match = line.match(totoPattern);
    if (match) {
      totoResults.push(line);
    }
  });
  
  console.log(`\n🎯 Found ${totoResults.length} TOTO result lines:`);
  totoResults.slice(0, 5).forEach((result, i) => {
    console.log(`Result ${i+1}: ${result}`);
  });

  // Check current CSV to compare
  try {
    const currentCsv = fs.readFileSync('totoResult.csv', 'utf8');
    const currentLines = currentCsv.split('\n').filter(line => line.trim());
    const latestInCsv = currentLines[0];
    console.log(`\n📋 Current latest in CSV: ${latestInCsv}`);
    
    // Look for newer results
    if (totoResults.length > 0) {
      const fetchedLatest = totoResults[0];
      console.log(`📋 Fetched latest: ${fetchedLatest}`);
      
      if (fetchedLatest !== latestInCsv) {
        console.log('\n🆕 NEW RESULTS FOUND!');
        console.log('Comparison:');
        console.log(`CSV:     ${latestInCsv}`);
        console.log(`Fetched: ${fetchedLatest}`);
        
        // Show all new results
        const newResults = [];
        for (const result of totoResults) {
          if (!currentLines.includes(result)) {
            newResults.push(result);
          } else {
            break; // Stop when we find a result that's already in CSV
          }
        }
        
        if (newResults.length > 0) {
          console.log(`\n📊 ${newResults.length} new result(s) to add:`);
          newResults.forEach((result, i) => {
            console.log(`${i+1}. ${result}`);
          });
        }
      } else {
        console.log('\n✅ CSV is up to date - no new results');
      }
    } else {
      console.log('\n❌ No valid TOTO results found in fetched data');
    }
  } catch (error) {
    console.log(`\n❌ Error reading CSV: ${error.message}`);
  }
}

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.setTimeout(15000, () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.end();