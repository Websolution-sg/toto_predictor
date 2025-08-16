// Comprehensive File Validation - Check all critical files
const fs = require('fs');
const path = require('path');

async function validateAllFiles() {
    console.log('🔍 COMPREHENSIVE FILE VALIDATION');
    console.log('=================================\n');
    
    const issues = [];
    const warnings = [];
    
    // 1. Check CSV File
    console.log('1️⃣ Validating totoResult.csv...');
    try {
        const csvPath = path.join(__dirname, 'totoResult.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log(`   📄 CSV has ${lines.length} lines`);
        
        // Check for invalid entries
        let invalidCount = 0;
        let duplicateCount = 0;
        const seenEntries = new Set();
        
        lines.forEach((line, index) => {
            const numbers = line.split(',').map(n => parseInt(n.trim()));
            
            // Check if line is valid
            if (numbers.length < 6 || numbers.length > 7) {
                invalidCount++;
                issues.push(`   ❌ Line ${index + 1}: Invalid number count (${numbers.length})`);
                return;
            }
            
            // Check number ranges
            const invalidNumbers = numbers.filter(n => isNaN(n) || n < 1 || n > 49);
            if (invalidNumbers.length > 0) {
                invalidCount++;
                issues.push(`   ❌ Line ${index + 1}: Invalid numbers ${invalidNumbers.join(', ')}`);
                return;
            }
            
            // Check for duplicates in main numbers
            const mainNumbers = numbers.slice(0, 6);
            const unique = [...new Set(mainNumbers)];
            if (unique.length !== 6) {
                invalidCount++;
                issues.push(`   ❌ Line ${index + 1}: Duplicate main numbers`);
                return;
            }
            
            // Check for duplicate entries
            const entryKey = mainNumbers.sort((a, b) => a - b).join(',');
            if (seenEntries.has(entryKey)) {
                duplicateCount++;
                warnings.push(`   ⚠️  Line ${index + 1}: Duplicate entry`);
            }
            seenEntries.add(entryKey);
            
            // Check first line specifically
            if (index === 0) {
                const firstLine = numbers.join(',');
                if (firstLine === '10,8,15,15,15,15,15') {
                    issues.push(`   ❌ Line 1: Invalid test data (repeated 15s)`);
                }
            }
        });
        
        if (invalidCount === 0 && duplicateCount === 0) {
            console.log('   ✅ CSV structure is valid');
        } else {
            console.log(`   ⚠️  Found ${invalidCount} invalid lines, ${duplicateCount} duplicates`);
        }
        
    } catch (error) {
        issues.push(`   ❌ CSV Error: ${error.message}`);
    }
    
    // 2. Check Main Script
    console.log('\n2️⃣ Validating updateTotoCSV.cjs...');
    try {
        const scriptPath = path.join(__dirname, 'updateTotoCSV.cjs');
        
        if (!fs.existsSync(scriptPath)) {
            issues.push('   ❌ updateTotoCSV.cjs not found');
        } else {
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for syntax issues
            const syntaxChecks = [
                { pattern: /\]\s*;\s*$/, description: 'Dangling array brackets' },
                { pattern: /\}\s*\]\s*;/, description: 'Malformed array/object syntax' },
                { pattern: /const.*const/, description: 'Duplicate const declarations' },
                { pattern: /22.*25.*29.*31.*34.*43/g, description: 'Hard-coded TOTO numbers' }
            ];
            
            syntaxChecks.forEach(check => {
                const matches = scriptContent.match(check.pattern);
                if (matches) {
                    if (check.description === 'Hard-coded TOTO numbers') {
                        warnings.push(`   ⚠️  Found ${matches.length} instances of ${check.description}`);
                    } else {
                        issues.push(`   ❌ Syntax issue: ${check.description}`);
                    }
                }
            });
            
            // Check for required functions
            const requiredFunctions = [
                'fetchLatestTotoResult',
                'validateTotoNumbers',
                'updateCSV'
            ];
            
            requiredFunctions.forEach(func => {
                if (!scriptContent.includes(func)) {
                    issues.push(`   ❌ Missing function: ${func}`);
                } else {
                    console.log(`   ✅ Function found: ${func}`);
                }
            });
            
            // Check for exports
            if (!scriptContent.includes('module.exports')) {
                warnings.push('   ⚠️  No module.exports found');
            }
        }
        
    } catch (error) {
        issues.push(`   ❌ Script Error: ${error.message}`);
    }
    
    // 3. Check Package.json
    console.log('\n3️⃣ Validating package.json...');
    try {
        const packagePath = path.join(__dirname, 'package.json');
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check dependencies
        const requiredDeps = ['node-fetch', 'cheerio'];
        const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        requiredDeps.forEach(dep => {
            if (deps[dep]) {
                console.log(`   ✅ Dependency found: ${dep}@${deps[dep]}`);
            } else {
                issues.push(`   ❌ Missing dependency: ${dep}`);
            }
        });
        
        // Check scripts
        if (packageContent.scripts && packageContent.scripts['fetch-results']) {
            console.log('   ✅ fetch-results script configured');
        } else {
            warnings.push('   ⚠️  fetch-results script not configured');
        }
        
    } catch (error) {
        issues.push(`   ❌ Package.json Error: ${error.message}`);
    }
    
    // 4. Check GitHub Workflow
    console.log('\n4️⃣ Validating GitHub Actions workflow...');
    try {
        const workflowPath = path.join(__dirname, '.github', 'workflows', 'update-toto.yml');
        
        if (!fs.existsSync(workflowPath)) {
            issues.push('   ❌ GitHub workflow file not found');
        } else {
            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            
            // Check key elements
            const checks = [
                { pattern: /schedule:/, description: 'Schedule configuration' },
                { pattern: /workflow_dispatch:/, description: 'Manual trigger' },
                { pattern: /node updateTotoCSV\.cjs/, description: 'Script execution' },
                { pattern: /git add.*git commit.*git push/s, description: 'Git operations' }
            ];
            
            checks.forEach(check => {
                if (workflowContent.includes(check.pattern) || workflowContent.match(check.pattern)) {
                    console.log(`   ✅ ${check.description} found`);
                } else {
                    warnings.push(`   ⚠️  ${check.description} may be missing`);
                }
            });
        }
        
    } catch (error) {
        issues.push(`   ❌ Workflow Error: ${error.message}`);
    }
    
    // 5. Summary Report
    console.log('\n🏁 VALIDATION SUMMARY');
    console.log('====================');
    
    if (issues.length === 0 && warnings.length === 0) {
        console.log('✅ ALL FILES ARE CORRECT AND WORKING PROPERLY!');
        console.log('🎯 Your TOTO predictor is ready for production use.');
        return true;
    }
    
    if (issues.length > 0) {
        console.log(`\n❌ CRITICAL ISSUES FOUND (${issues.length}):`);
        issues.forEach(issue => console.log(issue));
    }
    
    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
        warnings.forEach(warning => console.log(warning));
    }
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (issues.length > 0) {
        console.log('1. Fix critical issues first');
        console.log('2. Test script execution locally');
        console.log('3. Verify CSV data integrity');
    }
    if (warnings.length > 0) {
        console.log('4. Review warnings for potential improvements');
    }
    
    return issues.length === 0;
}

// Run validation
validateAllFiles().then(success => {
    if (success) {
        console.log('\n🚀 READY FOR DEPLOYMENT!');
    } else {
        console.log('\n🔧 FIXES NEEDED BEFORE DEPLOYMENT');
    }
}).catch(error => {
    console.error('💥 Validation failed:', error.message);
});
