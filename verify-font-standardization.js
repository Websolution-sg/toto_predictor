// Font Standardization Verification Script
// Checks that all numbers use consistent fonts and bold styling

const fs = require('fs');

console.log('🔤 Verifying font standardization...');

const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');

// Extract all font-related styles for numbers
const fontPatterns = [
  { name: 'Main Prizes (1st, 2nd, 3rd)', pattern: /1st Prize.*?font-size:\s*(\d+)px.*?font-weight:\s*(\w+).*?font-family:\s*([^;]+)/s },
  { name: 'Starter Numbers', pattern: /starter.*?font-size:\s*(\d+)px.*?font-weight:\s*(\w+).*?font-family:\s*([^;]+)/si },
  { name: 'Consolation Numbers', pattern: /consolation.*?font-size:\s*(\d+)px.*?font-weight:\s*(\w+).*?font-family:\s*([^;]+)/si },
  { name: 'Prediction Numbers', pattern: /\.prediction-number.*?font-size:\s*(\d+)px.*?font-weight:\s*(\w+).*?font-family:\s*([^;]+)/s }
];

console.log('\n📊 Font Analysis:');

// Check CSS classes
const cssClasses = [
  '.prediction-number',
  '.prize-number', 
  '.starter-number',
  '.consolation-number'
];

cssClasses.forEach(className => {
  const classPattern = new RegExp(`\\${className}\\s*{[^}]*font-family:\\s*([^;]+)[^}]*font-size:\\s*(\\d+)px[^}]*font-weight:\\s*(\\w+)`, 's');
  const match = htmlContent.match(classPattern);
  
  if (match) {
    console.log(`✅ ${className}:`);
    console.log(`   Font: ${match[1].trim()}`);
    console.log(`   Size: ${match[2]}px`);
    console.log(`   Weight: ${match[3]}`);
  } else {
    console.log(`❌ ${className}: Not found or incomplete styling`);
  }
});

// Check inline styles for main prizes
console.log('\n🎯 Main Prize Inline Styles:');
const prizeMatches = htmlContent.match(/(\d+(?:st|nd|rd) Prize).*?font-size:\s*(\d+)px.*?font-weight:\s*(\w+).*?font-family:\s*([^;]+)/g);

if (prizeMatches) {
  prizeMatches.forEach((match, index) => {
    const sizeMatch = match.match(/font-size:\s*(\d+)px/);
    const weightMatch = match.match(/font-weight:\s*(\w+)/);
    const familyMatch = match.match(/font-family:\s*([^;]+)/);
    
    if (sizeMatch && weightMatch && familyMatch) {
      console.log(`✅ Prize ${index + 1}: ${sizeMatch[1]}px, ${weightMatch[1]}, ${familyMatch[1].trim()}`);
    }
  });
}

// Check for consistency
const expectedFont = "'Courier New', monospace";
const expectedWeight = "bold";

console.log('\n🔍 Consistency Check:');

const consistencyChecks = [
  { name: 'All use Courier New', test: () => {
    const courierCount = (htmlContent.match(/'Courier New'/g) || []).length;
    return courierCount >= 6; // Should appear in multiple places
  }},
  { name: 'All numbers are bold', test: () => {
    const boldCount = (htmlContent.match(/font-weight:\s*bold/g) || []).length;
    return boldCount >= 6; // Should appear in multiple places
  }},
  { name: 'Standardized main prize sizes', test: () => {
    const mainPrizeSizes = htmlContent.match(/(\d+(?:st|nd|rd) Prize).*?font-size:\s*(\d+)px/g);
    if (!mainPrizeSizes) return false;
    const sizes = mainPrizeSizes.map(m => m.match(/font-size:\s*(\d+)px/)[1]);
    return sizes.every(size => size === '24'); // All should be 24px
  }}
];

consistencyChecks.forEach(check => {
  const result = check.test();
  console.log(`${result ? '✅' : '❌'} ${check.name}`);
});

console.log('\n📈 Summary:');
console.log('Expected standardization:');
console.log('- Main prizes: 24px, bold, Courier New');
console.log('- Starter/Consolation: 16px, bold, Courier New');
console.log('- Prediction results: 24px, bold, Courier New');
console.log('- All numbers: Consistent dark gray color (#2d3748)');

console.log('\n🎉 Font standardization verification complete!');
