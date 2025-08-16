/**
 * RAPID DEPLOYMENT MONITOR
 * Checks every 30 seconds with aggressive cache-busting
 */

const https = require('https');

console.log('⚡ RAPID DEPLOYMENT MONITOR');
console.log('==========================\n');

let checkCount = 0;
const maxChecks = 20; // 10 minutes total
const checkInterval = 30000; // 30 seconds

function rapidCheck() {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const url = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?bust=${timestamp}&emergency=true&check=${checkCount}`;
    
    console.log(`🔍 Check #${checkCount + 1} at ${new Date().toISOString().substr(11, 8)}`);
    console.log(`📡 URL: ${url}`);
    
    const startTime = Date.now();
    https.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const lines = data.trim().split('\n');
        const firstLine = lines[0];
        
        console.log(`   ⏱️ Response time: ${responseTime}ms`);
        console.log(`   📊 Lines: ${lines.length}`);
        console.log(`   🎯 First line: ${firstLine}`);
        console.log(`   📅 Last-Modified: ${res.headers['last-modified']}`);
        console.log(`   🏷️ ETag: ${res.headers['etag']}`);
        
        if (firstLine === '22,25,29,31,34,43,11') {
          console.log('   🎉 SUCCESS! CSV is updated!');
          resolve(true);
        } else {
          console.log('   ⏳ Still old data...');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function rapidMonitor() {
  console.log('🚀 Starting rapid monitoring (30-second intervals)');
  console.log('🎯 Target: 22,25,29,31,34,43,11');
  console.log('⏱️ Max time: 10 minutes\n');
  
  while (checkCount < maxChecks) {
    try {
      const success = await rapidCheck();
      checkCount++;
      
      if (success) {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log('🎉 GitHub Pages updated successfully!');
        console.log('🌐 Website: https://websolution-sg.github.io/toto_predictor/');
        console.log('📊 Should show: RECENT RESULT: 22,25,29,31,34,43(11)');
        console.log(`⏱️ Total time: ${checkCount * 0.5} minutes`);
        break;
      }
      
      if (checkCount < maxChecks) {
        console.log(`   ⏳ Waiting 30 seconds... (${checkCount}/${maxChecks})\n`);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
    } catch (error) {
      console.log(`   💥 Check failed: ${error.message}`);
      checkCount++;
    }
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n🚨 TIMEOUT - DEPLOYMENT STILL NOT COMPLETE');
    console.log('==========================================');
    console.log('❌ GitHub Pages deployment is taking too long');
    console.log('');
    console.log('🔍 TROUBLESHOOTING STEPS:');
    console.log('1. Check GitHub Actions: https://github.com/Websolution-sg/toto_predictor/actions');
    console.log('2. Check GitHub status: https://www.githubstatus.com/');
    console.log('3. Verify GitHub Pages settings in repository');
    console.log('4. Consider manual CSV replacement');
    console.log('');
    console.log('💡 This level of delay suggests a GitHub service issue');
  }
}

// Start rapid monitoring
rapidMonitor().catch(console.error);
