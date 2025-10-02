// Simple validation checker for TOTO results
import fs from 'fs';

console.log('🔍 TOTO Results Validation Check');
console.log('='.repeat(50));

// Read current CSV
try {
  const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📊 Total entries in CSV: ${lines.length}`);
  console.log('');
  
  // Show latest 5 entries
  console.log('📋 Latest 5 entries in CSV:');
  console.log('-'.repeat(40));
  lines.slice(0, 5).forEach((line, i) => {
    if (line.trim()) {
      const parts = line.split(',');
      const date = parts[0];
      const numbers = parts.slice(1).map(n => parseInt(n));
      console.log(`${i+1}. ${date}: [${numbers.join(', ')}]`);
    }
  });
  
  // Parse the latest entry
  const latestLine = lines[0];
  const latestParts = latestLine.split(',');
  const latestDate = latestParts[0];
  const latestNumbers = latestParts.slice(1).map(n => parseInt(n));
  
  console.log('');
  console.log('🎯 CURRENT LATEST RESULT:');
  console.log('='.repeat(30));
  console.log(`📅 Draw Date: ${latestDate}`);
  console.log(`🎲 Numbers: [${latestNumbers.join(', ')}]`);
  console.log(`📊 Main Numbers: [${latestNumbers.slice(0, 6).join(', ')}]`);
  console.log(`🎯 Additional Number: ${latestNumbers[6]}`);
  
  // Check if this is current (today is Oct 2, 2025)
  console.log('');
  console.log('📅 DATE ANALYSIS:');
  console.log('-'.repeat(20));
  console.log(`Latest entry: ${latestDate}`);
  console.log(`Today: Oct 2, 2025`);
  
  // Parse the date to check if it's recent
  const dateParts = latestDate.split('-');
  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0]);
    const month = dateParts[1];
    const year = parseInt(dateParts[2]) + 2000; // Convert 25 to 2025
    
    console.log(`Parsed: ${day} ${month} ${year}`);
    
    // Check if this is from September 2025
    if (year === 2025 && month === 'Sept' && day === 29) {
      console.log('✅ Latest entry is from Sept 29, 2025');
      console.log('❓ Need to check if there are results for Oct 2025');
    } else {
      console.log('⚠️ Latest entry may not be the most recent');
    }
  }
  
  console.log('');
  console.log('🔍 VALIDATION INSTRUCTIONS:');
  console.log('='.repeat(40));
  console.log('1. Visit https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx');
  console.log('2. Check if there are any TOTO results after Sept 29, 2025');
  console.log('3. The latest result in CSV shows: Sept 29, 2025');
  console.log('4. If you find newer results, please provide them for validation');
  console.log('');
  console.log('💡 Expected format for new results:');
  console.log('   DD-MMM-YY,N1,N2,N3,N4,N5,N6,ADDITIONAL');
  console.log('   Example: 2-Oct-25,12,23,34,45,46,49,8');
  
} catch (error) {
  console.error('❌ Error reading CSV:', error.message);
}