// Validate Additional Number Removal
console.log('🗑️ ADDITIONAL NUMBER REMOVAL VALIDATION');
console.log('=' .repeat(50));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Count dropdowns
const selectCount = (html.match(/<select/g) || []).length;
const additionalSelects = (html.match(/id="additional"/g) || []).length;
const includeAddCheckbox = (html.match(/id="includeAdd"/g) || []).length;

console.log('\n📱 DROPDOWN COUNT:');
console.log(`✅ Total dropdowns: ${selectCount} (target: 2)`);
console.log(`✅ Additional number selectors: ${additionalSelects} (should be 0)`);
console.log(`✅ Include additional checkbox: ${includeAddCheckbox} (should be 0)`);

// Check remaining dropdown types
const dropdownList = html.match(/<select[^>]*id="([^"]*)"[^>]*>/g) || [];
console.log('\n🧹 REMAINING DROPDOWNS:');
dropdownList.forEach(dropdown => {
  const idMatch = dropdown.match(/id="([^"]*)"/);
  if (idMatch) {
    console.log(`   • ${idMatch[1]}`);
  }
});

// Check for includeAdd references
const includeAddRefs = (html.match(/includeAdd/g) || []).length;
console.log(`\n⚠️ IncludeAdd references remaining: ${includeAddRefs}`);

console.log('\n🎉 REMOVAL STATUS:');
if (selectCount <= 2 && additionalSelects === 0 && includeAddCheckbox === 0) {
  console.log('✅ EXCELLENT: Additional number dropdown removed');
  console.log('✅ Interface further streamlined');
  if (includeAddRefs > 0) {
    console.log('⚠️ Some includeAdd references need cleanup');
  }
} else {
  console.log('⚠️ Cleanup incomplete');
}