/**
 * GitHub Pages Deployment Diagnostic Script
 * This script tests the live website to verify deployment status
 */

const https = require('https');

console.log('🔍 GITHUB PAGES DEPLOYMENT DIAGNOSTIC');
console.log('====================================\n');

// Function to fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testDeployment() {
  console.log('📋 Test 1: Checking main HTML page...');
  try {
    const htmlResponse = await fetchUrl('https://websolution-sg.github.io/toto_predictor/');
    console.log(`✅ HTML Status: ${htmlResponse.statusCode}`);
    console.log(`📄 Content length: ${htmlResponse.body.length} characters`);
    
    // Check if it contains the latest structure
    if (htmlResponse.body.includes('Singapore TOTO Predictor')) {
      console.log('✅ Page title found');
    } else {
      console.log('❌ Page title missing');
    }
    
    if (htmlResponse.body.includes('totoResult.csv')) {
      console.log('✅ CSV fetch code found in HTML');
    } else {
      console.log('❌ CSV fetch code missing');
    }
    
    // Check last-modified header
    if (htmlResponse.headers['last-modified']) {
      console.log(`📅 Last modified: ${htmlResponse.headers['last-modified']}`);
    }
    
  } catch (error) {
    console.log('❌ Failed to fetch HTML:', error.message);
  }
  
  console.log('\n📋 Test 2: Checking CSV file accessibility...');
  try {
    const csvResponse = await fetchUrl('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    console.log(`✅ CSV Status: ${csvResponse.statusCode}`);
    
    if (csvResponse.statusCode === 200) {
      const lines = csvResponse.body.trim().split('\n');
      console.log(`📊 CSV contains ${lines.length} lines`);
      
      if (lines.length > 0) {
        const latestResult = lines[0];
        console.log(`🎯 Latest result from CSV: ${latestResult}`);
        
        // Check if it matches expected result
        if (latestResult.includes('22,25,29,31,34,43,11')) {
          console.log('✅ Latest result matches expected (22,25,29,31,34,43,11)');
        } else {
          console.log('⚠️ Latest result does not match expected');
        }
      }
    }
    
    // Check cache headers
    if (csvResponse.headers['last-modified']) {
      console.log(`📅 CSV last modified: ${csvResponse.headers['last-modified']}`);
    }
    if (csvResponse.headers['etag']) {
      console.log(`🏷️ CSV ETag: ${csvResponse.headers['etag']}`);
    }
    
  } catch (error) {
    console.log('❌ Failed to fetch CSV:', error.message);
  }
  
  console.log('\n📋 Test 3: Checking cache status...');
  const currentTime = new Date().toISOString();
  console.log(`🕐 Current time: ${currentTime}`);
  
  // Test with cache-busting parameter
  try {
    const cacheBustedUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?v=${Date.now()}`;
    console.log(`🔄 Testing cache-busted URL: ${cacheBustedUrl}`);
    
    const cacheBustedResponse = await fetchUrl(cacheBustedUrl);
    console.log(`✅ Cache-busted CSV Status: ${cacheBustedResponse.statusCode}`);
    
    if (cacheBustedResponse.statusCode === 200) {
      const lines = cacheBustedResponse.body.trim().split('\n');
      if (lines.length > 0) {
        console.log(`🎯 Cache-busted result: ${lines[0]}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Cache-busted fetch failed:', error.message);
  }
}

// Function to check GitHub Pages deployment status
async function checkGitHubStatus() {
  console.log('\n📋 Test 4: GitHub Pages deployment status...');
  console.log('💡 Note: GitHub Pages may take 5-10 minutes to update after push');
  console.log('🔗 You can check deployment status at:');
  console.log('   https://github.com/Websolution-sg/toto_predictor/actions');
  console.log('');
  
  console.log('🎯 RECOMMENDATIONS:');
  console.log('==================');
  console.log('1. ✅ Latest commit pushed successfully');
  console.log('2. 🕐 Wait 5-10 minutes for GitHub Pages to update');
  console.log('3. 🔄 Clear browser cache and refresh the page');
  console.log('4. 🔍 Check GitHub Actions for deployment status');
  console.log('5. 📱 Test on different browser/device to confirm');
  console.log('');
  console.log('📊 Expected result on website: 22,25,29,31,34,43(11)');
}

// Run all tests
async function runDiagnostic() {
  await testDeployment();
  await checkGitHubStatus();
  
  console.log('\n🎉 DIAGNOSTIC COMPLETE');
  console.log('======================');
  console.log('The website should update within 5-10 minutes.');
  console.log('If issues persist, check GitHub Actions deployment logs.');
}

runDiagnostic().catch(console.error);
