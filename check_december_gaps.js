const fs = require('fs');

function readCSVData() {
    try {
        const csvContent = fs.readFileSync('totoResult.csv', 'utf-8');
        const lines = csvContent.trim().split('\n');
        const data = lines.map(line => {
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
        return data;
    } catch (error) {
        console.error('Error reading CSV:', error.message);
        return null;
    }
}

function parseDateString(dateStr) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[0]);
    let month, year;
    
    const monthNames = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sept': 8, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    month = monthNames[parts[1]];
    
    year = parseInt(parts[2]);
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

function main() {
    console.log('🎯 TOTO CSV Analysis - December 2025 Gaps');
    console.log('==========================================\n');
    
    const csvData = readCSVData();
    if (!csvData) return;
    
    console.log(`📊 Total CSV entries: ${csvData.length}`);
    
    // Get December 2025 entries
    const dec2025Entries = csvData.filter(entry => entry.date.includes('-Dec-25'));
    
    console.log(`\n🎄 December 2025 TOTO Results Found:`);
    dec2025Entries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.date}: [${entry.numbers.join(', ')}] + ${entry.additional}`);
    });
    
    // Check for expected draw dates in December 2025
    const expectedDates = [];
    const startDate = new Date(2025, 11, 1); // Dec 1, 2025
    const endDate = new Date(2025, 11, 31);  // Dec 31, 2025
    
    // TOTO draws are on Monday (1), Thursday (4), and Sunday (0)
    const drawDays = [1, 4, 0];
    
    const current = new Date(startDate);
    while (current <= endDate) {
        if (drawDays.includes(current.getDay())) {
            expectedDates.push(formatDate(current));
        }
        current.setDate(current.getDate() + 1);
    }
    
    console.log(`\n📅 Expected December 2025 Draw Dates:`);
    expectedDates.forEach((date, index) => {
        const found = dec2025Entries.some(entry => entry.date === date);
        console.log(`   ${index + 1}. ${date} ${found ? '✅' : '❌'}`);
    });
    
    // Find missing dates
    const missingDates = expectedDates.filter(date => 
        !dec2025Entries.some(entry => entry.date === date)
    );
    
    if (missingDates.length === 0) {
        console.log('\n🎉 Great! All December 2025 draws are present in the CSV!');
    } else {
        console.log(`\n⚠️  Missing ${missingDates.length} December 2025 draw(s):`);
        missingDates.forEach((date, index) => {
            console.log(`   ${index + 1}. ${date}`);
        });
    }
    
    // Show most recent entries for context
    console.log('\n🔍 Most Recent CSV Entries:');
    const recent = csvData.slice(0, 10);
    recent.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.date}: [${entry.numbers.join(', ')}] + ${entry.additional}`);
    });
}

if (require.main === module) {
    main();
}