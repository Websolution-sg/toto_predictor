/**
 * Deployment Progress Monitor
 * Tracks when GitHub Pages deployment completes
 */

const https = require('https');

console.log('🔍 DEPLOYMENT PROGRESS MONITOR');
console.log('==============================\n');

let checkCount = 0;
const maxChecks = 20; // Check for up to 20 minutes
const checkInterval = 60000; // Check every 60 seconds

function checkDeploymentStatus() {
  return new Promise((resolve, reject) => {
    https.get('https://websolution-sg.github.io/toto_predictor/totoResult.csv', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const currentTime = new Date().toISOString();
        const firstLine = data.trim().split('\n')[0];
        
        console.log(`🕐 ${currentTime} - Check #${checkCount + 1}`);
        console.log(`   📊 First line: ${firstLine}`);
        console.log(`   📅 Last-Modified: ${res.headers['last-modified']}`);
        console.log(`   🏷️ ETag: ${res.headers['etag']}`);
        
        if (firstLine === '22,25,29,31,34,43,11') {
          console.log('   ✅ SUCCESS - CSV Updated!');
          resolve(true);
        } else {
          console.log('   ⏳ Still waiting for update...');
          resolve(false);
        }
      });
    }).on('error', reject);
  });
}

async function monitorDeployment() {
  console.log('🚀 Starting deployment monitoring...');
  console.log('⏱️ Checking every 60 seconds for up to 20 minutes');
  console.log('🎯 Looking for: 22,25,29,31,34,43,11\n');
  
  while (checkCount < maxChecks) {
    try {
      const isUpdated = await checkDeploymentStatus();
      checkCount++;
      
      if (isUpdated) {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log('✅ GitHub Pages has been updated');
        console.log('✅ CSV now shows latest TOTO results');
        console.log('✅ Website should work correctly');
        console.log('');
        console.log('🌐 Visit: https://websolution-sg.github.io/toto_predictor/');
        console.log('📊 Expected display: RECENT RESULT: 22,25,29,31,34,43(11)');
        break;
      }
      
      if (checkCount < maxChecks) {
        console.log(`   ⏳ Waiting 60 seconds before next check...\n`);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
    } catch (error) {
      console.log(`   ❌ Check failed: ${error.message}`);
      checkCount++;
    }
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n⚠️ MONITORING TIMEOUT');
    console.log('====================');
    console.log('❌ Deployment taking longer than expected');
    console.log('🔍 Please check GitHub Actions manually:');
    console.log('   https://github.com/Websolution-sg/toto_predictor/actions');
    console.log('');
    console.log('💡 Possible next steps:');
    console.log('1. Check if GitHub Actions workflow failed');
    console.log('2. Verify GitHub Pages is enabled in repository settings');
    console.log('3. Wait longer (GitHub Pages can sometimes take 30+ minutes)');
    console.log('4. Contact GitHub Support if issue persists');
  }
}

// Start monitoring
monitorDeployment().catch(console.error);
