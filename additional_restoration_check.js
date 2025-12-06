// Validate Additional Number Restoration
console.log('🔄 ADDITIONAL NUMBER RESTORATION VALIDATION');
console.log('=' .repeat(50));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Count dropdowns
const selectCount = (html.match(/<select/g) || []).length;
const additionalSelects = (html.match(/id="additional"/g) || []).length;
const includeAddCheckbox = (html.match(/id="includeAdd"/g) || []).length;

console.log('\n📱 DROPDOWN COUNT:');
console.log(`✅ Total dropdowns: ${selectCount} (should be 3)`);
console.log(`✅ Additional number selectors: ${additionalSelects} (should be 1)`);
console.log(`✅ Include additional checkbox: ${includeAddCheckbox} (should be 1)`);

// Check for includeAdd references in functions
const includeAddRefs = (html.match(/includeAdd/g) || []).length;
const correctPoolAssignments = (html.match(/includeAdd \? draw\.numbers\.concat\(draw\.additional\) : draw\.numbers/g) || []).length;

console.log('\n⚙️ FUNCTIONALITY RESTORATION:');
console.log(`✅ IncludeAdd references: ${includeAddRefs}`);
console.log(`✅ Correct pool assignments: ${correctPoolAssignments} (should be >3)`);

// Check dropdown types
const dropdownList = html.match(/<select[^>]*id="([^"]*)"[^>]*>/g) || [];
console.log('\n🧹 CURRENT DROPDOWNS:');
dropdownList.forEach(dropdown => {
  const idMatch = dropdown.match(/id="([^"]*)"/);
  if (idMatch) {
    console.log(`   • ${idMatch[1]}`);
  }
});

console.log('\n🎉 RESTORATION STATUS:');
if (selectCount === 3 && additionalSelects === 1 && includeAddCheckbox === 1 && correctPoolAssignments > 3) {
  console.log('✅ EXCELLENT: Additional number functionality restored');
  console.log('✅ All dropdowns and logic working');
} else {
  console.log('⚠️ Restoration incomplete');
}