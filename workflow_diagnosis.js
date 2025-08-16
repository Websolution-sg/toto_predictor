// Diagnostic script to test TOTO fetching issues
const https = require('https');

console.log('🔍 WORKFLOW DIAGNOSIS REPORT');
console.log('============================\n');

console.log('📊 CURRENT STATE:');
console.log('   CSV First Line: 9,24,31,34,43,44,1 (INCORRECT)');
console.log('   Expected Result: 22,25,29,31,34,43,11 (CORRECT)');
console.log('   Workflow Status: RAN but returned NULL\n');

console.log('🎯 CONFIRMED ISSUE:');
console.log('   ❌ The workflow ran but fetchLatestTotoResult() returned NULL');
console.log('   ❌ When NULL is returned, script exits without updating CSV');
console.log('   ❌ This means ALL parsing strategies failed\n');

console.log('🔍 POSSIBLE CAUSES:');
console.log('   1. Website structure changed since script was written');
console.log('   2. Network connectivity issues in GitHub Actions environment');
console.log('   3. User-Agent blocking or rate limiting');
console.log('   4. SSL/TLS certificate issues');
console.log('   5. Parsing logic not matching current website HTML structure\n');

console.log('💡 DEBUGGING STEPS:');
console.log('   1. Test script locally with current website HTML');
console.log('   2. Check if Singapore Pools website is accessible');
console.log('   3. Verify HTML structure hasn\'t changed');
console.log('   4. Test different User-Agent strings');
console.log('   5. Add more detailed logging to identify failure point\n');

console.log('🎯 IMMEDIATE ACTION:');
console.log('   Add debugging to the script to see where parsing fails');
console.log('   Test the actual website content being fetched');

// Simple test to see if we can reach the website
console.log('🌐 TESTING WEBSITE CONNECTIVITY...');
const options = {
  hostname: 'www.singaporepools.com.sg',
  port: 443,
  path: '/en/product/Pages/toto_results.aspx',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`   Content Length: ${data.length} characters`);
    
    if (data.includes('toto') || data.includes('TOTO')) {
      console.log('   ✅ TOTO content detected');
    } else {
      console.log('   ❌ No TOTO content detected');
    }
    
    if (data.includes('22') && data.includes('25') && data.includes('29')) {
      console.log('   ✅ Expected numbers found in content');
    } else {
      console.log('   ❌ Expected numbers NOT found in content');
    }
  });
});

req.on('error', (error) => {
  console.log(`   ❌ Connection Error: ${error.message}`);
});

req.setTimeout(10000, () => {
  console.log('   ⏰ Request timed out');
  req.destroy();
});

req.end();
