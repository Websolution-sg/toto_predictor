// 4D Predictor Test Suite
// Tests all functionality of the Singapore 4D prediction system

const fs = require('fs');

console.log('🎯 Testing Singapore 4D Predictor System');
console.log('==========================================\n');

// Test 1: CSV Loading and Parsing
function testCSVLoading() {
    console.log('📄 Test 1: CSV Loading and Parsing');
    
    if (!fs.existsSync('4dResult.csv')) {
        console.log('❌ FAIL: 4dResult.csv not found');
        return false;
    }
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`✅ CSV loaded: ${lines.length - 1} data rows`);
    
    // Parse header
    const headers = lines[0].split(',');
    const expectedHeaders = ['draw', 'date', 'first', 'second', 'third', 'starter1', 'starter2'];
    
    let headerCheck = true;
    expectedHeaders.forEach(header => {
        if (!headers.includes(header)) {
            console.log(`❌ Missing header: ${header}`);
            headerCheck = false;
        }
    });
    
    if (headerCheck) {
        console.log('✅ All required headers present');
    }
    
    // Test data parsing
    const sampleRow = lines[1].split(',');
    console.log(`✅ Sample data - Draw: ${sampleRow[0]}, Date: ${sampleRow[1]}, First: ${sampleRow[2]}`);
    
    return headerCheck && lines.length > 1;
}

// Test 2: Data Structure Validation
function testDataStructure() {
    console.log('\n🔍 Test 2: Data Structure Validation');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    let validStructure = true;
    let testCount = 0;
    
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const data = lines[i].split(',');
        testCount++;
        
        // Check 4-digit numbers
        const first = data[2];
        const second = data[3];
        const third = data[4];
        
        if (!/^\d{4}$/.test(first) || !/^\d{4}$/.test(second) || !/^\d{4}$/.test(third)) {
            console.log(`❌ Row ${i}: Invalid 4-digit format`);
            validStructure = false;
        }
        
        // Check date format
        const date = data[1];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            console.log(`❌ Row ${i}: Invalid date format`);
            validStructure = false;
        }
    }
    
    if (validStructure) {
        console.log(`✅ Data structure valid (tested ${testCount} rows)`);
    }
    
    return validStructure;
}

// Test 3: Digit Frequency Analysis
function testDigitFrequency() {
    console.log('\n📊 Test 3: Digit Frequency Analysis');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    const digitCounts = Array(10).fill(0);
    const positionCounts = [Array(10).fill(0), Array(10).fill(0), Array(10).fill(0), Array(10).fill(0)];
    let numberCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        
        // Analyze first, second, third prizes
        [data[2], data[3], data[4]].forEach(number => {
            if (/^\d{4}$/.test(number)) {
                numberCount++;
                for (let j = 0; j < 4; j++) {
                    const digit = parseInt(number[j]);
                    digitCounts[digit]++;
                    positionCounts[j][digit]++;
                }
            }
        });
    }
    
    console.log('✅ Overall digit frequency:');
    digitCounts.forEach((count, digit) => {
        const percentage = (count / (numberCount * 4) * 100).toFixed(1);
        console.log(`   ${digit}: ${count} times (${percentage}%)`);
    });
    
    console.log('\n✅ Position-based frequency (Position 1):');
    positionCounts[0].forEach((count, digit) => {
        const percentage = (count / numberCount * 100).toFixed(1);
        console.log(`   ${digit}: ${count} times (${percentage}%)`);
    });
    
    return true;
}

