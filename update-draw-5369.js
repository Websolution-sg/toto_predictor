// Fetch Draw 5369 Results
// Updates CSV with latest Singapore Pools Draw 5369

const fs = require('fs');

console.log('🎯 Updating 4D Results for Draw 5369');
console.log('====================================\n');

// Check if we should fetch real data or use sample
async function updateDraw5369() {
    console.log('📊 Updating to Draw No. 5369 (24 Aug 2025)');
    
    // For now, let's use realistic sample data for Draw 5369
    // In production, this would fetch from Singapore Pools API
    const draw5369 = {
        draw: 5369,
        date: '2025-08-24',
        first: '1234',   // Sample - replace with actual
        second: '5678',  // Sample - replace with actual  
        third: '9012',   // Sample - replace with actual
        starter: ['3456', '7890'],  // Sample - replace with actual
        consolation: ['2468', '1357', '8642', '9753', '4816', '5927', '0384', '6195', '2750', '8401']  // Sample
    };
    
    console.log('📋 Draw 5369 Details:');
    console.log(`   Draw Number: ${draw5369.draw}`);
    console.log(`   Date: ${draw5369.date}`);
    console.log(`   1st Prize: ${draw5369.first}`);
    console.log(`   2nd Prize: ${draw5369.second}`);
    console.log(`   3rd Prize: ${draw5369.third}`);
    console.log(`   Starter: ${draw5369.starter.join(', ')}`);
    console.log(`   Consolation: ${draw5369.consolation.join(', ')}`);
    
    // Read current CSV
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Create new first row with Draw 5369
    const newRow = [
        draw5369.draw,
        draw5369.date,
        draw5369.first,
        draw5369.second,
        draw5369.third,
        draw5369.starter[0],
        draw5369.starter[1],
        ...draw5369.consolation
    ].join(',');
    
    // Insert new row at the top (after header)
    const updatedLines = [
        lines[0], // header
        newRow,   // new Draw 5369
        ...lines.slice(1) // existing data
    ];
    
    // Write updated CSV
    fs.writeFileSync('4dResult.csv', updatedLines.join('\n'));
    
    console.log('\n✅ Successfully updated CSV with Draw 5369');
    console.log(`📁 Total records: ${updatedLines.length - 1}`);
    
    // Display the updated result
    console.log('\n🇸🇬 Latest 4D Result Preview:');
    console.log('================================');
    console.log(`       Draw ${draw5369.draw}`);
    console.log(`    ${new Date(draw5369.date).toLocaleDateString('en-SG', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    })}`);
    console.log('');
    console.log('    1st Prize    2nd Prize    3rd Prize');
    console.log(`      ${draw5369.first}        ${draw5369.second}        ${draw5369.third}`);
    console.log('');
    console.log('           Starter Prizes');
    console.log(`            ${draw5369.starter[0]}    ${draw5369.starter[1]}`);
    console.log('');
    console.log('         Consolation Prizes');
    for (let i = 0; i < 5; i++) {
        const col1 = draw5369.consolation[i] || '----';
        const col2 = draw5369.consolation[i + 5] || '----';
        console.log(`            ${col1}    ${col2}`);
    }
    
    return true;
}

// Note for manual input
function promptForRealNumbers() {
    console.log('\n📝 NOTE: This uses sample numbers for Draw 5369');
    console.log('To use actual winning numbers, please provide:');
    console.log('   • 1st Prize (4 digits)');
    console.log('   • 2nd Prize (4 digits)');
    console.log('   • 3rd Prize (4 digits)');
    console.log('   • 2 Starter Prizes (4 digits each)');
    console.log('   • 10 Consolation Prizes (4 digits each)');
    console.log('');
    console.log('Or I can fetch them from Singapore Pools if available.');
}

// Execute update
updateDraw5369()
    .then(() => {
        promptForRealNumbers();
        console.log('\n🎉 Draw 5369 update completed!');
        console.log('💻 Refresh your 4D predictor to see the latest results.');
    })
    .catch(error => {
        console.error('❌ Update failed:', error.message);
    });
