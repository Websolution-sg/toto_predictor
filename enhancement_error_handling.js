// ERROR HANDLING ENHANCEMENT
// Robust error handling and fallback mechanisms
// Works with existing TOTO prediction system

console.log('🛡️ ERROR HANDLING ENHANCEMENT LOADED');
console.log('=' .repeat(45));

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.fallbackStrategies = new Map();
        this.initializeFallbacks();
        this.setupGlobalErrorHandling();
    }

    // Initialize fallback strategies
    initializeFallbacks() {
        this.fallbackStrategies.set('csv_load_failed', this.csvLoadFallback);
        this.fallbackStrategies.set('prediction_failed', this.predictionFallback);
        this.fallbackStrategies.set('method_unavailable', this.methodFallback);
        this.fallbackStrategies.set('data_corruption', this.dataCorruptionFallback);
        this.fallbackStrategies.set('ui_error', this.uiFallback);
    }

    // Setup global error handling
    setupGlobalErrorHandling() {
        // Capture unhandled errors
        window.addEventListener('error', (event) => {
            this.logError('global_error', event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Capture promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('promise_rejection', event.reason, {
                promise: event.promise
            });
        });
    }

    // Log error with context
    logError(type, error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            message: error.message || error,
            stack: error.stack,
            context: context,
            id: Date.now()
        };

        this.errorLog.push(errorEntry);
        
        // Keep only last 50 errors
        if (this.errorLog.length > 50) {
            this.errorLog.shift();
        }

        // Log to console with appropriate level
        if (type.includes('critical') || type.includes('fatal')) {
            console.error(`🚨 CRITICAL ERROR [${type}]:`, error.message || error);
        } else if (type.includes('warning')) {
            console.warn(`⚠️ WARNING [${type}]:`, error.message || error);
        } else {
            console.log(`ℹ️ INFO [${type}]:`, error.message || error);
        }

        return errorEntry.id;
    }

    // Execute function with error handling
    safeExecute(func, fallbackType = null, context = {}) {
        try {
            return func();
        } catch (error) {
            const errorId = this.logError('safe_execute_failed', error, context);
            
            if (fallbackType && this.fallbackStrategies.has(fallbackType)) {
                console.log(`🔄 Executing fallback strategy: ${fallbackType}`);
                return this.fallbackStrategies.get(fallbackType).call(this, error, context);
            }
            
            return null;
        }
    }

    // CSV load fallback
    csvLoadFallback(error, context) {
        console.log('📊 CSV load failed, using backup data...');
        
        // Return minimal sample data for testing
        return [
            ['31-Oct-25', '1', '5', '31', '34', '38', '45', '21'],
            ['27-Oct-25', '4', '12', '14', '24', '36', '38', '17'],
            ['24-Oct-25', '7', '14', '17', '18', '31', '38', '46']
        ];
    }

    // Prediction method fallback
    predictionFallback(error, context) {
        console.log('🔮 Prediction failed, using frequency fallback...');
        
        // Simple frequency-based fallback
        if (window.results && window.results.length > 0) {
            const frequency = {};
            for (let i = 1; i <= 49; i++) frequency[i] = 0;
            
            const recentDraws = window.results.slice(0, 20);
            recentDraws.forEach(draw => {
                for (let i = 1; i <= 6; i++) {
                    const num = parseInt(draw[i]);
                    if (frequency[num] !== undefined) frequency[num]++;
                }
            });
            
            const sortedNumbers = Object.entries(frequency)
                .sort(([,a], [,b]) => b - a)
                .map(([num]) => parseInt(num))
                .slice(0, 6);
                
            return sortedNumbers;
        }
        
        // Ultimate fallback - random numbers
        return this.generateRandomNumbers();
    }

    // Method unavailable fallback
    methodFallback(error, context) {
        console.log('⚙️ Requested method unavailable, switching to frequency method...');
        
        // Switch to frequency method as it's most reliable
        const methodSelect = document.getElementById('predictionMethod');
        if (methodSelect) {
            methodSelect.value = 'frequency';
        }
        
        return 'frequency';
    }

    // Data corruption fallback
    dataCorruptionFallback(error, context) {
        console.log('🔧 Data corruption detected, attempting repair...');
        
        if (window.results && window.results.length > 0) {
            // Filter out corrupted entries
            const cleanResults = window.results.filter(draw => {
                if (!Array.isArray(draw) || draw.length < 8) return false;
                
                const numbers = draw.slice(1, 7).map(n => parseInt(n));
                return numbers.every(n => !isNaN(n) && n >= 1 && n <= 49) &&
                       new Set(numbers).size === 6; // No duplicates
            });
            
            console.log(`🔧 Cleaned ${window.results.length - cleanResults.length} corrupted entries`);
            return cleanResults;
        }
        
        return this.csvLoadFallback(error, context);
    }

    // UI error fallback
    uiFallback(error, context) {
        console.log('🖥️ UI error detected, attempting recovery...');
        
        // Try to restore missing UI elements
        this.restoreUIElements();
        return true;
    }

    // Generate random numbers as ultimate fallback
    generateRandomNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 49) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    // Restore missing UI elements
    restoreUIElements() {
        const requiredElements = [
            { id: 'predictionMethod', type: 'select' },
            { id: 'drawRange', type: 'select' },
            { id: 'result', type: 'div' }
        ];

        requiredElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                console.log(`🔧 Restoring missing element: ${element.id}`);
                const newElement = document.createElement(element.type);
                newElement.id = element.id;
                
                if (element.type === 'select') {
                    this.addSelectOptions(newElement, element.id);
                }
                
                document.body.appendChild(newElement);
            }
        });
    }

    // Add options to select elements
    addSelectOptions(select, elementId) {
        if (elementId === 'predictionMethod') {
            const methods = [
                { value: 'enhanced', text: '🚀 Enhanced Ensemble' },
                { value: 'frequency', text: '📊 Frequency + Compatibility' },
                { value: 'weighted', text: '⚖️ Weighted Recent Analysis' },
                { value: 'hotcold', text: '🌡️ Hot/Cold Balance' }
            ];
            
            methods.forEach(method => {
                const option = document.createElement('option');
                option.value = method.value;
                option.textContent = method.text;
                select.appendChild(option);
            });
        } else if (elementId === 'drawRange') {
            const ranges = [
                { value: '20', text: 'Last 20' },
                { value: '50', text: 'Last 50' },
                { value: '100', text: 'Last 100' }
            ];
            
            ranges.forEach(range => {
                const option = document.createElement('option');
                option.value = range.value;
                option.textContent = range.text;
                select.appendChild(option);
            });
        }
    }

    // Validate data integrity
    validateData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        const issues = [];
        
        data.forEach((draw, index) => {
            if (!Array.isArray(draw)) {
                issues.push(`Row ${index}: Not an array`);
                return;
            }
            
            if (draw.length < 8) {
                issues.push(`Row ${index}: Insufficient columns`);
                return;
            }
            
            const numbers = draw.slice(1, 7).map(n => parseInt(n));
            
            if (numbers.some(n => isNaN(n) || n < 1 || n > 49)) {
                issues.push(`Row ${index}: Invalid number range`);
            }
            
            if (new Set(numbers).size !== 6) {
                issues.push(`Row ${index}: Duplicate numbers`);
            }
        });

        if (issues.length > 0) {
            this.logError('data_validation_failed', new Error(`Data validation issues: ${issues.join(', ')}`));
            return false;
        }

        return true;
    }

    // Enhanced predict function with error handling
    safePredictWrapper() {
        return this.safeExecute(() => {
            // Validate prerequisites
            if (!window.results || window.results.length === 0) {
                throw new Error('No TOTO data available');
            }

            if (!this.validateData(window.results)) {
                throw new Error('Data validation failed');
            }

            // Check UI elements
            const methodSelect = document.getElementById('predictionMethod');
            const rangeSelect = document.getElementById('drawRange');
            
            if (!methodSelect || !rangeSelect) {
                throw new Error('Required UI elements missing');
            }

            // Execute prediction
            if (typeof predict === 'function') {
                predict();
                return true;
            } else {
                throw new Error('Predict function not available');
            }
            
        }, 'prediction_failed', { 
            method: document.getElementById('predictionMethod')?.value,
            range: document.getElementById('drawRange')?.value 
        });
    }

    // System health check
    performHealthCheck() {
        console.log('🔍 PERFORMING SYSTEM HEALTH CHECK');
        console.log('=' .repeat(40));
        
        const checks = [
            { name: 'CSV Data', test: () => window.results && window.results.length > 0 },
            { name: 'Prediction Functions', test: () => typeof predict === 'function' },
            { name: 'UI Elements', test: () => document.getElementById('predictionMethod') && document.getElementById('drawRange') },
            { name: 'Data Integrity', test: () => window.results ? this.validateData(window.results.slice(0, 10)) : false },
            { name: 'Enhancement Modules', test: () => window.confidenceAnalyzer && window.performanceDashboard }
        ];

        const results = checks.map(check => ({
            name: check.name,
            status: check.test() ? 'PASS' : 'FAIL',
            passed: check.test()
        }));

        results.forEach(result => {
            const emoji = result.passed ? '✅' : '❌';
            console.log(`${emoji} ${result.name}: ${result.status}`);
        });

        const overallHealth = results.every(r => r.passed) ? 'EXCELLENT' : 
                             results.filter(r => r.passed).length >= 3 ? 'GOOD' : 'POOR';
        
        console.log(`\n🏥 Overall System Health: ${overallHealth}`);
        
        if (overallHealth === 'POOR') {
            console.log('🚨 System requires attention - running diagnostics...');
            this.runDiagnostics();
        }

        return {
            checks: results,
            overallHealth: overallHealth,
            timestamp: new Date().toISOString()
        };
    }

    // Run automated diagnostics
    runDiagnostics() {
        console.log('\n🔧 RUNNING AUTOMATED DIAGNOSTICS');
        console.log('=' .repeat(35));

        // Check data availability
        if (!window.results) {
            console.log('🔄 Attempting to load CSV data...');
            if (typeof loadResults === 'function') {
                this.safeExecute(loadResults, 'csv_load_failed');
            }
        }

        // Check UI integrity
        this.restoreUIElements();

        // Validate critical functions
        const criticalFunctions = ['predict', 'loadResults'];
        criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                console.log(`⚠️ Critical function missing: ${funcName}`);
            }
        });

        console.log('✅ Diagnostics complete');
    }

    // Get error report
    getErrorReport() {
        const report = {
            totalErrors: this.errorLog.length,
            recentErrors: this.errorLog.slice(-10),
            errorTypes: {},
            systemHealth: this.performHealthCheck()
        };

        // Count error types
        this.errorLog.forEach(error => {
            report.errorTypes[error.type] = (report.errorTypes[error.type] || 0) + 1;
        });

        console.log('\n📋 ERROR REPORT');
        console.log('=' .repeat(20));
        console.log(`Total Errors Logged: ${report.totalErrors}`);
        console.log('Error Types:', report.errorTypes);
        
        if (report.recentErrors.length > 0) {
            console.log('\nRecent Errors:');
            report.recentErrors.forEach(error => {
                console.log(`• ${error.timestamp}: ${error.type} - ${error.message}`);
            });
        }

        return report;
    }

    // Clear error log
    clearErrorLog() {
        this.errorLog = [];
        console.log('🗑️ Error log cleared');
    }
}

