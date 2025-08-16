/**
 * TEST MONITORING: Verify index.html CSV Fetch
 * Monitors if website shows the updated result after removing latest entry
 */

const https = require('https');

console.log('🔍 MONITORING: INDEX.HTML CSV FETCH TEST');
console.log('========================================\n');

let checkCount = 0;
const maxChecks = 15; // 15 minutes
const checkInterval = 60000; // 1 minute

function checkRemoteCSV() {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const url = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?test=${timestamp}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.trim().split('\n');
        const firstLine = lines[0];
        const lastModified = res.headers['last-modified'];
        
        console.log(`📊 Remote CSV Status:`);
        console.log(`   Lines: ${lines.length}`);
        console.log(`   First line: ${firstLine}`);
        console.log(`   Last-Modified: ${lastModified}`);
        console.log(`   Expected: 9,24,31,34,43,44,1`);
        
        resolve({
          firstLine,
          lineCount: lines.length,
          lastModified,
          isUpdated: firstLine === '9,24,31,34,43,44,1'
        });
      });
    }).on('error', (err) => {
      console.log(`❌ CSV check failed: ${err.message}`);
      resolve(null);
    });
  });
}

function checkWebsiteFetch() {
  return new Promise((resolve) => {
    https.get('https://websolution-sg.github.io/toto_predictor/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Basic check if page loads
        const hasTitle = data.includes('Singapore TOTO Predictor');
        const hasFetchCode = data.includes('fetch(csvUrl');
        
        console.log(`🌐 Website Status:`);
        console.log(`   Page loads: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   Fetch code present: ${hasFetchCode ? '✅' : '❌'}`);
        
        resolve({ hasTitle, hasFetchCode });
      });
    }).on('error', (err) => {
      console.log(`❌ Website check failed: ${err.message}`);
      resolve(null);
    });
  });
}

async function monitorTest() {
  console.log('🚀 Starting test monitoring...');
  console.log('🎯 Target: 9,24,31,34,43,44,1 (after removing latest result)');
  console.log('⏱️ Checking every minute for 15 minutes\n');
  
  while (checkCount < maxChecks) {
    const currentTime = new Date().toISOString().substr(11, 8);
    console.log(`🕐 Check #${checkCount + 1} at ${currentTime}`);
    console.log('=' + '='.repeat(40));
    
    try {
      const csvResult = await checkRemoteCSV();
      const websiteResult = await checkWebsiteFetch();
      
      if (csvResult && csvResult.isUpdated) {
        console.log('\n🎉 SUCCESS! CSV has been updated on GitHub Pages');
        console.log('✅ Remote CSV now shows: 9,24,31,34,43,44,1');
        console.log('');
        console.log('🌐 Now test the website:');
        console.log('   1. Visit: https://websolution-sg.github.io/toto_predictor/');
        console.log('   2. Hard refresh: Ctrl+Shift+R');
        console.log('   3. Expected display: RECENT RESULT: 9,24,31,34,43,44(1)');
        console.log('');
        console.log('✅ If you see the updated result, index.html IS fetching CSV correctly!');
        break;
      }
      
      checkCount++;
      
      if (checkCount < maxChecks) {
        console.log(`⏳ Waiting 1 minute... (${checkCount}/${maxChecks})\n`);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
    } catch (error) {
      console.log(`💥 Check failed: ${error.message}`);
      checkCount++;
    }
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n⏱️ MONITORING TIMEOUT');
    console.log('=====================');
    console.log('⚠️ GitHub Pages deployment taking longer than expected');
    console.log('💡 You can manually check:');
    console.log('   1. https://github.com/Websolution-sg/toto_predictor/actions');
    console.log('   2. https://websolution-sg.github.io/toto_predictor/');
  }
  
  console.log('\n📋 TEST COMPLETION STEPS:');
  console.log('=========================');
  console.log('1. ✅ Removed latest result from CSV');
  console.log('2. ✅ Committed and pushed changes');
  console.log('3. ⏳ Waiting for GitHub Pages deployment');
  console.log('4. 🎯 Check if website shows: RECENT RESULT: 9,24,31,34,43,44(1)');
  console.log('5. 🔄 Add back latest result: 22,25,29,31,34,43,11');
}

// Start monitoring
monitorTest().catch(console.error);
