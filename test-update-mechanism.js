// Simple test to verify the update mechanism works
const fs = require('fs');

function readExistingCSV(path) {
  if (!fs.existsSync(path)) return [];
  try {
    const content = fs.readFileSync(path, 'utf8').trim();
    if (!content) return [];
    return content.split('\n').map(line => line.split(',').map(Number));
  } catch (error) {
    return [];
  }
}

function writeCSV(path, rows) {
  try {
    const content = rows.map(r => r.join(',')).join('\n') + '\n';
    fs.writeFileSync(path, content, 'utf8');
    return true;
  } catch (error) {
    console.log('❌ Error writing CSV:', error.message);
    return false;
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

console.log('🧪 TESTING CSV UPDATE MECHANISM');
console.log('='.repeat(50));

const CSV_FILE = 'totoResult.csv';

// Read current state
const existing = readExistingCSV(CSV_FILE);
console.log(`📊 Current CSV top: [${existing[0]?.join(', ') || 'EMPTY'}]`);

// Simulate the latest result from Singapore Pools
const latestResult = [22, 25, 29, 31, 34, 43, 11];
console.log(`🎯 Latest from website: [${latestResult.join(', ')}]`);

// Check if they match
const isEqual = existing.length > 0 && arraysEqual(latestResult, existing[0]);
console.log(`🔍 Results match: ${isEqual}`);

if (!isEqual) {
  console.log('🆕 Update needed - adding latest result...');
  
  // Create backup
  const backupFile = `${CSV_FILE}.backup.${Date.now()}`;
  writeCSV(backupFile, existing);
  console.log(`💾 Backup created: ${backupFile}`);
  
  // Add latest result to top
  existing.unshift(latestResult);
  
  // Write updated CSV
  if (writeCSV(CSV_FILE, existing)) {
    console.log('✅ CSV updated successfully!');
    console.log(`📊 New top entry: [${existing[0].join(', ')}]`);
    console.log(`📊 Total entries: ${existing.length}`);
    
    // Verify the update
    const verification = readExistingCSV(CSV_FILE);
    if (verification.length > 0 && arraysEqual(verification[0], latestResult)) {
      console.log('🎉 Update verification successful!');
    } else {
      console.log('❌ Update verification failed!');
    }
  } else {
    console.log('❌ CSV update failed!');
  }
  
  // Restore original for testing
  setTimeout(() => {
    writeCSV(CSV_FILE, existing.slice(1)); // Remove the added result
    fs.unlinkSync(backupFile); // Clean up backup
    console.log('🔄 Original state restored for further testing');
  }, 1000);
  
} else {
  console.log('✅ No update needed - results already match');
}

console.log('\n🏁 Update mechanism test completed');
