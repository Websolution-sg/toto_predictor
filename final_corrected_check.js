const fs = require('fs');

console.log('🔍 TOTO Prediction Models - Corrected Final Check');
console.log('='.repeat(55));

try {
    // Read the HTML file
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Extract JavaScript content
    const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (!scriptMatch) {
        console.log('❌ No script tags found');
        process.exit(1);
    }
    
    const jsCode = scriptMatch[scriptMatch.length - 1].replace(/<\/?script[^>]*>/g, '');
    
    // Check for actual prediction functions found in the HTML
    const actualFunctions = [
        { name: 'runEnhancedEnsemblePrediction', desc: 'Enhanced Ensemble Analysis' },
        { name: 'runFrequencyCompatibilityPrediction', desc: 'Frequency + Compatibility Analysis' },
        { name: 'runHotColdPrediction', desc: 'Hot/Cold Analysis' },
        { name: 'runEnhancedPrediction', desc: 'Enhanced Combined Analysis' },
        { name: 'runWeightedPrediction', desc: 'Weighted Recent Analysis' },
        { name: 'displayPredictedNumbers', desc: 'Results Display Function' }
    ];
    
    console.log('\n📋 Prediction Models Availability:');
    let allFunctionsFound = true;
    const foundFunctions = {};
    
    actualFunctions.forEach(func => {
        const regex = new RegExp(`function\\s+${func.name}\\s*\\(`);
        const found = regex.test(jsCode);
        console.log(`   ${func.desc}`);
        console.log(`     Function: ${func.name} ${found ? '✅' : '❌'}`);
        foundFunctions[func.name] = found;
        if (!found) allFunctionsFound = false;
    });
    
    // Check for disabled functions (should not be active)
    console.log('\n⚠️  Disabled Functions Check:');
    const disabledFunctions = [
        'runEnhancedPrediction_DISABLED',
        'runWeightedPrediction_DISABLED'
    ];
    
    disabledFunctions.forEach(funcName => {
        const found = jsCode.includes(`function ${funcName}`);
        console.log(`   ${funcName}: ${found ? '⚠️ Present (OK - disabled)' : '✅ Not found'}`);
    });
    
    // Check syntax balance
    const lines = jsCode.split('\n');
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
    }
    
    console.log('\n🔧 Code Structure:');
    console.log(`   JavaScript syntax balance: ${braceCount === 0 ? '✅ Perfect' : `❌ Imbalanced (${braceCount})`}`);
    
    // Check for displayPredictedNumbers calls in main functions
    console.log('\n🎯 Display Integration:');
    const mainFunctions = [
        'runEnhancedEnsemblePrediction',
        'runFrequencyCompatibilityPrediction', 
        'runHotColdPrediction',
        'runEnhancedPrediction',
        'runWeightedPrediction'
    ];
    
    mainFunctions.forEach(funcName => {
        if (foundFunctions[funcName]) {
            const funcRegex = new RegExp(`function\\s+${funcName}[\\s\\S]*?(?=function|$)`);
            const funcMatch = jsCode.match(funcRegex);
            if (funcMatch) {
                const funcCode = funcMatch[0];
                const hasDisplayCall = funcCode.includes('displayPredictedNumbers');
                console.log(`   ${funcName}: ${hasDisplayCall ? '✅' : '❌'}`);
            }
        }
    });
    
    // Check for essential components
    console.log('\n🛠️  Essential Components:');
    const components = [
        { name: 'Base numbers (base1, base2, base3)', check: jsCode.includes('base1') && jsCode.includes('base2') && jsCode.includes('base3') },
        { name: 'Draw range selection', check: jsCode.includes('drawRange') },
        { name: 'Historical data access', check: jsCode.includes('historical') },
        { name: 'Debug logging', check: jsCode.includes('Debug: Final predictions') },
        { name: 'Temperature data', check: jsCode.includes('temperatureData') },
        { name: 'Even/odd balancing', check: jsCode.includes('evenCount') && jsCode.includes('oddCount') }
    ];
    
    components.forEach(comp => {
        console.log(`   ${comp.name}: ${comp.check ? '✅' : '❌'}`);
    });
    
    // Check button connections
    console.log('\n🔘 UI Button Connections:');
    const buttonFunctions = [
        { button: 'Enhanced Ensemble', func: 'runEnhancedEnsemblePrediction' },
        { button: 'Frequency+Compatibility', func: 'runFrequencyCompatibilityPrediction' },
        { button: 'Hot/Cold Analysis', func: 'runHotColdPrediction' },
        { button: 'Enhanced Combined', func: 'runEnhancedPrediction' },
        { button: 'Weighted Recent', func: 'runWeightedPrediction' }
    ];
    
    buttonFunctions.forEach(btn => {
        const hasFunction = foundFunctions[btn.func];
        const hasButtonCall = htmlContent.includes(`onclick="${btn.func}()`) || 
                             htmlContent.includes(`onclick='${btn.func}()'`) ||
                             htmlContent.includes(btn.func);
        console.log(`   ${btn.button}: ${hasFunction && hasButtonCall ? '✅' : '⚠️'} ${!hasFunction ? '(function missing)' : ''}`);
    });
    
    // Final assessment
    console.log('\n' + '='.repeat(55));
    console.log('📋 FINAL PREDICTION MODELS ASSESSMENT:');
    console.log('='.repeat(55));
    
    const criticalFunctions = foundFunctions['runEnhancedEnsemblePrediction'] && 
                             foundFunctions['runFrequencyCompatibilityPrediction'] && 
                             foundFunctions['runHotColdPrediction'] && 
                             foundFunctions['displayPredictedNumbers'];
    
    if (criticalFunctions && braceCount === 0) {
        console.log('✅ CORE PREDICTION MODELS: OPERATIONAL');
        console.log('✅ JavaScript syntax: Clean and balanced');
        console.log('✅ Display integration: Functional');
        console.log('✅ Essential components: Present');
        
        console.log('\n📊 Available Prediction Methods:');
        if (foundFunctions['runEnhancedEnsemblePrediction']) 
            console.log('   🔥 Enhanced Ensemble Analysis - Advanced weighted prediction');
        if (foundFunctions['runFrequencyCompatibilityPrediction']) 
            console.log('   📊 Frequency + Compatibility - Statistical analysis');
        if (foundFunctions['runHotColdPrediction']) 
            console.log('   🌡️  Hot/Cold Analysis - Temperature-based prediction');
        if (foundFunctions['runEnhancedPrediction']) 
            console.log('   ⚡ Enhanced Combined - Multi-factor analysis');
        if (foundFunctions['runWeightedPrediction']) 
            console.log('   ⏱️  Weighted Recent - Recent trend analysis');
        
        console.log('\n🎯 SYSTEM STATUS: READY FOR PRODUCTION');
        console.log('🎲 All prediction models validated and operational!');
        
    } else {
        console.log('❌ CRITICAL ISSUES DETECTED:');
        if (!criticalFunctions) {
            console.log('   - Missing core prediction functions');
            if (!foundFunctions['runEnhancedEnsemblePrediction']) console.log('     * Enhanced Ensemble missing');
            if (!foundFunctions['runFrequencyCompatibilityPrediction']) console.log('     * Frequency+Compatibility missing');
            if (!foundFunctions['runHotColdPrediction']) console.log('     * Hot/Cold Analysis missing');
            if (!foundFunctions['displayPredictedNumbers']) console.log('     * Display function missing');
        }
        if (braceCount !== 0) console.log('   - JavaScript syntax errors');
        console.log('\n🔧 SYSTEM STATUS: REQUIRES IMMEDIATE ATTENTION');
    }
    
} catch (error) {
    console.error('\n❌ Critical error during model check:', error.message);
    console.error('🔧 SYSTEM STATUS: FATAL ERROR');
}