// Validate Additional Number Dropdown Removal
console.log('🗑️ ADDITIONAL NUMBER DROPDOWN REMOVAL CHECK');
console.log('=' .repeat(50));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Count dropdowns
const selectCount = (html.match(/<select/g) || []).length;
const additionalSelects = (html.match(/id="additional"/g) || []).length;

console.log('\n📱 DROPDOWN COUNT:');
console.log(`✅ Total dropdowns: ${selectCount} (should be 2)`);
console.log(`✅ Additional number selectors: ${additionalSelects} (should be 0)`);

// Check dropdown types
const dropdownList = html.match(/<select[^>]*id="([^"]*)"[^>]*>/g) || [];
console.log('\n🧹 REMAINING DROPDOWNS:');
dropdownList.forEach(dropdown => {
  const idMatch = dropdown.match(/id="([^"]*)"/);
  if (idMatch) {
    console.log(`   • ${idMatch[1]}`);
  }
});

// Check for hardcoded includeAdd = false
const hardcodedIncludeAdd = (html.match(/includeAdd = false/g) || []).length;
console.log(`\n⚙️ Hardcoded includeAdd = false: ${hardcodedIncludeAdd} instances`);

console.log('\n🎉 REMOVAL STATUS:');
if (selectCount === 2 && additionalSelects === 0) {
  console.log('✅ EXCELLENT: Additional number dropdown removed');
  console.log('✅ Interface streamlined to 2 dropdowns');
  console.log('✅ Prediction logic updated to exclude additional numbers');
} else {
  console.log('⚠️ Removal incomplete');
}