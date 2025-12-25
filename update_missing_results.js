const fs = require('fs');
const https = require('https');

// Known latest result from Singapore Pools (Dec 22, 2025)
const knownLatestResult = {
    date: '22-Dec-25',
    numbers: [4, 5, 13, 22, 24, 30],
    additional: 36
};

function readCSVData() {
    try {
        const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
        const lines = csvContent.trim().split('\n');
        const header = lines[0];
        const data = lines.slice(1).map(line => {
            const parts = line.split(',');
            return {
                date: parts[0],
                numbers: [
                    parseInt(parts[1]),
                    parseInt(parts[2]),
                    parseInt(parts[3]),
                    parseInt(parts[4]),
                    parseInt(parts[5]),
                    parseInt(parts[6])
                ],
                additional: parseInt(parts[7])
            };
        });
        return { header, data };
    } catch (error) {
        console.error('Error reading CSV:', error.message);
        return null;
    }
}

function getLastDate(csvData) {
    if (!csvData || csvData.data.length === 0) return null;
    return csvData.data[csvData.data.length - 1].date;
}

function parseDateString(dateStr) {
    // Handle format like "5-Sept-24" or "22-Dec-25"
    const parts = dateStr.split('-');
    const day = parseInt(parts[0]);
    let month, year;
    
    if (parts[1].length > 3) {
        // Month name format like "Sept"
        const monthNames = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sept': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        month = monthNames[parts[1]];
    } else {
        // Month abbreviation format like "Dec"
        const monthNames = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        month = monthNames[parts[1]];
    }
    
    year = parseInt(parts[2]);
    // Convert 2-digit year to 4-digit
    if (year < 50) {
        year += 2000;
    } else if (year < 100) {
        year += 1900;
    }
    
    return new Date(year, month, day);
}

function formatDate(date) {
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

function getMissingDates(lastDate, knownLatestDate) {
    const missing = [];
    const start = parseDateString(lastDate);
    const end = parseDateString(knownLatestDate);
    
    console.log(`\n📅 Checking for missing draws between ${lastDate} and ${knownLatestDate}`);
    
    // TOTO draws are typically on Monday, Thursday, and Sunday
    const drawDays = [1, 4, 0]; // Monday=1, Thursday=4, Sunday=0
    
    const current = new Date(start);
    current.setDate(current.getDate() + 1); // Start from the day after last CSV date
    
    while (current <= end) {
        if (drawDays.includes(current.getDay())) {
            missing.push(formatDate(current));
        }
        current.setDate(current.getDate() + 1);
    }
    
    return missing;
}

function appendToCSV(newResults) {
    if (newResults.length === 0) {
        console.log('✅ No new results to add');
        return;
    }
    
    try {
        let csvContent = '';
        newResults.forEach(result => {
            const line = `${result.date},${result.numbers.join(',')},${result.additional}`;
            csvContent += line + '\n';
        });
        
        fs.appendFileSync('totoResult.csv', csvContent);
        console.log(`✅ Added ${newResults.length} new result(s) to CSV`);
    } catch (error) {
        console.error('❌ Error appending to CSV:', error.message);
    }
}

function main() {
    console.log('🎯 TOTO Missing Results Updater');
    console.log('================================\n');
    
    // Read current CSV data
    const csvData = readCSVData();
    if (!csvData) {
        console.log('❌ Failed to read CSV data');
        return;
    }
    
    console.log(`📊 Current CSV contains ${csvData.data.length} results`);
    
    const lastDate = getLastDate(csvData);
    console.log(`📅 Last date in CSV: ${lastDate}`);
    
    // Get missing dates
    const missingDates = getMissingDates(lastDate, knownLatestResult.date);
    
    if (missingDates.length === 0) {
        console.log('✅ CSV is up to date - no missing draws found');
        return;
    }
    
    console.log(`\n🔍 Found ${missingDates.length} potentially missing draw dates:`);
    missingDates.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date}`);
    });
    
    // For now, we can only add the known latest result (Dec 22, 2025)
    const resultsToAdd = [];
    
    if (missingDates.includes(knownLatestResult.date)) {
        console.log(`\n✅ Adding confirmed result for ${knownLatestResult.date}`);
        resultsToAdd.push(knownLatestResult);
        
        console.log(`   Numbers: [${knownLatestResult.numbers.join(', ')}]`);
        console.log(`   Additional: ${knownLatestResult.additional}`);
    }
    
    // Check if there are other missing dates we need results for
    const otherMissingDates = missingDates.filter(date => date !== knownLatestResult.date);
    
    if (otherMissingDates.length > 0) {
        console.log(`\n⚠️  Still need results for ${otherMissingDates.length} other dates:`);
        otherMissingDates.forEach((date, index) => {
            console.log(`   ${index + 1}. ${date}`);
        });
        console.log('\n💡 These results need to be manually obtained from Singapore Pools or other sources.');
    }
    
    // Add the results we have
    if (resultsToAdd.length > 0) {
        appendToCSV(resultsToAdd);
        
        console.log('\n🎉 Update Summary:');
        console.log(`   - Added ${resultsToAdd.length} new result(s)`);
        console.log(`   - CSV now has ${csvData.data.length + resultsToAdd.length} total results`);
        
        if (otherMissingDates.length > 0) {
            console.log(`   - Still missing ${otherMissingDates.length} result(s)`);
        } else {
            console.log('   - CSV is now fully up to date! ✅');
        }
    }
    
    console.log('\n📋 Next Steps:');
    if (otherMissingDates.length > 0) {
        console.log('   1. Manually check Singapore Pools for missing dates');
        console.log('   2. Add any found results to the CSV');
        console.log('   3. Re-run this script to verify completeness');
    } else {
        console.log('   1. Your CSV is fully updated!');
        console.log('   2. You can now generate new predictions with complete data');
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    readCSVData,
    getLastDate,
    getMissingDates,
    appendToCSV
};