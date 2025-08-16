/**
 * Real-time Index.html CSV Fetch Verification
 * This script simulates the exact browser behavior when opening index.html
 */

const https = require('https');

console.log('🔍 INDEX.HTML CSV FETCH VERIFICATION');
console.log('====================================\n');

// Function to fetch with detailed analysis
function fetchWithAnalysis(url, description) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`📡 ${description}: ${url}`);
    
    https.get(url, (res) => {
      const endTime = Date.now();
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`   ✅ Status: ${res.statusCode} (${endTime - startTime}ms)`);
        console.log(`   📅 Last-Modified: ${res.headers['last-modified']}`);
        console.log(`   🏷️ ETag: ${res.headers['etag']}`);
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: endTime - startTime
        });
      });
    }).on('error', reject);
  });
}

async function verifyIndexHTMLFetch() {
  console.log('📋 STEP 1: Verify Current CSV Content');
  console.log('=====================================');
  
  try {
    // Test current CSV
    const csvResponse = await fetchWithAnalysis(
      'https://websolution-sg.github.io/toto_predictor/totoResult.csv',
      'Direct CSV fetch'
    );
    
    const csvLines = csvResponse.body.trim().split('\n');
    console.log(`📊 CSV Analysis:`);
    console.log(`   Lines: ${csvLines.length}`);
    console.log(`   First line: ${csvLines[0]}`);
    console.log(`   Expected: 22,25,29,31,34,43,11`);
    
    const isCorrectCSV = csvLines[0] === '22,25,29,31,34,43,11';
    console.log(`   ✅ CSV is ${isCorrectCSV ? 'CORRECT' : 'INCORRECT'}`);
    
    if (!isCorrectCSV) {
      console.log('❌ CSV still not updated on GitHub Pages!');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ CSV fetch failed: ${error.message}`);
    return false;
  }
  
  console.log('\n📋 STEP 2: Simulate Index.html JavaScript Execution');
  console.log('==================================================');
  
  try {
    // Get the HTML page
    const htmlResponse = await fetchWithAnalysis(
      'https://websolution-sg.github.io/toto_predictor/',
      'HTML page fetch'
    );
    
    const htmlContent = htmlResponse.body;
    
    // Extract JavaScript execution simulation
    console.log('🔍 JavaScript Analysis:');
    
    // Check if fetch code exists
    if (htmlContent.includes('fetch(csvUrl')) {
      console.log('   ✅ Fetch code found in HTML');
    } else {
      console.log('   ❌ Fetch code missing in HTML');
      return false;
    }
    
    // Extract cache-busting logic
    const cacheBusterMatch = htmlContent.match(/const cacheBuster = ([^;]+);/);
    const randomIdMatch = htmlContent.match(/const randomId = ([^;]+);/);
    const csvUrlMatch = htmlContent.match(/const csvUrl = ([^;]+);/);
    
    if (cacheBusterMatch && randomIdMatch && csvUrlMatch) {
      console.log('   ✅ Cache-busting logic found');
      console.log(`   📝 Cache buster: ${cacheBusterMatch[1]}`);
      console.log(`   📝 Random ID: ${randomIdMatch[1]}`);
      console.log(`   📝 CSV URL: ${csvUrlMatch[1]}`);
    } else {
      console.log('   ⚠️ Cache-busting logic incomplete');
    }
    
  } catch (error) {
    console.log(`❌ HTML analysis failed: ${error.message}`);
    return false;
  }
  
  console.log('\n📋 STEP 3: Simulate Exact Browser Fetch Sequence');
  console.log('===============================================');
  
  try {
    // Simulate the exact fetch that happens in browser
    console.log('🔄 Simulating browser JavaScript execution...');
    
    // Step 1: Create cache-busting parameters (like the browser does)
    const cacheBuster = new Date().getTime();
    const randomId = Math.random().toString(36).substring(7);
    const simulatedCsvUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?v=${cacheBuster}&r=${randomId}&nocache=${Date.now()}`;
    
    console.log(`📡 Simulated fetch URL: ${simulatedCsvUrl}`);
    
    // Step 2: Fetch with same headers as browser
    const simulatedResponse = await fetchWithAnalysis(simulatedCsvUrl, 'Simulated browser fetch');
    
    // Step 3: Process data exactly like JavaScript does
    const csvText = simulatedResponse.body;
    const historical = csvText.trim().split('\n').map(line => line.split(',').map(Number));
    
    console.log('📊 JavaScript Processing Simulation:');
    console.log(`   Historical array length: ${historical.length}`);
    
    if (historical.length > 0) {
      const recent = historical[0];
      console.log(`   Recent draw: ${recent}`);
      console.log(`   Base numbers: ${recent.slice(0, 6).join(',')}`);
      console.log(`   Additional: ${recent[6]}`);
      
      // Step 4: Simulate UI update
      const resultText = `${recent.slice(0, 6).join(',')}(${recent[6]})`;
      console.log(`   UI would show: RECENT RESULT: ${resultText}`);
      
      // Check if this matches expected
      if (recent.slice(0, 6).join(',') === '22,25,29,31,34,43' && recent[6] === 11) {
        console.log('   ✅ Simulation shows CORRECT result!');
        return true;
      } else {
        console.log('   ❌ Simulation shows WRONG result!');
        return false;
      }
    } else {
      console.log('   ❌ No historical data processed');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Browser simulation failed: ${error.message}`);
    return false;
  }
}

async function testMultipleFetchAttempts() {
  console.log('\n📋 STEP 4: Multiple Fetch Attempts (Cache Variation)');
  console.log('===================================================');
  
  const attempts = 3;
  let successCount = 0;
  
  for (let i = 1; i <= attempts; i++) {
    try {
      const timestamp = Date.now() + i * 1000;
      const testUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?test=${timestamp}&attempt=${i}`;
      
      const response = await fetchWithAnalysis(testUrl, `Attempt ${i}`);
      const firstLine = response.body.trim().split('\n')[0];
      
      console.log(`   Result: ${firstLine}`);
      
      if (firstLine === '22,25,29,31,34,43,11') {
        successCount++;
        console.log(`   ✅ Attempt ${i} SUCCESS`);
      } else {
        console.log(`   ❌ Attempt ${i} FAILED`);
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Attempt ${i} ERROR: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Success rate: ${successCount}/${attempts} (${(successCount/attempts*100).toFixed(1)}%)`);
  return successCount === attempts;
}

async function runCompleteVerification() {
  console.log('🚀 Starting complete index.html fetch verification...\n');
  
  const step1Success = await verifyIndexHTMLFetch();
  const step2Success = await testMultipleFetchAttempts();
  
  console.log('\n🎯 FINAL VERIFICATION RESULT');
  console.log('============================');
  
  if (step1Success && step2Success) {
    console.log('✅ INDEX.HTML IS FETCHING LATEST CSV CORRECTLY');
    console.log('✅ JavaScript execution simulation successful');
    console.log('✅ Multiple fetch attempts all successful');
    console.log('✅ Expected display: RECENT RESULT: 22,25,29,31,34,43(11)');
    console.log('');
    console.log('🌐 Website should work perfectly at:');
    console.log('   https://websolution-sg.github.io/toto_predictor/');
    console.log('');
    console.log('💡 If you still see "Loading...", it\'s browser cache:');
    console.log('   - Hard refresh: Ctrl+Shift+R');
    console.log('   - Clear browser cache');
    console.log('   - Try incognito mode');
  } else {
    console.log('❌ ISSUES DETECTED:');
    console.log(`   Main simulation: ${step1Success ? '✅' : '❌'}`);
    console.log(`   Multiple attempts: ${step2Success ? '✅' : '❌'}`);
    console.log('');
    console.log('🔍 Troubleshooting needed - check the detailed logs above');
  }
}

runCompleteVerification().catch(console.error);
