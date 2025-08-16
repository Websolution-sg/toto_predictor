// Workflow Test - Check latest fetch result
const { fetchLatestTotoResult, validateTotoNumbers } = require('./updateTotoCSV.cjs');
const fs = require('fs');
const path = require('path');

async function checkWorkflow() {
    console.log('🔍 CHECKING TOTO WORKFLOW');
    console.log('==========================\n');
    
    console.log('📊 Current Workflow Status:');
    console.log('1️⃣ Testing fetch functionality...');
    
    const startTime = Date.now();
    
    try {
        // Test the fetch function
        const result = await fetchLatestTotoResult();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️  Fetch completed in ${duration}ms\n`);
        
        if (result && result.length >= 6) {
            console.log('✅ WORKFLOW STATUS: WORKING');
            console.log('🎯 LATEST FETCH RESULT:');
            console.log('========================');
            console.log(`📋 Main Numbers: ${result.slice(0, 6).join(', ')}`);
            
            if (result[6]) {
                console.log(`➕ Additional Number: ${result[6]}`);
            }
            
            console.log(`📊 Full Result: [${result.join(', ')}]`);
            
            // Validate the result
            const isValid = validateTotoNumbers(result);
            console.log(`✅ Validation: ${isValid ? 'PASSED' : 'FAILED'}`);
            
            if (isValid) {
                // Check if this is a new result
                const csvPath = path.join(__dirname, 'totoResult.csv');
                const csvContent = fs.readFileSync(csvPath, 'utf8');
                const newLine = result.slice(0, 6).join(',') + (result[6] ? ',' + result[6] : '');
                
                const isNew = !csvContent.includes(newLine);
                console.log(`🔄 Result Status: ${isNew ? 'NEW (will be added to CSV)' : 'EXISTING (already in CSV)'}`);
                
                // Show validation details
                console.log('\n🔍 RESULT ANALYSIS:');
                console.log('===================');
                
                const mainNumbers = result.slice(0, 6);
                const sorted = [...mainNumbers].sort((a, b) => a - b);
                const range = sorted[5] - sorted[0];
                const lowCount = mainNumbers.filter(n => n <= 25).length;
                const highCount = mainNumbers.filter(n => n > 25).length;
                
                console.log(`📈 Number Range: ${sorted[0]} - ${sorted[5]} (spread: ${range})`);
                console.log(`📊 Distribution: ${lowCount} low (≤25), ${highCount} high (>25)`);
                console.log(`🎯 Numbers Sorted: ${sorted.join(', ')}`);
                
                return result;
            } else {
                console.log('❌ WORKFLOW ISSUE: Fetched result failed validation');
                return null;
            }
            
        } else {
            console.log('❌ WORKFLOW STATUS: FAILED');
            console.log('💥 ISSUE: No valid result returned from fetch');
            console.log(`📝 Raw result: ${result}`);
            
            console.log('\n🔧 TROUBLESHOOTING:');
            console.log('===================');
            console.log('1. Check internet connection');
            console.log('2. Verify Singapore Pools website is accessible');
            console.log('3. Check if website structure has changed');
            
            return null;
        }
        
    } catch (error) {
        console.log('❌ WORKFLOW STATUS: ERROR');
        console.log(`💥 Error: ${error.message}`);
        console.log(`📝 Stack: ${error.stack}`);
        return null;
    }
}

async function checkCSVStatus() {
    console.log('\n📄 CSV FILE STATUS:');
    console.log('===================');
    
    try {
        const csvPath = path.join(__dirname, 'totoResult.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log(`📊 Total entries: ${lines.length}`);
        console.log(`📋 Last 3 entries:`);
        
        const lastThree = lines.slice(-3);
        lastThree.forEach((line, i) => {
            console.log(`   ${lines.length - 2 + i}: ${line}`);
        });
        
        console.log(`📅 File last modified: ${fs.statSync(csvPath).mtime.toLocaleString()}`);
        
    } catch (error) {
        console.log(`❌ CSV Error: ${error.message}`);
    }
}

async function checkGitHubActionsReadiness() {
    console.log('\n🔧 GITHUB ACTIONS READINESS:');
    console.log('=============================');
    
    // Check workflow file
    const workflowPath = path.join(__dirname, '.github', 'workflows', 'update-toto.yml');
    
    if (fs.existsSync(workflowPath)) {
        console.log('✅ Workflow file exists');
        
        const workflowContent = fs.readFileSync(workflowPath, 'utf8');
        
        // Check key components
        const checks = [
            { pattern: /schedule.*cron/, check: 'Schedule configuration', expected: true },
            { pattern: /workflow_dispatch/, check: 'Manual trigger', expected: true },
            { pattern: /node updateTotoCSV\.cjs/, check: 'Script execution', expected: true },
            { pattern: /git.*commit.*git.*push/s, check: 'Git operations', expected: true }
        ];
        
        checks.forEach(({ pattern, check, expected }) => {
            const found = pattern.test(workflowContent);
            console.log(`${found === expected ? '✅' : '❌'} ${check}: ${found ? 'configured' : 'missing'}`);
        });
        
    } else {
        console.log('❌ Workflow file not found');
    }
    
    // Check dependencies
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        console.log('✅ Dependencies check:');
        console.log(`   node-fetch: ${deps['node-fetch'] || 'missing'}`);
        console.log(`   cheerio: ${deps['cheerio'] || 'missing'}`);
    }
}

// Run the comprehensive workflow check
async function main() {
    const result = await checkWorkflow();
    await checkCSVStatus();
    await checkGitHubActionsReadiness();
    
    console.log('\n🏁 WORKFLOW SUMMARY:');
    console.log('====================');
    
    if (result) {
        console.log('✅ WORKFLOW STATUS: FULLY FUNCTIONAL');
        console.log(`🎯 LATEST RESULT: [${result.join(', ')}]`);
        console.log('🚀 Ready for GitHub Actions automation');
    } else {
        console.log('❌ WORKFLOW STATUS: NEEDS ATTENTION');
        console.log('🔧 Check the issues above and retry');
    }
}

main().catch(console.error);