// Create global error handler instance
window.errorHandler = new ErrorHandler();

// Enhanced wrapper functions
window.safePredict = function() {
    return window.errorHandler.safePredictWrapper();
};

window.safePredictWithAll = function() {
    console.log('🛡️ SAFE PREDICTION WITH ALL ENHANCEMENTS');
    
    // Health check first
    const health = window.errorHandler.performHealthCheck();
    if (health.overallHealth === 'POOR') {
        console.log('⚠️ System health poor - proceed with caution');
    }

    // Apply recommendations if available
    if (window.smartRecommendations) {
        window.smartRecommendations.applyRecommendations();
    }

    // Run prediction with tracking and confidence
    const result = window.errorHandler.safeExecute(() => {
        if (window.predictWithTracking) {
            window.predictWithTracking();
        } else if (window.predictWithConfidence) {
            window.predictWithConfidence();
        } else {
            predict();
        }
        return true;
    }, 'prediction_failed');

    return result;
};

console.log('\n🛡️ ERROR HANDLING READY!');
console.log('Commands:');
console.log('• safePredict() - Run prediction with error handling');
console.log('• safePredictWithAll() - Run with all enhancements safely');
console.log('• errorHandler.performHealthCheck() - Check system health');
console.log('• errorHandler.getErrorReport() - View error statistics');
console.log('• errorHandler.clearErrorLog() - Clear error history');