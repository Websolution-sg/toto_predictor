// Debug GitHub Pages live site issues
const https = require('https');

console.log('🔍 DEBUGGING LIVE GITHUB PAGES SITE');
console.log('====================================');

async function debugLiveSite() {
  try {
    // Step 1: Check CSV data
    console.log('📊 Step 1: Checking CSV data on GitHub Pages...');
    const csvData = await fetchData('https://websolution-sg.github.io/toto_predictor/totoResult.csv?t=' + Date.now());
    
    const lines = csvData.trim().split('\n');
    const firstLine = lines[0];
    
    console.log('✅ CSV Response received');
    console.log('   Total lines:', lines.length);
    console.log('   First line (latest):', firstLine);
    
    // Step 2: Check HTML page
    console.log('');
    console.log('🌐 Step 2: Checking HTML page...');
    const htmlData = await fetchData('https://websolution-sg.github.io/toto_predictor/');
    
    console.log('✅ HTML page loaded');
    
    // Check HTML structure
    const hasRecentResult = htmlData.includes('id="recentResult"');
    const hasLoadingText = htmlData.includes('Loading...');
    const hasFetchScript = htmlData.includes('fetch(csvUrl');
    const hasUpdateFunction = htmlData.includes('updateLatestResult');
    
    console.log('');
    console.log('🔍 HTML Analysis:');
    console.log('   Has recentResult element:', hasRecentResult);
    console.log('   Shows Loading... initially:', hasLoadingText);
    console.log('   Has CSV fetch code:', hasFetchScript);
    console.log('   Has update function:', hasUpdateFunction);
    
    // Step 3: Simulate JavaScript execution
    console.log('');
    console.log('⚙️ Step 3: Simulating JavaScript execution...');
    
    const historical = csvData.trim().split('\n').map(line => line.split(',').map(Number));
    const recent = historical[0];
    const winningNumbers = recent.slice(0, 6);
    const additionalNumber = recent[6];
    
    const resultText = winningNumbers.join(',') + '(' + additionalNumber + ')';
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-SG', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const expectedDisplay = 'RECENT RESULT: ' + resultText + ' - ' + dateStr;
    
    console.log('✅ JavaScript simulation successful');
    console.log('   Expected display:', expectedDisplay);
    
    // Diagnosis
    console.log('');
    console.log('🎯 DIAGNOSIS:');
    if (hasRecentResult && hasFetchScript && hasUpdateFunction) {
      console.log('✅ HTML structure looks correct');
      console.log('');
      console.log('❓ Possible issues:');
      console.log('   1. JavaScript execution error in browser');
      console.log('   2. CORS or network issues');
      console.log('   3. Browser caching the old JavaScript');
      console.log('   4. GitHub Pages serving cached HTML');
      console.log('');
      console.log('🔧 Try these solutions:');
      console.log('   - Hard refresh browser (Ctrl+F5)');
      console.log('   - Clear browser cache');
      console.log('   - Open in incognito/private window');
      console.log('   - Check browser console for errors');
    } else {
      console.log('❌ HTML structure issues detected:');
      if (!hasRecentResult) console.log('   - Missing recentResult element');
      if (!hasFetchScript) console.log('   - Missing CSV fetch code');
      if (!hasUpdateFunction) console.log('   - Missing update function');
      console.log('   - GitHub Pages might be serving old HTML');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

debugLiveSite();
