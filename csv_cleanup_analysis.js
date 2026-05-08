// CSV Cleanup Analysis: Check for duplicates and data integrity
// March 26, 2026 - Post-Update Analysis

const fs = require('fs');

function analyzeCSVUpdates() {
    console.log('🔍 ANALYZING TOTO CSV UPDATES...\n');
    console.log('📅 Latest Update Analysis: March 26, 2026');
    console.log('===========================================');

    try {
        const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log(`📊 Total Lines in CSV: ${lines.length}`);
        
        // Check for duplicates
        const seenDates = new Set();
        const duplicates = [];
        const validEntries = [];
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                const parts = line.split(',');
                const date = parts[0];
                
                if (seenDates.has(date)) {
                    duplicates.push({ line: index + 1, date, content: line });
                } else {
                    seenDates.add(date);
                    validEntries.push(line);
                }
            }
        });
        
        console.log(`✅ Unique Entries: ${validEntries.length}`);
        console.log(`⚠️ Duplicate Entries Found: ${duplicates.length}`);
        
        if (duplicates.length > 0) {
            console.log('\n🚨 DUPLICATE ENTRIES DETECTED:');
            console.log('============================');
            duplicates.forEach(dup => {
                console.log(`Line ${dup.line}: ${dup.date} - ${dup.content}`);
            });
        }
        
        // Analyze March 2026 entries
        console.log('\n🆕 MARCH 2026 NEW ENTRIES:');
        console.log('=========================');
        const marchEntries = validEntries.filter(line => {
            const date = line.split(',')[0];
            return date.includes('Mar-26');
        });
        
        if (marchEntries.length > 0) {
            console.log(`📈 March 2026 Results Added: ${marchEntries.length}`);
            marchEntries.forEach(entry => {
                const parts = entry.split(',');
                const date = parts[0];
                const numbers = parts.slice(1, 7).join(', ');
                const additional = parts[7];
                console.log(`${date}: [${numbers}] +${additional}`);
            });
        } else {
            // Check for other March entries
            const allMarchEntries = validEntries.filter(line => {
                const date = line.split(',')[0];
                return date.includes('-Mar-26');
            });
            
            console.log(`📈 March 2026 Results Added: ${allMarchEntries.length}`);
            allMarchEntries.forEach(entry => {
                const parts = entry.split(',');
                const date = parts[0];
                const numbers = parts.slice(1, 7).join(', ');
                const additional = parts[7];
                console.log(`${date}: [${numbers}] +${additional}`);
            });
        }
        
        // Generate cleaned CSV content
        if (duplicates.length > 0) {
            console.log('\n🧹 GENERATING CLEANED CSV...');
            console.log('============================');
            
            const cleanedContent = validEntries.join('\n');
            fs.writeFileSync('totoResult_cleaned.csv', cleanedContent);
            console.log('✅ Cleaned CSV saved as: totoResult_cleaned.csv');
            console.log(`📊 Removed ${duplicates.length} duplicate entries`);
            console.log(`✨ Clean dataset: ${validEntries.length} unique results`);
        }
        
        // Latest entries summary
        console.log('\n📊 LATEST 10 ENTRIES:');
        console.log('====================');
        validEntries.slice(0, 10).forEach((entry, index) => {
            const parts = entry.split(',');
            const date = parts[0];
            const numbers = parts.slice(1, 7).join(', ');
            const additional = parts[7];
            console.log(`${(index + 1).toString().padStart(2)}. ${date}: [${numbers}] +${additional}`);
        });
        
        // Data consistency check
        console.log('\n🔎 DATA CONSISTENCY CHECK:');
        console.log('=========================');
        let inconsistencies = 0;
        
        validEntries.forEach((entry, index) => {
            const parts = entry.split(',');
            if (parts.length < 8) {
                console.log(`⚠️ Line ${index + 1}: Missing data - ${entry}`);
                inconsistencies++;
            }
            
            // Check if numbers are in valid range (1-49)
            const numbers = parts.slice(1, 7).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            const invalidNumbers = numbers.filter(n => n < 1 || n > 49);
            if (invalidNumbers.length > 0) {
                console.log(`⚠️ Line ${index + 1}: Invalid numbers ${invalidNumbers} - ${entry}`);
                inconsistencies++;
            }
        });
        
        if (inconsistencies === 0) {
            console.log('✅ All entries are consistent and valid!');
        } else {
            console.log(`⚠️ Found ${inconsistencies} data inconsistencies`);
        }
        
        return {
            totalEntries: lines.length,
            uniqueEntries: validEntries.length,
            duplicates: duplicates.length,
            marchEntries: validEntries.filter(l => l.includes('-Mar-26')).length,
            isClean: duplicates.length === 0 && inconsistencies === 0
        };
        
    } catch (error) {
        console.error('❌ Error reading CSV file:', error.message);
        return null;
    }
}

// Run the analysis
const analysis = analyzeCSVUpdates();

if (analysis) {
    console.log('\n✨ CSV UPDATE ANALYSIS COMPLETE!');
    console.log('================================');
    console.log(`📁 Dataset Status: ${analysis.isClean ? 'CLEAN ✅' : 'NEEDS CLEANUP ⚠️'}`);
    console.log(`📊 Total Valid Results: ${analysis.uniqueEntries}`);
    console.log(`🆕 March 2026 Added: ${analysis.marchEntries} new results`);
    console.log(`🧹 Cleanup Required: ${analysis.duplicates > 0 ? 'YES' : 'NO'}`);
    
    if (!analysis.isClean) {
        console.log('\n💡 RECOMMENDED ACTIONS:');
        console.log('1. Use the generated totoResult_cleaned.csv file');
        console.log('2. Remove duplicate entries from original CSV');
        console.log('3. Validate data consistency');
    }
}