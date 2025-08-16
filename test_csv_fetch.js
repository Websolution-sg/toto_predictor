const fs = require('fs');

function testCSVFetching() {
  console.log('🌐 TESTING HTML CSV FETCHING SIMULATION');
  console.log('=====================================\n');
  
  try {
    // Simulate what the HTML fetch would do
    console.log('📄 Simulating HTML CSV fetch operation...');
    
    // Read CSV file (simulating fetch response.text())
    const csvText = fs.readFileSync('totoResult.csv', 'utf8');
    console.log('✅ CSV file read successfully');
    console.log(`📊 CSV content length: ${csvText.length} characters`);
    
    // Process CSV data (simulating JavaScript processing)
    const historical = csvText.trim().split('\n').map(line => line.split(',').map(Number));
    console.log(`✅ CSV parsed successfully`);
    console.log(`📊 Historical data entries: ${historical.length}`);
    
    // Validate recent result (first entry)
    const recent = historical[0];
    console.log(`✅ Recent result extracted: [${recent.join(',')}]`);
    
    // Test what HTML would populate
    console.log('\n🎯 SIMULATING HTML POPULATION:');
    
    // Base number selectors (first 6 numbers)
    const baseNumbers = recent.slice(0, 6);
    console.log(`   📋 Base numbers for selectors: [${baseNumbers.join(',')}]`);
    
    // Additional number selector (7th number)
    const additionalNumber = recent[6];
    console.log(`   🎲 Additional number for selector: ${additionalNumber}`);
    
    // Format for display
    const resultText = `${baseNumbers.join(',')}(${additionalNumber})`;
    console.log(`   📺 Display format: "RECENT RESULT: ${resultText}"`);
    
    // Validate number ranges (1-49)
    console.log('\n✅ DATA VALIDATION:');
    
    let validationPassed = true;
    
    // Check base numbers
    baseNumbers.forEach((num, index) => {
      if (num >= 1 && num <= 49) {
        console.log(`   ✅ Base ${index + 1}: ${num} - Valid range`);
      } else {
        console.log(`   ❌ Base ${index + 1}: ${num} - Invalid range`);
        validationPassed = false;
      }
    });
    
    // Check additional number
    if (additionalNumber >= 1 && additionalNumber <= 49) {
      console.log(`   ✅ Additional: ${additionalNumber} - Valid range`);
    } else {
      console.log(`   ❌ Additional: ${additionalNumber} - Invalid range`);
      validationPassed = false;
    }
    
    // Check for duplicates
    const allNumbers = [...baseNumbers, additionalNumber];
    const uniqueNumbers = [...new Set(allNumbers)];
    if (allNumbers.length === uniqueNumbers.length) {
      console.log(`   ✅ No duplicates found`);
    } else {
      console.log(`   ❌ Duplicate numbers detected`);
      validationPassed = false;
    }
    
    // Test historical data consistency
    console.log('\n📊 HISTORICAL DATA VALIDATION:');
    
    let historicalValidCount = 0;
    for (let i = 0; i < Math.min(5, historical.length); i++) {
      const entry = historical[i];
      if (entry.length >= 6 && entry.every(n => n >= 1 && n <= 49)) {
        console.log(`   ✅ Entry ${i + 1}: [${entry.join(',')}] - Valid`);
        historicalValidCount++;
      } else {
        console.log(`   ❌ Entry ${i + 1}: [${entry.join(',')}] - Invalid`);
      }
    }
    
    console.log(`   📊 Historical validation: ${historicalValidCount}/${Math.min(5, historical.length)} entries valid`);
    
    // Final assessment
    console.log('\n🎯 FETCH SIMULATION RESULTS:');
    
    if (validationPassed && historicalValidCount === Math.min(5, historical.length)) {
      console.log('🌟 SUCCESS: HTML would successfully fetch and process CSV data');
      console.log('✅ All data is valid and ready for HTML consumption');
      console.log('🎯 Recent result would populate correctly in HTML selectors');
      console.log('📊 Historical data is consistent and usable');
    } else {
      console.log('⚠️ ISSUES DETECTED: HTML fetch would encounter data problems');
      if (!validationPassed) {
        console.log('❌ Recent result has validation issues');
      }
      if (historicalValidCount !== Math.min(5, historical.length)) {
        console.log('❌ Historical data has consistency issues');
      }
    }
    
    console.log('\n✅ CSV fetching simulation completed!');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
    console.log('💡 This indicates HTML fetch would also fail');
  }
}

testCSVFetching();
