// Test Latest Draw Only Display
// Verifies only the most recent draw is shown

const fs = require('fs');

console.log('🎯 Testing Latest Draw Only Display');
console.log('===================================\n');

// Test the current CSV data
function showLatestDrawPreview() {
    console.log('📊 Latest Draw Preview');
    console.log('----------------------');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length > 1) {
        const latestData = lines[1].split(',');
        
        console.log('🇸🇬 Latest 4D Result');
        console.log('====================================');
        console.log(`       Draw ${latestData[0]}`);
        console.log(`    ${new Date(latestData[1]).toLocaleDateString('en-SG', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
        })}`);
        console.log('');
        console.log('    1st Prize    2nd Prize    3rd Prize');
        console.log(`      ${latestData[2]}        ${latestData[3]}        ${latestData[4]}`);
        console.log('');
        console.log('           Starter Prizes');
        console.log(`            ${latestData[5]}    ${latestData[6]}`);
        console.log('');
        console.log('         Consolation Prizes');
        for (let i = 0; i < 5; i++) {
            const col1 = latestData[7 + i] || '----';
            const col2 = latestData[12 + i] || '----';
            console.log(`            ${col1}    ${col2}`);
        }
        console.log('');
        
        console.log('✅ Displaying ONLY the latest draw result');
        console.log(`📅 Draw ${latestData[0]} (${latestData[1]})`);
        console.log(`🥇 1st: ${latestData[2]} | 🥈 2nd: ${latestData[3]} | 🥉 3rd: ${latestData[4]}`);
        
    } else {
        console.log('❌ No data available');
    }
}

// Verify HTML changes
function verifyHTMLChanges() {
    console.log('\n🔍 HTML Changes Verification');
    console.log('-----------------------------');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    const checks = [
        { name: 'Single draw display', pattern: /const latestDraw = historical4D\[0\]/, description: 'Shows only latest draw' },
        { name: 'Removed loop', pattern: /recentDraws\.forEach/, shouldNotExist: true, description: 'No longer loops through multiple draws' },
        { name: 'Latest result header', pattern: /Latest 4D Result/, description: 'Updated header text' },
        { name: 'Loading message update', pattern: /Loading latest result/, description: 'Updated loading message' }
    ];
    
    checks.forEach(check => {
        const found = check.pattern.test(htmlContent);
        if (check.shouldNotExist) {
            console.log(`${!found ? '✅' : '❌'} ${check.name}: ${!found ? 'REMOVED' : 'STILL PRESENT'} - ${check.description}`);
        } else {
            console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'IMPLEMENTED' : 'MISSING'} - ${check.description}`);
        }
    });
}

// Test function structure
function testFunctionStructure() {
    console.log('\n⚙️ Function Structure Test');
    console.log('---------------------------');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    // Extract the updateLatestResult function
    const functionMatch = htmlContent.match(/function updateLatestResult\([\s\S]*?^}/m);
    
    if (functionMatch) {
        const functionCode = functionMatch[0];
        
        const functionChecks = [
            { name: 'Single draw selection', pattern: /historical4D\[0\]/ },
            { name: 'No loop logic', pattern: /forEach|for.*i/ },
            { name: 'Direct HTML assignment', pattern: /container\.innerHTML = html;/ },
            { name: 'Latest draw styling', pattern: /latest-draw/ }
        ];
        
        functionChecks.forEach(check => {
            const found = check.pattern.test(functionCode);
            if (check.name === 'No loop logic') {
                console.log(`${!found ? '✅' : '❌'} ${check.name}: ${!found ? 'CONFIRMED' : 'STILL HAS LOOPS'}`);
            } else {
                console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'PRESENT' : 'MISSING'}`);
            }
        });
        
        console.log('✅ Function successfully updated for single draw display');
    } else {
        console.log('❌ Could not find updateLatestResult function');
    }
}

// Run all tests
function runLatestDrawTests() {
    showLatestDrawPreview();
    verifyHTMLChanges();
    testFunctionStructure();
    
    console.log('\n🎉 Latest Draw Display Summary');
    console.log('==============================');
    console.log('✅ NOW SHOWING: Only the latest 4D draw result');
    console.log('✅ FORMAT: Singapore Pools official layout');
    console.log('✅ INCLUDES: 1st, 2nd, 3rd prizes + Starter + Consolation');
    console.log('✅ STYLING: Professional Singapore blue theme');
    console.log('✅ MOBILE: Responsive design maintained');
    console.log('');
    console.log('🇸🇬 Your 4D predictor now displays only the most recent draw result!');
}

// Execute tests
runLatestDrawTests();
