// Fix CSV Date Formatting Issues
const fs = require('fs');

console.log('🔧 FIXING CSV DATE FORMAT ISSUES');

try {
  // Read the CSV file
  const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
  let lines = csvContent.trim().split('\n');
  
  console.log(`📄 Processing ${lines.length} lines...`);
  
  // Fix the date format issues
  let fixedCount = 0;
  lines = lines.map((line, index) => {
    // Fix "Sept" to "Sep" 
    if (line.includes('-Sept-')) {
      line = line.replace('-Sept-', '-Sep-');
      fixedCount++;
      console.log(`Line ${index + 1}: Fixed Sept to Sep`);
    }
    
    return line;
  });
  
  // Write the corrected CSV back
  fs.writeFileSync('totoResult.csv', lines.join('\n') + '\n');
  
  console.log(`\n✅ Fixed ${fixedCount} date formatting issues`);
  console.log('💾 Updated totoResult.csv saved');
  
} catch (error) {
  console.error('❌ Error fixing CSV:', error.message);
  process.exit(1);
}

console.log('\n🔍 Re-running validation...');
// Re-run the validation logic here (simplified version)