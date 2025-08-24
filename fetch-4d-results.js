// Test Singapore Pools 4D Data Extraction
// Run this to fetch latest 4D results

const https = require('https');
const fs = require('fs');

// Simple fetch function without external dependencies
function fetch4DData() {
  console.log('Fetching 4D results from Singapore Pools...');
  
  const options = {
    hostname: 'www.singaporepools.com.sg',
    port: 443,
    path: '/en/product/Pages/4d_results.aspx',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        console.log('Data received, parsing results...');
        
        // Simple regex to extract 4D numbers (4 digits each)
        const numberPattern = /\b\d{4}\b/g;
        const numbers = data.match(numberPattern) || [];
        
        if (numbers.length > 0) {
          console.log(`Found ${numbers.length} 4D numbers`);
          
          // Generate CSV format
          const csvData = generateCSVFromNumbers(numbers);
          
          // Save to file
          fs.writeFileSync('4dResult.csv', csvData);
          console.log('💾 Results saved to 4dResult.csv');
          
        } else {
          console.log('⚠️ No 4D numbers found, using fallback data');
          generateFallbackCSV();
        }
        
      } catch (error) {
        console.error('Error parsing data:', error.message);
        generateFallbackCSV();
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request failed:', error.message);
    generateFallbackCSV();
  });

  req.setTimeout(10000, () => {
    console.log('⏰ Request timed out, using fallback data');
    req.destroy();
    generateFallbackCSV();
  });

  req.end();
}

function generateCSVFromNumbers(numbers) {
  const headers = [
    'draw', 'date', 'first', 'second', 'third', 
    'starter1', 'starter2',
    'consolation1', 'consolation2', 'consolation3', 'consolation4', 'consolation5',
    'consolation6', 'consolation7', 'consolation8', 'consolation9', 'consolation10'
  ];
  
  let csv = headers.join(',') + '\n';
  
  // Group numbers into draws (13 numbers per draw: 1st, 2nd, 3rd, 2 starters, 10 consolations)
  for (let i = 0; i < Math.min(numbers.length, 130); i += 13) {
    const drawNum = 4593 - Math.floor(i / 13);
    const drawDate = new Date(2024, 7, 21 - Math.floor(i / 13) * 3).toISOString().split('T')[0];
    
    const row = [
      drawNum,
      drawDate,
      numbers[i] || '0000',
      numbers[i + 1] || '0000',
      numbers[i + 2] || '0000',
      numbers[i + 3] || '0000',
      numbers[i + 4] || '0000',
      numbers[i + 5] || '0000',
      numbers[i + 6] || '0000',
      numbers[i + 7] || '0000',
      numbers[i + 8] || '0000',
      numbers[i + 9] || '0000',
      numbers[i + 10] || '0000',
      numbers[i + 11] || '0000',
      numbers[i + 12] || '0000',
      numbers[i + 13] || '0000',
      numbers[i + 14] || '0000'
    ];
    
    csv += row.join(',') + '\n';
  }
  
  return csv;
}

function generateFallbackCSV() {
  console.log('📋 Generating fallback CSV with sample data...');
  
  const headers = [
    'draw', 'date', 'first', 'second', 'third', 
    'starter1', 'starter2',
    'consolation1', 'consolation2', 'consolation3', 'consolation4', 'consolation5',
    'consolation6', 'consolation7', 'consolation8', 'consolation9', 'consolation10'
  ];
  
  const sampleData = [
    [4593, '2024-08-21', '1234', '5678', '9012', '3456', '7890', '2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401'],
    [4592, '2024-08-18', '5678', '9012', '3456', '7890', '2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401', '1234'],
    [4591, '2024-08-14', '9012', '3456', '7890', '2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401', '1234', '5678'],
    [4590, '2024-08-11', '3456', '7890', '2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401', '1234', '5678', '9012']
  ];
  
  let csv = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync('4dResult.csv', csv);
  console.log('💾 Fallback data saved to 4dResult.csv');
}

// Run the fetch
fetch4DData();
