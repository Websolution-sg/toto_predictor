/**
 * Comprehensive CSV Fetch Debugging Script
 * This script simulates the exact fetch behavior from index.html
 */

const https = require('https');
const http = require('http');

console.log('🔍 COMPREHENSIVE CSV FETCH DEBUGGING');
console.log('===================================\n');

// Function to test HTTPS fetch (like browsers do)
function testHttpsFetch(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`📡 Testing HTTPS fetch: ${url}`);
    
    https.get(url, (res) => {
      const endTime = Date.now();
      let data = '';
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Response time: ${endTime - startTime}ms`);
      console.log(`   Headers:`, {
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length'],
        'cache-control': res.headers['cache-control'],
        'last-modified': res.headers['last-modified']
      });
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: endTime - startTime
        });
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

// Test exact URLs that the browser would use
async function testBrowserFetchBehavior() {
  console.log('📋 Test 1: Direct CSV fetch (like browser)');
  console.log('------------------------------------------');
  
  try {
    const directResponse = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    
    if (directResponse.statusCode === 200) {
      console.log('✅ Direct fetch successful');
      const lines = directResponse.body.trim().split('\n');
      console.log(`📊 Lines: ${lines.length}`);
      console.log(`🎯 First line: ${lines[0]}`);
      
      // Validate CSV format
      const firstLineData = lines[0].split(',');
      if (firstLineData.length === 7) {
        console.log('✅ CSV format valid (7 columns)');
        console.log(`📈 Numbers: ${firstLineData.slice(0, 6).join(',')} + ${firstLineData[6]}`);
      } else {
        console.log('❌ CSV format invalid');
      }
    } else {
      console.log(`❌ Direct fetch failed with status ${directResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Direct fetch error: ${error.message}`);
  }
  
  console.log('\n📋 Test 2: Cache-busted fetch (simulating index.html)');
  console.log('----------------------------------------------------');
  
  try {
    // Simulate the exact cache-busting from index.html
    const cacheBuster = new Date().getTime();
    const randomId = Math.random().toString(36).substring(7);
    const cacheBustedUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?v=${cacheBuster}&r=${randomId}&nocache=${Date.now()}`;
    
    const cacheBustedResponse = await testHttpsFetch(cacheBustedUrl);
    
    if (cacheBustedResponse.statusCode === 200) {
      console.log('✅ Cache-busted fetch successful');
      console.log(`🎯 Response time: ${cacheBustedResponse.responseTime}ms`);
    } else {
      console.log(`❌ Cache-busted fetch failed with status ${cacheBustedResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Cache-busted fetch error: ${error.message}`);
  }
  
  console.log('\n📋 Test 3: CORS and Security Headers');
  console.log('-----------------------------------');
  
  try {
    const response = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    const headers = response.headers;
    
    console.log('🔍 Security Headers Analysis:');
    console.log(`   Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'Not set'}`);
    console.log(`   X-Frame-Options: ${headers['x-frame-options'] || 'Not set'}`);
    console.log(`   Content-Security-Policy: ${headers['content-security-policy'] || 'Not set'}`);
    console.log(`   X-Content-Type-Options: ${headers['x-content-type-options'] || 'Not set'}`);
    
    // Check if content-type is correct
    const contentType = headers['content-type'];
    console.log(`📄 Content-Type: ${contentType}`);
    
    if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
      console.log('✅ Content-Type is appropriate for CSV');
    } else {
      console.log('⚠️ Content-Type might cause issues');
    }
    
  } catch (error) {
    console.log(`❌ Headers check error: ${error.message}`);
  }
}

// Test the HTML page JavaScript execution simulation
async function testJavaScriptExecution() {
  console.log('\n📋 Test 4: JavaScript Execution Simulation');
  console.log('------------------------------------------');
  
  try {
    // Get the HTML page
    const htmlResponse = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/');
    
    if (htmlResponse.statusCode === 200) {
      console.log('✅ HTML page fetched successfully');
      
      // Check for JavaScript fetch code
      const htmlContent = htmlResponse.body;
      
      // Extract the fetch URL pattern
      const fetchMatch = htmlContent.match(/const csvUrl = `([^`]+)`/);
      if (fetchMatch) {
        console.log('✅ Found CSV URL pattern in HTML');
        console.log(`📝 Pattern: ${fetchMatch[1]}`);
      } else {
        console.log('❌ Could not find CSV URL pattern in HTML');
      }
      
      // Check for fetch implementation
      if (htmlContent.includes('fetch(csvUrl')) {
        console.log('✅ Fetch implementation found');
      } else {
        console.log('❌ Fetch implementation missing');
      }
      
      // Check for error handling
      if (htmlContent.includes('.catch(error')) {
        console.log('✅ Error handling found');
      } else {
        console.log('❌ Error handling missing');
      }
      
      // Look for any potential JavaScript errors
      if (htmlContent.includes('console.log')) {
        console.log('✅ Debug logging present');
      }
      
    } else {
      console.log(`❌ Failed to fetch HTML page: ${htmlResponse.statusCode}`);
    }
    
  } catch (error) {
    console.log(`❌ HTML page error: ${error.message}`);
  }
}

// Test potential MIME type issues
async function testMimeTypeIssues() {
  console.log('\n📋 Test 5: MIME Type and File Extension Issues');
  console.log('----------------------------------------------');
  
  try {
    const response = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    
    console.log('📄 File Analysis:');
    console.log(`   File extension: .csv`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']}`);
    console.log(`   Encoding: ${response.headers['content-encoding'] || 'none'}`);
    
    // Check if the content is actually CSV
    const content = response.body;
    const lines = content.trim().split('\n');
    
    if (lines.length > 0) {
      const firstLine = lines[0];
      const commaSeparated = firstLine.split(',').length;
      
      console.log(`📊 CSV Validation:`);
      console.log(`   Lines: ${lines.length}`);
      console.log(`   First line columns: ${commaSeparated}`);
      console.log(`   First line: "${firstLine}"`);
      
      if (commaSeparated >= 7) {
        console.log('✅ CSV structure looks correct');
      } else {
        console.log('❌ CSV structure might be incorrect');
      }
    }
    
  } catch (error) {
    console.log(`❌ MIME type test error: ${error.message}`);
  }
}

