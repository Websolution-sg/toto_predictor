// Dropdown Functionality Test
console.log('🔍 TESTING DROPDOWN FUNCTIONALITY');
console.log('=' .repeat(50));

// Test HTML structure first
const fs = require('fs');

function testDropdownStructure() {
    console.log('\n📋 TESTING DROPDOWN HTML STRUCTURE');
    
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf-8');
        
        // Check prediction method dropdown
        const predictionMethodRegex = /<select id="predictionMethod">([\s\S]*?)<\/select>/;
        const predictionMatch = htmlContent.match(predictionMethodRegex);
        
        if (predictionMatch) {
            console.log('✅ Prediction Method Dropdown: Found');
            
            // Check for all expected options
            const predictionOptions = predictionMatch[1];
            const expectedPredictionOptions = [
                'enhanced',
                'frequency', 
                'weighted',
                'hotcold'
            ];
            
            expectedPredictionOptions.forEach(option => {
                if (predictionOptions.includes(`value="${option}"`)) {
                    console.log(`  ✅ ${option} option: Found`);
                } else {
                    console.log(`  ❌ ${option} option: Missing`);
                }
            });
        } else {
            console.log('❌ Prediction Method Dropdown: Not found');
        }
        
        // Check draw range dropdown
        const drawRangeRegex = /<select id="drawRange">([\s\S]*?)<\/select>/;
        const drawRangeMatch = htmlContent.match(drawRangeRegex);
        
        if (drawRangeMatch) {
            console.log('\n✅ Draw Range Dropdown: Found');
            
            // Check for all expected options
            const drawRangeOptions = drawRangeMatch[1];
            const expectedDrawOptions = ['20', '50', '100'];
            
            expectedDrawOptions.forEach(option => {
                if (drawRangeOptions.includes(`value="${option}"`)) {
                    console.log(`  ✅ ${option} draws option: Found`);
                } else {
                    console.log(`  ❌ ${option} draws option: Missing`);
                }
            });
            
            // Check default selection
            if (drawRangeOptions.includes('selected>Last 20 draws') || 
                drawRangeOptions.includes('value="20" selected')) {
                console.log('  ✅ Default selection (20 draws): Correct');
            } else {
                console.log('  ❌ Default selection: Issue detected');
            }
        } else {
            console.log('❌ Draw Range Dropdown: Not found');
        }
        
    } catch (error) {
        console.log('❌ Error reading HTML file:', error.message);
    }
}

function testFunctionConnections() {
    console.log('\n📋 TESTING FUNCTION CONNECTIONS');
    
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf-8');
        
        // Test predict() function exists
        if (htmlContent.includes('function predict()')) {
            console.log('✅ predict() function: Found');
            
            // Test if predict() reads prediction method
            if (htmlContent.includes("document.getElementById('predictionMethod').value")) {
                console.log('  ✅ Reads prediction method dropdown: Yes');
            } else {
                console.log('  ❌ Reads prediction method dropdown: No');
            }
            
            // Test switch statement for methods
            const switchMethods = ['enhanced', 'frequency', 'weighted', 'hotcold'];
            switchMethods.forEach(method => {
                if (htmlContent.includes(`case '${method}':`)) {
                    console.log(`  ✅ Handles ${method} method: Yes`);
                } else {
                    console.log(`  ❌ Handles ${method} method: No`);
                }
            });
            
        } else {
            console.log('❌ predict() function: Not found');
        }
        
        // Test getDrawRange() function
        if (htmlContent.includes('function getDrawRange()')) {
            console.log('\n✅ getDrawRange() function: Found');
            
            if (htmlContent.includes("document.getElementById('drawRange').value")) {
                console.log('  ✅ Reads draw range dropdown: Yes');
            } else {
                console.log('  ❌ Reads draw range dropdown: No');
            }
            
            if (htmlContent.includes('parseInt(rangeValue)')) {
                console.log('  ✅ Parses range value: Yes');
            } else {
                console.log('  ❌ Parses range value: No');
            }
        } else {
            console.log('❌ getDrawRange() function: Not found');
        }
        
    } catch (error) {
        console.log('❌ Error testing functions:', error.message);
    }
}

