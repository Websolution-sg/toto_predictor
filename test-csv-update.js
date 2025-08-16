// Test CSV update functionality
const fs = require('fs');

const CSV_FILE = 'totoResult.csv';

// Read current CSV
function readExistingCSV(path) {
  if (!fs.existsSync(path)) {
    console.log('📄 CSV file does not exist');
    return [];
  }
  
  try {
    const content = fs.readFileSync(path, 'utf8').trim();
    if (!content) {
      console.log('📄 CSV file is empty');
      return [];
    }
    
    const rows = content.split('\n').map(line => line.split(',').map(Number));
    console.log(`📄 Read ${rows.length} existing results from CSV`);
    return rows;
  } catch (error) {
    console.log('❌ Error reading CSV:', error.message);
    return [];
  }
}

// Write CSV
function writeCSV(path, rows) {
  try {
    const content = rows.map(r => r.join(',')).join('\n') + '\n';
    fs.writeFileSync(path, content, 'utf8');
    console.log(`💾 Successfully wrote ${rows.length} results to CSV`);
    return true;
  } catch (error) {
    console.log('❌ Error writing CSV:', error.message);
    return false;
  }
}

// Test the update process
console.log('🧪 Testing CSV Update Functionality...');
console.log('');

// Step 1: Read current CSV
console.log('📖 Step 1: Reading current CSV...');
const currentData = readExistingCSV(CSV_FILE);
console.log(`📊 Current top entry: [${currentData.length > 0 ? currentData[0].join(', ') : 'EMPTY'}]`);
console.log(`📊 Total entries: ${currentData.length}`);

// Step 2: Backup current CSV
console.log('');
console.log('💾 Step 2: Creating backup...');
const backupFile = `${CSV_FILE}.backup.${Date.now()}`;
if (currentData.length > 0) {
  writeCSV(backupFile, currentData);
  console.log(`✅ Backup created: ${backupFile}`);
}

// Step 3: Test adding a new (simulated) result
console.log('');
console.log('🧪 Step 3: Testing CSV update with simulated new result...');
const simulatedNewResult = [1, 5, 12, 25, 33, 42, 15]; // Test result
const testData = [...currentData];
testData.unshift(simulatedNewResult);

console.log(`📝 Simulating addition of: [${simulatedNewResult.join(', ')}]`);
const updateSuccess = writeCSV(CSV_FILE, testData);

if (updateSuccess) {
  console.log('✅ CSV update test successful!');
  
  // Step 4: Verify the update
  console.log('');
  console.log('✅ Step 4: Verifying update...');
  const updatedData = readExistingCSV(CSV_FILE);
  console.log(`📊 New top entry: [${updatedData[0].join(', ')}]`);
  console.log(`📊 Total entries after update: ${updatedData.length}`);
  
  if (updatedData[0].join(',') === simulatedNewResult.join(',')) {
    console.log('🎉 SUCCESS: CSV update mechanism is working correctly!');
  } else {
    console.log('❌ ERROR: CSV update verification failed');
  }
  
  // Step 5: Restore original CSV
  console.log('');
  console.log('🔄 Step 5: Restoring original CSV...');
  writeCSV(CSV_FILE, currentData);
  console.log('✅ Original CSV restored');
  
  // Clean up backup
  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
    console.log('🗑️ Backup file cleaned up');
  }
  
} else {
  console.log('❌ CSV update test failed - unable to write to file');
}

console.log('');
console.log('🏁 CSV Update Test Completed');
