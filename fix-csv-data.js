const fs = require('fs');
const path = require('path');

// Correct data from Singapore Pools
const correctData = [
    {
        draw: 5370,
        date: '2025-08-24',
        first: '9197',
        second: '2313',
        third: '3178',
        starter: ['4136', '5744', '6028', '6108', '6112', '6446', '7170', '8698', '9897', '9983'],
        consolation: ['1120', '3167', '6131', '6582', '6913', '8280', '8420', '9523', '9657', '9666']
    },
    {
        draw: 5369,
        date: '2025-08-23',
        first: '2250',
        second: '6325',
        third: '0963',
        starter: ['0297', '0721', '0759', '2136', '2807', '4877', '5486', '5583', '8575', '9399'],
        consolation: ['0300', '1056', '1330', '2354', '2870', '3128', '3762', '4234', '7566', '9185']
    },
    {
        draw: 5368,
        date: '2025-08-20',
        first: '0707',
        second: '4411',
        third: '9382',
        starter: ['0283', '3013', '3115', '3190', '3332', '4379', '6124', '6678', '7436', '8842'],
        consolation: ['1332', '2273', '2433', '4916', '6298', '7954', '8265', '8545', '8703', '8925']
    },
    {
        draw: 5367,
        date: '2025-08-17',
        first: '7477',
        second: '7066',
        third: '2520',
        starter: ['0546', '1411', '3164', '3705', '4201', '4649', '4807', '5728', '8437', '9746'],
        consolation: ['0726', '2459', '2734', '3056', '4490', '5098', '5203', '5811', '6828', '9522']
    },
    {
        draw: 5366,
        date: '2025-08-16',
        first: '4315',
        second: '2555',
        third: '5488',
        starter: ['1244', '3076', '4615', '5597', '5729', '5860', '7276', '7305', '8841', '9655'],
        consolation: ['1264', '2168', '2630', '2927', '4965', '5483', '6463', '7294', '8090', '9649']
    },
    {
        draw: 5365,
        date: '2025-08-13',
        first: '3380',
        second: '9757',
        third: '0537',
        starter: ['1957', '1973', '2278', '2636', '3178', '3967', '5090', '5165', '7503', '7986'],
        consolation: ['0759', '0782', '2899', '3875', '4339', '5490', '6048', '6793', '8574', '9177']
    }
];

function updateCSV() {
    const csvFile = '4dResult.csv';
    
    // Read existing CSV
    let csvContent = '';
    try {
        csvContent = fs.readFileSync(csvFile, 'utf8');
    } catch (error) {
        console.log('❌ Error reading CSV file:', error.message);
        return;
    }
    
    const lines = csvContent.split('\n');
    const header = lines[0];
    let dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log('🔍 Checking for data corrections needed...');
    
    // Update/add correct data
    correctData.forEach(correctRow => {
        const existingIndex = dataLines.findIndex(line => {
            const draw = line.split(',')[0];
            return parseInt(draw) === correctRow.draw;
        });
        
        const csvRow = [
            correctRow.draw,
            correctRow.date,
            correctRow.first,
            correctRow.second,
            correctRow.third,
            ...correctRow.starter,
            ...correctRow.consolation
        ].join(',');
        
        if (existingIndex >= 0) {
            const oldRow = dataLines[existingIndex];
            if (oldRow !== csvRow) {
                console.log(`🔧 Updating Draw ${correctRow.draw}: ${correctRow.date}`);
                console.log(`   Old: ${oldRow.substring(0, 50)}...`);
                console.log(`   New: ${csvRow.substring(0, 50)}...`);
                dataLines[existingIndex] = csvRow;
            }
        } else {
            console.log(`➕ Adding new Draw ${correctRow.draw}: ${correctRow.date}`);
            dataLines.unshift(csvRow); // Add at beginning
        }
    });
    
    // Sort by draw number (descending)
    dataLines.sort((a, b) => {
        const drawA = parseInt(a.split(',')[0]);
        const drawB = parseInt(b.split(',')[0]);
        return drawB - drawA;
    });
    
    // Write updated CSV
    const updatedContent = header + '\n' + dataLines.join('\n') + '\n';
    
    try {
        fs.writeFileSync(csvFile, updatedContent);
        console.log('✅ CSV file updated successfully!');
        console.log(`📊 Total records: ${dataLines.length}`);
        
        // Show first few records
        console.log('\n📋 Latest records:');
        dataLines.slice(0, 3).forEach(line => {
            const parts = line.split(',');
            console.log(`   Draw ${parts[0]} (${parts[1]}): ${parts[2]}, ${parts[3]}, ${parts[4]}`);
        });
        
    } catch (error) {
        console.log('❌ Error writing CSV file:', error.message);
    }
}

updateCSV();
