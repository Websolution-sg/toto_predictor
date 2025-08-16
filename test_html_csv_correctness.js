const fs = require('fs');

function testHTMLCSVCorrectness() {
  console.log('🌐 TESTING HTML-CSV CORRECTNESS INTEGRATION');
  console.log('==========================================\n');
  
  try {
    // Read current CSV
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const historical = csvContent.trim().split('\n').map(line => line.split(',').map(Number));
    const recent = historical[0];
    
    console.log('📄 CSV DATA SIMULATION:');
    console.log(`   📊 Total entries: ${historical.length}`);
    console.log(`   📋 Latest result: [${recent.join(',')}]`);
    
    // Simulate HTML processing
    console.log('\n🎯 HTML PROCESSING SIMULATION:');
    
    // Base numbers (first 6)
    const baseNumbers = recent.slice(0, 6);
    console.log(`   🔢 Base numbers for selectors: [${baseNumbers.join(',')}]`);
    
    // Additional number (7th)
    const additionalNumber = recent[6];
    console.log(`   🎲 Additional number: ${additionalNumber}`);
    
    // Format for display
    const displayFormat = `${baseNumbers.join(',')}(${additionalNumber})`;
    console.log(`   📺 Display text: "RECENT RESULT: ${displayFormat}"`);
    
    // Verify against Singapore Pools
    console.log('\n✅ CORRECTNESS VERIFICATION:');
    const expectedNumbers = [22, 25, 29, 31, 34, 43];
    const expectedAdditional = 11;
    
    const baseMatch = JSON.stringify(baseNumbers) === JSON.stringify(expectedNumbers);
    const additionalMatch = additionalNumber === expectedAdditional;
    
    console.log(`   ${baseMatch ? '✅' : '❌'} Base numbers match Singapore Pools: [${expectedNumbers.join(',')}]`);
    console.log(`   ${additionalMatch ? '✅' : '❌'} Additional number matches Singapore Pools: ${expectedAdditional}`);
    
    if (baseMatch && additionalMatch) {
      console.log('\n🌟 PERFECT MATCH: HTML will display correct Singapore Pools data');
      console.log('=====================================');
      console.log('✅ HTML selectors will show: [22,25,29,31,34,43]');
      console.log('✅ Additional selector will show: 11');
      console.log('✅ Recent result display: "RECENT RESULT: 22,25,29,31,34,43(11)"');
      console.log('✅ Users will see the accurate latest TOTO result');
    } else {
      console.log('\n❌ MISMATCH DETECTED: HTML will display incorrect data');
      console.log('====================================================');
      console.log(`❌ HTML would show: [${baseNumbers.join(',')}] + ${additionalNumber}`);
      console.log(`❌ Should show: [${expectedNumbers.join(',')}] + ${expectedAdditional}`);
    }
    
    // Test cache-busting effectiveness
    console.log('\n🔄 CACHE-BUSTING TEST:');
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const hasCacheBusting = htmlContent.includes('cacheBuster = new Date().getTime()');
    const hasParameterized = htmlContent.includes('?v=${cacheBuster}');
    
    console.log(`   ${hasCacheBusting ? '✅' : '❌'} Cache-busting timestamp generation`);
    console.log(`   ${hasParameterized ? '✅' : '❌'} Cache-busting URL parameter`);
    
    if (hasCacheBusting && hasParameterized) {
      console.log('   ✅ HTML will always fetch the latest CSV data (no stale cache)');
    }
    
    console.log('\n✅ HTML-CSV correctness test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHTMLCSVCorrectness();
