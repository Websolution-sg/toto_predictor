// Direct Singapore Pools API/Data fetch attempt
const https = require('https');
const fs = require('fs');

console.log('🎯 ATTEMPTING DIRECT SINGAPORE POOLS DATA EXTRACTION');
console.log('================================================');

// Try different Singapore Pools endpoints
const endpoints = [
  {
    name: 'Mobile API',
    url: 'https://m.singaporepools.com.sg/api/lottery/toto/latest'
  },
  {
    name: 'Data Feed XML',
    url: 'https://www.singaporepools.com.sg/DataFeed/Lottery/Output/toto_result.xml'
  },
  {
    name: 'JSON API',
    url: 'https://www.singaporepools.com.sg/api/lottery/toto/results/latest'
  },
  {
    name: 'Results Feed',
    url: 'https://www.singaporepools.com.sg/datafeeds/lottery/toto_result.xml'
  }
];

async function tryEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`\n🌐 Trying: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/xml, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    };

    const req = https.get(endpoint.url, options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      
      if (res.statusCode === 302 || res.statusCode === 301) {
        console.log(`   Redirect to: ${res.headers.location}`);
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Data length: ${data.length} bytes`);
        
        if (data.length > 0) {
          // Save for inspection
          const filename = `${endpoint.name.toLowerCase().replace(/\s+/g, '_')}_response.txt`;
          fs.writeFileSync(filename, data);
          console.log(`   💾 Saved to: ${filename}`);
          
          // Try to extract TOTO data
          const results = parseAnyFormat(data, endpoint.name);
          resolve({ endpoint: endpoint.name, results, raw: data });
        } else {
          resolve({ endpoint: endpoint.name, results: [], raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ endpoint: endpoint.name, results: [], error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ Timeout`);
      req.destroy();
      resolve({ endpoint: endpoint.name, results: [], error: 'Timeout' });
    });
  });
}

function parseAnyFormat(data, source) {
  console.log(`🔍 Parsing ${source} data...`);
  const results = [];
  
  try {
    // Try JSON first
    const json = JSON.parse(data);
    console.log(`   📊 JSON parsed successfully`);
    
    // Look for TOTO-like data in JSON
    const findTotoInObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          findTotoInObject(value, currentPath);
        } else if (typeof value === 'string' || typeof value === 'number') {
          // Look for patterns that might be TOTO results
          if (key.toLowerCase().includes('date') || key.toLowerCase().includes('draw')) {
            console.log(`   📅 Found date field: ${currentPath} = ${value}`);
          }
          if (key.toLowerCase().includes('number') || key.toLowerCase().includes('result')) {
            console.log(`   🎯 Found number field: ${currentPath} = ${value}`);
          }
        }
      }
    };
    
    findTotoInObject(json);
    
  } catch (jsonError) {
    // Try XML
    if (data.includes('<?xml') || data.includes('<xml')) {
      console.log(`   📋 XML format detected`);
      
      // Extract XML data with regex
      const xmlPatterns = [
        /<draw[^>]*date="([^"]*)"[^>]*>[\s\S]*?<numbers>([^<]*)<\/numbers>[\s\S]*?<additional>([^<]*)<\/additional>/gi,
        /<result[^>]*>[\s\S]*?<date>([^<]*)<\/date>[\s\S]*?<numbers>([^<]*)<\/numbers>/gi,
        /<toto[^>]*>[\s\S]*?<drawDate>([^<]*)<\/drawDate>[\s\S]*?<winningNumbers>([^<]*)<\/winningNumbers>/gi
      ];
      
      xmlPatterns.forEach((pattern, index) => {
        let match;
        console.log(`   🎯 Trying XML pattern ${index + 1}...`);
        
        while ((match = pattern.exec(data)) !== null) {
          console.log(`   ✅ XML match found: ${match[0].substring(0, 100)}...`);
          results.push({
            source: `${source} - XML Pattern ${index + 1}`,
            date: match[1],
            data: match[2],
            additional: match[3] || null
          });
        }
      });
    } else {
      // Try text patterns
      console.log(`   📄 Text format - searching for patterns`);
      
      // Look for date patterns
      const datePatterns = [
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
        /(\d{1,2}-\w{3}-\d{2})/g
      ];
      
      datePatterns.forEach((pattern, index) => {
        const matches = data.match(pattern);
        if (matches) {
          console.log(`   📅 Date pattern ${index + 1} found: ${matches.slice(0, 3).join(', ')}`);
        }
      });
      
      // Look for number sequences
      const numberSequences = data.match(/\b\d{1,2}\b/g);
      if (numberSequences) {
        const validTotoNumbers = numberSequences
          .map(n => parseInt(n))
          .filter(n => n >= 1 && n <= 49);
        
        if (validTotoNumbers.length >= 6) {
          console.log(`   🎯 Found ${validTotoNumbers.length} valid TOTO numbers: ${validTotoNumbers.slice(0, 10).join(', ')}...`);
        }
      }
    }
  }
  
  return results;
}

async function main() {
  console.log(`📅 Current time: ${new Date().toISOString()}`);
  
  const allResults = [];
  
  for (const endpoint of endpoints) {
    const result = await tryEndpoint(endpoint);
    allResults.push(result);
    
    if (result.results && result.results.length > 0) {
      console.log(`\n🎉 SUCCESS: Found ${result.results.length} results from ${result.endpoint}!`);
      result.results.forEach((res, index) => {
        console.log(`\n📊 Result ${index + 1}:`);
        console.log(`   Source: ${res.source}`);
        console.log(`   Date: ${res.date}`);
        console.log(`   Data: ${res.data}`);
        if (res.additional) console.log(`   Additional: ${res.additional}`);
      });
    }
  }
  
  // Summary
  console.log('\n🏁 EXTRACTION SUMMARY');
  console.log('====================');
  
  const successful = allResults.filter(r => r.results && r.results.length > 0);
  
  if (successful.length > 0) {
    console.log(`✅ ${successful.length} endpoint(s) returned data`);
    successful.forEach(s => {
      console.log(`   - ${s.endpoint}: ${s.results.length} result(s)`);
    });
  } else {
    console.log('❌ No TOTO results found from any endpoint');
    console.log('\n🔍 Recommendations:');
    console.log('   1. Check manual Singapore Pools website');
    console.log('   2. Results may be behind login/CAPTCHA');
    console.log('   3. Website structure may have changed');
    console.log('   4. Try during Singapore business hours');
  }
  
  // Show current CSV for comparison
  try {
    const currentCSV = fs.readFileSync('totoResult.csv', 'utf8');
    const currentLatest = currentCSV.split('\n')[0];
    console.log(`\n📊 Current CSV Latest: ${currentLatest}`);
  } catch (error) {
    console.log(`⚠️ Could not read current CSV: ${error.message}`);
  }
}

main().catch(console.error);