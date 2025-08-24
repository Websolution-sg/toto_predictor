const fs = require('fs');

function sortCSV() {
    const csvFile = '4dResult.csv';
    
    // Read CSV file
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0];
    let dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log('🔄 Sorting CSV by draw number (descending)...');
    
    // Sort by draw number (descending)
    dataLines.sort((a, b) => {
        const drawA = parseInt(a.split(',')[0]);
        const drawB = parseInt(b.split(',')[0]);
        return drawB - drawA;
    });
    
    // Write sorted CSV
    const sortedContent = header + '\n' + dataLines.join('\n') + '\n';
    fs.writeFileSync(csvFile, sortedContent);
    
    console.log('✅ CSV file sorted successfully!');
    console.log(`📊 Total records: ${dataLines.length}`);
    
    // Show first few records to verify
    console.log('\n📋 Latest records:');
    dataLines.slice(0, 5).forEach(line => {
        const parts = line.split(',');
        console.log(`   Draw ${parts[0]} (${parts[1]}): ${parts[2]}, ${parts[3]}, ${parts[4]}`);
    });
}

sortCSV();
