// Interface Streamlining Validation - Base Numbers Display Only
console.log('🎯 INTERFACE STREAMLINING VALIDATION');
console.log('=' .repeat(50));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Count dropdowns
const selectCount = (html.match(/<select/g) || []).length;
const baseSelectCount = (html.match(/base[1-6]/g) || []).length;

console.log('\n📱 DROPDOWN COUNT:');
console.log(`✅ Total dropdowns: ${selectCount} (target: ≤3)`);
console.log(`✅ Base selector references: ${baseSelectCount} (should be 0)`);

// Check for base number display
const hasBaseDisplay = html.includes('16, 22, 10') && html.includes('Base Numbers');
const hasHardcodedBases = html.includes('return [16, 22, 10]');

console.log('\n🎯 BASE NUMBERS IMPLEMENTATION:');
console.log(`✅ Static display shown: ${hasBaseDisplay ? 'YES' : 'NO'}`);
console.log(`✅ Hardcoded in function: ${hasHardcodedBases ? 'YES' : 'NO'}`);

// Check cleanup
const dropdownList = html.match(/<select[^>]*id="([^"]*)"[^>]*>/g) || [];
console.log('\n🧹 REMAINING DROPDOWNS:');
dropdownList.forEach(dropdown => {
  const idMatch = dropdown.match(/id="([^"]*)"/);
  if (idMatch) {
    console.log(`   • ${idMatch[1]}`);
  }
});

console.log('\n🎉 STREAMLINING STATUS:');
if (selectCount <= 3 && baseSelectCount === 0 && hasBaseDisplay && hasHardcodedBases) {
  console.log('✅ EXCELLENT: Interface fully streamlined');
  console.log('✅ Base numbers now display-only');
  console.log('✅ Prediction model uses fixed optimal bases');
} else {
  console.log('⚠️  Needs more work');
}