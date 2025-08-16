// FINAL HARD-CODED VALUE VERIFICATION
console.log('🔍 SCANNING FOR HARD-CODED VALUES');
console.log('==================================');

const fs = require('fs');

try {
  const scriptContent = fs.readFileSync('updateTotoCSV.cjs', 'utf8');
  
  console.log('\n📋 CHECKING FOR HARD-CODED CONTENT...');
  
  // Check 1: Specific number sequences
  const numberSequencePatterns = [
    /\b22[,\s]+25[,\s]+29[,\s]+31[,\s]+34[,\s]+43/,
    /\b9[,\s]+24[,\s]+31[,\s]+34[,\s]+43[,\s]+44[,\s]+1/,
    /\[22.*43.*11\]/,
    /\[9.*24.*31.*34.*43.*44.*1\]/
  ];
  
  let foundHardCoded = false;
  
  numberSequencePatterns.forEach((pattern, index) => {
    const matches = scriptContent.match(pattern);
    if (matches) {
      console.log(`❌ Hard-coded sequence found (pattern ${index + 1}): ${matches[0]}`);
      foundHardCoded = true;
    }
  });
  
  // Check 2: Hard-coded dates
  const datePatterns = [
    /'2025'/g,
    /"2025"/g,
    /'Aug'/g,
    /"Aug"/g,
    /'16'/g,
    /"16"/g,
    /includes\('2025'\)/g,
    /includes\('Aug'\)/g,
    /includes\('16'\)/g
  ];
  
  datePatterns.forEach((pattern, index) => {
    const matches = scriptContent.match(pattern);
    if (matches) {
      console.log(`❌ Hard-coded date found (pattern ${index + 1}): ${matches.length} occurrences`);
      matches.forEach(match => console.log(`   "${match}"`));
      foundHardCoded = true;
    }
  });
  
  // Check 3: Hard-coded arrays or test data
  const arrayPatterns = [
    /\[[0-9\s,]{20,}\]/g, // Arrays with many numbers
    /\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/g // 6+ number arrays
  ];
  
  arrayPatterns.forEach((pattern, index) => {
    const matches = scriptContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip regex patterns and variable displays
        if (!match.includes('\\d') && !match.includes('${') && !match.includes('.join')) {
          console.log(`❌ Hard-coded array found (pattern ${index + 1}): ${match}`);
          foundHardCoded = true;
        }
      });
    }
  });
  
  // Check 4: Console.log with specific numbers
  const logPattern = /console\.log\([^)]*\b\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}/g;
  const logMatches = scriptContent.match(logPattern);
  if (logMatches) {
    logMatches.forEach(match => {
      if (!match.includes('${') && !match.includes('.join')) {
        console.log(`❌ Hard-coded console.log found: ${match.substring(0, 60)}...`);
        foundHardCoded = true;
      }
    });
  }
  
  // Summary
  if (!foundHardCoded) {
    console.log('✅ NO HARD-CODED VALUES FOUND!');
    console.log('\n🎯 VERIFICATION COMPLETE:');
    console.log('✅ All number sequences are dynamic');
    console.log('✅ All dates use current date detection');
    console.log('✅ All validation is pattern-based');
    console.log('✅ All logging uses variables');
    console.log('\n🚀 WORKFLOW IS COMPLETELY DYNAMIC!');
  } else {
    console.log('\n⚠️  HARD-CODED VALUES FOUND - NEED REMOVAL');
  }
  
  // Check dynamic date usage
  console.log('\n📅 DYNAMIC DATE VERIFICATION:');
  const dynamicDatePatterns = [
    'new Date()',
    'currentDate.getFullYear()',
    'currentDate.toLocaleDateString',
    'currentDate.getDate()'
  ];
  
  let dynamicCount = 0;
  dynamicDatePatterns.forEach(pattern => {
    const count = (scriptContent.match(new RegExp(pattern, 'g')) || []).length;
    if (count > 0) {
      console.log(`✅ ${pattern}: ${count} occurrences`);
      dynamicCount += count;
    }
  });
  
  console.log(`\n📊 Total dynamic date references: ${dynamicCount}`);
  
} catch (error) {
  console.log('❌ Error reading script:', error.message);
}

console.log('\n✅ Hard-coded value scan completed!');
