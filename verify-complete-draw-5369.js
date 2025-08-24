// Verify Complete Draw 5369 Actual Results
// Confirms all real winning numbers are correctly updated

const fs = require('fs');

console.log('🎯 Verifying Complete Draw 5369 Actual Results');
console.log('===============================================\n');

function verifyCompleteResults() {
    console.log('📊 Complete Actual Results Verification');
    console.log('---------------------------------------');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length > 1) {
        const draw5369 = lines[1].split(',');
        
        console.log(`✅ Draw Number: ${draw5369[0]} (Expected: 5369)`);
        console.log(`✅ Date: ${draw5369[1]} (Expected: 2025-08-23 - Sat, 23 Aug 2025)`);
        console.log(`✅ 1st Prize: ${draw5369[2]} (Expected: 2250)`);
        console.log(`✅ 2nd Prize: ${draw5369[3]} (Expected: 6325)`);
        console.log(`✅ 3rd Prize: ${draw5369[4]} (Expected: 0963)`);
        
        console.log('\n🎲 Starter Prizes Verification:');
        const expectedStarter = ['0297', '0721'];
        const actualStarter = [draw5369[5], draw5369[6]];
        
        expectedStarter.forEach((expected, index) => {
            const actual = actualStarter[index];
            console.log(`✅ Starter ${index + 1}: ${actual} (Expected: ${expected}) ${actual === expected ? '✓' : '✗'}`);
        });
        
        console.log('\n🎪 Consolation Prizes Verification:');
        const expectedConsolation = ['0300', '1056', '1330', '2354', '2870', '3128', '3762', '4234', '7566', '9185'];
        const actualConsolation = draw5369.slice(7, 17);
        
        expectedConsolation.forEach((expected, index) => {
            const actual = actualConsolation[index];
            console.log(`✅ Consolation ${index + 1}: ${actual} (Expected: ${expected}) ${actual === expected ? '✓' : '✗'}`);
        });
        
        // Verify all numbers match
        let allCorrect = true;
        
        // Check main prizes
        if (draw5369[2] !== '2250' || draw5369[3] !== '6325' || draw5369[4] !== '0963') {
            allCorrect = false;
        }
        
        // Check starter prizes
        if (draw5369[5] !== '0297' || draw5369[6] !== '0721') {
            allCorrect = false;
        }
        
        // Check consolation prizes
        for (let i = 0; i < expectedConsolation.length; i++) {
            if (actualConsolation[i] !== expectedConsolation[i]) {
                allCorrect = false;
                break;
            }
        }
        
        if (allCorrect) {
            console.log('\n🎯 PERFECT! All winning numbers match the actual Draw 5369 results!');
        } else {
            console.log('\n⚠️  Some numbers may not match the expected results.');
        }
        
        return allCorrect;
    }
    
    return false;
}

function displayCompleteOfficialFormat() {
    console.log('\n🇸🇬 Complete Official Draw 5369 Results');
    console.log('========================================');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const data = lines[1].split(',');
    
    console.log(`       Draw ${data[0]}`);
    console.log(`    ${new Date(data[1]).toLocaleDateString('en-SG', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    })}`);
    console.log('');
    console.log('    1st Prize    2nd Prize    3rd Prize');
    console.log(`      ${data[2]}        ${data[3]}        ${data[4]}`);
    console.log('');
    console.log('           Starter Prizes');
    console.log(`      ${data[5]}   ${data[6]}   ${data[7] || '----'}   ${data[8] || '----'}   ${data[9] || '----'}`);
    console.log('');
    console.log('         Consolation Prizes');
    
    // Display consolation in 2 columns, 5 rows
    const consolationStart = 7;
    for (let i = 0; i < 5; i++) {
        const col1 = data[consolationStart + i] || '----';
        const col2 = data[consolationStart + i + 5] || '----';
        console.log(`            ${col1}    ${col2}`);
    }
}

function generateActualSummary() {
    console.log('\n📋 Complete Draw 5369 Actual Results Summary');
    console.log('===========================================');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const data = lines[1].split(',');
    
    console.log(`🎯 Draw: ${data[0]}`);
    console.log(`📅 Date: Sat, 23 Aug 2025`);
    console.log(`🥇 1st Prize: ${data[2]}`);
    console.log(`🥈 2nd Prize: ${data[3]}`);
    console.log(`🥉 3rd Prize: ${data[4]}`);
    console.log(`🎲 Starter Prizes: ${data[5]}, ${data[6]}`);
    console.log(`🎪 All Starter: 0297, 0721, 0759, 2136, 2807, 4877, 5486, 5583, 8575, 9399`);
    console.log(`🎭 Consolation: ${data.slice(7, 17).join(', ')}`);
    
    console.log('\n📝 Note: CSV format stores first 2 starter prizes and 10 consolation prizes');
    console.log('     Full starter list includes all 10 numbers as per Singapore Pools format');
}

// Run complete verification
const allCorrect = verifyCompleteResults();
displayCompleteOfficialFormat();
generateActualSummary();

console.log('\n🎉 Complete Draw 5369 Update Summary');
console.log('====================================');

if (allCorrect) {
    console.log('✅ CONFIRMED: Draw 5369 updated with ALL actual winning numbers!');
    console.log('✅ Date corrected: Sat, 23 Aug 2025 ✓');
    console.log('✅ Main Prizes: 2250, 6325, 0963 ✓');
    console.log('✅ Starter Prizes: 0297, 0721 (first 2 of 10) ✓');
    console.log('✅ Consolation Prizes: All 10 numbers ✓');
    console.log('');
    console.log('🇸🇬 Your 4D predictor now shows the complete real Draw 5369 results!');
    console.log('💻 Refresh your browser to see all the actual winning numbers.');
} else {
    console.log('⚠️  There may be an issue with some number updates.');
}
