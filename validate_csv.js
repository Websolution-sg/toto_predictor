const fs = require('fs');

console.log('🔍 Validating CSV file...');

try {
  const data = fs.readFileSync('totoResult.csv', 'utf8');
  const lines = data.trim().split('\n');
  
  console.log(`📊 Total lines: ${lines.length}`);
  console.log('📋 First 5 lines validation:');
  
  let validCount = 0;
  let invalidCount = 0;
  
  lines.slice(0, 5).forEach((line, i) => {
    const nums = line.split(',').map(n => parseInt(n));
    const isValid = nums.length === 7 && nums.every(n => n >= 1 && n <= 49);
    const hasDuplicates = new Set(nums).size !== nums.length;
    
    console.log(`Line ${i+1}: ${nums.join(', ')}`);
    console.log(`  - Count: ${nums.length} ${nums.length === 7 ? '✅' : '❌'}`);
    console.log(`  - Range: ${Math.min(...nums)}-${Math.max(...nums)} ${nums.every(n => n >= 1 && n <= 49) ? '✅' : '❌'}`);
    console.log(`  - Duplicates: ${hasDuplicates ? '❌ YES' : '✅ NO'}`);
    console.log(`  - Overall: ${isValid && !hasDuplicates ? '✅ VALID' : '❌ INVALID'}`);
    console.log('');
    
    if (isValid && !hasDuplicates) validCount++;
    else invalidCount++;
  });
  
  console.log(`📈 Summary: ${validCount} valid, ${invalidCount} invalid`);
  
} catch (error) {
  console.error('❌ Error reading CSV:', error.message);
}
