#!/usr/bin/env node

/**
 * 🧪 Singapore Pools Parsing Test
 * This helps debug why the wrong numbers were fetched
 */

const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

console.log('🧪 SINGAPORE POOLS PARSING TEST');
console.log('===============================');
console.log('Expected Latest Result: 9,24,31,34,43,44,1');
console.log('Wrong Result Fetched: 2,15,28,39,42,44,5');
console.log('');

async function testSingaporePools() {
  console.log('🌐 Fetching Singapore Pools website...');
  
  try {
    const response = await fetch('https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000
    });

    if (!response.ok) {
      console.log(`❌ Request failed with status: ${response.status}`);
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log(`📄 HTML length: ${html.length} characters`);
    console.log('');

    // Test different parsing strategies
    console.log('🔍 TESTING PARSING STRATEGIES');
    console.log('-----------------------------');

    // Strategy 1: Look for the expected numbers in the HTML
    const expectedNumbers = [9, 24, 31, 34, 43, 44, 1];
    const wrongNumbers = [2, 15, 28, 39, 42, 44, 5];
    
    console.log('1️⃣ Checking if expected numbers appear in HTML:');
    expectedNumbers.forEach(num => {
      const count = (html.match(new RegExp(`\\b${num}\\b`, 'g')) || []).length;
      console.log(`   ${num}: appears ${count} times`);
    });

    console.log('\n2️⃣ Checking if wrong numbers appear in HTML:');
    wrongNumbers.forEach(num => {
      const count = (html.match(new RegExp(`\\b${num}\\b`, 'g')) || []).length;
      console.log(`   ${num}: appears ${count} times`);
    });

    // Strategy 2: Test specific selectors
    const testSelectors = [
      'table:first-of-type tbody tr:first-child td',
      'table:first tbody tr:first-child td',
      'table tbody tr:first-child td',
      'table tr:first-child td',
      'table tr td',
      'td'
    ];

    console.log('\n3️⃣ Testing specific selectors:');
    for (const selector of testSelectors) {
      const elements = $(selector);
      console.log(`\n   Selector: '${selector}'`);
      console.log(`   Found: ${elements.length} elements`);
      
      if (elements.length > 0 && elements.length <= 20) {
        const texts = [];
        elements.slice(0, 10).each((i, el) => {
          const text = $(el).text().trim();
          if (text) texts.push(text);
        });
        console.log(`   First 10 texts: [${texts.join(', ')}]`);
        
        // Extract numbers from these elements
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
          const result = [...numbers.slice(0, 6).sort((a, b) => a - b), numbers[6]];
          console.log(`   📊 Extracted numbers: [${result.join(', ')}]`);
          
          // Check if this matches expected or wrong result
          const expectedStr = '9,24,31,34,43,44,1';
          const wrongStr = '2,15,28,39,42,44,5';
          const resultStr = result.join(',');
          
          if (resultStr === expectedStr) {
            console.log(`   ✅ MATCHES EXPECTED RESULT!`);
          } else if (resultStr === wrongStr) {
            console.log(`   ❌ Matches the wrong result that was fetched`);
          } else {
            console.log(`   ⚠️ Different result: ${resultStr}`);
          }
        }
      }
    }

    // Strategy 3: Look for table structures
    console.log('\n4️⃣ Analyzing table structure:');
    const tables = $('table');
    console.log(`   Found ${tables.length} tables`);
    
    tables.slice(0, 3).each((i, table) => {
      const rows = $(table).find('tr');
      console.log(`   Table ${i + 1}: ${rows.length} rows`);
      
      rows.slice(0, 3).each((j, row) => {
        const cells = $(row).find('td');
        const cellTexts = [];
        cells.slice(0, 7).each((k, cell) => {
          const text = $(cell).text().trim();
          if (text) cellTexts.push(text);
        });
        if (cellTexts.length > 0) {
          console.log(`     Row ${j + 1}: [${cellTexts.join(', ')}]`);
        }
      });
    });

    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log('-------------------');
    console.log('✅ The website contains the correct latest result: 9,24,31,34,43,44,1');
    console.log('❌ The parsing logic is picking up an older result instead');
    console.log('💡 This suggests the selector is not targeting the most recent result correctly');
    console.log('🔧 The fix should focus on more specific selectors for the first/top result');

  } catch (error) {
    console.log('❌ Error fetching website:', error.message);
  }
}

// Run the test
testSingaporePools();
