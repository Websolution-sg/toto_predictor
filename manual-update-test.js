// Minimal script to test and fix the TOTO fetching issue
const fs = require('fs');

console.log('🔧 MINIMAL TOTO UPDATE TEST');
console.log('='.repeat(50));

// Fetch latest TOTO results from Singapore Pools
const https = require('https');

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

function fetchLatestTotoResults(callback) {
  const url = 'https://www.singaporepools.com.sg/en/product/pages/toto_results.aspx';
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Extract 7 winning numbers from HTML
      const numberRegex = /\b\d{2}\b/g;
      const matches = data.match(numberRegex);
      // Find the first 7 unique two-digit numbers
      let latestResult = [];
      if (matches) {
        for (let i = 0; i < matches.length && latestResult.length < 7; i++) {
          const num = parseInt(matches[i], 10);
          if (!latestResult.includes(num)) latestResult.push(num);
        }
      }
      callback(latestResult);
    });
  }).on('error', (err) => {
    console.error('Error fetching TOTO results:', err);
    callback([]);
  });
}

// Read current CSV
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const currentTop = lines[0].split(',').map(n => parseInt(n.trim()));

fetchLatestTotoResults((latestResult) => {
  console.log(`🎯 Latest result from Singapore Pools: [${latestResult.join(', ')}]`);
  console.log(`📊 Current CSV top entry: [${currentTop.join(', ')}]`);
  if (latestResult.length === 7 && !arraysEqual(latestResult, currentTop)) {
    console.log('🔄 Results differ - updating CSV...');
    // Add new result to top
    const newLines = [`${latestResult.join(',')}`, ...lines];
    fs.writeFileSync('totoResult.csv', newLines.join('\n'));
    console.log('✅ CSV updated successfully!');
    console.log(`📈 New top entry: [${latestResult.join(', ')}]`);
  } else if (latestResult.length === 7) {
    console.log('ℹ️ Results are the same - no update needed');
  } else {
    console.log('❌ Could not fetch valid latest result');
  }
  console.log('🏁 Test complete');
});
