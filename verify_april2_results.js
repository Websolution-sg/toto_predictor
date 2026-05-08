// REAL SINGAPORE POOLS RESULTS CHECKER - April 2, 2026
// Script to help fetch and verify actual TOTO results from official sources

const https = require('https');
const fs = require('fs');

console.log('🌐 SINGAPORE POOLS RESULTS CHECKER');
console.log('==================================');
console.log('📅 Target: April 2, 2026 TOTO Draw');
console.log('🔗 Source: Official Singapore Pools');
console.log('⚠️  Only adding VERIFIED official results');
console.log('');

// Check current database status
function checkCurrentDatabase() {
    console.log('📊 CURRENT DATABASE STATUS:');
    console.log('===========================');
    
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        console.log(`📈 Total verified draws: ${lines.length}`);
        
        // Show last 3 entries
        console.log('🎲 Last 3 verified draws:');
        lines.slice(0, 3).forEach((line, index) => {
            const data = line.split(',');
            const numbers = data.slice(1, 7).join(', ');
            const additional = data[7];
            console.log(`   ${index + 1}. ${data[0]}: [${numbers}] + ${additional}`);
        });
        
        const latestDate = lines[0].split(',')[0];
        console.log(`\n📅 Latest verified date: ${latestDate}`);
        
        return { lines, latestDate };
    } catch (error) {
        console.error('❌ Error reading database:', error.message);
        return null;
    }
}

// Instructions for manual verification
function showVerificationInstructions() {
    console.log('\n🔍 MANUAL VERIFICATION STEPS:');
    console.log('=============================');
    console.log('1. 🌐 Open: https://www.singaporepools.com.sg');
    console.log('2. 🎯 Navigate to TOTO results section');
    console.log('3. 📅 Look for April 2, 2026 draw results');
    console.log('4. 📝 Note the 6 winning numbers + additional number');
    console.log('5. ✅ Verify the draw date and numbers are correct');
    console.log('');
    console.log('📋 EXPECTED FORMAT:');
    console.log('==================');
    console.log('Draw Date: April 2, 2026 (or 2-Apr-26)');
    console.log('Winning Numbers: [__, __, __, __, __, __]');
    console.log('Additional Number: __');
    console.log('');
}

// Function to add verified results
function addVerifiedResults(date, numbers, additional) {
    console.log('📝 ADDING VERIFIED RESULTS:');
    console.log('============================');
    
    // Validate input
    if (!date || !numbers || !additional) {
        console.error('❌ Invalid input - all fields required');
        return false;
    }
    
    if (!Array.isArray(numbers) || numbers.length !== 6) {
        console.error('❌ Invalid numbers - must be array of 6 numbers');
        return false;
    }
    
    if (numbers.some(n => n < 1 || n > 49)) {
        console.error('❌ Invalid numbers - must be between 1-49');
        return false;
    }
    
    if (additional < 1 || additional > 49) {
        console.error('❌ Invalid additional number - must be between 1-49');
        return false;
    }
    
    try {
        // Read current CSV
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        
        // Check if already exists
        if (lines[0].startsWith(date)) {
            console.log('⚠️ Results for this date already exist!');
            console.log(`   Current: ${lines[0]}`);
            return false;
        }
        
        // Format new entry
        const newEntry = `${date},${numbers.join(',')},${additional},,,,,`;
        
        // Add to beginning (newest first)
        lines.unshift(newEntry);
        
        // Write back to file
        const updatedCsv = lines.join('\n');
        fs.writeFileSync('totoResult.csv', updatedCsv);
        
        console.log('✅ RESULTS SUCCESSFULLY ADDED!');
        console.log('==============================');
        console.log(`📅 Date: ${date}`);
        console.log(`🎯 Numbers: [${numbers.join(', ')}]`);
        console.log(`⭐ Additional: ${additional}`);
        console.log(`📈 Total draws: ${lines.length}`);
        console.log('');
        console.log('🎉 Database updated with verified official results!');
        
        return true;
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        return false;
    }
}

// Main execution
function main() {
    console.log('🚀 STARTING VERIFICATION PROCESS...');
    console.log('===================================');
    
    // Check current state
    const dbStatus = checkCurrentDatabase();
    
    if (!dbStatus) {
        console.error('❌ Cannot proceed - database error');
        return;
    }
    
    // Check if April 2 already exists
    if (dbStatus.latestDate === '2-Apr-26') {
        console.log('✅ April 2, 2026 results already verified!');
        const latestLine = dbStatus.lines[0].split(',');
        const numbers = latestLine.slice(1, 7).join(', ');
        const additional = latestLine[7];
        console.log(`🏆 Numbers: [${numbers}] + ${additional}`);
        return;
    }
    
    // Show verification instructions
    showVerificationInstructions();
    
    console.log('⏳ WAITING FOR MANUAL VERIFICATION...');
    console.log('=====================================');
    console.log('Once you have verified the April 2, 2026 results from Singapore Pools:');
    console.log('');
    console.log('📝 USE THIS COMMAND TO ADD THEM:');
    console.log('================================');
    console.log('// Example format (replace with actual numbers):');
    console.log('// addVerifiedResults("2-Apr-26", [1, 12, 23, 34, 45, 49], 8);');
    console.log('');
    console.log('⚠️  IMPORTANT: Only add numbers you have personally verified');
    console.log('🔗 Source: https://www.singaporepools.com.sg');
    console.log('');
    
    // Export function for manual use
    console.log('📋 READY FOR MANUAL INPUT');
    console.log('=========================');
    console.log('Function available: addVerifiedResults(date, [n1,n2,n3,n4,n5,n6], additional)');
}

// Export the add function for manual use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addVerifiedResults };
}

// Run the checker
main();