function testPredictionMethodHandlers() {
    console.log('\n📋 TESTING PREDICTION METHOD HANDLERS');
    
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf-8');
        
        const handlers = [
            { name: 'Enhanced Ensemble', func: 'runEnhancedEnsemblePrediction()' },
            { name: 'Frequency Compatibility', func: 'runFrequencyCompatibilityPrediction()' },
            { name: 'Weighted Analysis', func: 'runWeightedPrediction()' },
            { name: 'Hot/Cold Analysis', func: 'runHotColdPrediction()' }
        ];
        
        handlers.forEach(handler => {
            if (htmlContent.includes(`function ${handler.func.replace('()', '')}(`)) {
                console.log(`✅ ${handler.name} handler: Found`);
                
                // Check if it uses getDrawRange()
                const functionMatch = htmlContent.match(new RegExp(`function ${handler.func.replace('()', '')}\\([^}]*\\{[\\s\\S]*?(?=function|$)`));
                if (functionMatch && functionMatch[0].includes('getDrawRange()')) {
                    console.log(`  ✅ Uses draw range: Yes`);
                } else {
                    console.log(`  ⚠️ Uses draw range: Check needed`);
                }
            } else {
                console.log(`❌ ${handler.name} handler: Not found`);
            }
        });
        
    } catch (error) {
        console.log('❌ Error testing handlers:', error.message);
    }
}

function testDropdownIntegration() {
    console.log('\n📋 TESTING DROPDOWN INTEGRATION');
    
    console.log('🔧 Integration Test Points:');
    console.log('1. Prediction method dropdown changes algorithm');
    console.log('2. Draw range dropdown affects analysis scope');
    console.log('3. Both dropdowns work together correctly');
    console.log('4. Default values are appropriate');
    console.log('5. Analytics update with dropdown changes');
    
    console.log('\n🧪 MANUAL TESTING REQUIRED:');
    console.log('1. Open index.html in browser');
    console.log('2. Change Prediction Method dropdown');
    console.log('3. Click Predict - verify different algorithms run');
    console.log('4. Change Draw Range dropdown');  
    console.log('5. Click Predict - verify different data ranges used');
    console.log('6. Try all combinations of settings');
    console.log('7. Check analytics change appropriately');
    
    console.log('\n✅ Expected Behavior:');
    console.log('• Enhanced Ensemble: Multi-factor algorithm');
    console.log('• Frequency+Compatibility: Original algorithm');
    console.log('• Weighted Recent: Exponential decay weighting');
    console.log('• Hot/Cold Analysis: Temperature-based selection');
    console.log('• 20/50/100 draws: Different analysis windows');
}

function testPotentialIssues() {
    console.log('\n⚠️ POTENTIAL DROPDOWN ISSUES TO CHECK:');
    
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf-8');
        
        console.log('\n🔍 Issue Detection:');
        
        // Check for missing event handlers
        if (!htmlContent.includes('onclick="predict()"')) {
            console.log('❌ No predict button click handler found');
        } else {
            console.log('✅ Predict button click handler found');
        }
        
        // Check for potential variable conflicts
        if (htmlContent.includes('var method') && htmlContent.includes('const method')) {
            console.log('⚠️ Potential variable naming conflict with "method"');
        }
        
        // Check for unclosed select tags
        const selectOpens = (htmlContent.match(/<select/g) || []).length;
        const selectCloses = (htmlContent.match(/<\/select>/g) || []).length;
        
        if (selectOpens === selectCloses) {
            console.log('✅ Select tags properly closed');
        } else {
            console.log('❌ Unclosed select tags detected');
        }
        
        // Check for missing IDs
        const requiredIds = ['predictionMethod', 'drawRange'];
        requiredIds.forEach(id => {
            if (htmlContent.includes(`id="${id}"`)) {
                console.log(`✅ ID "${id}": Found`);
            } else {
                console.log(`❌ ID "${id}": Missing`);
            }
        });
        
    } catch (error) {
        console.log('❌ Error checking for issues:', error.message);
    }
}

// Run all tests
testDropdownStructure();
testFunctionConnections();
testPredictionMethodHandlers();
testDropdownIntegration();
testPotentialIssues();

console.log('\n' + '='.repeat(50));
console.log('🎯 DROPDOWN FUNCTIONALITY TEST COMPLETE');
console.log('='.repeat(50));
console.log('📋 Summary: Check output above for any ❌ issues');
console.log('🧪 Manual browser testing still required');
console.log('✅ Automated checks help identify code-level problems');