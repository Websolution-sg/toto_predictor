const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

// VALIDATION SCRIPT: Shows exactly what the enhanced workflow fetches
async function validateWorkflow() {
  console.log('🔍 VALIDATION: Testing TOTO workflow to show exactly what is being fetched...');
  console.log('📅 Current date:', new Date().toISOString());
  console.log('');
  
  // Test the enhanced fetching process
  const result = await fetchLatestTotoResult();
  
  if (result) {
    console.log('');
    console.log('🎯 VALIDATION RESULT:');
    console.log(`   ✅ Successfully fetched: [${result.join(', ')}]`);
    console.log('');
    
    // Compare with current CSV
    const existingResults = readExistingCSV(CSV_FILE);
    if (existingResults.length > 0) {
      console.log('📊 COMPARISON WITH CURRENT CSV:');
      console.log(`   📄 Current CSV top entry: [${existingResults[0].join(', ')}]`);
      console.log(`   🔍 Fetched result:       [${result.join(', ')}]`);
      console.log(`   🔄 Match status: ${arraysEqual(result, existingResults[0]) ? '✅ MATCH' : '🆕 NEW RESULT'}`);
    }
  } else {
    console.log('❌ VALIDATION FAILED: Could not fetch any result');
  }
  
  return result;
}

// Enhanced TOTO result fetching with detailed logging for validation
async function fetchLatestTotoResult() {
  console.log('🔍 Starting enhanced multi-strategy TOTO fetch...');
  
  const endpoints = [
    {
      name: 'Singapore Pools Main',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      strategy: 'date-based'
    },
    {
      name: 'Singapore Pools Alternative',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      strategy: 'table-based'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Testing ${endpoint.name}...`);
      
      const response = await fetch(endpoint.url, {
        headers: endpoint.headers,
        timeout: 30000
      });
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`   📄 Received ${html.length} characters`);
      
      // Validate content
      if (!validateContent(html)) {
        console.log(`   ⚠️ Content validation failed`);
        continue;
      }
      
      // Parse based on strategy
      const result = endpoint.strategy === 'date-based' 
        ? parseWithDateStrategy(html)
        : parseWithTableStrategy(html);
      
      if (result && result.length === 7) {
        console.log(`   ✅ ${endpoint.name} found: [${result.join(', ')}]`);
        results.push({
          source: endpoint.name,
          numbers: result,
          confidence: calculateSimpleConfidence(result, html)
        });
      } else {
        console.log(`   ❌ ${endpoint.name} parsing failed`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} error: ${error.message}`);
    }
  }
  
  if (results.length === 0) {
    console.log('❌ All endpoints failed');
    return null;
  }
  
  // Sort by confidence and return best result
  results.sort((a, b) => b.confidence - a.confidence);
  const best = results[0];
  
  console.log(`🏆 Best result from ${best.source}: [${best.numbers.join(', ')}] (confidence: ${best.confidence.toFixed(1)})`);
  
  if (results.length > 1) {
    console.log(`🔄 Cross-validation: ${results.filter(r => arraysEqual(r.numbers, best.numbers)).length}/${results.length} sources agree`);
  }
  
  return best.numbers;
}

function validateContent(html) {
  const text = html.toLowerCase();
  const hasKeywords = text.includes('toto') && (text.includes('result') || text.includes('winning'));
  const hasLength = html.length > 5000;
  
  console.log(`   🔍 Content validation: Keywords=${hasKeywords}, Length=${hasLength} (${html.length} chars)`);
  return hasKeywords && hasLength;
}

