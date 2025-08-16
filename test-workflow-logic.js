// Test the current workflow logic with the missing latest result
const fs = require('fs');

// Simulate the key functions from the main script
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

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

function isValidNewResult(numbers, knownResults) {
  // Simplified validation for testing
  
  // Check length
  if (!Array.isArray(numbers) || numbers.length !== 7) {
    return { valid: false, reason: `Invalid length: expected 7 numbers, got ${numbers?.length || 0}` };
  }
  
  // Check range and duplicates
  if (!numbers.every(n => n >= 1 && n <= 49)) {
    return { valid: false, reason: 'Numbers out of range 1-49' };
  }
  
  if (new Set(numbers).size !== numbers.length) {
    return { valid: false, reason: 'Contains duplicate numbers' };
  }
  
  // Check for exact duplicates
  for (const known of knownResults) {
    if (numbers.length === known.length && 
        numbers.slice(0, 6).sort().join(',') === known.slice(0, 6).sort().join(',') &&
        numbers[6] === known[6]) {
      return { valid: false, reason: `Exact duplicate of existing result [${known.join(', ')}]` };
    }
  }
  
  return { valid: true, reason: 'Valid new result' };
}

// Test the workflow logic
console.log('🧪 TESTING WORKFLOW LOGIC WITH MISSING LATEST RESULT');
console.log('='.repeat(70));

const CSV_FILE = 'totoResult.csv';

// Step 1: Read current CSV
console.log('\n📖 Step 1: Reading current CSV state...');
const existing = readExistingCSV(CSV_FILE);
if (existing.length > 0) {
  console.log(`📊 Current top entry: [${existing[0].join(', ')}]`);
} else {
  console.log('📊 CSV is empty');
}

// Step 2: Simulate what the workflow should fetch from Singapore Pools
console.log('\n🌐 Step 2: Simulating Singapore Pools fetch...');
const latestFromWebsite = [22, 25, 29, 31, 34, 43, 11]; // What we know is the latest
console.log(`🎯 Latest from Singapore Pools: [${latestFromWebsite.join(', ')}]`);

// Step 3: Test the comparison logic
console.log('\n🔍 Step 3: Testing comparison logic...');
if (existing.length > 0) {
  const isEqual = arraysEqual(latestFromWebsite, existing[0]);
  console.log(`📊 Current CSV top: [${existing[0].join(', ')}]`);
  console.log(`🎯 Website latest: [${latestFromWebsite.join(', ')}]`);
  console.log(`🔍 Arrays equal: ${isEqual}`);
  
  if (isEqual) {
    console.log('✅ Results match - no update needed');
  } else {
    console.log('🆕 Results differ - update required!');
    
    // Step 4: Test validation
    console.log('\n✅ Step 4: Testing validation...');
    const recentResults = existing.slice(0, 3); // Use top 3 for validation
    const validation = isValidNewResult(latestFromWebsite, recentResults);
    
    console.log(`🔍 Validation result: ${validation.valid}`);
    console.log(`🔍 Validation reason: ${validation.reason}`);
    
    if (validation.valid) {
      console.log('🎉 SUCCESS: New result would be added to CSV!');
      
      // Simulate the update
      console.log('\n📝 Step 5: Simulating CSV update...');
      const updatedData = [latestFromWebsite, ...existing];
      console.log(`📊 New top entry would be: [${updatedData[0].join(', ')}]`);
      console.log(`📊 Total entries would be: ${updatedData.length}`);
      console.log('✅ CSV update simulation successful!');
    } else {
      console.log('❌ PROBLEM: Validation failed - result would be rejected');
    }
  }
} else {
  console.log('📊 CSV is empty - any valid result would be added');
}

console.log('\n🏁 Test completed');
console.log('\nExpected outcome when workflow runs:');
console.log('✅ Should detect difference between CSV and website');
console.log('✅ Should validate [22, 25, 29, 31, 34, 43, 11] as new result');
console.log('✅ Should add it to the top of CSV');
console.log('✅ Should commit and push the change');
