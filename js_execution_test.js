/**
 * JavaScript Execution Test
 * Test if the fetch is working from JavaScript perspective
 */

const https = require('https');

console.log('🔍 JAVASCRIPT EXECUTION TEST');
console.log('============================\n');

// Test 1: Verify CSV is accessible
async function testCSVAccess() {
  console.log('📋 Test 1: CSV Accessibility');
  console.log('----------------------------');
  
  return new Promise((resolve) => {
    https.get('https://websolution-sg.github.io/toto_predictor/totoResult.csv', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.trim().split('\n');
        console.log(`✅ CSV accessible: ${res.statusCode}`);
        console.log(`📊 Lines: ${lines.length}`);
        console.log(`🎯 First line: ${lines[0]}`);
        console.log(`📄 Content-Type: ${res.headers['content-type']}`);
        console.log(`🔄 Cache-Control: ${res.headers['cache-control']}`);
        resolve(lines[0] === '22,25,29,31,34,43,11');
      });
    }).on('error', (err) => {
      console.log(`❌ CSV access failed: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 2: Check HTML page JavaScript
async function testHTMLJavaScript() {
  console.log('\n📋 Test 2: HTML JavaScript Analysis');
  console.log('-----------------------------------');
  
  return new Promise((resolve) => {
    https.get('https://websolution-sg.github.io/toto_predictor/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ HTML accessible: ${res.statusCode}`);
        
        // Check for fetch implementation
        if (data.includes('fetch(csvUrl')) {
          console.log('✅ Fetch code found in HTML');
        } else {
          console.log('❌ Fetch code missing in HTML');
        }
        
        // Check for console.log statements
        if (data.includes('console.log')) {
          console.log('✅ Debug logging present');
        }
        
        // Check for error handling
        if (data.includes('.catch(error')) {
          console.log('✅ Error handling present');
        }
        
        // Check for CSV URL construction
        if (data.includes('totoResult.csv')) {
          console.log('✅ CSV URL reference found');
        }
        
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`❌ HTML access failed: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 3: Simulate browser fetch with exact same parameters
async function simulateBrowserFetch() {
  console.log('\n📋 Test 3: Browser Fetch Simulation');
  console.log('-----------------------------------');
  
  // Simulate exact fetch from index.html
  const cacheBuster = new Date().getTime();
  const randomId = Math.random().toString(36).substring(7);
  const csvUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?v=${cacheBuster}&r=${randomId}&nocache=${Date.now()}`;
  
  console.log(`📡 Simulated URL: ${csvUrl}`);
  
  return new Promise((resolve) => {
    https.get(csvUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Fetch simulation: ${res.statusCode}`);
        const lines = data.trim().split('\n');
        const historical = lines.map(line => line.split(',').map(Number));
        
        if (historical.length > 0) {
          const recent = historical[0];
          console.log(`📊 Parsed data: ${recent.slice(0, 6).join(',')} + ${recent[6]}`);
          console.log(`🎯 Expected display: RECENT RESULT: ${recent.slice(0, 6).join(',')}(${recent[6]})`);
          
          if (recent.slice(0, 6).join(',') === '22,25,29,31,34,43' && recent[6] === 11) {
            console.log('✅ Data parsing successful - should show correct result');
            resolve(true);
          } else {
            console.log('❌ Data parsing shows unexpected result');
            resolve(false);
          }
        } else {
          console.log('❌ No data parsed');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ Fetch simulation failed: ${err.message}`);
      resolve(false);
    });
  });
}

async function runJavaScriptTest() {
  console.log('🚀 Testing JavaScript execution chain...\n');
  
  const csvOk = await testCSVAccess();
  const htmlOk = await testHTMLJavaScript();
  const fetchOk = await simulateBrowserFetch();
  
  console.log('\n🎯 DIAGNOSIS');
  console.log('============');
  
  if (csvOk && htmlOk && fetchOk) {
    console.log('✅ All tests passed - JavaScript should work');
    console.log('💡 If still showing "Loading...", try:');
    console.log('   1. Hard refresh: Ctrl+Shift+R');
    console.log('   2. Clear browser cache');
    console.log('   3. Open browser DevTools and check for errors');
    console.log('   4. Try incognito/private mode');
  } else {
    console.log('❌ Some tests failed:');
    console.log(`   CSV Access: ${csvOk ? '✅' : '❌'}`);
    console.log(`   HTML JavaScript: ${htmlOk ? '✅' : '❌'}`);
    console.log(`   Fetch Simulation: ${fetchOk ? '✅' : '❌'}`);
  }
}

runJavaScriptTest().catch(console.error);
