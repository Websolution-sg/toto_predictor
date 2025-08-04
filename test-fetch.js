const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

console.log('🧪 Testing TOTO Result Fetching from Singapore Pools');
console.log('='.repeat(55));

async function testFetchLatestResult() {
  try {
    console.log('🔍 Fetching from Singapore Pools...');
    
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }

    console.log('✅ Successfully fetched HTML from Singapore Pools');
    const html = await response.text();
    
    console.log(`📄 HTML content length: ${html.length} characters`);
    
    // Try to parse using Cheerio
    const $ = cheerio.load(html);
    
    console.log('\n🔍 Analyzing HTML structure...');
    
    // Look for tables
    const tables = $('table');
    console.log(`📊 Found ${tables.length} tables`);
    
    // Look for the specific patterns we expect
    const patterns = [
      { name: 'Table rows', selector: 'table tr' },
      { name: 'Table cells', selector: 'table td' }, 
      { name: 'Draw results', selector: '.drawResults' },
      { name: 'Number elements', selector: '.number' },
      { name: 'Winning numbers', selector: '.winning-numbers' }
    ];
    
    for (const pattern of patterns) {
      const elements = $(pattern.selector);
      console.log(`${pattern.name}: ${elements.length} found`);
      
      if (elements.length > 0 && elements.length <= 20) {
        console.log(`  Sample content:`, elements.first().text().trim().substring(0, 50));
      }
    }
    
    console.log('\n🎯 Attempting to extract TOTO numbers...');
    
    // Method 1: Look in table cells for number patterns
    const tableCells = $('table td');
    const potentialNumbers = [];
    
    tableCells.each((i, cell) => {
      const text = $(cell).text().trim();
      
      // Look for individual numbers 1-49
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49) {
        potentialNumbers.push(num);
      }
      
      // Also look for space-separated numbers in a single cell
      const numbers = text.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 49);
      if (numbers.length > 0) {
        potentialNumbers.push(...numbers);
      }
    });
    
    console.log(`📊 Found ${potentialNumbers.length} potential TOTO numbers:`, potentialNumbers.slice(0, 20));
    
    // Method 2: Extract the first valid set of 7 unique numbers
    if (potentialNumbers.length >= 7) {
      for (let i = 0; i <= potentialNumbers.length - 7; i++) {
        const subset = potentialNumbers.slice(i, i + 7);
        if (new Set(subset).size === 7) { // All unique
          const winningNumbers = subset.slice(0, 6).sort((a, b) => a - b);
          const additional = subset[6];
          
          console.log('\n✅ EXTRACTED RESULT:');
          console.log(`🎯 Winning Numbers: ${winningNumbers.join(', ')}`);
          console.log(`🎲 Additional Number: ${additional}`);
          console.log(`📝 CSV Format: ${[...winningNumbers, additional].join(',')}`);
          
          return [...winningNumbers, additional];
        }
      }
    }
    
    // Method 3: Look for specific HTML patterns
    console.log('\n🔍 Checking for specific result patterns...');
    
    // Look for the most common result display patterns
    const resultPatterns = [
      'table tbody tr:first-child td',
      'table tr:first-child td', 
      '.result-table td',
      '.toto-results td',
      '[class*="result"] td',
      '[class*="number"]'
    ];
    
    for (const pattern of resultPatterns) {
      const elements = $(pattern);
      if (elements.length >= 6) {
        console.log(`Trying pattern: ${pattern} (${elements.length} elements)`);
        
        const numbers = [];
        elements.each((i, el) => {
          if (numbers.length >= 7) return false;
          const text = $(el).text().trim();
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.push(num);
          }
        });
        
        if (numbers.length >= 7) {
          const winningNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
          const additional = numbers[6];
          
          console.log(`✅ FOUND with pattern '${pattern}':`);
          console.log(`🎯 Result: ${[...winningNumbers, additional].join(',')}`);
          
          return [...winningNumbers, additional];
        }
      }
    }
    
    console.log('\n❌ Could not extract TOTO numbers from current HTML structure');
    
    // Debug: Save a sample of the HTML for analysis
    const htmlSample = html.substring(0, 2000);
    console.log('\n📋 HTML Sample (first 2000 chars):');
    console.log('-'.repeat(50));
    console.log(htmlSample);
    console.log('-'.repeat(50));
    
    return null;
    
  } catch (error) {
    console.log('❌ Error during fetch test:', error.message);
    return null;
  }
}

async function compareWithCurrentCSV() {
  console.log('\n📊 Comparing with current CSV data...');
  
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const currentLatest = lines[0].split(',').map(Number);
    
    console.log(`📋 Current latest in CSV: ${currentLatest.join(',')}`);
    console.log(`📈 Total results in CSV: ${lines.length}`);
    
    return currentLatest;
  } catch (error) {
    console.log('❌ Could not read CSV file:', error.message);
    return null;
  }
}

// Expected result based on website manual check
const expectedResult = [30, 32, 40, 43, 45, 49, 5]; // From manual website inspection

async function runTest() {
  console.log('🚀 Starting comprehensive fetch test...\n');
  
  // Check current CSV
  const currentCSV = await compareWithCurrentCSV();
  
  // Test fetch
  const fetchedResult = await testFetchLatestResult();
  
  console.log('\n📋 TEST RESULTS:');
  console.log('='.repeat(40));
  
  if (currentCSV) {
    console.log(`📊 Current CSV:     ${currentCSV.join(',')}`);
  }
  
  console.log(`🌐 Expected (web):  ${expectedResult.join(',')}`);
  
  if (fetchedResult) {
    console.log(`🤖 Fetched result:  ${fetchedResult.join(',')}`);
    
    // Compare results
    if (JSON.stringify(fetchedResult) === JSON.stringify(expectedResult)) {
      console.log('✅ PERFECT! Fetched result matches website');
    } else {
      console.log('⚠️ Fetched result differs from expected');
    }
    
    if (currentCSV && JSON.stringify(fetchedResult) !== JSON.stringify(currentCSV)) {
      console.log('🆕 New result detected! CSV needs updating');
    } else if (currentCSV) {
      console.log('📋 Result matches CSV (up to date)');
    }
  } else {
    console.log('❌ Failed to fetch result from website');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('='.repeat(40));
  
  if (!fetchedResult) {
    console.log('🔧 The website structure may have changed');
    console.log('🔧 Consider updating the parsing selectors');
    console.log('🔧 May need to manually update CSV with: ' + expectedResult.join(','));
  } else if (fetchedResult && JSON.stringify(fetchedResult) !== JSON.stringify(currentCSV)) {
    console.log('🎯 Your fetching mechanism is working!');
    console.log('🎯 Run the actual update script to update CSV');
  } else {
    console.log('✅ Everything looks good - CSV is up to date');
  }
}

// Run the test
runTest().catch(console.error);
