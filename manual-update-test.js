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
      // Extract draw date (e.g., 28-Aug-25 or similar)
      const dateRegex = /(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}/i;
      let drawDate = null;
      const dateMatch = data.match(dateRegex);
      if (dateMatch) {
        drawDate = `${dateMatch[1]}-${dateMatch[2]}-25`;
      } else {
        // Try alternative format (e.g., 28 August 2025)
        const altDateRegex = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(2025)/i;
        const altDateMatch = data.match(altDateRegex);
        if (altDateMatch) {
          const monthMap = {
            'January':'Jan','February':'Feb','March':'Mar','April':'Apr','May':'May','June':'Jun','July':'Jul','August':'Aug','September':'Sep','October':'Oct','November':'Nov','December':'Dec'
          };
          drawDate = `${altDateMatch[1]}-${monthMap[altDateMatch[2]]}-25`;
        }
      }
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
      callback({numbers: latestResult, date: drawDate});
    });
  }).on('error', (err) => {
    console.error('Error fetching TOTO results:', err);
    callback({numbers: [], date: null});
  });
}

// Read current CSV
const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const currentTop = lines[0].split(',').map(n => parseInt(n.trim()));

fetchLatestTotoResults((latest) => {
  console.log(`🎯 Latest result from Singapore Pools: [${latest.numbers.join(', ')}]`);
  console.log(`📅 Draw date: ${latest.date}`);
  console.log(`📊 Current CSV top entry: [${currentTop.join(', ')}]`);
  // Compare only numbers for update
  if (latest.numbers.length === 7 && !arraysEqual(latest.numbers, currentTop.slice(-7))) {
    console.log('🔄 Results differ - updating CSV...');
    // Add new result to top, with date if available
    let newLine = latest.date ? `${latest.date},${latest.numbers.join(',')}` : latest.numbers.join(',');
    const newLines = [newLine, ...lines];
    fs.writeFileSync('totoResult.csv', newLines.join('\n'));
    console.log('✅ CSV updated successfully!');
    console.log(`📈 New top entry: [${newLine}]`);
  } else if (latest.numbers.length === 7) {
    console.log('ℹ️ Results are the same - no update needed');
  } else {
    console.log('❌ Could not fetch valid latest result');
  }
  console.log('🏁 Test complete');
});
