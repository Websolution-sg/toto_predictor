/**
 * GitHub Pages Deployment Lag Analysis
 * This script investigates why there's a delay between commits and live deployment
 */

const https = require('https');

console.log('🕐 GITHUB PAGES DEPLOYMENT LAG ANALYSIS');
console.log('=======================================\n');

// Function to fetch with detailed timing
function fetchWithTiming(url, description) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`📡 Fetching ${description}: ${url}`);
    
    https.get(url, (res) => {
      const endTime = Date.now();
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`   ✅ Status: ${res.statusCode} (${endTime - startTime}ms)`);
        console.log(`   📅 Last-Modified: ${res.headers['last-modified']}`);
        console.log(`   🏷️ ETag: ${res.headers['etag'] || 'None'}`);
        console.log(`   🔄 Cache-Control: ${res.headers['cache-control']}`);
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: endTime - startTime,
          fetchTime: new Date().toISOString()
        });
      });
    }).on('error', reject);
  });
}

async function analyzeDeploymentLag() {
  console.log('📋 Test 1: Current Deployment Status');
  console.log('------------------------------------');
  
  try {
    // Check main page
    const htmlResponse = await fetchWithTiming(
      'https://websolution-sg.github.io/toto_predictor/',
      'HTML page'
    );
    
    // Check CSV file
    const csvResponse = await fetchWithTiming(
      'https://websolution-sg.github.io/toto_predictor/totoResult.csv',
      'CSV file'
    );
    
    // Parse CSV content
    const csvLines = csvResponse.body.trim().split('\n');
    console.log(`\n📊 Current remote CSV analysis:`);
    console.log(`   Lines: ${csvLines.length}`);
    console.log(`   First line: ${csvLines[0]}`);
    console.log(`   Expected: 22,25,29,31,34,43,11`);
    
    if (csvLines[0] === '22,25,29,31,34,43,11') {
      console.log('   ✅ CSV is UP TO DATE!');
    } else {
      console.log('   ❌ CSV is OUTDATED');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n📋 Test 2: GitHub Pages Timing Analysis');
  console.log('---------------------------------------');
  
  // Get current time and recent commit time
  const currentTime = new Date();
  console.log(`🕐 Current time: ${currentTime.toISOString()}`);
  
  // Parse last commit time from git log
  console.log('📝 Latest commit: eaadfa0 (🎯 Auto update TOTO results: 2025-08-16 14:00:38 UTC)');
  const commitTime = new Date('2025-08-16T14:00:38Z');
  const timeDiff = (currentTime - commitTime) / 1000 / 60; // minutes
  
  console.log(`⏱️ Time since last commit: ${timeDiff.toFixed(1)} minutes`);
  
  // GitHub Pages typical deployment time
  console.log('\n💡 GitHub Pages Deployment Timeline:');
  console.log('   📤 Commit pushed: Immediate');
  console.log('   🔄 GitHub Actions trigger: 0-2 minutes');
  console.log('   🏗️ Build process: 1-3 minutes');
  console.log('   🌐 CDN propagation: 2-10 minutes');
  console.log('   📱 Browser cache: Up to 10 minutes');
  
  if (timeDiff < 5) {
    console.log('\n⚠️ DEPLOYMENT MAY STILL BE IN PROGRESS');
    console.log('   GitHub Pages typically takes 5-10 minutes to fully deploy');
  } else if (timeDiff < 15) {
    console.log('\n🔄 DEPLOYMENT SHOULD BE COMPLETE');
    console.log('   If still not updated, there may be a caching issue');
  } else {
    console.log('\n🚨 DEPLOYMENT DELAY DETECTED');
    console.log('   This is longer than typical GitHub Pages deployment time');
  }
}

async function checkCDNStatus() {
  console.log('\n📋 Test 3: CDN and Caching Analysis');
  console.log('-----------------------------------');
  
  try {
    // Test multiple cache-busted requests to see consistency
    console.log('🔄 Testing cache-busted requests...');
    
    for (let i = 1; i <= 3; i++) {
      const cacheBustedUrl = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?test=${Date.now()}&v=${i}`;
      const response = await fetchWithTiming(cacheBustedUrl, `Cache test ${i}`);
      
      const firstLine = response.body.trim().split('\n')[0];
      console.log(`   Test ${i} result: ${firstLine}`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.log(`❌ CDN test error: ${error.message}`);
  }
}

async function identifyLagCause() {
  console.log('\n📋 Test 4: Lag Cause Identification');
  console.log('-----------------------------------');
  
  console.log('🔍 Possible causes of deployment lag:');
  console.log('');
  console.log('1. 🕐 TIMING ISSUE:');
  console.log('   - GitHub Pages deployment in progress');
  console.log('   - CDN cache propagation delay');
  console.log('   - Solution: Wait 5-10 minutes');
  console.log('');
  console.log('2. 🔄 WORKFLOW ISSUE:');
  console.log('   - GitHub Actions failed or delayed');
  console.log('   - Build process errors');
  console.log('   - Solution: Check GitHub Actions tab');
  console.log('');
  console.log('3. 📦 CACHING ISSUE:');
  console.log('   - Browser cache serving stale content');
  console.log('   - CDN edge servers not updated');
  console.log('   - Solution: Hard refresh, clear cache');
  console.log('');
  console.log('4. 🌐 GITHUB PAGES ISSUE:');
  console.log('   - GitHub Pages service delay');
  console.log('   - Regional CDN propagation');
  console.log('   - Solution: Wait or contact GitHub Support');
  console.log('');
  
  // Check GitHub Actions URL
  console.log('🔗 RECOMMENDED ACTIONS:');
  console.log('=====================');
  console.log('1. Check GitHub Actions: https://github.com/Websolution-sg/toto_predictor/actions');
  console.log('2. Verify latest workflow run completed successfully');
  console.log('3. Check GitHub Pages status: https://www.githubstatus.com/');
  console.log('4. Clear browser cache and try again');
  console.log('5. Test from different browser/device');
}

// Run complete analysis
async function runCompleteAnalysis() {
  console.log('🚀 Starting deployment lag analysis...\n');
  
  await analyzeDeploymentLag();
  await checkCDNStatus();
  await identifyLagCause();
  
  console.log('\n🎯 ANALYSIS COMPLETE');
  console.log('===================');
  console.log('Review the results above to identify the lag cause.');
}

runCompleteAnalysis().catch(console.error);
