// Minimal script to test and fix the TOTO fetching issue
const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

console.log('🔧 CHEERIO TOTO UPDATE TEST');
console.log('='.repeat(50));

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

function fetchLatestTotoResults(callback) {
  const url = 'https://www.singaporepools.com.sg/en/product/pages/toto_results.aspx';
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const $ = cheerio.load(data);
      // Find draw date (look for text like '01 Sep 2025' or similar)
      let drawDate = null;
      let dateText = $('body').text().match(/\b\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\b/i);
      if (dateText) {
        // Convert to CSV format: 01-Sep-25
        const parts = dateText[0].split(' ');
        drawDate = `${parts[0]}-${parts[1]}-${parts[2].slice(-2)}`;
      }
      // Target 'Winning Numbers' and 'Additional Number' blocks only
      let numbers = [];
      let foundWinning = false;
      let foundAdditional = false;
      let winningNums = [];
      let additionalNum = null;
      $('body').find('*').each(function() {
        const txt = $(this).text().trim();
        if (txt === 'Winning Numbers' || txt === '开奖号码') {
          foundWinning = true;
          winningNums = [];
          return;
        }
        if (foundWinning && winningNums.length < 6 && /^\d{1,2}$/.test(txt)) {
          winningNums.push(Number(txt));
          if (winningNums.length === 6) {
            foundWinning = false;
            foundAdditional = true;
          }
          return;
        }
        if ((txt === 'Additional Number' || txt === '额外号码') && !additionalNum) {
          foundAdditional = true;
          return;
        }
        if (foundAdditional && additionalNum === null && /^\d{1,2}$/.test(txt)) {
          additionalNum = Number(txt);
          foundAdditional = false;
        }
      });
      if (winningNums.length === 6 && additionalNum !== null) {
        numbers = winningNums.concat(additionalNum);
      }
      callback({numbers, date: drawDate});
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
