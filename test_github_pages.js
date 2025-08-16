// Test to verify GitHub Pages CSV data and caching
const https = require('https');

console.log('🔍 GITHUB PAGES VALIDATION REPORT');
console.log('=====================================');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function validateGitHubPages() {
  try {
    console.log('\n📊 Fetching CSV from GitHub Pages...');
    const csvData = await fetchUrl('https://websolution-sg.github.io/toto_predictor/totoResult.csv');
    const lines = csvData.trim().split('\n');
    console.log('   First line (latest):', lines[0]);
    console.log('   Total entries:', lines.length);
    
    console.log('\n📄 Fetching HTML page...');
    const htmlData = await fetchUrl('https://websolution-sg.github.io/toto_predictor/');
    const hasCache = htmlData.includes('Cache-Control');
    const hasFetch = htmlData.includes('totoResult.csv');
    
    console.log('   Has cache control:', hasCache);
    console.log('   Has CSV fetch:', hasFetch);
    
    // Check local data
    const fs = require('fs');
    const localCsv = fs.readFileSync('totoResult.csv', 'utf8').trim();
    const localFirst = localCsv.split('\n')[0];
    
    console.log('\n🔄 Comparison:');
    console.log('   Local first line:', localFirst);
    console.log('   GitHub first line:', lines[0]);
    console.log('   Match:', localFirst === lines[0] ? '✅ YES' : '❌ NO');
    
    if (localFirst !== lines[0]) {
      console.log('\n⚠️  ISSUE DETECTED:');
      console.log('   GitHub Pages is not showing latest CSV data');
      console.log('   This could be due to:');
      console.log('   1. GitHub Pages caching delay');
      console.log('   2. CDN propagation time');
      console.log('   3. Browser caching');
    } else {
      console.log('\n✅ SUCCESS: GitHub Pages is up to date!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

validateGitHubPages();
