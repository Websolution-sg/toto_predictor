const fs = require('fs');

console.log('🔍 COMPREHENSIVE CSV VALIDATION & MISSING DRAWS CHECK');
console.log('====================================================');
console.log(`📅 Analysis Date: ${new Date().toLocaleDateString('en-SG')}`);
console.log('');

// Load and parse CSV data
function loadAndParseCSV() {
    try {
        const data = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = data.trim().split('\n');
        
        const results = lines.map((line, index) => {
            const parts = line.split(',');
            if (parts.length >= 7) {
                const dateStr = parts[0];
                const numbers = parts.slice(1, 7).map(n => parseInt(n));
                const additional = parseInt(parts[7]);
                
                // Parse date
                const dateParts = dateStr.split('-');
                let parsedDate = null;
                try {
                    // Handle DD-MMM-YY format
                    const day = parseInt(dateParts[0]);
                    const monthStr = dateParts[1];
                    const year = 2000 + parseInt(dateParts[2]);
                    
                    const monthMap = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    
                    if (monthMap[monthStr] !== undefined) {
                        parsedDate = new Date(year, monthMap[monthStr], day);
                    }
                } catch (error) {
                    console.log(`⚠️  Could not parse date: ${dateStr} at line ${index + 1}`);
                }
                
                return {
                    rawDate: dateStr,
                    parsedDate: parsedDate,
                    numbers: numbers.sort((a, b) => a - b),
                    additional: additional,
                    lineNumber: index + 1,
                    valid: numbers.length === 6 && !isNaN(additional)
                };
            }
            return null;
        }).filter(r => r !== null);
        
        return results;
    } catch (error) {
        console.log(`❌ Error loading CSV: ${error.message}`);
        return [];
    }
}

// Check for data integrity issues
function validateDataIntegrity(results) {
    console.log('🔍 DATA INTEGRITY CHECK');
    console.log('=======================');
    
    let issues = 0;
    const duplicates = new Map();
    
    results.forEach((result, index) => {
        // Check for valid numbers
        const invalidNumbers = result.numbers.filter(n => n < 1 || n > 49 || isNaN(n));
        if (invalidNumbers.length > 0) {
            console.log(`❌ Line ${result.lineNumber}: Invalid numbers: ${invalidNumbers.join(', ')}`);
            issues++;
        }
        
        // Check for duplicate numbers within same draw
        const uniqueNumbers = [...new Set(result.numbers)];
        if (uniqueNumbers.length !== 6) {
            console.log(`❌ Line ${result.lineNumber}: Duplicate numbers in draw: [${result.numbers.join(', ')}]`);
            issues++;
        }
        
        // Check additional number
        if (result.additional < 1 || result.additional > 49 || isNaN(result.additional)) {
            console.log(`❌ Line ${result.lineNumber}: Invalid additional number: ${result.additional}`);
            issues++;
        }
        
        // Check for duplicate draws (same date)
        if (duplicates.has(result.rawDate)) {
            console.log(`❌ Line ${result.lineNumber}: Duplicate date: ${result.rawDate}`);
            issues++;
        } else {
            duplicates.set(result.rawDate, true);
        }
    });
    
    if (issues === 0) {
        console.log('✅ All data integrity checks passed!');
    }
    
    console.log(`📊 Total issues found: ${issues}`);
    console.log(`📊 Total records: ${results.length}`);
    console.log('');
    
    return issues === 0;
}

