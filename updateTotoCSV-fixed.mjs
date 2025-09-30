import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

const CSV_FILE = 'd:/Timothy/Toto Predictor/Repository/toto_predictor/totoResult.csv';

async function fetchLatestTotoResult() {
  console.log('🚀 Fetching latest TOTO result from Singapore Pools...');
  
  try {
    const response = await axios.get('https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000
    });

    console.log('✅ Successfully fetched Singapore Pools page');
    
    const $ = cheerio.load(response.data);
    
    // Extract draw date
    const dateMatch = response.data.match(/Mon, (\d{1,2} \w{3} \d{4})|Tue, (\d{1,2} \w{3} \d{4})|Wed, (\d{1,2} \w{3} \d{4})|Thu, (\d{1,2} \w{3} \d{4})|Fri, (\d{1,2} \w{3} \d{4})|Sat, (\d{1,2} \w{3} \d{4})|Sun, (\d{1,2} \w{3} \d{4})/);
    if (!dateMatch) {
      throw new Error('Could not find draw date');
    }
    
    const drawDate = dateMatch[0].replace(/^\w{3}, /, ''); // Remove day prefix
    console.log(`📅 Found draw date: ${drawDate}`);
    
    // Extract winning numbers from table cells
    const numberCells = [];
    $('td').each((i, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= 49) {
        numberCells.push(num);
      }
    });
    
    if (numberCells.length < 7) {
      throw new Error(`Not enough numbers found. Got: ${numberCells.length}`);
    }
    
    // First 6 are winning numbers, 7th is additional
    const winningNumbers = numberCells.slice(0, 6);
    const additionalNumber = numberCells[6];
    
    console.log(`🎯 Winning numbers: ${winningNumbers.join(', ')}`);
    console.log(`➕ Additional number: ${additionalNumber}`);
    
    return {
      drawDate: formatDateDDMMMYY(drawDate),
      winningNumbers,
      additionalNumber
    };
    
  } catch (error) {
    console.error('❌ Error fetching TOTO result:', error.message);
    return null;
  }
}

function formatDateDDMMMYY(dateStr) {
  try {
    // Convert "29 Sep 2025" to "29-Sept-25"
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}

async function updateCSV(result) {
  try {
    const newLine = `${result.drawDate},${result.winningNumbers.join(',')},${result.additionalNumber}`;
    
    // Read existing CSV
    let csvContent = '';
    if (fs.existsSync(CSV_FILE)) {
      csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    }
    
    // Check if this result already exists
    if (csvContent.includes(newLine)) {
      console.log('ℹ️ Result already exists in CSV');
      return false;
    }
    
    // Add new result at the top
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    lines.unshift(newLine);
    
    // Write back to file
    fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n');
    console.log('✅ CSV updated successfully');
    console.log(`📊 Total entries: ${lines.length}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error updating CSV:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🎯 Starting TOTO update process...');
  
  const result = await fetchLatestTotoResult();
  
  if (result) {
    console.log('\n📋 Fetched result:');
    console.log(`   Date: ${result.drawDate}`);
    console.log(`   Numbers: ${result.winningNumbers.join(', ')}`);
    console.log(`   Additional: ${result.additionalNumber}`);
    
    const updated = await updateCSV(result);
    if (updated) {
      console.log('\n✅ TOTO results updated successfully!');
    } else {
      console.log('\n📋 No new results to add');
    }
  } else {
    console.log('\n❌ Failed to fetch TOTO results');
    process.exit(1);
  }
}

main().catch(console.error);