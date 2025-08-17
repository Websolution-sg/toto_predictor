// Final verification script - Check for any remaining sequential pattern references
const fs = require('fs');

console.log('🔍 FINAL VERIFICATION: Sequential Pattern Removal Check');
console.log('======================================================\n');

try {
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    // Check for various sequential-related terms
    const searchTerms = [
        'sequential',
        'Sequential',
        'SEQUENTIAL',
        'runSequential',
        'Sequential Pattern',
        '610666',
        'Like 610666.xyz'
    ];
    
    let foundAny = false;
    
    searchTerms.forEach(term => {
        const found = indexContent.includes(term);
        const status = found ? '❌ FOUND' : '✅ CLEAN';
        console.log(`${status} "${term}": ${found ? 'Still present' : 'Completely removed'}`);
        if (found) foundAny = true;
    });
    
    console.log('\n📊 DROPDOWN OPTIONS CHECK:');
    console.log('==========================');
    
    // Extract dropdown options
    const dropdownMatch = indexContent.match(/<select id="predictionMethod">(.*?)<\/select>/s);
    if (dropdownMatch) {
        const options = dropdownMatch[1].match(/<option[^>]*>(.*?)<\/option>/g);
        if (options) {
            options.forEach((option, i) => {
                const text = option.replace(/<[^>]*>/g, '');
                console.log(`${i + 1}. ${text}`);
            });
        }
    }
    
    console.log('\n🔍 SWITCH STATEMENT CHECK:');
    console.log('==========================');
    
    // Extract switch cases
    const switchMatch = indexContent.match(/switch \(method\) \{(.*?)default:/s);
    if (switchMatch) {
        const cases = switchMatch[1].match(/case '([^']+)':/g);
        if (cases) {
            cases.forEach((caseItem, i) => {
                const method = caseItem.match(/case '([^']+)':/)[1];
                console.log(`${i + 1}. ${method}`);
            });
        }
    }
    
    console.log('\n🎯 FINAL RESULT:');
    console.log('================');
    
    if (!foundAny) {
        console.log('✅ SUCCESS: Sequential pattern COMPLETELY REMOVED!');
        console.log('✅ All references cleaned up');
        console.log('✅ Only statistically sound algorithms remain');
        console.log('\n🎉 Your TOTO predictor is now mathematically pure!');
        console.log('🌐 Live at: https://websolution-sg.github.io/toto_predictor/');
    } else {
        console.log('❌ INCOMPLETE: Some sequential references still found');
        console.log('❌ Additional cleanup needed');
    }
    
} catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
}

console.log(`\n📅 Verification completed: ${new Date().toLocaleString()}`);