// Test GitHub Pages specific issues
async function testGitHubPagesIssues() {
  console.log('\n📋 Test 6: GitHub Pages Specific Issues');
  console.log('--------------------------------------');
  
  try {
    // Test if GitHub Pages is serving files correctly
    const indexResponse = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/');
    const csvResponse = await testHttpsFetch('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    
    console.log('🔍 GitHub Pages Analysis:');
    
    // Check server headers
    console.log(`   Server: ${indexResponse.headers.server || 'Unknown'}`);
    console.log(`   HTML Last-Modified: ${indexResponse.headers['last-modified']}`);
    console.log(`   CSV Last-Modified: ${csvResponse.headers['last-modified']}`);
    
    // Check if times match (both should be recent)
    const htmlTime = new Date(indexResponse.headers['last-modified']).getTime();
    const csvTime = new Date(csvResponse.headers['last-modified']).getTime();
    const timeDiff = Math.abs(htmlTime - csvTime) / 1000 / 60; // minutes
    
    console.log(`   Time difference: ${timeDiff.toFixed(1)} minutes`);
    
    if (timeDiff < 60) {
      console.log('✅ Both files updated recently');
    } else {
      console.log('⚠️ Files have different update times');
    }
    
    // Check for CDN caching
    if (indexResponse.headers['x-served-by'] || indexResponse.headers['cf-ray']) {
      console.log('✅ CDN detected - files served through CDN');
    }
    
  } catch (error) {
    console.log(`❌ GitHub Pages test error: ${error.message}`);
  }
}

// Run all tests
async function runComprehensiveDebugging() {
  console.log('🚀 Starting comprehensive CSV fetch debugging...\n');
  
  await testBrowserFetchBehavior();
  await testJavaScriptExecution();
  await testMimeTypeIssues();
  await testGitHubPagesIssues();
  
  console.log('\n🎯 DEBUGGING SUMMARY');
  console.log('===================');
  console.log('Analysis complete. Check the results above for any issues.');
  console.log('');
  console.log('💡 Common issues that cause "Loading..." to persist:');
  console.log('   1. JavaScript errors preventing fetch execution');
  console.log('   2. CORS policy blocking the request');
  console.log('   3. Incorrect MIME type causing fetch to fail');
  console.log('   4. Network connectivity issues');
  console.log('   5. CDN caching serving stale content');
  console.log('   6. Browser security settings blocking local file access');
}

runComprehensiveDebugging().catch(console.error);
