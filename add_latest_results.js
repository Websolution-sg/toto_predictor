// ADD LATEST TOTO RESULTS TO CSV
// Script to manually add March 30, 2026 results when available

const fs = require('fs');

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
        
        console.log('✅ Successfully added new TOTO results!');
        console.log('======================================');
        console.log(`📅 Date: ${date}`);
        console.log(`🎯 Numbers: [${numbers.join(', ')}]`);
        console.log(`⭐ Additional: ${additional}`);
        console.log(`📊 Total draws: ${lines.length}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error updating CSV:', error.message);
        return false;
    }
}

// Example usage - uncomment and modify when results are available:
// addTotoResult('30-Mar-26', [1, 12, 23, 34, 45, 49], 8);

console.log('📝 ADD MARCH 30, 2026 TOTO RESULTS');
console.log('==================================');
console.log('');
console.log('🔧 INSTRUCTIONS:');
console.log('1. Wait for official results from Singapore Pools');
console.log('2. Uncomment the addTotoResult line below');
console.log('3. Replace numbers with actual winning numbers');
console.log('4. Run this script again');
console.log('');
console.log('📋 FORMAT: addTotoResult(\'30-Mar-26\', [n1,n2,n3,n4,n5,n6], additional)');
console.log('');
console.log('⏳ Waiting for March 30, 2026 results...');
console.log('🎯 Your 55 predictions are ready for validation!');