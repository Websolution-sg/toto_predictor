// Simple debug script to test TOTO fetching
const fs = require('fs');

console.log('=== SIMPLE TOTO FETCH DEBUG ===');
console.log('Current date:', new Date().toISOString());
console.log('');

// Test 1: Can we access the file system?
console.log('TEST 1: File system access...');
try {
  const exists = fs.existsSync('totoResult.csv');
  console.log('✅ CSV file exists:', exists);
  if (exists) {
    const content = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = content.trim().split('\n');
    console.log('✅ CSV lines count:', lines.length);
    console.log('✅ First line:', lines[0]);
  }
} catch (err) {
  console.log('❌ File system error:', err.message);
}

console.log('');

// Test 2: Can we load required modules?
console.log('TEST 2: Module loading...');
try {
  const fetch = require('node-fetch');
  console.log('✅ node-fetch loaded:', typeof fetch);
} catch (err) {
  console.log('❌ node-fetch error:', err.message);
}

try {
  const cheerio = require('cheerio');
  console.log('✅ cheerio loaded:', typeof cheerio.load);
} catch (err) {
  console.log('❌ cheerio error:', err.message);
}

console.log('');

// Test 3: Simple web request
console.log('TEST 3: Web request test...');
async function testWebRequest() {
  try {
    const fetch = require('node-fetch');
    console.log('🌐 Testing basic web request...');
    const response = await fetch('https://httpbin.org/get', { timeout: 10000 });
    console.log('✅ Web request successful:', response.status);
    console.log('✅ Response type:', response.headers.get('content-type'));
  } catch (err) {
    console.log('❌ Web request failed:', err.message);
  }
}

// Test 4: Singapore Pools access
console.log('TEST 4: Singapore Pools access...');
async function testSingaporePools() {
  try {
    const fetch = require('node-fetch');
    console.log('🌐 Testing Singapore Pools access...');
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('✅ Singapore Pools response:', response.status);
    console.log('✅ Content type:', response.headers.get('content-type'));
    console.log('✅ Content length:', response.headers.get('content-length'));
    
    const text = await response.text();
    console.log('✅ Response length:', text.length);
    console.log('✅ Contains TOTO:', text.includes('TOTO') || text.includes('toto'));
    console.log('✅ Contains numbers:', /\d{1,2}/.test(text));
  } catch (err) {
    console.log('❌ Singapore Pools error:', err.message);
  }
}

// Run tests
(async () => {
  await testWebRequest();
  console.log('');
  await testSingaporePools();
  console.log('');
  console.log('=== DEBUG COMPLETE ===');
})();
