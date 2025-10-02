import axios from 'axios';
import fs from 'fs';

console.log('🔍 COMPREHENSIVE RE-CHECK FOR OCTOBER 2, 2025 TOTO RESULTS');
console.log('='.repeat(65));
console.log(`🕐 Current time: ${new Date().toISOString()}`);
console.log('');

async function comprehensiveRecheck() {
  // Strategy 1: Multiple Singapore Pools endpoints
  const endpoints = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0',
    'https://www.singaporepools.com.sg/DataFileHandler.ashx?data=toto',
    'https://www.singaporepools.com.sg/api/toto/results',
    'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/productLanding/sr/toto'
  ];

  console.log('🌐 Strategy 1: Testing multiple endpoints...');
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    try {
      console.log(`\n📡 [${i+1}/${endpoints.length}] Checking: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 20000,
        maxRedirects: 5
      });
      
      console.log(`   ✅ Status: ${response.status} | Size: ${response.data.length} chars`);
      
      // Look for October 2025 TOTO results with multiple patterns
      const content = response.data;
      
      // Pattern 1: Standard date formats
      const datePatterns = [
        /2[-\s]*Oct[-\s]*25/gi,
        /02[-\s]*Oct[-\s]*25/gi,
        /Oct[-\s]*2[-\s]*25/gi,
        /October[-\s]*2[-\s]*2025/gi,
        /2025[-\s]*10[-\s]*02/gi,
        /02[-\/\s]*10[-\/\s]*2025/gi
      ];
      
      let foundOctDate = false;
      for (const pattern of datePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   🎯 Found Oct 2 date pattern: ${matches[0]}`);
          foundOctDate = true;
        }
      }
      
      // Pattern 2: TOTO result formats
      const resultPatterns = [
        // CSV format: 2-Oct-25,1,2,3,4,5,6,7
        /(2-Oct-25|02-Oct-25)[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})[,\s]*(\d{1,2})/gi,
        // Table format with pipes
        /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g,
        // JSON format
        /"date"[:\s]*"(2-Oct-25|02-Oct-25)"/gi,
        // HTML table cells
        /<td[^>]*>(2-Oct-25|02-Oct-25)<\/td>/gi
      ];
      
      let foundResults = [];
      for (const pattern of resultPatterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          console.log(`   🎲 Found ${matches.length} result pattern matches`);
          matches.forEach((match, idx) => {
            console.log(`      Match ${idx+1}: ${match[0].substring(0, 100)}...`);
            foundResults.push(match);
          });
        }
      }
      
      // Pattern 3: Look for any recent results context
      const recentContext = [
        /latest.*result/gi,
        /most.*recent/gi,
        /current.*draw/gi,
        /today.*result/gi
      ];
      
      for (const pattern of recentContext) {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   📋 Found recent context: ${matches[0]}`);
        }
      }
      
      // If we found October date patterns, search around them
      if (foundOctDate) {
        console.log('   🔍 Found October dates - searching for nearby numbers...');
        
        // Look for number sequences near October mentions
        const octSections = content.split(/oct|october/gi);
        for (let j = 0; j < Math.min(octSections.length, 3); j++) {
          const section = octSections[j];
          const numbers = section.match(/\b\d{1,2}\b/g);
          if (numbers && numbers.length >= 6) {
            console.log(`   🎯 Numbers near Oct mention ${j+1}: [${numbers.slice(0, 8).join(', ')}]`);
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🔄 Strategy 2: Different request methods...');
  
  // Strategy 2: Try POST requests or different headers
  try {
    const postResponse = await axios.post('https://www.singaporepools.com.sg/DataFileHandler.ashx', 
      'data=toto&format=json', 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      }
    );
    console.log(`📡 POST request successful: ${postResponse.status} | ${postResponse.data.length} chars`);
    
    // Check POST response for October results
    const postContent = postResponse.data;
    if (postContent.includes('2-Oct-25') || postContent.includes('02-Oct-25')) {
      console.log('🎯 Found October 2 in POST response!');
    }
    
  } catch (error) {
    console.log(`❌ POST request failed: ${error.message}`);
  }
  
  console.log('\n📊 Strategy 3: Cross-reference with current CSV...');
  
  // Strategy 3: Check what we currently have and look for gaps
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`📋 Current CSV has ${lines.length} entries`);
    console.log(`📅 Latest entry: ${lines[0]}`);
    
    // Parse the latest date to understand the gap
    const latestLine = lines[0];
    const latestDate = latestLine.split(',')[0];
    console.log(`📆 Latest date in CSV: ${latestDate}`);
    
    // Check if there should be a draw between Sept 29 and Oct 2
    console.log('🗓️ TOTO draw schedule analysis:');
    console.log('   - TOTO typically draws on Monday and Thursday');
    console.log('   - Sept 29, 2025 was a Sunday');
    console.log('   - Oct 2, 2025 is a Wednesday');
    console.log('   - Expected next draw: Monday Sept 30 or Thursday Oct 3');
    
    // Check for Monday Sept 30 or any intermediate dates
    const intermediateResults = lines.filter(line => {
      const date = line.split(',')[0];
      return date.includes('30-Sept-25') || date.includes('1-Oct-25') || date.includes('2-Oct-25');
    });
    
    if (intermediateResults.length > 0) {
      console.log('🎯 Found intermediate results:');
      intermediateResults.forEach(result => console.log(`   ${result}`));
    } else {
      console.log('❌ No intermediate results found between Sept 29 and Oct 2');
    }
    
  } catch (error) {
    console.log(`❌ CSV analysis error: ${error.message}`);
  }
  
  console.log('\n🔍 Strategy 4: Manual validation suggestions...');
  console.log('If automated checks are inconclusive, please manually verify:');
  console.log('1. Visit https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx');
  console.log('2. Look for any draws on or after Sept 30, 2025');
  console.log('3. Check if Oct 2, 2025 (Wednesday) had a special draw');
  console.log('4. Verify TOTO draw schedule for October 2025');
  
  console.log('\n✅ Comprehensive recheck completed');
}

// Run the comprehensive recheck
comprehensiveRecheck().catch(error => {
  console.error('❌ Script error:', error.message);
});