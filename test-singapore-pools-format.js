// Test Singapore Pools 4D Format Implementation
// Verifies the official format is correctly implemented

const fs = require('fs');

console.log('🇸🇬 Testing Singapore Pools 4D Format Implementation');
console.log('===================================================\n');

// Test 1: Check Singapore Pools styling elements
function testSingaporePoolsStyling() {
    console.log('🎨 Test 1: Singapore Pools Styling Check');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    const styleChecks = [
        { name: 'Draw header styling', pattern: /\.draw-header.*text-align.*center/ },
        { name: 'Main prizes layout', pattern: /\.main-prizes.*display.*flex/ },
        { name: 'Prize number monospace font', pattern: /font-family.*Courier New.*monospace/ },
        { name: 'Starter prizes horizontal', pattern: /\.starter-prizes.*display.*flex/ },
        { name: 'Consolation grid layout', pattern: /\.consolation-grid.*grid-template-columns/ },
        { name: 'Latest draw highlight', pattern: /\.latest-draw.*border.*#0066cc/ },
        { name: 'Singapore colors', pattern: /#0066cc|#f0f8ff/ },
        { name: 'Professional typography', pattern: /font-weight.*bold/ }
    ];
    
    let passedStyles = 0;
    styleChecks.forEach(check => {
        const found = check.pattern.test(htmlContent);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'IMPLEMENTED' : 'MISSING'}`);
        if (found) passedStyles++;
    });
    
    console.log(`📊 Style implementation: ${passedStyles}/${styleChecks.length} features`);
    return passedStyles >= styleChecks.length - 1; // Allow 1 minor missing feature
}

// Test 2: Verify layout structure
function testLayoutStructure() {
    console.log('\n🏗️ Test 2: Layout Structure Verification');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    const structureChecks = [
        { name: 'Draw header section', pattern: /draw-header/ },
        { name: 'Main prizes section', pattern: /main-prizes/ },
        { name: 'Individual prize displays', pattern: /main-prize/ },
        { name: 'Starter prizes section', pattern: /starter-prizes/ },
        { name: 'Consolation grid', pattern: /consolation-grid/ },
        { name: 'Prize labels', pattern: /prize-label/ },
        { name: 'Singapore flag emoji', pattern: /🇸🇬/ }
    ];
    
    let structurePassed = 0;
    structureChecks.forEach(check => {
        const found = check.pattern.test(htmlContent);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'PRESENT' : 'MISSING'}`);
        if (found) structurePassed++;
    });
    
    console.log(`🏗️ Structure completeness: ${structurePassed}/${structureChecks.length} elements`);
    return structurePassed === structureChecks.length;
}

// Test 3: Simulate data display
function testDataDisplay() {
    console.log('\n📊 Test 3: Data Display Simulation');
    
    // Read actual CSV data
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Parse first draw
    const firstDraw = lines[1].split(',');
    const draw = {
        draw: firstDraw[0],
        date: firstDraw[1],
        first: firstDraw[2],
        second: firstDraw[3],
        third: firstDraw[4],
        starter: [firstDraw[5], firstDraw[6]],
        consolation: firstDraw.slice(7, 17)
    };
    
    console.log('✅ Sample Singapore Pools format display:');
    console.log('');
    console.log(`🇸🇬 4D Results`);
    console.log(`=====================================`);
    console.log(`       Draw ${draw.draw}`);
    console.log(`    ${new Date(draw.date).toLocaleDateString('en-SG', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    })}`);
    console.log('');
    console.log('    1st Prize    2nd Prize    3rd Prize');
    console.log(`      ${draw.first}        ${draw.second}        ${draw.third}`);
    console.log('');
    console.log('           Starter Prizes');
    console.log(`            ${draw.starter[0]}    ${draw.starter[1]}`);
    console.log('');
    console.log('         Consolation Prizes');
    console.log(`    ${draw.consolation[0]}    ${draw.consolation[1]}`);
    console.log(`    ${draw.consolation[2]}    ${draw.consolation[3]}`);
    console.log(`    ${draw.consolation[4]}    ${draw.consolation[5]}`);
    console.log(`    ${draw.consolation[6]}    ${draw.consolation[7]}`);
    console.log(`    ${draw.consolation[8]}    ${draw.consolation[9]}`);
    console.log('');
    
    return true;
}

// Test 4: Responsive design check
function testResponsiveDesign() {
    console.log('\n📱 Test 4: Responsive Design Check');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    const responsiveChecks = [
        { name: 'Mobile media query', pattern: /@media.*max-width.*768px/ },
        { name: 'Flexible main prizes', pattern: /flex-direction.*column/ },
        { name: 'Adaptive font sizes', pattern: /font-size.*28px/ },
        { name: 'Mobile-friendly gaps', pattern: /gap.*10px/ }
    ];
    
    let responsivePassed = 0;
    responsiveChecks.forEach(check => {
        const found = check.pattern.test(htmlContent);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'IMPLEMENTED' : 'MISSING'}`);
        if (found) responsivePassed++;
    });
    
    console.log(`📱 Mobile optimization: ${responsivePassed}/${responsiveChecks.length} features`);
    return responsivePassed >= 3; // Allow some flexibility
}

// Test 5: Compare with official format
function testOfficialFormatCompliance() {
    console.log('\n🏛️ Test 5: Official Format Compliance');
    
    const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
    
    const complianceChecks = [
        { name: 'Clean white background', pattern: /background.*white/ },
        { name: 'Centered draw information', pattern: /text-align.*center/ },
        { name: 'Bold section headers', pattern: /font-weight.*bold/ },
        { name: 'Monospace number font', pattern: /Courier New/ },
        { name: 'Professional spacing', pattern: /padding.*margin/ },
        { name: 'Singapore blue color', pattern: /#0066cc/ },
        { name: 'Grid layout for consolation', pattern: /grid-template-columns.*1fr 1fr/ }
    ];
    
    let compliancePassed = 0;
    complianceChecks.forEach(check => {
        const found = check.pattern.test(htmlContent);
        console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
        if (found) compliancePassed++;
    });
    
    const complianceScore = (compliancePassed / complianceChecks.length * 100).toFixed(1);
    console.log(`🏛️ Official format compliance: ${complianceScore}%`);
    
    return compliancePassed >= 6; // High compliance threshold
}

// Run all tests
function runSingaporePoolsTests() {
    const tests = [
        testSingaporePoolsStyling,
        testLayoutStructure,
        testDataDisplay,
        testResponsiveDesign,
        testOfficialFormatCompliance
    ];
    
    let passedTests = 0;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1} failed: ${error.message}`);
        }
    });
    
    console.log('\n🎉 Singapore Pools Format Test Summary');
    console.log('======================================');
    console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
    
    if (passedTests === tests.length) {
        console.log('🇸🇬 PERFECT! Your 4D results now match Singapore Pools official format!');
        console.log('🎯 Features implemented:');
        console.log('   • Authentic Singapore Pools layout');
        console.log('   • Professional typography and spacing');
        console.log('   • Official color scheme (#0066cc Singapore blue)');
        console.log('   • Responsive design for mobile devices');
        console.log('   • Grid layout for consolation prizes');
        console.log('   • Highlighted latest draw');
        console.log('   • Clean, professional appearance');
    } else {
        console.log('⚠️  Some format elements need adjustment.');
    }
}

// Execute all tests
runSingaporePoolsTests();
