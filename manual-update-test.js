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
      // Enhanced extraction: Find block of 6 two-digit numbers followed by a single two-digit number (additional)
      let latestResult = [];
      let drawDate = null;
      // Find all blocks of 6 two-digit numbers followed by a single two-digit number
      const blockRegex = /((?:\b\d{2}\b[\s|\n|\r]+){6})(\b\d{2}\b)/g;
      let blockMatch;
      let foundBlock = null;
      while ((blockMatch = blockRegex.exec(data)) !== null) {
        // Get the 6 numbers and the additional
        const sixNumbers = blockMatch[1].match(/\b\d{2}\b/g);
        const additional = blockMatch[2];
        if (sixNumbers && sixNumbers.length === 6 && additional) {
          foundBlock = {numbers: sixNumbers.map(Number).concat(Number(additional)), index: blockMatch.index};
          break;
        }
      }
      if (foundBlock) {
        latestResult = foundBlock.numbers;
        // Try to find the draw date near the block
        const context = data.slice(Math.max(0, foundBlock.index - 200), foundBlock.index + 200);
        // Dash format
        const dashDateRegex = /(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2})/i;
        const dashDateMatch = context.match(dashDateRegex);
        if (dashDateMatch) {
          drawDate = `${dashDateMatch[1]}-${dashDateMatch[2]}-${dashDateMatch[3]}`;
        } else {
          // Space format
          const spaceDateRegex = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(2025)/i;
          const spaceDateMatch = context.match(spaceDateRegex);
          if (spaceDateMatch) {
            const monthMap = {
              'January':'Jan','February':'Feb','March':'Mar','April':'Apr','May':'May','June':'Jun','July':'Jul','August':'Aug','September':'Sep','October':'Oct','November':'Nov','December':'Dec'
            };
            drawDate = `${spaceDateMatch[1]}-${monthMap[spaceDateMatch[2]]}-25`;
          }
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
