// --- All function definitions copied from updateTotoCSV.cjs ---
async function fetchLatestByDateAnalysis() {
  const urls = [
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
    'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0'
  ];
  for (const url of urls) {
    try {
      console.log(`🔍 Analyzing ${url} for latest result by date...`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (response.status !== 200) {
        console.log(`❌ HTTP error: ${response.status}`);
        continue;
      }
      const html = response.data;
      const $ = cheerio.load(html);
      let drawDate = null;
      let numbers = [];
      // Find all draw date and result blocks
      $('table, h2, h3, h4, .drawdate').each((i, el) => {
        const text = $(el).text();
        const dateMatch = text.match(/(\d{1,2} [A-Za-z]{3} \d{4})/);
        if (dateMatch) {
          drawDate = dateMatch[1];
        }
      });
      // Find numbers in result table
      let found = false;
      $('table').each((i, table) => {
        let mainNumbers = [];
        let additional = null;
        let resultDrawDate = null;
        let rows = $(table).find('tr');
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          const row = rows[rowIdx];
          const cells = $(row).find('td');
          const nums = [];
          cells.each((cellIdx, td) => {
            const num = parseInt($(td).text().trim());
            if (!isNaN(num) && num >= 1 && num <= 49) {
              nums.push(num);
            }
          });
          // Try to extract draw date from the row or previous sibling or parent
          const rowText = $(row).text();
          const dateMatch = rowText.match(/(\d{1,2} [A-Za-z]{3} \d{4})/);
          if (dateMatch) {
            resultDrawDate = dateMatch[1];
          } else if (!resultDrawDate && rowIdx > 0) {
            const prevRowText = $(rows[rowIdx-1]).text();
            const prevDateMatch = prevRowText.match(/(\d{1,2} [A-Za-z]{3} \d{4})/);
            if (prevDateMatch) {
              resultDrawDate = prevDateMatch[1];
            }
          } else if (!resultDrawDate) {
            // Check parent or header elements
            const parentText = $(table).parent().text();
            const parentDateMatch = parentText.match(/(\d{1,2} [A-Za-z]{3} \d{4})/);
            if (parentDateMatch) {
              resultDrawDate = parentDateMatch[1];
            }
          }
          if (nums.length === 6 && mainNumbers.length === 0) {
            mainNumbers = nums;
          } else if (nums.length === 1 && mainNumbers.length === 6 && additional === null) {
            additional = nums[0];
          }
        }
        if (mainNumbers.length === 6 && additional !== null && resultDrawDate) {
          numbers = [...mainNumbers, additional];
          drawDate = resultDrawDate;
          found = true;
        }
      });
      // If not found, try to extract from non-table elements
      if (!found) {
        // Look for draw date in headers or paragraphs
        let drawDateText = null;
        $('h2, h3, h4, p, div').each((i, el) => {
          const text = $(el).text();
          const dateMatch = text.match(/(\d{1,2} [A-Za-z]{3} \d{4})/);
          if (dateMatch) {
            drawDateText = dateMatch[1];
          }
        });
        // Look for numbers in sequences of 6 followed by 1
        let nums = [];
        let addNum = null;
        let foundSeq = false;
        $('td').each((i, td) => {
          const num = parseInt($(td).text().trim());
          if (!isNaN(num) && num >= 1 && num <= 49) {
            nums.push(num);
            if (nums.length === 6) {
              foundSeq = true;
            } else if (foundSeq && nums.length === 7) {
              addNum = nums[6];
            }
          }
        });
        if (drawDateText && nums.length >= 6 && addNum !== null) {
          numbers = [...nums.slice(0, 6), addNum];
          drawDate = drawDateText;
        }
      }
      if (drawDate && numbers.length >= 6) {
        console.log(`✅ Found latest completed draw: [${numbers.join(', ')}] for draw date: ${drawDate}`);
        return { numbers, drawDate };
      }
    } catch (error) {
      console.log(`❌ Error with ${url}:`, error.message);
    }
  }
  return null;
}
async function fetchLatestByPatternMatching() {
  // ...function body from updateTotoCSV.cjs...
}
async function tryMultipleEndpointsForLatest() {
  // ...function body from updateTotoCSV.cjs...
}
async function comprehensiveLatestAnalysis() {
  // ...function body from updateTotoCSV.cjs...
}
function validateTotoNumbers(numbers) {
  // ...function body from updateTotoCSV.cjs...
}
function isNewerThanCurrent(newNumbers) {
  // ...function body from updateTotoCSV.cjs...
}
function arraysEqual(a, b) {
  // ...function body from updateTotoCSV.cjs...
}
async function updateCSV({ drawDate, numbers }) {
  // ...function body from updateTotoCSV.cjs...
}
import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

