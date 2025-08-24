// Manual 4D Update Tool (Safe alternative to web scraping)
// This allows manual entry of 4D results when web scraping fails
// Completely separate from TOTO system

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class Manual4DUpdater {
  constructor() {
    this.csvPath = path.join(__dirname, '4dResult.csv'); // Separate from totoResult.csv
  }

  async promptForResults() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('=== Manual 4D Results Entry ===');
    console.log('(Separate from TOTO system - updates 4dResult.csv only)');
    console.log('');

    const drawNumber = await this.question(rl, 'Enter draw number (e.g., 5370): ');
    const drawDate = await this.question(rl, 'Enter draw date (YYYY-MM-DD, e.g., 2025-08-24): ');
    const first = await this.question(rl, 'Enter 1st prize (4 digits): ');
    const second = await this.question(rl, 'Enter 2nd prize (4 digits): ');
    const third = await this.question(rl, 'Enter 3rd prize (4 digits): ');

    console.log('\nEnter 10 starter prizes:');
    const starter = [];
    for (let i = 1; i <= 10; i++) {
      const prize = await this.question(rl, `Starter ${i}: `);
      starter.push(prize);
    }

    console.log('\nEnter 10 consolation prizes:');
    const consolation = [];
    for (let i = 1; i <= 10; i++) {
      const prize = await this.question(rl, `Consolation ${i}: `);
      consolation.push(prize);
    }

    rl.close();

    return {
      draw: parseInt(drawNumber),
      date: drawDate,
      first: first,
      second: second,
      third: third,
      starter: starter,
      consolation: consolation
    };
  }

  question(rl, prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async updateCSV(newResult) {
    try {
      let existingData = [];
      
      // Read existing CSV if it exists
      if (fs.existsSync(this.csvPath)) {
        const csvContent = fs.readFileSync(this.csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        if (lines.length > 1) {
          // Parse existing data (skip header)
          existingData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
              draw: parseInt(values[0]),
              date: values[1],
              first: values[2],
              second: values[3],
              third: values[4],
              starter: values.slice(5, 15),
              consolation: values.slice(15, 25)
            };
          });
        }
      }

      // Check if draw number already exists
      const existingEntry = existingData.find(item => item.draw === newResult.draw);
      if (existingEntry) {
        console.log(`\nWARNING: Draw ${newResult.draw} already exists.`);
        console.log('Existing entry will be updated.');
        
        // Remove existing entry
        existingData = existingData.filter(item => item.draw !== newResult.draw);
      }

      // Add new result and sort by draw number (descending - newest first)
      existingData.unshift(newResult);
      existingData.sort((a, b) => b.draw - a.draw);
      
      // Keep only latest 101 records
      existingData = existingData.slice(0, 101);
      
      // Generate CSV content
      const header = 'draw,date,first,second,third,starter1,starter2,starter3,starter4,starter5,starter6,starter7,starter8,starter9,starter10,consolation1,consolation2,consolation3,consolation4,consolation5,consolation6,consolation7,consolation8,consolation9,consolation10';
      
      const csvLines = [header];
      existingData.forEach(item => {
        const starterPadded = [...item.starter, ...Array(10)].slice(0, 10).map(val => val || '');
        const consolationPadded = [...item.consolation, ...Array(10)].slice(0, 10).map(val => val || '');
        
        const line = [
          item.draw,
          item.date,
          item.first,
          item.second,
          item.third,
          ...starterPadded,
          ...consolationPadded
        ].join(',');
        
        csvLines.push(line);
      });
      
      // Write updated CSV
      fs.writeFileSync(this.csvPath, csvLines.join('\n'));
      console.log(`\nSUCCESS: 4dResult.csv updated with draw ${newResult.draw}`);
      console.log(`Total records: ${existingData.length}`);
      console.log('TOTO system remains completely unaffected.');
      
      return true;
      
    } catch (error) {
      console.error('ERROR: Failed to update CSV:', error.message);
      return false;
    }
  }

  showCurrentData() {
    try {
      if (fs.existsSync(this.csvPath)) {
        const csvContent = fs.readFileSync(this.csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log('\n=== Current 4D Data (Latest 5 entries) ===');
        console.log('(From 4dResult.csv - TOTO data in totoResult.csv is separate)');
        
        if (lines.length > 1) {
          for (let i = 0; i < Math.min(6, lines.length); i++) {
            console.log(lines[i]);
          }
          if (lines.length > 6) {
            console.log(`... and ${lines.length - 6} more entries`);
          }
        } else {
          console.log('No data found');
        }
      } else {
        console.log('4dResult.csv not found');
      }
    } catch (error) {
      console.error('ERROR: Failed to read CSV:', error.message);
    }
  }

  async run() {
    console.log('4D Manual Update Tool');
    console.log('(Completely separate from your TOTO automation system)');
    console.log('');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--show')) {
      this.showCurrentData();
      return;
    }
    
    if (args.includes('--help')) {
      console.log('Usage:');
      console.log('  node manual-4d-update.js          # Add new 4D result');
      console.log('  node manual-4d-update.js --show   # Show current data');
      console.log('  node manual-4d-update.js --help   # Show this help');
      console.log('');
      console.log('Note: This tool updates 4dResult.csv only.');
      console.log('Your TOTO system (totoResult.csv) remains completely separate.');
      return;
    }
    
    try {
      const result = await this.promptForResults();
      
      console.log('\n=== Confirm Entry ===');
      console.log(`Draw: ${result.draw}`);
      console.log(`Date: ${result.date}`);
      console.log(`1st: ${result.first}, 2nd: ${result.second}, 3rd: ${result.third}`);
      console.log(`Starter: ${result.starter.join(', ')}`);
      console.log(`Consolation: ${result.consolation.join(', ')}`);
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const confirm = await this.question(rl, '\nSave this entry? (y/n): ');
      rl.close();
      
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        const success = await this.updateCSV(result);
        if (success) {
          console.log('\n4D result added successfully!');
          this.showCurrentData();
        }
      } else {
        console.log('Entry cancelled.');
      }
      
    } catch (error) {
      console.error('ERROR:', error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const updater = new Manual4DUpdater();
  updater.run();
}

module.exports = Manual4DUpdater;
