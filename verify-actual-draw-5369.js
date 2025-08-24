// Verify Actual Draw 5369 Winning Numbers
// Confirms the real winning numbers are correctly updated

const fs = require('fs');

console.log('🎯 Verifying Actual Draw 5369 Winning Numbers');
console.log('==============================================\n');

function verifyActualNumbers() {
    console.log('📊 Actual Winning Numbers Verification');
    console.log('--------------------------------------');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length > 1) {
        const draw5369 = lines[1].split(',');
        
        console.log(`✅ Draw Number: ${draw5369[0]}`);
        console.log(`✅ Date: ${draw5369[1]}`);
        console.log(`✅ 1st Prize: ${draw5369[2]} (Expected: 2250)`);
        console.log(`✅ 2nd Prize: ${draw5369[3]} (Expected: 6325)`);
        console.log(`✅ 3rd Prize: ${draw5369[4]} (Expected: 0963)`);
        
        // Verify the numbers match
        const expectedNumbers = {
            first: '2250',
            second: '6325',
            third: '0963'
        };
        
        const actualNumbers = {
            first: draw5369[2],
            second: draw5369[3],
            third: draw5369[4]
        };
        
        let allCorrect = true;
        
        if (actualNumbers.first !== expectedNumbers.first) {
            console.log(`❌ 1st Prize mismatch: got ${actualNumbers.first}, expected ${expectedNumbers.first}`);
            allCorrect = false;
        }
        
        if (actualNumbers.second !== expectedNumbers.second) {
            console.log(`❌ 2nd Prize mismatch: got ${actualNumbers.second}, expected ${expectedNumbers.second}`);
            allCorrect = false;
        }
        
        if (actualNumbers.third !== expectedNumbers.third) {
            console.log(`❌ 3rd Prize mismatch: got ${actualNumbers.third}, expected ${expectedNumbers.third}`);
            allCorrect = false;
        }
        
        if (allCorrect) {
            console.log('\n🎯 PERFECT! All winning numbers match the actual results!');
        }
        
        return allCorrect;
    }
    
    return false;
}

function displayOfficialFormat() {
    console.log('\n🇸🇬 Official Draw 5369 Results Display');
    console.log('=======================================');
    
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
    console.log(`            ${data[5]}    ${data[6]}`);
    console.log('');
    console.log('         Consolation Prizes');
    for (let i = 0; i < 5; i++) {
        const col1 = data[7 + i] || '----';
        const col2 = data[12 + i] || '----';
        console.log(`            ${col1}    ${col2}`);
    }
}

function generateSummary() {
    console.log('\n📋 Draw 5369 Summary');
    console.log('====================');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const data = lines[1].split(',');
    
    console.log(`🎯 Draw: ${data[0]}`);
    console.log(`📅 Date: ${data[1]}`);
    console.log(`🥇 1st Prize: ${data[2]}`);
    console.log(`🥈 2nd Prize: ${data[3]}`);
    console.log(`🥉 3rd Prize: ${data[4]}`);
    console.log(`🎲 Starter: ${data[5]}, ${data[6]}`);
    console.log(`🎪 Consolation: ${data.slice(7, 17).join(', ')}`);
}

// Run verification
const numbersCorrect = verifyActualNumbers();
displayOfficialFormat();
generateSummary();

console.log('\n🎉 Draw 5369 Update Summary');
console.log('===========================');

if (numbersCorrect) {
    console.log('✅ CONFIRMED: Draw 5369 updated with actual winning numbers!');
    console.log('✅ 1st Prize: 2250 ✓');
    console.log('✅ 2nd Prize: 6325 ✓');
    console.log('✅ 3rd Prize: 0963 ✓');
    console.log('');
    console.log('🇸🇬 Your 4D predictor now shows the real Draw 5369 results!');
    console.log('💻 Refresh your browser to see the updated winning numbers.');
} else {
    console.log('⚠️  There may be an issue with the number updates.');
}