const CSV_FILE = 'totoResult.csv';

// FULLY DYNAMIC TOTO result fetching - NO HARDCODED VALUES - DATE-BASED LATEST DETECTION
async function fetchLatestTotoResult() {
  console.log('🚀 FULLY DYNAMIC TOTO fetching - Finding latest result by date analysis...');
  console.log('📅 NO hardcoded values - will determine latest result from website by date');
  console.log('🎯 Expected format: Latest TOTO winning numbers');
  // Strategy 1: Enhanced date-based dynamic parsing (primary method)
  const dynamicResult = await fetchLatestByDateAnalysis();
  if (dynamicResult && dynamicResult.numbers && dynamicResult.numbers.length === 7 && validateTotoNumbers(dynamicResult.numbers)) {
    console.log(`✅ SUCCESS: Date-based parsing found latest result [${dynamicResult.numbers.join(', ')}] for draw date: ${dynamicResult.drawDate}`);
    return dynamicResult;
  }
  // Strategy 2: Latest result pattern matching
  console.log('🔄 Date-based failed, trying latest result pattern matching...');
  const patternResult = await fetchLatestByPatternMatching();
  if (patternResult && patternResult.length === 7 && validateTotoNumbers(patternResult)) {
    console.log(`✅ SUCCESS: Pattern matching found latest result [${patternResult.join(', ')}]`);
    return patternResult;
  }
  // Strategy 3: Multiple endpoint parsing with latest detection
  console.log('🔄 Pattern matching failed, trying multiple endpoint latest detection...');
  const multiEndpointResult = await tryMultipleEndpointsForLatest();
  if (multiEndpointResult && multiEndpointResult.length === 7 && validateTotoNumbers(multiEndpointResult)) {
    console.log(`✅ SUCCESS: Multi-endpoint parsing found latest result [${multiEndpointResult.join(', ')}]`);
    return multiEndpointResult;
  }
  // Strategy 4: Comprehensive content analysis for most recent
  console.log('🔄 Multi-endpoint failed, trying comprehensive latest analysis...');
  const contentResult = await comprehensiveLatestAnalysis();
  if (contentResult && contentResult.length === 7 && validateTotoNumbers(contentResult)) {
    console.log(`✅ SUCCESS: Comprehensive analysis found latest result [${contentResult.join(', ')}]`);
    return contentResult;
  }
  console.log('📋 Returning null - no hardcoded values used');
  return null;
}

// ...copy all other function definitions and logic from updateTotoCSV.cjs here...

(async () => {
  try {
    console.log('🎯 Starting FULLY DYNAMIC TOTO result fetching...');
    console.log('📋 NO hardcoded values - purely dynamic parsing\n');
    const latestResult = await fetchLatestTotoResult();
    if (!latestResult || !latestResult.numbers || !latestResult.drawDate) {
      console.log('❌ RESULT: No latest TOTO result found through dynamic parsing');
      console.log('📋 CSV will remain unchanged (no hardcoded fallback)');
      process.exit(0); // Exit successfully but without updates
    }
    console.log(`\n🎯 Latest TOTO result found: [${latestResult.numbers.join(', ')}] for draw date: ${latestResult.drawDate}`);
    // Check if this is newer than current
    if (isNewerThanCurrent(latestResult.numbers)) {
      await updateCSV(latestResult);
      console.log('✅ SUCCESS: CSV updated with latest TOTO result');
    } else {
      console.log('📋 INFO: Result is same as current, no update needed');
    }
  } catch (error) {
    console.log('💥 CRITICAL ERROR:', error.message);
    console.log('📋 Stack:', error.stack);
    process.exit(1);
  }
})();
