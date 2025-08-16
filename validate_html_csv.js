const fs = require('fs');
const path = require('path');

function validateHTMLCSVIntegration() {
  console.log('🔍 VALIDATING INDEX.HTML CSV INTEGRATION');
  console.log('=======================================\n');
  
  try {
    // Read the HTML file
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Test 1: Check if CSV fetch is implemented
    console.log('📄 TEST 1: CSV FETCH IMPLEMENTATION');
    const csvFetchPatterns = [
      'fetch(`totoResult.csv',
      'response.text()',
      '.split(\'\\n\')',
      '.map(line => line.split(\',\').map(Number))'
    ];
    
    let fetchScore = 0;
    csvFetchPatterns.forEach((pattern, index) => {
      if (htmlContent.includes(pattern)) {
        console.log(`   ✅ Pattern ${index + 1}: ${pattern} - Found`);
        fetchScore++;
      } else {
        console.log(`   ❌ Pattern ${index + 1}: ${pattern} - Missing`);
      }
    });
    console.log(`   📊 CSV Fetch Score: ${fetchScore}/${csvFetchPatterns.length}\n`);
    
    // Test 2: Check cache-busting mechanism
    console.log('🔄 TEST 2: CACHE-BUSTING MECHANISM');
    const cacheBustingFeatures = [
      'cacheBuster',
      'new Date().getTime()',
      '?v=${cacheBuster}'
    ];
    
    let cacheScore = 0;
    cacheBustingFeatures.forEach((feature, index) => {
      if (htmlContent.includes(feature)) {
        console.log(`   ✅ Feature ${index + 1}: ${feature} - Implemented`);
        cacheScore++;
      } else {
        console.log(`   ❌ Feature ${index + 1}: ${feature} - Missing`);
      }
    });
    console.log(`   📊 Cache-busting Score: ${cacheScore}/${cacheBustingFeatures.length}\n`);
    
    // Test 3: Check data processing
    console.log('⚙️ TEST 3: DATA PROCESSING');
    const processingFeatures = [
      'historical = text.trim().split',
      'recent = historical[0]',
      'updateLatestResult',
      'document.getElementById(id).value = recent[idx]'
    ];
    
    let processingScore = 0;
    processingFeatures.forEach((feature, index) => {
      if (htmlContent.includes(feature)) {
        console.log(`   ✅ Feature ${index + 1}: Data processing - Implemented`);
        processingScore++;
      } else {
        console.log(`   ❌ Feature ${index + 1}: Data processing - Missing`);
      }
    });
    console.log(`   📊 Data Processing Score: ${processingScore}/${processingFeatures.length}\n`);
    
    // Test 4: Check error handling
    console.log('🛡️ TEST 4: ERROR HANDLING');
    const errorFeatures = [
      '.catch(error =>',
      'alert("Failed to load historical data.")',
      'console.error(error)'
    ];
    
    let errorScore = 0;
    errorFeatures.forEach((feature, index) => {
      if (htmlContent.includes(feature)) {
        console.log(`   ✅ Error handling ${index + 1}: Implemented`);
        errorScore++;
      } else {
        console.log(`   ❌ Error handling ${index + 1}: Missing`);
      }
    });
    console.log(`   📊 Error Handling Score: ${errorScore}/${errorFeatures.length}\n`);
    
    // Test 5: Check CSV file existence and format
    console.log('📁 TEST 5: CSV FILE VALIDATION');
    try {
      const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
      const lines = csvContent.trim().split('\n');
      
      console.log(`   ✅ CSV file exists`);
      console.log(`   ✅ CSV has ${lines.length} entries`);
      
      // Check first few lines format
      let formatScore = 0;
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const numbers = lines[i].split(',').map(n => parseInt(n.trim()));
        if (numbers.length >= 6 && numbers.every(n => n >= 1 && n <= 49)) {
          formatScore++;
          console.log(`   ✅ Line ${i + 1}: [${numbers.join(',')}] - Valid format`);
        } else {
          console.log(`   ❌ Line ${i + 1}: [${numbers.join(',')}] - Invalid format`);
        }
      }
      console.log(`   📊 CSV Format Score: ${formatScore}/3 lines validated\n`);
      
    } catch (error) {
      console.log(`   ❌ CSV file error: ${error.message}\n`);
    }
    
    // Overall Assessment
    const totalScore = fetchScore + cacheScore + processingScore + errorScore;
    const maxScore = 4 + 3 + 4 + 3; // 14 total
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    console.log('📊 OVERALL ASSESSMENT');
    console.log('====================');
    console.log(`🎯 Integration Score: ${totalScore}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🌟 EXCELLENT: HTML perfectly integrated with CSV');
    } else if (percentage >= 75) {
      console.log('✅ GOOD: HTML has strong CSV integration');
    } else if (percentage >= 60) {
      console.log('⚠️ ADEQUATE: HTML has basic CSV integration');
    } else {
      console.log('❌ POOR: HTML-CSV integration needs work');
    }
    
    // Specific recommendations
    console.log('\n💡 INTEGRATION ANALYSIS:');
    if (fetchScore === 4) {
      console.log('✅ CSV fetching is properly implemented');
    }
    if (cacheScore === 3) {
      console.log('✅ Cache-busting prevents stale data issues');
    }
    if (processingScore === 4) {
      console.log('✅ Data processing handles CSV format correctly');
    }
    if (errorScore === 3) {
      console.log('✅ Error handling provides user feedback');
    }
    
    console.log('\n✅ HTML-CSV integration validation completed!');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
}

validateHTMLCSVIntegration();
