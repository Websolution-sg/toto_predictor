/* 
BROWSER CONSOLE TEST
===================
Copy and paste this code into your browser's console (F12) 
when you're on https://websolution-sg.github.io/toto_predictor/
to test if the CSV fetch is working correctly.
*/

console.log('🧪 MANUAL BROWSER TEST');
console.log('======================');

// Test the CSV fetch with aggressive cache busting
const testUrl = `totoResult.csv?test=${Date.now()}&r=${Math.random()}&force=${Math.floor(Math.random() * 1000000)}`;

console.log('📊 Testing CSV fetch:', testUrl);

fetch(testUrl, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
})
.then(response => response.text())
.then(text => {
  console.log('✅ CSV fetched successfully');
  const lines = text.trim().split('\n');
  const firstLine = lines[0];
  
  console.log('📈 Total lines:', lines.length);
  console.log('🎯 First line (latest):', firstLine);
  
  // Parse the data
  const numbers = firstLine.split(',').map(Number);
  const winning = numbers.slice(0, 6);
  const additional = numbers[6];
  
  console.log('🎲 Winning numbers:', winning);
  console.log('🎯 Additional number:', additional);
  
  // Format result
  const resultText = winning.join(',') + '(' + additional + ')';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-SG', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  console.log('');
  console.log('📱 EXPECTED DISPLAY:');
  console.log('RECENT RESULT: ' + resultText + ' - ' + dateStr);
  
  // Check current page display
  const currentDisplay = document.getElementById('recentResult');
  if (currentDisplay) {
    console.log('');
    console.log('🔍 CURRENT PAGE DISPLAY:');
    console.log('"' + currentDisplay.textContent + '"');
    
    if (currentDisplay.textContent.includes(resultText)) {
      console.log('✅ SUCCESS: Page is showing correct data!');
    } else if (currentDisplay.textContent.includes('Loading')) {
      console.log('⏳ Page is still loading...');
    } else {
      console.log('❌ Page is showing incorrect/old data');
    }
  }
})
.catch(error => {
  console.error('❌ CSV fetch failed:', error);
  console.log('🔧 Try hard refresh (Ctrl+F5) or clear cache');
});
