import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Use absolute path for local CSV file
const CSV_FILE = 'd:/Timothy/Toto Predictor/Repository/toto_predictor/totoResult.csv';

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
      // Scan for all draw dates and their associated numbers
      let draws = [];
      let currentDate = null;
      let currentNumbers = [];
      let currentAdditional = null;
      $('*').each((i, el) => {
        const text = $(el).text();
        const dateMatch = text.match(/Draw Date\s*:?\s*(\d{1,2} [A-Za-z]{3} \d{4})/);
        if (dateMatch) {
          // If previous draw is complete, save it
          if (currentDate && currentNumbers.length === 6 && currentAdditional !== null) {
            draws.push({ date: currentDate, numbers: [...currentNumbers], additional: currentAdditional });
          }
          // Start new draw
          currentDate = dateMatch[1];
          currentNumbers = [];
          currentAdditional = null;
        }
        // Collect numbers
        const num = parseInt(text.trim());
        if (!isNaN(num) && num >= 1 && num <= 49) {
          if (currentNumbers.length < 6) {
            currentNumbers.push(num);
          } else if (currentNumbers.length === 6 && currentAdditional === null) {
            currentAdditional = num;
          }
        }
      });
      // Save last draw if complete
      if (currentDate && currentNumbers.length === 6 && currentAdditional !== null) {
        draws.push({ date: currentDate, numbers: [...currentNumbers], additional: currentAdditional });
      }
      // Find the most recent draw by date
      if (draws.length > 0) {
        // Sort draws by date descending
        draws.sort((a, b) => {
          const parseDate = d => {
            const [day, month, year] = d.date.split(' ');
            const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
            return new Date(2000 + parseInt(year.slice(-2)), months[month], parseInt(day));
          };
          return parseDate(b) - parseDate(a);
        });
        const latest = draws[0];
        // Format drawDate as DD-MMM-YY for consistency with CSV
        function formatDateDDMMMYY(dateStr) {
          let d = dateStr.replace(/-/g, ' ').replace(/\//g, ' ');
          let parts = d.split(' ');
          if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].length === 3 ? parts[1].toUpperCase() : parts[1].slice(0,3).toUpperCase();
            let year = parts[2].length === 4 ? parts[2].slice(2) : parts[2];
            return `${day}-${month}-${year}`;
          }
          return dateStr;
        }
        const formattedDrawDate = formatDateDDMMMYY(latest.date);
        console.log(`✅ Found latest completed draw: [${latest.numbers.join(', ')}] + Additional: ${latest.additional} for draw date: ${latest.date} (formatted: ${formattedDrawDate})`);
        return { numbers: [...latest.numbers, latest.additional], drawDate: formattedDrawDate };
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
  // Validate that numbers is an array of 7 unique integers between 1 and 49
  if (!Array.isArray(numbers) || numbers.length !== 7) return false;
  const unique = new Set(numbers);
  if (unique.size !== 7) return false;
  for (const n of numbers) {
    if (typeof n !== 'number' || n < 1 || n > 49) return false;
  }
  return true;
}
function isNewerThanCurrent(newResult) {
  try {
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) return true;
    const currentFirst = lines[0].split(',');
    // Extract date and numbers from CSV
    const currentDateRaw = currentFirst[0].trim();
    const currentNumbers = currentFirst.slice(1).map(n => parseInt(n.trim()));
    // Normalize date formats for comparison
    function normalizeDate(dateStr) {
      // Accepts DD MMM YYYY, DD-MMM-YY, DD/MM/YYYY, DD-MMM-YYYY, etc.
      let d = dateStr.replace(/-/g, ' ').replace(/\//g, ' ');
      let parts = d.split(' ');
      if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].length === 3 ? parts[1].toUpperCase() : parts[1].slice(0,3).toUpperCase();
        let year = parts[2].length === 4 ? parts[2].slice(2) : parts[2];
        return `${day}-${month}-${year}`;
      }
      return dateStr;
    }
  const currentDate = normalizeDate(currentDateRaw);
  const newDate = normalizeDate(newResult.drawDate);
  console.log(`DEBUG: Comparing normalized dates and numbers:`);
  console.log(`  Current CSV date: '${currentDateRaw}' normalized: '${currentDate}'`);
  console.log(`  New result date: '${newResult.drawDate}' normalized: '${newDate}'`);
  console.log(`  Current CSV numbers: [${currentNumbers.join(', ')}]`);
  console.log(`  New result numbers: [${newResult.numbers.join(', ')}]`);
  // Compare date and numbers
  const numbersEqual = arraysEqual(newResult.numbers, currentNumbers);
  const dateEqual = currentDate === newDate;
  console.log(`  numbersEqual=${numbersEqual}, dateEqual=${dateEqual}`);
  return !(numbersEqual && dateEqual);
  } catch (error) {
    console.log('❌ Error reading current CSV:', error.message);
    return true; // If can't read, assume it's newer
  }
}
function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
async function updateCSV({ drawDate, numbers }) {
  try {
    console.log(`💾 Updating CSV with new result: [${numbers.join(', ')}] for draw date: ${drawDate}`);
    let csvContent = '';
    try {
      csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    } catch (error) {
      console.log('📝 CSV file not found, creating new one');
    }
    // Format: DD-MMM-YYYY,number1,number2,...,additional
    function formatDateDDMMMYY(dateStr) {
      // Accepts DD MMM YYYY, DD/MM/YYYY, etc. and returns DD-MMM-YY
      let d = dateStr.replace(/-/g, ' ').replace(/\//g, ' ');
      let parts = d.split(' ');
      if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].length === 3 ? parts[1].toUpperCase() : parts[1].slice(0,3).toUpperCase();
        let year = parts[2].length === 4 ? parts[2].slice(2) : parts[2];
        return `${day}-${month}-${year}`;
      }
      return dateStr;
    }
    const formattedDate = formatDateDDMMMYY(drawDate);
    const newLine = `${formattedDate},${numbers.slice(0, 6).join(',')},${numbers[6] || ''}`;
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    // Insert new result at the beginning
    lines.unshift(newLine);
    // Write back to file
    fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n');
    console.log('✅ CSV updated successfully');
    console.log(`📊 Total entries: ${lines.length}`);
  } catch (error) {
    console.log('❌ Error updating CSV:', error.message);
    throw error;
  }
}

// FULLY DYNAMIC TOTO result fetching - NO HARDCODED VALUES - DATE-BASED LATEST DETECTION
async function fetchLatestTotoResult() {
  console.log('🚀 FULLY DYNAMIC TOTO fetching - Finding latest result by date analysis...');
  console.log('📅 NO hardcoded values - will determine latest result from website by date');
  console.log('🎯 Expected format: Latest TOTO winning numbers');
  // Strategy 1: Enhanced date-based dynamic parsing (primary method)
  const dynamicResult = await fetchLatestByDateAnalysis();
  if (dynamicResult) {
    console.log(`DEBUG: dynamicResult.numbers length = ${dynamicResult.numbers ? dynamicResult.numbers.length : 'undefined'}`);
    console.log(`DEBUG: validateTotoNumbers = ${dynamicResult.numbers ? validateTotoNumbers(dynamicResult.numbers) : 'undefined'}`);
    if (dynamicResult.numbers && dynamicResult.numbers.length === 7 && validateTotoNumbers(dynamicResult.numbers)) {
      console.log(`✅ SUCCESS: Date-based parsing found latest result [${dynamicResult.numbers.join(', ')}] for draw date: ${dynamicResult.drawDate}`);
      return dynamicResult;
    }
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
      if (isNewerThanCurrent(latestResult)) {
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
