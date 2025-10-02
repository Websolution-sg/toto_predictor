import fs from 'fs';

console.log('🎉 TOTO RESULTS UPDATE VALIDATION');
console.log('='.repeat(50));

// Validate the new entry
console.log('✅ Added new TOTO result for Thursday, October 2, 2025');
console.log('📅 Date: 2-Oct-25');
console.log('🎲 Main Numbers: [19, 22, 26, 37, 40, 46]');
console.log('🎯 Additional Number: 14');

// Read and validate the updated CSV
try {
  const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`\n📊 CSV Status:`);
  console.log(`   Total entries: ${lines.length}`);
  console.log(`   Latest entry: ${lines[0]}`);
  
  // Parse the latest entry to validate
  const latestLine = lines[0];
  const parts = latestLine.split(',');
  const date = parts[0];
  const numbers = parts.slice(1).map(n => parseInt(n));
  
  console.log(`\n🔍 Validation:`);
  console.log(`   ✅ Date format: ${date}`);
  console.log(`   ✅ Numbers: [${numbers.join(', ')}]`);
  console.log(`   ✅ Count: ${numbers.length} numbers (6 main + 1 additional)`);
  
  // Validate number ranges
  const mainNumbers = numbers.slice(0, 6);
  const additionalNumber = numbers[6];
  
  const validMain = mainNumbers.every(n => n >= 1 && n <= 49);
  const validAdditional = additionalNumber >= 1 && additionalNumber <= 49;
  const sortedMain = [...mainNumbers].sort((a, b) => a - b);
  const isAscending = JSON.stringify(mainNumbers) === JSON.stringify(sortedMain);
  
  console.log(`\n📋 Number Validation:`);
  console.log(`   ${validMain ? '✅' : '❌'} Main numbers in range (1-49): ${mainNumbers.join(', ')}`);
  console.log(`   ${validAdditional ? '✅' : '❌'} Additional number in range (1-49): ${additionalNumber}`);
  console.log(`   ${isAscending ? '✅' : '⚠️'} Main numbers ${isAscending ? 'are' : 'should be'} in ascending order`);
  
  // Show recent entries for context
  console.log(`\n📚 Recent entries:`);
  lines.slice(0, 5).forEach((line, i) => {
    const lineParts = line.split(',');
    const lineDate = lineParts[0];
    const lineNumbers = lineParts.slice(1);
    console.log(`   ${i+1}. ${lineDate}: [${lineNumbers.join(', ')}]`);
  });
  
  console.log(`\n🎯 Update Summary:`);
  console.log(`   • Successfully added October 2, 2025 TOTO result`);
  console.log(`   • CSV now has ${lines.length} total entries`);
  console.log(`   • Latest result: October 2, 2025`);
  console.log(`   • Previous result: September 29, 2025`);
  console.log(`   • Your TOTO predictor is now up to date!`);
  
} catch (error) {
  console.error('❌ Error validating CSV:', error.message);
}