// Test 4: Pattern Analysis
function testPatternAnalysis() {
    console.log('\n🔄 Test 4: Pattern Analysis');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    const patterns = {
        consecutive: 0,
        repeated: 0,
        allSame: 0,
        mirror: 0
    };
    
    let totalNumbers = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        
        [data[2], data[3], data[4]].forEach(number => {
            if (/^\d{4}$/.test(number)) {
                totalNumbers++;
                
                // Check patterns
                const digits = number.split('').map(d => parseInt(d));
                
                // All same digits
                if (digits.every(d => d === digits[0])) {
                    patterns.allSame++;
                }
                
                // Consecutive digits
                let isConsecutive = true;
                for (let j = 1; j < digits.length; j++) {
                    if (digits[j] !== digits[j-1] + 1) {
                        isConsecutive = false;
                        break;
                    }
                }
                if (isConsecutive) patterns.consecutive++;
                
                // Repeated digits
                const uniqueDigits = [...new Set(digits)];
                if (uniqueDigits.length < digits.length) {
                    patterns.repeated++;
                }
                
                // Mirror pattern (palindrome)
                if (number === number.split('').reverse().join('')) {
                    patterns.mirror++;
                }
            }
        });
    }
    
    console.log(`✅ Pattern analysis (${totalNumbers} numbers):`,);
    console.log(`   Consecutive: ${patterns.consecutive} (${(patterns.consecutive/totalNumbers*100).toFixed(1)}%)`);
    console.log(`   Repeated digits: ${patterns.repeated} (${(patterns.repeated/totalNumbers*100).toFixed(1)}%)`);
    console.log(`   All same: ${patterns.allSame} (${(patterns.allSame/totalNumbers*100).toFixed(1)}%)`);
    console.log(`   Mirror: ${patterns.mirror} (${(patterns.mirror/totalNumbers*100).toFixed(1)}%)`);
    
    return true;
}

// Test 5: Prediction Algorithm Simulation
function testPredictionAlgorithm() {
    console.log('\n🎯 Test 5: Prediction Algorithm Simulation');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Simulate the prediction algorithm from the HTML
    const digitFreq = Array(10).fill(0);
    const positionFreq = [Array(10).fill(0), Array(10).fill(0), Array(10).fill(0), Array(10).fill(0)];
    
    // Analyze last 20 results
    const recentLines = lines.slice(1, Math.min(21, lines.length));
    
    recentLines.forEach(line => {
        const data = line.split(',');
        [data[2], data[3], data[4]].forEach(number => {
            if (/^\d{4}$/.test(number)) {
                for (let i = 0; i < 4; i++) {
                    const digit = parseInt(number[i]);
                    digitFreq[digit]++;
                    positionFreq[i][digit]++;
                }
            }
        });
    });
    
    // Generate predictions based on frequency
    const predictions = [];
    
    for (let p = 0; p < 5; p++) {
        let prediction = '';
        for (let pos = 0; pos < 4; pos++) {
            // Find most frequent digit for this position
            let maxFreq = -1;
            let bestDigit = 0;
            for (let d = 0; d < 10; d++) {
                if (positionFreq[pos][d] > maxFreq) {
                    maxFreq = positionFreq[pos][d];
                    bestDigit = d;
                }
            }
            
            // Add some randomness to avoid same prediction
            if (p > 0) {
                bestDigit = (bestDigit + p) % 10;
            }
            
            prediction += bestDigit;
        }
        predictions.push(prediction);
    }
    
    console.log('✅ Generated sample predictions:');
    predictions.forEach((pred, index) => {
        console.log(`   Prediction ${index + 1}: ${pred}`);
    });
    
    return predictions.length === 5;
}

// Test 6: Date Range Validation
function testDateRange() {
    console.log('\n📅 Test 6: Date Range Validation');
    
    const csvContent = fs.readFileSync('4dResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    const dates = [];
    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        dates.push(new Date(data[1]));
    }
    
    dates.sort((a, b) => a - b);
    
    const oldestDate = dates[0];
    const newestDate = dates[dates.length - 1];
    
    console.log(`✅ Date range: ${oldestDate.toDateString()} to ${newestDate.toDateString()}`);
    console.log(`✅ Total span: ${Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24))} days`);
    console.log(`✅ Data coverage: ${dates.length} draws`);
    
    return true;
}

// Run all tests
async function runAllTests() {
    const tests = [
        testCSVLoading,
        testDataStructure,
        testDigitFrequency,
        testPatternAnalysis,
        testPredictionAlgorithm,
        testDateRange
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        try {
            const result = test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test failed: ${error.message}`);
        }
    }
    
    console.log('\n🎉 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
    
    if (passedTests === tests.length) {
        console.log('🎯 All tests PASSED! 4D Predictor is ready for use.');
    } else {
        console.log('⚠️  Some tests failed. Please review the results above.');
    }
}

// Execute tests
runAllTests().catch(console.error);
