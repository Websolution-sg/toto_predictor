// CSV Data Integrity Validation for TOTO Results
const fs = require('fs');

console.log('📊 CSV DATA INTEGRITY VALIDATION');
console.log('📅 Current Date: December 1, 2025');
console.log('=' * 50);

// Read and validate CSV file
function validateCSVData() {
  try {
    console.log('\n🔍 Reading totoResult.csv file...');
    const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`📄 Total lines in CSV: ${lines.length}`);
    
    if (lines.length === 0) {
      console.log('❌ CSV file is empty');
      return false;
    }
    
    // Parse and validate each line
    const validRows = [];
    const errors = [];
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      if (!line.trim()) {
        errors.push(`Line ${lineNumber}: Empty line`);
        return;
      }
      
      const parts = line.split(',');
      
      // Should have exactly 8 parts: Date,Num1,Num2,Num3,Num4,Num5,Num6,Additional
      if (parts.length !== 8) {
        errors.push(`Line ${lineNumber}: Expected 8 columns, got ${parts.length}`);
        return;
      }
      
      const [date, ...numbers] = parts;
      
      // Validate date format (DD-MMM-YY)
      const dateRegex = /^\d{1,2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
      if (!dateRegex.test(date)) {
        errors.push(`Line ${lineNumber}: Invalid date format '${date}' (expected DD-MMM-YY)`);
      }
      
      // Validate numbers
      const nums = numbers.map(n => parseInt(n.trim()));
      
      // Check if all numbers are valid integers
      if (nums.some(isNaN)) {
        errors.push(`Line ${lineNumber}: Non-numeric values found`);
        return;
      }
      
      // Check if main numbers (first 6) are in range 1-49
      const mainNumbers = nums.slice(0, 6);
      if (mainNumbers.some(n => n < 1 || n > 49)) {
        errors.push(`Line ${lineNumber}: Main numbers must be 1-49, got ${mainNumbers}`);
      }
      
      // Check if additional number (7th) is in range 1-49
      const additional = nums[6];
      if (additional < 1 || additional > 49) {
        errors.push(`Line ${lineNumber}: Additional number must be 1-49, got ${additional}`);
      }
      
      // Check for duplicates in main numbers
      const uniqueMain = new Set(mainNumbers);
      if (uniqueMain.size !== 6) {
        errors.push(`Line ${lineNumber}: Duplicate numbers in main set: ${mainNumbers}`);
      }
      
      // Check if additional number conflicts with main numbers
      if (mainNumbers.includes(additional)) {
        errors.push(`Line ${lineNumber}: Additional number ${additional} already in main set`);
      }
      
      // Check if numbers are sorted (they should be)
      const sortedMain = [...mainNumbers].sort((a, b) => a - b);
      if (JSON.stringify(mainNumbers) !== JSON.stringify(sortedMain)) {
        errors.push(`Line ${lineNumber}: Main numbers not sorted: ${mainNumbers} (should be ${sortedMain})`);
      }
      
      validRows.push({
        lineNumber,
        date,
        numbers: mainNumbers,
        additional
      });
    });
    
    // Report validation results
    console.log(`\n📊 VALIDATION RESULTS:`);
    console.log(`✅ Valid rows: ${validRows.length}`);
    console.log(`❌ Errors found: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }
    
    if (validRows.length > 0) {
      console.log('\n📈 DATA OVERVIEW:');
      console.log(`📅 Latest result: ${validRows[0].date}`);
      console.log(`🎯 Latest numbers: ${validRows[0].numbers.join(',')}`);
      console.log(`➕ Latest additional: ${validRows[0].additional}`);
      console.log(`📅 Oldest result: ${validRows[validRows.length - 1].date}`);
      
      // Check date order (should be newest first)
      console.log('\n📅 DATE ORDER CHECK:');
      let dateOrderCorrect = true;
      for (let i = 0; i < Math.min(5, validRows.length - 1); i++) {
        const current = new Date(convertDate(validRows[i].date));
        const next = new Date(convertDate(validRows[i + 1].date));
        
        if (current <= next) {
          console.log(`⚠️ Date order issue: ${validRows[i].date} should be after ${validRows[i + 1].date}`);
          dateOrderCorrect = false;
        }
      }
      
      if (dateOrderCorrect) {
        console.log('✅ Dates are in correct order (newest first)');
      }
      
      // Check for expected latest date (01-Dec-25)
      const expectedLatest = '1-Dec-25';
      const actualLatest = validRows[0].date;
      console.log(`\n📅 LATEST DATE CHECK:`);
      if (actualLatest === expectedLatest) {
        console.log(`✅ Latest date matches expected: ${expectedLatest}`);
      } else {
        console.log(`⚠️ Latest date mismatch - Expected: ${expectedLatest}, Actual: ${actualLatest}`);
      }
    }
    
    return errors.length === 0;
    
  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message);
    return false;
  }
}

// Helper function to convert DD-MMM-YY to standard date
function convertDate(dateStr) {
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const [day, month, year] = dateStr.split('-');
  return `20${year}-${months[month]}-${day.padStart(2, '0')}`;
}

// Run validation
const isValid = validateCSVData();

console.log('\n' + '=' * 50);
console.log('🏆 CSV VALIDATION RESULT:');
console.log(isValid ? '✅ CSV DATA INTEGRITY: PASSED' : '❌ CSV DATA INTEGRITY: FAILED');

if (isValid) {
  console.log('🌟 CSV file is properly formatted and contains valid TOTO results');
  console.log('📊 Data is ready for prediction algorithms');
} else {
  console.log('🚨 CSV file has integrity issues that need to be fixed');
}

process.exit(isValid ? 0 : 1);