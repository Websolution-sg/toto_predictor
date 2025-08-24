// Check for Duplicated Content in 4D Predictor HTML
// Verifies no duplicated results displays remain

const fs = require('fs');

console.log('🔍 Checking for duplicated content in 4D predictor...');

const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');

// Count occurrences of key phrases
const checks = [
  { phrase: 'Latest 4D Results', description: 'Latest 4D Results headers' },
  { phrase: 'Draw 5369', description: 'Draw number references' },
  { phrase: '2250', description: '1st prize number (2250)' },
  { phrase: '6325', description: '2nd prize number (6325)' },
  { phrase: '0963', description: '3rd prize number (0963)' },
  { phrase: 'Starter Prizes', description: 'Starter prizes sections' },
  { phrase: 'Consolation Prizes', description: 'Consolation prizes sections' }
];

console.log('\n📊 Content Analysis:');
checks.forEach(check => {
  const matches = (htmlContent.match(new RegExp(check.phrase, 'g')) || []).length;
  const status = matches <= 2 ? '✅' : '⚠️';
  console.log(`${status} ${check.description}: ${matches} occurrences`);
  
  if (matches > 2) {
    console.log(`   🔍 Multiple occurrences detected - may need review`);
  }
});

// Check for old-style results display
const oldStylePatterns = [
  'background: linear-gradient(135deg, #1e3c72',
  '🎯 Latest 4D Results</h3>',
  'class="latest-result"'
];

console.log('\n🗑️ Old Style Display Check:');
let foundOldStyle = false;
oldStylePatterns.forEach(pattern => {
  const hasPattern = htmlContent.includes(pattern);
  if (hasPattern) {
    foundOldStyle = true;
    console.log(`❌ Found old style pattern: ${pattern.substring(0, 30)}...`);
  }
});

if (!foundOldStyle) {
  console.log('✅ No old style displays found - duplication removal successful!');
}

// Count total sections
const resultSections = (htmlContent.match(/Latest 4D Results/g) || []).length;
console.log(`\n📈 Summary:`);
console.log(`- Total "Latest 4D Results" sections: ${resultSections}`);
console.log(`- Expected: 1 (clean design only)`);
console.log(`- Status: ${resultSections === 1 ? '✅ Perfect' : '⚠️ Needs review'}`);

if (resultSections === 1) {
  console.log('\n🎉 Duplication successfully removed! Only clean design remains.');
} else {
  console.log('\n⚠️ Multiple sections still detected. Manual review may be needed.');
}
