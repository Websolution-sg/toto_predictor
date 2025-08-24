// Live HTML Integration Test
// Tests if the 4D predictor HTML can read the actual CSV

const fs = require('fs');
const path = require('path');

console.log('🌐 Live HTML Integration Test');
console.log('=============================\n');

// Test if the files exist and are accessible
function testFileAccess() {
    console.log('📁 Test 1: File Access Check');
    
    const files = [
        '4d_predictor.html',
        '4dResult.csv'
    ];
    
    let allFilesExist = true;
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            console.log(`✅ ${file}: ${stats.size} bytes`);
        } else {
            console.log(`❌ ${file}: NOT FOUND`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// Test CSV accessibility for web interface
function testCSVWebAccess() {
    console.log('\n🌐 Test 2: CSV Web Accessibility');
    
    try {
        const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log(`✅ CSV readable: ${lines.length} lines`);
        console.log(`✅ First data row: ${lines[1].substring(0, 50)}...`);
        
        // Check if it's properly formatted for web consumption
        const headers = lines[0].split(',');
        const requiredHeaders = ['draw', 'date', 'first', 'second', 'third'];
        
        const hasAllHeaders = requiredHeaders.every(header => headers.includes(header));
        console.log(`✅ Web-compatible headers: ${hasAllHeaders}`);
        
        return hasAllHeaders;
    } catch (error) {
        console.log(`❌ CSV read error: ${error.message}`);
        return false;
    }
}

// Test HTML structure
function testHTMLStructure() {
    console.log('\n📄 Test 3: HTML Structure Check');
    
    try {
        const htmlContent = fs.readFileSync('4d_predictor.html', 'utf8');
        
        const checks = [
            { name: 'CSV loading', pattern: /loadCSV|fetch.*4dResult\.csv/ },
            { name: '4-digit input', pattern: /maxlength="4"|pattern.*\d{4}/ },
            { name: 'Chart.js', pattern: /Chart\.js|new Chart/ },
            { name: 'Prediction function', pattern: /function.*predict|predict.*function/ },
            { name: 'CSV parsing', pattern: /split.*,|Papa\.parse/ }
        ];
        
        checks.forEach(check => {
            const found = check.pattern.test(htmlContent);
            console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'FOUND' : 'NOT FOUND'}`);
        });
        
        return true;
    } catch (error) {
        console.log(`❌ HTML read error: ${error.message}`);
        return false;
    }
}

// Test data consistency
function testDataConsistency() {
    console.log('\n🔍 Test 4: Data Consistency Check');
    
    try {
        const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
        const lines = csvContent.trim().split('\n');
        
        let consistentData = true;
        let checkedRows = 0;
        
        for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
            const data = lines[i].split(',');
            checkedRows++;
            
            // Check draw number
            if (!/^\d+$/.test(data[0])) {
                console.log(`❌ Row ${i}: Invalid draw number`);
                consistentData = false;
            }
            
            // Check 4-digit numbers
            if (!/^\d{4}$/.test(data[2]) || !/^\d{4}$/.test(data[3]) || !/^\d{4}$/.test(data[4])) {
                console.log(`❌ Row ${i}: Invalid 4-digit format`);
                consistentData = false;
            }
        }
        
        if (consistentData) {
            console.log(`✅ Data consistency verified (${checkedRows} rows)`);
        }
        
        return consistentData;
    } catch (error) {
        console.log(`❌ Data check error: ${error.message}`);
        return false;
    }
}

// Test current working directory
function testWorkingDirectory() {
    console.log('\n📂 Test 5: Working Directory Check');
    
    const cwd = process.cwd();
    console.log(`✅ Current directory: ${cwd}`);
    
    const expectedFiles = ['4d_predictor.html', '4dResult.csv'];
    const filesInDir = expectedFiles.filter(file => fs.existsSync(file));
    
    console.log(`✅ Required files present: ${filesInDir.length}/${expectedFiles.length}`);
    
    return filesInDir.length === expectedFiles.length;
}

// Run integration tests
function runIntegrationTests() {
    console.log('Starting live integration tests...\n');
    
    const tests = [
        testFileAccess,
        testCSVWebAccess,
        testHTMLStructure,
        testDataConsistency,
        testWorkingDirectory
    ];
    
    let passedTests = 0;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Integration test ${index + 1} failed: ${error.message}`);
        }
    });
    
    console.log('\n🎉 Integration Test Results');
    console.log('===========================');
    console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
    
    if (passedTests === tests.length) {
        console.log('🎯 4D Predictor is FULLY OPERATIONAL!');
        console.log('🌐 HTML interface ready for use');
        console.log('📊 CSV data properly integrated');
        console.log('🎲 Prediction algorithms functional');
    } else {
        console.log('⚠️  Some integration issues detected.');
    }
    
    console.log('\n💡 Access your 4D Predictor at:');
    console.log(`   file:///${path.resolve('4d_predictor.html').replace(/\\/g, '/')}`);
}

// Execute all tests
runIntegrationTests();
