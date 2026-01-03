const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

console.log('🎯 FETCHING LATEST TOTO RESULTS FROM SINGAPORE POOLS');
console.log('=====================================================');

async function fetchTOTOResults() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.singaporepools.com.sg',
      path: '/en/product/Pages/toto_results.aspx',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000
    };

    console.log('🌐 Connecting to Singapore Pools...');
    
    const req = https.request(options, (res) => {
      console.log(`✅ Response Status: ${res.statusCode}`);
      console.log(`📋 Content-Type: ${res.headers['content-type']}`);
      console.log(`🗜️ Content-Encoding: ${res.headers['content-encoding']}`);
      
      let stream = res;
      
      // Handle compression
      if (res.headers['content-encoding'] === 'gzip') {
        stream = zlib.createGunzip();
        res.pipe(stream);
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = zlib.createInflate();
        res.pipe(stream);
      } else if (res.headers['content-encoding'] === 'br') {
        stream = zlib.createBrotliDecompress();
        res.pipe(stream);
      }
      
      let data = '';
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        console.log(`📄 Content received: ${data.length} characters`);
        
        // Save readable content
        fs.writeFileSync('singapore_pools_content.html', data);
        console.log('💾 Content saved to singapore_pools_content.html');
        
        const results = extractTOTOResults(data);
        resolve(results);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Stream error:', error.message);
        reject(error);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function extractTOTOResults(html) {
  console.log('🔍 Extracting TOTO results from HTML...');
  
  const results = [];
  
  // Pattern for TOTO results table - try multiple variations
  const patterns = [
    // Pattern 1: Table with date and numbers
    /<tr[^>]*>[\s\S]*?<td[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>/gi,
    
    // Pattern 2: Alternative date format
    /<tr[^>]*>[\s\S]*?<td[^>]*>(\d{1,2}-\w{3}-\d{2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>[\s\S]*?<td[^>]*>(\d{1,2})<\/td>/gi,
    
    // Pattern 3: Look for any sequence of 7 numbers with date
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})/g
  ];
  
  // Also look for specific text patterns
  const textSearches = [
    'winning numbers',
    'toto result',
    'draw date',
    'additional number'
  ];
  
  console.log('🔍 Searching for TOTO-related content...');
  textSearches.forEach(search => {
    const regex = new RegExp(search, 'gi');
    const matches = html.match(regex);
    if (matches) {
      console.log(`✅ Found "${search}": ${matches.length} occurrences`);
    }
  });
  
  // Look for table structures
  const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  console.log(`🔍 Found ${tableMatches ? tableMatches.length : 0} tables`);
  
  if (tableMatches) {
    tableMatches.forEach((table, index) => {
      console.log(`📊 Table ${index + 1} sample: ${table.substring(0, 200)}...`);
      
      // Check if table contains numbers that could be TOTO results
      const numbers = table.match(/\b\d{1,2}\b/g);
      if (numbers && numbers.length >= 6) {
        console.log(`🎯 Table ${index + 1} contains ${numbers.length} numbers: ${numbers.slice(0, 10).join(', ')}...`);
      }
    });
  }
  
  // Try patterns
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    let match;
    
    console.log(`🎯 Trying extraction pattern ${i + 1}...`);
    
    while ((match = pattern.exec(html)) !== null) {
      try {
        const date = match[1];
        const numbers = [
          parseInt(match[2]), parseInt(match[3]), parseInt(match[4]),
          parseInt(match[5]), parseInt(match[6]), parseInt(match[7])
        ];
        const additional = parseInt(match[8]);
        
        // Validate
        if (numbers.every(n => n >= 1 && n <= 49) && additional >= 1 && additional <= 49) {
          console.log(`✅ Valid TOTO result found!`);
          console.log(`   Date: ${date}`);
          console.log(`   Numbers: ${numbers.join(', ')}`);
          console.log(`   Additional: ${additional}`);
          
          results.push({
            date: formatDate(date),
            numbers: numbers.sort((a, b) => a - b),
            additional
          });
        }
      } catch (error) {
        // Skip invalid matches
      }
    }
    
    if (results.length > 0) break;
  }
  
  return results;
}

function formatDate(dateStr) {
  // Convert various date formats to DD-MMM-YY format
  try {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr; // Return as-is if conversion fails
  }
}

async function main() {
  try {
    const results = await fetchTOTOResults();
    
    if (results.length > 0) {
      console.log('\n🎯 LATEST SINGAPORE POOLS TOTO RESULTS:');
      console.log('=======================================');
      
      results.forEach((result, index) => {
        console.log(`\n📊 Result ${index + 1}:`);
        console.log(`   📅 Date: ${result.date}`);
        console.log(`   🎯 Winning Numbers: ${result.numbers.join(', ')}`);
        console.log(`   ➕ Additional Number: ${result.additional}`);
      });
      
      // Compare with current CSV
      try {
        const currentCSV = fs.readFileSync('totoResult.csv', 'utf8');
        const currentLatest = currentCSV.split('\n')[0];
        console.log(`\n📊 Current CSV Latest: ${currentLatest}`);
        
        const latestResult = results[0];
        const newEntry = `${latestResult.date},${latestResult.numbers.join(',')},${latestResult.additional}`;
        
        if (newEntry !== currentLatest) {
          console.log(`🔄 New result detected!`);
          console.log(`   New: ${newEntry}`);
          console.log(`   Old: ${currentLatest}`);
        } else {
          console.log(`✅ Results are up to date`);
        }
      } catch (error) {
        console.log(`⚠️ Could not compare with CSV: ${error.message}`);
      }
    } else {
      console.log('\n❌ No TOTO results extracted');
      console.log('🔍 The website structure may have changed');
      console.log('📋 Check singapore_pools_content.html for manual review');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

main();