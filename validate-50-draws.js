// 50 Draws CSV Validation Script
// Validates that all 50 draws are properly formatted

const fs = require('fs');

console.log('🔍 Validating 50 draws CSV...');

const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
const lines = csvContent.trim().split('\n');

console.log(`📊 CSV Analysis:`);
console.log(`- Total lines: ${lines.length}`);
console.log(`- Header + Data rows: ${lines.length - 1} draws`);

const header = lines[0].split(',');
console.log(`- Columns: ${header.length}`);

// Validate structure
let isValid = true;
const errors = [];

// Check header
if (header.length !== 25) {
  errors.push(`❌ Header should have 25 columns, found ${header.length}`);
  isValid = false;
}

// Validate each data row
for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split(',');
  const drawNum = row[0];
  
  if (row.length !== 25) {
    errors.push(`❌ Row ${i} (Draw ${drawNum}): Expected 25 columns, found ${row.length}`);
    isValid = false;
  }
  
  // Check if all numbers are 4 digits
  for (let j = 2; j < row.length; j++) { // Skip draw and date
    if (row[j].length !== 4) {
      errors.push(`❌ Row ${i} (Draw ${drawNum}): Number "${row[j]}" is not 4 digits`);
      isValid = false;
      break; // Don't spam errors for same row
    }
  }
}

if (isValid) {
  console.log('✅ All validations passed!');
} else {
  console.log('❌ Validation errors found:');
  errors.forEach(error => console.log(error));
}

// Show summary
const firstRow = lines[1].split(',');
const lastRow = lines[lines.length - 1].split(',');

console.log(`\n📈 Dataset Summary:`);
console.log(`- Latest Draw: ${firstRow[0]} (${firstRow[1]})`);
console.log(`- Oldest Draw: ${lastRow[0]} (${lastRow[1]})`);
console.log(`- Total Draws: ${lines.length - 1}`);
console.log(`- Draw Range: ${lastRow[0]} to ${firstRow[0]}`);

console.log(`\n🎯 Sample Latest Results:`);
for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
  const row = lines[i].split(',');
  console.log(`Draw ${row[0]} (${row[1]}): ${row[2]}, ${row[3]}, ${row[4]}`);
}

console.log(`\n🎯 Sample Oldest Results:`);
for (let i = Math.max(1, lines.length - 5); i < lines.length; i++) {
  const row = lines[i].split(',');
  console.log(`Draw ${row[0]} (${row[1]}): ${row[2]}, ${row[3]}, ${row[4]}`);
}

if (isValid) {
  console.log('\n🎉 Your 4D CSV with 50 draws is ready for prediction analysis!');
}
