const fs = require('fs');

function comprehensiveHardCodedScan() {
  console.log('🔍 COMPREHENSIVE HARD-CODED VALUE SCAN');
  console.log('=====================================\n');
  
  try {
    const content = fs.readFileSync('updateTotoCSV.cjs', 'utf8');
    
    // Check for number arrays
    const numberArrayPatterns = [
      /\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
      /\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+/g
    ];
    
    // Check for specific number sequences that could be TOTO results
    const totoSequencePatterns = [
      /\b\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\b/g,
      /\b\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*\d{1,2}\b/g
    ];
    
    // Check for specific dates/months
    const datePatterns = [
      /\b(2024|2025|2026)\b/g,
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
      /\b(16|14|15)\s+(Aug|August)\b/g
    ];
    
    let foundIssues = [];
    
    // Scan for number arrays
    numberArrayPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if it's just a comment or example
          const lines = content.split('\n');
          const lineWithMatch = lines.find(line => line.includes(match));
          if (lineWithMatch && !lineWithMatch.trim().startsWith('//') && !lineWithMatch.includes('example') && !lineWithMatch.includes('Example')) {
            foundIssues.push(`Number array: ${match}`);
          }
        });
      }
    });
    
    // Scan for TOTO sequences
    totoSequencePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.split('\n');
          const lineWithMatch = lines.find(line => line.includes(match));
          if (lineWithMatch && !lineWithMatch.trim().startsWith('//') && !lineWithMatch.includes('pattern') && !lineWithMatch.includes('format')) {
            foundIssues.push(`TOTO sequence: ${match}`);
          }
        });
      }
    });
    
    // Scan for specific dates (excluding dynamic date usage)
    datePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.split('\n');
          const lineWithMatch = lines.find(line => line.includes(match));
          if (lineWithMatch && 
              !lineWithMatch.includes('toLocaleDateString') && 
              !lineWithMatch.includes('getFullYear') &&
              !lineWithMatch.includes('new Date') &&
              !lineWithMatch.trim().startsWith('//')) {
            foundIssues.push(`Date value: ${match} in line: ${lineWithMatch.trim()}`);
          }
        });
      }
    });
    
    // Report results
    if (foundIssues.length > 0) {
      console.log('❌ HARD-CODED VALUES FOUND:');
      foundIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('\n⚠️  REQUIRES CLEANUP');
    } else {
      console.log('✅ NO HARD-CODED VALUES FOUND!');
      console.log('🎯 WORKFLOW IS COMPLETELY DYNAMIC!');
    }
    
    // Verify dynamic patterns
    console.log('\n📅 DYNAMIC DATE VERIFICATION:');
    const dynamicPatterns = [
      { pattern: /new Date\(\)/g, name: 'new Date()' },
      { pattern: /currentDate\.getFullYear\(\)/g, name: 'currentDate.getFullYear()' },
      { pattern: /currentDate\.toLocaleDateString/g, name: 'currentDate.toLocaleDateString' },
      { pattern: /currentDate\.getDate\(\)/g, name: 'currentDate.getDate()' }
    ];
    
    let totalDynamicRefs = 0;
    dynamicPatterns.forEach(dp => {
      const matches = content.match(dp.pattern);
      const count = matches ? matches.length : 0;
      console.log(`✅ ${dp.name}: ${count} occurrences`);
      totalDynamicRefs += count;
    });
    
    console.log(`\n📊 Total dynamic date references: ${totalDynamicRefs}`);
    
    console.log('\n✅ Comprehensive scan completed!');
    
  } catch (error) {
    console.error('❌ Error during scan:', error.message);
  }
}

comprehensiveHardCodedScan();
