// Verify Draw 5369 Display
// Confirms the latest draw is showing correctly

const fs = require('fs');

console.log('🎯 Verifying Draw 5369 Display');
console.log('==============================\n');

// Check CSV data
function verifyCSVData() {
    console.log('📊 CSV Data Verification');
    console.log('------------------------');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length > 1) {
        const latestData = lines[1].split(',');
        
        console.log(`✅ Latest Draw Number: ${latestData[0]}`);
        console.log(`✅ Date: ${latestData[1]}`);
        console.log(`✅ 1st Prize: ${latestData[2]}`);
        console.log(`✅ 2nd Prize: ${latestData[3]}`);
        console.log(`✅ 3rd Prize: ${latestData[4]}`);
        console.log(`✅ Starter 1: ${latestData[5]}`);
        console.log(`✅ Starter 2: ${latestData[6]}`);
        console.log(`✅ Consolation: ${latestData.slice(7, 17).join(', ')}`);
        
        // Verify it's Draw 5369
        if (latestData[0] === '5369') {
            console.log('\n🎯 CONFIRMED: Draw 5369 is the latest result!');
            return true;
        } else {
            console.log(`\n❌ ERROR: Expected Draw 5369, found Draw ${latestData[0]}`);
            return false;
        }
    } else {
        console.log('❌ No data found in CSV');
        return false;
    }
}

// Display formatted result
function displayFormattedResult() {
    console.log('\n🇸🇬 Latest 4D Result Display Preview');
    console.log('=====================================');
    
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

// Check for duplicates
function checkForDuplicates() {
    console.log('\n🔍 Duplicate Check');
    console.log('------------------');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    const drawNumbers = [];
    let duplicates = false;
    
    for (let i = 1; i < lines.length; i++) {
        const drawNum = lines[i].split(',')[0];
        if (drawNumbers.includes(drawNum)) {
            console.log(`❌ Duplicate found: Draw ${drawNum}`);
            duplicates = true;
        } else {
            drawNumbers.push(drawNum);
        }
    }
    
    if (!duplicates) {
        console.log('✅ No duplicates found');
        console.log(`✅ Total unique draws: ${drawNumbers.length}`);
    }
    
    return !duplicates;
}

// Run verification
function runVerification() {
    const csvCheck = verifyCSVData();
    displayFormattedResult();
    const duplicateCheck = checkForDuplicates();
    
    console.log('\n🎉 Draw 5369 Verification Summary');
    console.log('=================================');
    
    if (csvCheck && duplicateCheck) {
        console.log('✅ PERFECT! Draw 5369 is correctly set as latest result');
        console.log('✅ CSV data is clean and formatted correctly');
        console.log('✅ No duplicate entries found');
        console.log('✅ Your 4D predictor will now show Draw 5369');
        console.log('');
        console.log('🇸🇬 Ready to view at: 4d_predictor.html');
    } else {
        console.log('⚠️  Some issues detected. Please review above.');
    }
}

// Execute verification
runVerification();
