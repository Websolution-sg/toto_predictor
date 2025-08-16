// Debug GitHub Pages vs Local CSV comparison
const fs = require('fs');
const https = require('https');

console.log('🔍 DEBUGGING GITHUB PAGES CSV FETCH');
console.log('====================================');

// Read local CSV
const localCsv = fs.readFileSync('totoResult.csv', 'utf8');
const localLines = localCsv.trim().split('\n');

console.log('📁 LOCAL CSV STATUS:');
console.log('   Total lines:', localLines.length);
console.log('   First line (latest):', localLines[0]);
console.log('   Second line:', localLines[1]);

// Fetch from GitHub Pages
const timestamp = Date.now();
const random = Math.random().toString(36).substring(7);
const url = `https://websolution-sg.github.io/toto_predictor/totoResult.csv?v=${timestamp}&r=${random}&nocache=${timestamp}`;

console.log('');
console.log('🌐 FETCHING FROM GITHUB PAGES:');
console.log('   URL:', url);

https.get(url, (res) => {
  console.log('   Response Status:', res.statusCode);
  console.log('   Last Modified:', res.headers['last-modified']);
  console.log('   Cache Control:', res.headers['cache-control']);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const githubLines = data.trim().split('\n');
    
    console.log('');
    console.log('📊 GITHUB PAGES CSV STATUS:');
    console.log('   Total lines:', githubLines.length);
    console.log('   First line (latest):', githubLines[0]);
    console.log('   Second line:', githubLines[1]);
    
    console.log('');
    console.log('🔄 COMPARISON RESULTS:');
    console.log('   Lines count match:', localLines.length === githubLines.length);
    console.log('   First line match:', localLines[0] === githubLines[0]);
    
    if (localLines[0] !== githubLines[0]) {
      console.log('');
      console.log('❌ MISMATCH DETECTED!');
      console.log('   Local first line:  "' + localLines[0] + '"');
      console.log('   GitHub first line: "' + githubLines[0] + '"');
      console.log('   Local length:', localLines[0].length);
      console.log('   GitHub length:', githubLines[0].length);
      
      console.log('');
      console.log('🔧 DIAGNOSIS:');
      console.log('   - GitHub Pages deployment may be delayed');
      console.log('   - CDN caching may be active');
      console.log('   - Check if latest commit was pushed');
      
      // Show character-by-character comparison
      console.log('');
      console.log('🔍 CHARACTER ANALYSIS:');
      for (let i = 0; i < Math.max(localLines[0].length, githubLines[0].length); i++) {
        const localChar = localLines[0][i] || 'undefined';
        const githubChar = githubLines[0][i] || 'undefined';
        if (localChar !== githubChar) {
          console.log(`   Position ${i}: Local="${localChar}" GitHub="${githubChar}"`);
        }
      }
    } else {
      console.log('');
      console.log('✅ SUCCESS: GitHub Pages is synchronized with local CSV!');
      console.log('📊 Website should display: ' + localLines[0].split(',').slice(0,6).join(',') + '(' + localLines[0].split(',')[6] + ')');
    }
  });
}).on('error', err => {
  console.error('❌ Error fetching from GitHub Pages:', err.message);
});
