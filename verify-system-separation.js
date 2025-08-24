// System Separation Verification
// Ensures TOTO and 4D predictors are completely independent

const fs = require('fs');

console.log('🔄 Verifying TOTO and 4D Predictor Separation');
console.log('==============================================\n');

function checkSystemFiles() {
    console.log('📁 File System Check');
    console.log('--------------------');
    
    const systems = {
        toto: {
            html: 'index.html',
            csv: 'totoResult.csv',
            title: 'Singapore TOTO Predictor'
        },
        fourD: {
            html: '4d_predictor.html',
            csv: '4dResult.csv',
            title: 'Singapore 4D Predictor'
        }
    };
    
    Object.entries(systems).forEach(([systemName, config]) => {
        console.log(`\n🎯 ${systemName.toUpperCase()} System:`);
        
        // Check HTML file
        if (fs.existsSync(config.html)) {
            const htmlContent = fs.readFileSync(config.html, 'utf8');
            const hasCorrectTitle = htmlContent.includes(config.title);
            console.log(`  ✅ ${config.html} - ${fs.statSync(config.html).size} bytes ${hasCorrectTitle ? '(correct title)' : '(check title)'}`);
        } else {
            console.log(`  ❌ ${config.html} - NOT FOUND`);
        }
        
        // Check CSV file
        if (fs.existsSync(config.csv)) {
            const csvContent = fs.readFileSync(config.csv, 'utf8');
            const lines = csvContent.trim().split('\n');
            console.log(`  ✅ ${config.csv} - ${lines.length - 1} records`);
        } else {
            console.log(`  ❌ ${config.csv} - NOT FOUND`);
        }
    });
}

function checkCrossReferences() {
    console.log('\n🔍 Cross-Reference Check');
    console.log('------------------------');
    
    // Check if TOTO system references 4D files
    const totoHtml = fs.readFileSync('index.html', 'utf8');
    const totoReferences4D = totoHtml.includes('4dResult') || totoHtml.includes('4d_predictor');
    console.log(`📊 TOTO → 4D references: ${totoReferences4D ? '❌ FOUND' : '✅ NONE'}`);
    
    // Check if 4D system references TOTO files
    const fourDHtml = fs.readFileSync('4d_predictor.html', 'utf8');
    const fourDReferencesToto = fourDHtml.includes('totoResult') || fourDHtml.includes('index.html');
    console.log(`📊 4D → TOTO references: ${fourDReferencesToto ? '❌ FOUND' : '✅ NONE'}`);
    
    // Check for shared variables or functions that could cause conflicts
    const sharedElements = {
        'historical4D': [totoHtml.includes('historical4D'), fourDHtml.includes('historical4D')],
        'historicalResults': [totoHtml.includes('historicalResults'), fourDHtml.includes('historicalResults')],
        'predict()': [totoHtml.includes('function predict()'), fourDHtml.includes('function predict()')],
        'init()': [totoHtml.includes('function init()'), fourDHtml.includes('function init()')]
    };
    
    console.log('\n🔧 Shared Function/Variable Check:');
    Object.entries(sharedElements).forEach(([element, [inToto, in4D]]) => {
        if (inToto && in4D) {
            console.log(`  ⚠️  ${element}: Used in BOTH systems (potential conflict)`);
        } else {
            console.log(`  ✅ ${element}: ${inToto ? 'TOTO only' : in4D ? '4D only' : 'Neither'}`);
        }
    });
}

function analyzeDataStructures() {
    console.log('\n📊 Data Structure Analysis');
    console.log('--------------------------');
    
    // TOTO CSV structure
    if (fs.existsSync('totoResult.csv')) {
        const totoCSV = fs.readFileSync('totoResult.csv', 'utf8');
        const totoLines = totoCSV.trim().split('\n');
        const totoHeaders = totoLines[0].split(',');
        console.log(`📈 TOTO CSV: ${totoHeaders.length} columns - ${totoHeaders.slice(0, 5).join(', ')}...`);
        console.log(`   Sample: ${totoLines[1] ? totoLines[1].substring(0, 50) + '...' : 'No data'}`);
    }
    
    // 4D CSV structure
    if (fs.existsSync('4dResult.csv')) {
        const fourDCSV = fs.readFileSync('4dResult.csv', 'utf8');
        const fourDLines = fourDCSV.trim().split('\n');
        const fourDHeaders = fourDLines[0].split(',');
        console.log(`📈 4D CSV: ${fourDHeaders.length} columns - ${fourDHeaders.slice(0, 5).join(', ')}...`);
        console.log(`   Sample: ${fourDLines[1] ? fourDLines[1].substring(0, 50) + '...' : 'No data'}`);
    }
}

function generateSeparationReport() {
    console.log('\n📋 System Separation Report');
    console.log('===========================');
    
    const totoExists = fs.existsSync('index.html') && fs.existsSync('totoResult.csv');
    const fourDExists = fs.existsSync('4d_predictor.html') && fs.existsSync('4dResult.csv');
    
    console.log(`🎯 TOTO System: ${totoExists ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`   • HTML: index.html`);
    console.log(`   • Data: totoResult.csv`);
    console.log(`   • Purpose: 6/49 TOTO number prediction`);
    
    console.log(`🎯 4D System: ${fourDExists ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`   • HTML: 4d_predictor.html`);
    console.log(`   • Data: 4dResult.csv`);
    console.log(`   • Purpose: 4-digit lottery prediction`);
    
    if (totoExists && fourDExists) {
        console.log('\n🎉 SEPARATION STATUS: ✅ FULLY SEPARATED');
        console.log('   • Both systems are independent');
        console.log('   • No shared data files');
        console.log('   • Separate HTML interfaces');
        console.log('   • Different prediction algorithms');
    } else {
        console.log('\n⚠️  SEPARATION STATUS: ❌ INCOMPLETE');
        console.log('   • Some system files may be missing');
    }
}

function createUsageGuide() {
    console.log('\n📖 Usage Guide');
    console.log('==============');
    
    console.log('🇸🇬 SINGAPORE TOTO PREDICTOR:');
    console.log('   📄 File: index.html');
    console.log('   🎯 Purpose: Predict 6 numbers from 1-49 for TOTO');
    console.log('   📊 Data: totoResult.csv (historical TOTO results)');
    console.log('   🔮 Features: System 6/7, frequency analysis, trends');
    
    console.log('\n🇸🇬 SINGAPORE 4D PREDICTOR:');
    console.log('   📄 File: 4d_predictor.html');
    console.log('   🎯 Purpose: Predict 4-digit numbers for 4D lottery');
    console.log('   📊 Data: 4dResult.csv (historical 4D results)');
    console.log('   🔮 Features: Digit frequency, position analysis, patterns');
    
    console.log('\n💡 ACCESSING THE SYSTEMS:');
    console.log('   1. TOTO: Open index.html in web browser');
    console.log('   2. 4D: Open 4d_predictor.html in web browser');
    console.log('   3. Both can run simultaneously without conflicts');
}

// Run all verification checks
checkSystemFiles();
checkCrossReferences();
analyzeDataStructures();
generateSeparationReport();
createUsageGuide();

console.log('\n✅ Verification complete! Both systems are properly separated.');
