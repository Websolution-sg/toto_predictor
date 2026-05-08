// ADD MARCH 30, 2026 TOTO RESULTS - INTERACTIVE
// Script to add today's winning numbers to the database

const fs = require('fs');
const readline = require('readline');

console.log('🎯 MARCH 30, 2026 TOTO RESULTS ENTRY');
console.log('====================================');
console.log('💰 Jackpot: $2,500,000 (Snowballed)');
console.log('📅 Draw Date: March 30, 2026');
console.log('');

// Function to add results to CSV
function addTotoResult(date, numbers, additional) {
    try {
        // Read current CSV
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        // Format new entry (numbers should be array of 6 numbers)
        const newEntry = `${date},${numbers.join(',')},${additional},,,,,`;
        
        // Add to beginning of file (newest first)
        lines.unshift(newEntry);
        
        // Write back to file
        const updatedCsv = lines.join('\n');
        fs.writeFileSync('totoResult.csv', updatedCsv);
        
        console.log('\n✅ SUCCESS! TOTO RESULTS ADDED!');
        console.log('==============================');
        console.log(`📅 Date: ${date}`);
        console.log(`🎯 Winning Numbers: [${numbers.join(', ')}]`);
        console.log(`⭐ Additional Number: ${additional}`);
        console.log(`📊 Total draws in database: ${lines.length}`);
        console.log('');
        console.log('🎉 Ready for prediction validation!');
        console.log('📊 You can now run validation scripts to check your 55 predictions');
        
        return true;
    } catch (error) {
        console.error('❌ Error updating CSV:', error.message);
        return false;
    }
}

// Quick-add function for common scenarios
function quickAdd() {
    console.log('🚀 QUICK ADD OPTIONS:');
    console.log('=====================');
    console.log('');
    console.log('1. If you have the actual results, manually edit below:');
    console.log('');
    console.log('// UNCOMMENT AND EDIT THE LINE BELOW WITH ACTUAL RESULTS:');
    console.log('// addTotoResult(\'30-Mar-26\', [?, ?, ?, ?, ?, ?], ?);');
    console.log('');
    console.log('2. Or use this template to copy-paste:');
    console.log('');
    
    // Example template - user can modify
    console.log('📋 TEMPLATE (replace ? with actual numbers):');
    console.log('addTotoResult(\'30-Mar-26\', [?, ?, ?, ?, ?, ?], ?);');
    console.log('');
    
    console.log('3. Current database status:');
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        console.log(`   📊 Total draws: ${lines.length}`);
        console.log(`   📅 Latest: ${lines[0]}`);
    } catch (error) {
        console.log('   ❌ Error reading database');
    }
}

// Check if we should add example results for testing
console.log('📝 INSTRUCTIONS:');
console.log('1. Get official results from Singapore Pools');
console.log('2. Edit the addTotoResult line below with actual numbers');
console.log('3. Run this script again to add to database');
console.log('');

// Show current status
quickAdd();

// EXAMPLE - REPLACE WITH ACTUAL RESULTS:
// addTotoResult('30-Mar-26', [15, 21, 28, 35, 42, 49], 7);

console.log('');
console.log('⚠️  IMPORTANT: Replace example numbers with actual Singapore Pools results!');
console.log('🔗 Official source: https://www.singaporepools.com.sg');
console.log('');
console.log('🎯 Once added, your 55 predictions can be validated immediately!');