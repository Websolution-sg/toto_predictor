/**
 * RESTORE LATEST RESULT SCRIPT
 * Run this after confirming the fetch test worked
 */

const fs = require('fs');

console.log('🔄 RESTORE LATEST RESULT');
console.log('========================\n');

function restoreLatestResult() {
  try {
    // Read current CSV
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`📊 Current CSV has ${lines.length} lines`);
    console.log(`🎯 Current first line: ${lines[0]}`);
    
    // Add back the latest result at the beginning
    const latestResult = '22,25,29,31,34,43,11';
    const updatedContent = latestResult + '\n' + csvContent;
    
    // Write back to file
    fs.writeFileSync('totoResult.csv', updatedContent);
    
    console.log('✅ Latest result restored!');
    console.log(`🎯 New first line: ${latestResult}`);
    console.log(`📊 CSV now has ${updatedContent.trim().split('\n').length} lines`);
    
    console.log('\n💡 Next steps:');
    console.log('1. git add totoResult.csv');
    console.log('2. git commit -m "Restore latest TOTO result 22,25,29,31,34,43,11"');
    console.log('3. git push origin main');
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

if (restoreLatestResult()) {
  console.log('\n🎉 RESTORATION COMPLETE!');
} else {
  console.log('\n❌ RESTORATION FAILED!');
}
