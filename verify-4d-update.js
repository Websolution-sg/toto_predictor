// 4D Results Update Verification Script
// Checks if our CSV has the latest Singapore Pools 4D results

const https = require('https');
const fs = require('fs');

console.log('🔍 Verifying 4D results are up to date...');

// Read current CSV to get latest draw
const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const latestRecord = lines[1].split(',');
const currentLatestDraw = parseInt(latestRecord[0]);
const currentLatestDate = latestRecord[1];

console.log(`📊 Current latest in CSV: Draw ${currentLatestDraw} (${currentLatestDate})`);

// Fetch from Singapore Pools to verify
const url = 'https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      // Look for the latest draw information
      const drawMatch = data.match(/Draw\s*No\.\s*(\d+)/i);
      const dateMatch = data.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s*(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})/i);
      
      if (drawMatch && dateMatch) {
        const websiteDraw = parseInt(drawMatch[1]);
        const websiteDate = `${dateMatch[0]}`;
        
        console.log(`🌐 Website latest: Draw ${websiteDraw} (${websiteDate})`);
        
        if (websiteDraw === currentLatestDraw) {
          console.log('✅ CSV is up to date with latest Singapore Pools results!');
          console.log(`🎯 Latest winning numbers: ${latestRecord[2]}, ${latestRecord[3]}, ${latestRecord[4]}`);
        } else if (websiteDraw > currentLatestDraw) {
          console.log('⚠️  Newer draw found on website. Running extractor...');
          // Run the extractor
          const { exec } = require('child_process');
          exec('node complete-singapore-4d-extractor.js', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Error running extractor:', error);
              return;
            }
            console.log(stdout);
          });
        } else {
          console.log('🤔 CSV seems to have newer data than website (cache delay)');
        }
      } else {
        console.log('⚠️  Could not parse draw information from website');
      }
    } catch (error) {
      console.error('❌ Error parsing website data:', error.message);
    }
  });
  
}).on('error', (err) => {
  console.error('❌ Error fetching website:', err.message);
});