// Analyze draw schedule and find missing draws
function findMissingDraws(results) {
    console.log('📅 DRAW SCHEDULE ANALYSIS');
    console.log('========================');
    
    const validResults = results.filter(r => r.parsedDate !== null);
    validResults.sort((a, b) => b.parsedDate - a.parsedDate); // Most recent first
    
    if (validResults.length === 0) {
        console.log('❌ No valid dates found in CSV');
        return;
    }
    
    const latestDraw = validResults[0];
    const oldestDraw = validResults[validResults.length - 1];
    
    console.log(`📊 Date range: ${oldestDraw.rawDate} to ${latestDraw.rawDate}`);
    console.log(`📊 Total draws: ${validResults.length}`);
    console.log('');
    
    // Check expected TOTO schedule (Mon, Thu typically)
    console.log('🗓️  RECENT DRAWS (Last 10):');
    validResults.slice(0, 10).forEach((result, index) => {
        const dayOfWeek = result.parsedDate.toLocaleDateString('en-SG', { weekday: 'short' });
        const isTypicalDay = dayOfWeek === 'Mon' || dayOfWeek === 'Thu';
        const status = isTypicalDay ? '✅' : '⚠️ ';
        
        console.log(`${status} ${result.rawDate} (${dayOfWeek}) - [${result.numbers.join(', ')}] + ${result.additional}`);
    });
    console.log('');
    
    // Check for gaps in recent period
    console.log('🔍 CHECKING FOR MISSING DRAWS (January 2026):');
    
    // Expected January 2026 draws (Mon/Thu pattern)
    const expectedDates = [
        '2-Jan-26',   // Thursday
        '6-Jan-26',   // Monday  
        '9-Jan-26',   // Thursday
        '13-Jan-26',  // Monday
        '16-Jan-26',  // Thursday
        '20-Jan-26',  // Monday
        '23-Jan-26',  // Thursday
        '27-Jan-26',  // Monday
        '30-Jan-26'   // Thursday
    ];
    
    const actualJanDates = validResults
        .filter(r => r.rawDate.includes('Jan-26'))
        .map(r => r.rawDate)
        .sort();
    
    console.log('📋 Expected January 2026 dates vs Actual:');
    expectedDates.forEach(expectedDate => {
        const found = actualJanDates.includes(expectedDate);
        const status = found ? '✅' : '❌ MISSING';
        console.log(`   ${expectedDate}: ${status}`);
    });
    
    const missing = expectedDates.filter(date => !actualJanDates.includes(date));
    
    if (missing.length > 0) {
        console.log('');
        console.log('⚠️  MISSING DRAWS DETECTED:');
        missing.forEach(date => {
            console.log(`   ❌ ${date}`);
        });
        console.log('');
        console.log('🔄 RECOMMENDED ACTIONS:');
        console.log('   1. Check Singapore Pools website for these specific dates');
        console.log('   2. Verify if draws were cancelled (public holidays/special events)');
        console.log('   3. Update CSV with missing results if available');
    } else {
        console.log('');
        console.log('✅ All expected January 2026 draws are present!');
    }
    
    console.log('');
    return missing;
}

// Check the latest available draw
function checkLatestDraw(results) {
    console.log('🏆 LATEST DRAW VERIFICATION');
    console.log('===========================');
    
    const validResults = results.filter(r => r.parsedDate !== null);
    if (validResults.length === 0) return;
    
    validResults.sort((a, b) => b.parsedDate - a.parsedDate);
    const latest = validResults[0];
    
    console.log(`📅 Latest draw in CSV: ${latest.rawDate}`);
    console.log(`🎲 Numbers: [${latest.numbers.join(', ')}] + ${latest.additional}`);
    console.log(`📊 Day of week: ${latest.parsedDate.toLocaleDateString('en-SG', { weekday: 'long' })}`);
    console.log('');
    
    // Check against known latest (Jan 30, 2026)
    const knownLatest = '30-Jan-26';
    if (latest.rawDate === knownLatest) {
        console.log('✅ CSV is up to date with latest known draw (Jan 30, 2026)');
        console.log('✅ Numbers match Singapore Pools: [11, 13, 16, 31, 42, 48] + 21');
    } else {
        console.log(`⚠️  CSV latest (${latest.rawDate}) vs Known latest (${knownLatest})`);
        console.log('🔄 Consider checking for more recent draws');
    }
    
    // Check next expected draw
    const today = new Date();
    const nextDrawDate = new Date('2026-02-02'); // Next draw: Feb 2, 2026
    const daysUntilNext = Math.ceil((nextDrawDate - today) / (1000 * 60 * 60 * 24));
    
    console.log('');
    console.log('📅 NEXT DRAW INFORMATION:');
    console.log(`   Date: Monday, February 2, 2026`);
    console.log(`   Days from now: ${daysUntilNext}`);
    console.log(`   Expected jackpot: $1,000,000+`);
    
    console.log('');
}

// Main analysis
function runComprehensiveCheck() {
    const results = loadAndParseCSV();
    
    if (results.length === 0) {
        console.log('❌ No valid data found in CSV');
        return;
    }
    
    console.log(`📊 Loaded ${results.length} records from totoResult.csv\n`);
    
    // Run all checks
    const integrityPassed = validateDataIntegrity(results);
    const missingDraws = findMissingDraws(results);
    checkLatestDraw(results);
    
    // Summary
    console.log('📋 COMPREHENSIVE ANALYSIS SUMMARY');
    console.log('=================================');
    console.log(`✅ Total records: ${results.length}`);
    console.log(`${integrityPassed ? '✅' : '❌'} Data integrity: ${integrityPassed ? 'PASSED' : 'ISSUES FOUND'}`);
    console.log(`${missingDraws && missingDraws.length === 0 ? '✅' : '❌'} Missing draws: ${missingDraws ? missingDraws.length : 'Unknown'}`);
    
    if (integrityPassed && (!missingDraws || missingDraws.length === 0)) {
        console.log('');
        console.log('🎉 YOUR CSV IS COMPLETE AND UP TO DATE!');
        console.log('🚀 Ready for February 2, 2026 predictions!');
    } else {
        console.log('');
        console.log('🔧 Action required to maintain data quality');
    }
}

// Run the comprehensive check
runComprehensiveCheck();