const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Simplified debug test to see what's happening with fetching
async function debugFetch() {
  console.log('🔍 DEBUGGING TOTO FETCH ISSUE');
  console.log('='.repeat(50));
  
  try {
    console.log('📡 Fetching Singapore Pools...');
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response OK: ${response.ok}`);
    
    if (!response.ok) {
      console.log('❌ Response not OK, workflow would exit here');
      return;
    }
    
    const html = await response.text();
    console.log(`📄 HTML length: ${html.length}`);
    
    // Test the exact pattern from the updateTotoCSV.cjs
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`🔍 Found ${matches.length} table pattern matches`);
    
    if (matches.length > 0) {
      console.log('✅ PATTERN MATCHING WORKS!');
      for (let i = 0; i < Math.min(3, matches.length); i++) {
        const match = matches[i];
        const numbers = match.slice(1, 7).map(n => parseInt(n));
        console.log(`   Match ${i + 1}: [${numbers.join(', ')}]`);
        
        // Look for additional number after first match
        if (i === 0) {
          const afterMatch = html.substring(match.index + match[0].length, match.index + match[0].length + 500);
          const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
          const additionalMatch = afterMatch.match(additionalPattern);
          
          if (additionalMatch) {
            const additional = parseInt(additionalMatch[1]);
            const fullResult = [...numbers, additional];
            console.log(`   ✅ FULL RESULT: [${fullResult.join(', ')}]`);
            
            // Check against current CSV
            const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
            const lines = csvContent.trim().split('\n');
            const currentTop = lines[0].split(',').map(n => parseInt(n.trim()));
            
            console.log(`📊 Current CSV top: [${currentTop.join(', ')}]`);
            console.log(`🔍 Results equal: ${JSON.stringify(fullResult.sort()) === JSON.stringify(currentTop.sort())}`);
            
            if (JSON.stringify(fullResult.sort()) !== JSON.stringify(currentTop.sort())) {
              console.log('🎉 NEW RESULT DETECTED - Should update CSV!');
              return { shouldUpdate: true, newResult: fullResult, currentTop };
            } else {
              console.log('ℹ️ Same result - no update needed');
              return { shouldUpdate: false, reason: 'Same result' };
            }
          } else {
            console.log('❌ Additional number not found');
          }
        }
      }
    } else {
      console.log('❌ NO PATTERN MATCHES - This is the problem!');
      
      // Debug: Show a sample of HTML content around "toto" or numbers
      const lowerHtml = html.toLowerCase();
      const totoIndex = lowerHtml.indexOf('toto');
      if (totoIndex !== -1) {
        console.log('\n📋 HTML around "toto":');
        console.log(html.substring(Math.max(0, totoIndex - 200), totoIndex + 800));
      }
      
      // Look for any table-like patterns
      const anyTablePattern = /\|\s*\d+\s*\|/g;
      const anyMatches = [...html.matchAll(anyTablePattern)];
      console.log(`🔍 Found ${anyMatches.length} simple table patterns`);
      if (anyMatches.length > 0) {
        console.log('Sample table patterns:');
        anyMatches.slice(0, 5).forEach((match, i) => {
          console.log(`   ${i + 1}: ${match[0]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ This error would cause workflow to exit without updating');
  }
}

debugFetch().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('🏁 DEBUG COMPLETE');
  if (result) {
    if (result.shouldUpdate) {
      console.log('✅ Issue found: Fetching works but CSV not updating');
      console.log(`   New: [${result.newResult.join(', ')}]`);
      console.log(`   Old: [${result.currentTop.join(', ')}]`);
      console.log('💡 Problem likely in the update logic or git operations');
    } else {
      console.log('ℹ️ No update needed - results are the same');
      console.log(`   Reason: ${result.reason}`);
    }
  } else {
    console.log('❌ Fetching failed - this explains why CSV not updating');
  }
  console.log('='.repeat(50));
});
