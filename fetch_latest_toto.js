const https = require('https');
const fs = require('fs');

console.log('🎯 FETCHING LATEST TOTO RESULTS FROM SINGAPORE POOLS');
console.log('=====================================================');

// Try multiple endpoints
const endpoints = [
  'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
  'https://online.singaporepools.com/en/lottery',
  'https://www.singaporepools.com.sg/DataFeed/Lottery/Output/toto_result.xml'
];

async function fetchFromEndpoint(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ status: res.statusCode, data, url });
      });
    });

    req.on('error', (error) => {
      reject({ error, url });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ error: 'Timeout', url });
    });
  });
}

function extractTOTONumbers(html) {
  const results = [];
  
  // Multiple regex patterns to catch different formats
  const patterns = [
    // Pattern 1: Standard table format
    /<td[^>]*>(\d{1,2}-\w{3}-\d{2,4})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>/gi,
    
    // Pattern 2: Div based format
    /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]*?(\d{1,2}-\w{3}-\d{2,4})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})/gi,
    
    // Pattern 3: JSON-like format
    /"date":\s*"([^"]+)"[\s\S]*?"numbers":\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\][\s\S]*?"additional":\s*(\d+)/gi,
    
    // Pattern 4: Simple number sequence with date
    /(\d{1,2}\/\d{1,2}\/\d{4})[^0-9]*(\d{1,2})[^0-9]+(\d{1,2})[^0-9]+(\d{1,2})[^0-9]+(\d{1,2})[^0-9]+(\d{1,2})[^0-9]+(\d{1,2})[^0-9]+(\d{1,2})/gi
  ];

  console.log('🔍 Analyzing HTML content...');
  console.log(`📄 Content length: ${html.length} characters`);
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    let match;
    
    console.log(`🎯 Trying pattern ${i + 1}...`);
    
    while ((match = pattern.exec(html)) !== null) {
      if (match.length >= 8) {
        const date = match[1];
        const numbers = [
          parseInt(match[2]), parseInt(match[3]), parseInt(match[4]),
          parseInt(match[5]), parseInt(match[6]), parseInt(match[7])
        ];
        const additional = parseInt(match[8]);
        
        // Validate numbers are in TOTO range (1-49)
        if (numbers.every(n => n >= 1 && n <= 49) && additional >= 1 && additional <= 49) {
          console.log(`✅ Found valid result: ${date} - Numbers: ${numbers.join(',')} Additional: ${additional}`);
          results.push({
            date,
            numbers,
            additional,
            raw: match[0].substring(0, 100) + '...'
          });
        }
      }
    }
    
    if (results.length > 0) {
      console.log(`🎉 Pattern ${i + 1} found ${results.length} results!`);
      break;
    }
  }
  
  return results;
}

async function main() {
  for (const url of endpoints) {
    try {
      console.log(`\n🌐 Trying: ${url}`);
      
      const result = await fetchFromEndpoint(url);
      console.log(`✅ Status: ${result.status}`);
      
      if (result.status === 200) {
        console.log(`📄 Content received: ${result.data.length} bytes`);
        
        // Save raw content for debugging
        fs.writeFileSync('debug_content.html', result.data);
        console.log('💾 Raw content saved to debug_content.html');
        
        const totoResults = extractTOTONumbers(result.data);
        
        if (totoResults.length > 0) {
          console.log('\n🎯 EXTRACTED TOTO RESULTS:');
          console.log('===========================');
          
          totoResults.forEach((result, index) => {
            console.log(`\n📊 Result ${index + 1}:`);
            console.log(`   Date: ${result.date}`);
            console.log(`   Numbers: ${result.numbers.join(', ')}`);
            console.log(`   Additional: ${result.additional}`);
          });
          
          // Check if this is newer than our current data
          const currentCSV = fs.readFileSync('totoResult.csv', 'utf8');
          const currentLatest = currentCSV.split('\n')[0];
          
          console.log(`\n📊 Current CSV latest: ${currentLatest}`);
          
          return totoResults;
        } else {
          console.log('❌ No valid TOTO results found in content');
          
          // Show some sample content for debugging
          const sample = result.data.substring(0, 500).replace(/\s+/g, ' ');
          console.log(`🔍 Content sample: ${sample}...`);
        }
      } else {
        console.log(`❌ HTTP Error: ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message || error}`);
    }
  }
  
  console.log('\n🏁 FETCH COMPLETE - No new results found');
}

main().catch(console.error);