function parseWithDateStrategy(html) {
  console.log('   📅 Using date-based parsing strategy...');
  
  try {
    const currentDate = new Date();
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi
    ];
    
    const foundDates = [];
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.regex ? pattern.regex.exec(html) : pattern.exec(html)) !== null) {
        try {
          let date;
          if (match[0].includes('/')) {
            date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
            const months = {'jan':0,'feb':1,'mar':2,'apr':3,'may':4,'jun':5,'jul':6,'aug':7,'sep':8,'oct':9,'nov':10,'dec':11};
            date = new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
          }
          
          if (date.getFullYear() === currentDate.getFullYear() && date <= currentDate) {
            foundDates.push({
              date: date,
              dateString: match[0],
              position: match.index,
              context: html.substring(Math.max(0, match.index - 300), match.index + 800)
            });
          }
        } catch (err) {
          // Skip invalid dates
        }
      }
    }
    
    console.log(`   📅 Found ${foundDates.length} valid dates`);
    
    if (foundDates.length === 0) return null;
    
    // Sort by most recent date
    foundDates.sort((a, b) => b.date - a.date);
    
    // Look for numbers near the most recent dates
    for (let i = 0; i < Math.min(foundDates.length, 3); i++) {
      const dateInfo = foundDates[i];
      console.log(`   📅 Checking date: ${dateInfo.dateString}`);
      
      const numbers = extractNumbersFromContext(dateInfo.context);
      if (numbers && numbers.length === 7) {
        console.log(`   ✅ Found 7 numbers near ${dateInfo.dateString}: [${numbers.join(', ')}]`);
        return numbers;
      }
    }
    
    return null;
    
  } catch (error) {
    console.log(`   ❌ Date parsing error: ${error.message}`);
    return null;
  }
}

function parseWithTableStrategy(html) {
  console.log('   📊 Using table-based parsing strategy...');
  
  try {
    const $ = cheerio.load(html);
    
    // Look for tables with TOTO content
    const tables = $('table');
    console.log(`   📊 Found ${tables.length} tables`);
    
    for (let i = 0; i < tables.length; i++) {
      const table = $(tables[i]);
      const tableText = table.text().toLowerCase();
      
      if (tableText.includes('toto') || tableText.includes('winning')) {
        console.log(`   📊 Table ${i + 1} contains TOTO content`);
        
        const rows = table.find('tr');
        for (let j = 0; j < Math.min(rows.length, 5); j++) {
          const row = $(rows[j]);
          const numbers = [];
          
          row.find('td, th').each((index, cell) => {
            const text = $(cell).text().trim();
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          if (numbers.length >= 7) {
            const result = numbers.slice(0, 7);
            if (validateNumbers(result)) {
              console.log(`   ✅ Found valid sequence in table ${i + 1}, row ${j + 1}: [${result.join(', ')}]`);
              return result;
            }
          }
        }
      }
    }
    
    return null;
    
  } catch (error) {
    console.log(`   ❌ Table parsing error: ${error.message}`);
    return null;
  }
}

function extractNumbersFromContext(context) {
  const numbers = [];
  const numberPattern = /(\d{1,2})/g;
  let match;
  
  while ((match = numberPattern.exec(context)) !== null) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 49) {
      numbers.push(num);
    }
  }
  
  // Look for sequences of 7 valid numbers
  for (let i = 0; i <= numbers.length - 7; i++) {
    const sequence = numbers.slice(i, i + 7);
    if (validateNumbers(sequence)) {
      return sequence;
    }
  }
  
  return null;
}

function validateNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 7) return false;
  
  // All numbers must be 1-49
  if (!numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 49)) return false;
  
  // First 6 numbers should be unique
  const mainNumbers = numbers.slice(0, 6);
  if (new Set(mainNumbers).size !== 6) return false;
  
  return true;
}

function calculateSimpleConfidence(numbers, html) {
  let confidence = 50;
  
  // Check for result-related keywords in HTML
  const text = html.toLowerCase();
  if (text.includes('winning')) confidence += 15;
  if (text.includes('latest')) confidence += 10;
  if (text.includes('result')) confidence += 10;
  if (text.includes('draw')) confidence += 10;
  
  // Check number distribution
  const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
  const spread = mainNumbers[5] - mainNumbers[0];
  if (spread >= 20 && spread <= 35) confidence += 15;
  
  return confidence;
}

function readExistingCSV(filename) {
  try {
    if (!fs.existsSync(filename)) return [];
    
    const content = fs.readFileSync(filename, 'utf8').trim();
    if (!content) return [];
    
    return content.split('\n').map(line => 
      line.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
    ).filter(arr => arr.length === 7);
    
  } catch (error) {
    console.log(`❌ Error reading CSV: ${error.message}`);
    return [];
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

// Run validation
validateWorkflow().then(result => {
  console.log('');
  console.log('🎯 VALIDATION COMPLETE');
  console.log(`📋 Final Status: ${result ? 'SUCCESS' : 'FAILED'}`);
  if (result) {
    console.log(`🎲 Fetched Numbers: [${result.join(', ')}]`);
  }
}).catch(error => {
  console.error('💥 Validation Error:', error.message);
});
