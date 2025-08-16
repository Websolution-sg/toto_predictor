// Test script to temporarily modify CSV and verify cache-busting
const fs = require('fs');

console.log('🧪 TESTING LIVE CSV UPDATES');
console.log('============================');

// Read current CSV
const originalCsv = fs.readFileSync('totoResult.csv', 'utf8');
const lines = originalCsv.trim().split('\n');

console.log('📊 Original first line:', lines[0]);

// Create a test modification (add timestamp to verify freshness)
const testNumbers = '1,2,3,4,5,6,7'; // Test numbers to easily identify
const modifiedLines = [testNumbers, ...lines.slice(1)];
const modifiedCsv = modifiedLines.join('\n');

console.log('🔄 Temporarily modifying CSV for cache test...');
fs.writeFileSync('totoResult.csv', modifiedCsv);
console.log('📊 Modified first line:', testNumbers);

setTimeout(() => {
  console.log('\n⏰ After 3 seconds - restoring original CSV...');
  fs.writeFileSync('totoResult.csv', originalCsv);
  console.log('✅ Original CSV restored');
  console.log('📊 Restored first line:', lines[0]);
  
  console.log('\n💡 Instructions:');
  console.log('1. Refresh your browser page (F5 or Ctrl+R)');
  console.log('2. Check if the numbers briefly showed 1,2,3,4,5,6,7');
  console.log('3. After refresh, it should show:', lines[0]);
  console.log('4. Check browser console for debug logs');
  console.log('5. Check timestamp to verify fresh data loading');
}, 3000);

console.log('\n⏳ Waiting 3 seconds before restoring...');
console.log('🌐 Refresh http://localhost:8080 now to see test numbers!');
