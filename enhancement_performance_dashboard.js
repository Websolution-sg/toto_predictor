// PERFORMANCE DASHBOARD ENHANCEMENT
// Real-time performance tracking and visualization
// Works alongside existing TOTO prediction system

console.log('📊 PERFORMANCE DASHBOARD ENHANCEMENT LOADED');
console.log('=' .repeat(50));

class PerformanceDashboard {
    constructor() {
        this.methodStats = {
            enhanced: { tests: 0, matches: 0, history: [] },
            frequency: { tests: 0, matches: 0, history: [] },
            weighted: { tests: 0, matches: 0, history: [] },
            hotcold: { tests: 0, matches: 0, history: [] }
        };
        this.globalStats = {
            totalPredictions: 0,
            totalMatches: 0,
            bestMethod: 'unknown',
            averageAccuracy: 0
        };
        this.loadStoredStats();
    }

    // Load stats from localStorage if available
    loadStoredStats() {
        try {
            const stored = localStorage.getItem('totoPerformanceStats');
            if (stored) {
                const data = JSON.parse(stored);
                this.methodStats = { ...this.methodStats, ...data.methodStats };
                this.globalStats = { ...this.globalStats, ...data.globalStats };
                console.log('📈 Loaded previous performance statistics');
            }
        } catch (error) {
            console.log('📊 Starting fresh performance tracking');
        }
    }

    // Save stats to localStorage
    saveStats() {
        try {
            const data = {
                methodStats: this.methodStats,
                globalStats: this.globalStats,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('totoPerformanceStats', JSON.stringify(data));
        } catch (error) {
            console.log('⚠️ Could not save performance stats');
        }
    }

    // Record a prediction result
    recordPrediction(method, prediction, actualResult = null, matches = null) {
        if (!this.methodStats[method]) {
            this.methodStats[method] = { tests: 0, matches: 0, history: [] };
        }

        this.methodStats[method].tests++;
        this.globalStats.totalPredictions++;

        if (matches !== null) {
            this.methodStats[method].matches += matches;
            this.globalStats.totalMatches += matches;
            
            // Store in history (keep last 20)
            this.methodStats[method].history.push({
                date: new Date().toISOString(),
                prediction: [...prediction],
                actual: actualResult ? [...actualResult] : null,
                matches: matches
            });

            if (this.methodStats[method].history.length > 20) {
                this.methodStats[method].history.shift();
            }
        }

        this.updateGlobalStats();
        this.saveStats();
    }

    // Update global statistics
    updateGlobalStats() {
        let bestMethod = 'unknown';
        let bestAccuracy = 0;

        Object.keys(this.methodStats).forEach(method => {
            const stats = this.methodStats[method];
            if (stats.tests > 0) {
                const accuracy = (stats.matches / (stats.tests * 6)) * 100;
                if (accuracy > bestAccuracy) {
                    bestAccuracy = accuracy;
                    bestMethod = method;
                }
            }
        });

        this.globalStats.bestMethod = bestMethod;
        this.globalStats.averageAccuracy = this.globalStats.totalPredictions > 0 
            ? (this.globalStats.totalMatches / (this.globalStats.totalPredictions * 6)) * 100 
            : 0;
    }

    // Get method performance
    getMethodPerformance(method) {
        const stats = this.methodStats[method];
        if (!stats || stats.tests === 0) {
            return {
                accuracy: 0,
                avgMatches: 0,
                tests: 0,
                trend: 'unknown'
            };
        }

        const accuracy = (stats.matches / (stats.tests * 6)) * 100;
        const avgMatches = stats.matches / stats.tests;
        
        // Calculate trend from recent history
        let trend = 'stable';
        if (stats.history.length >= 5) {
            const recent = stats.history.slice(-5);
            const older = stats.history.slice(-10, -5);
            
            if (recent.length > 0 && older.length > 0) {
                const recentAvg = recent.reduce((sum, h) => sum + h.matches, 0) / recent.length;
                const olderAvg = older.reduce((sum, h) => sum + h.matches, 0) / older.length;
                
                if (recentAvg > olderAvg + 0.2) trend = 'improving';
                else if (recentAvg < olderAvg - 0.2) trend = 'declining';
            }
        }

        return {
            accuracy: Math.round(accuracy * 10) / 10,
            avgMatches: Math.round(avgMatches * 100) / 100,
            tests: stats.tests,
            totalMatches: stats.matches,
            trend: trend
        };
    }

    // Display performance dashboard in console
    displayDashboard() {
        console.log('\n📊 PERFORMANCE DASHBOARD');
        console.log('=' .repeat(35));
        
        console.log('\n🏆 GLOBAL STATISTICS:');
        console.log(`Total Predictions: ${this.globalStats.totalPredictions}`);
        console.log(`Total Matches: ${this.globalStats.totalMatches}`);
        console.log(`Average Accuracy: ${Math.round(this.globalStats.averageAccuracy * 10) / 10}%`);
        console.log(`Best Method: ${this.globalStats.bestMethod}`);
        
        console.log('\n📈 METHOD PERFORMANCE:');
        console.log('-'.repeat(25));
        
        const methods = [
            { id: 'enhanced', name: '🚀 Enhanced Ensemble' },
            { id: 'frequency', name: '📊 Frequency+Compatibility' },
            { id: 'weighted', name: '⚖️ Weighted Recent' },
            { id: 'hotcold', name: '🌡️ Hot/Cold Balance' }
        ];

        const performances = methods.map(method => ({
            ...method,
            ...this.getMethodPerformance(method.id)
        })).sort((a, b) => b.accuracy - a.accuracy);

        performances.forEach((method, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
            const trendEmoji = method.trend === 'improving' ? '📈' : 
                              method.trend === 'declining' ? '📉' : '➡️';
            
            console.log(`\n${medal} ${method.name}:`);
            console.log(`    Accuracy: ${method.accuracy}% ${trendEmoji}`);
            console.log(`    Avg Matches: ${method.avgMatches}/6 per draw`);
            console.log(`    Tests: ${method.tests} (${method.totalMatches} total matches)`);
        });

        console.log('\n🎯 RECOMMENDATIONS:');
        this.generateRecommendations();
    }

    // Generate smart recommendations
    generateRecommendations() {
        const performances = Object.keys(this.methodStats).map(method => ({
            method,
            ...this.getMethodPerformance(method)
        })).filter(p => p.tests > 0).sort((a, b) => b.accuracy - a.accuracy);

        if (performances.length === 0) {
            console.log('• No performance data available yet');
            console.log('• Run some predictions to build performance history');
            return;
        }

        const best = performances[0];
        const worst = performances[performances.length - 1];

        console.log(`• 🎯 Use "${best.method}" method (${best.accuracy}% accuracy)`);
        
        if (best.trend === 'improving') {
            console.log(`• 📈 "${best.method}" is improving - continue using it`);
        } else if (best.trend === 'declining') {
            console.log(`• 📉 "${best.method}" is declining - consider switching`);
        }

        if (worst.accuracy < 15 && worst.tests >= 5) {
            console.log(`• ⚠️ Avoid "${worst.method}" method (only ${worst.accuracy}% accuracy)`);
        }

        if (this.globalStats.averageAccuracy < 20) {
            console.log('• 🔄 Consider adjusting prediction ranges');
            console.log('• 📊 Try different parameter combinations');
        } else if (this.globalStats.averageAccuracy > 30) {
            console.log('• ✅ Excellent performance! Keep current strategy');
        }
    }

    // Create visual dashboard (if Chart.js is available)
    createVisualDashboard() {
        // Check if we can create visual dashboard
        const chartContainer = document.getElementById('performanceChart') || this.createChartContainer();
        
        if (typeof Chart !== 'undefined' && chartContainer) {
            this.renderPerformanceChart(chartContainer);
        } else {
            console.log('📊 Visual dashboard requires Chart.js library and chart container');
            console.log('Add this to your HTML: <canvas id="performanceChart"></canvas>');
        }
    }

    // Create chart container if it doesn't exist
    createChartContainer() {
        const resultDiv = document.getElementById('result');
        if (resultDiv && resultDiv.parentNode) {
            const chartDiv = document.createElement('div');
            chartDiv.innerHTML = `
                <h3>Performance Dashboard</h3>
                <canvas id="performanceChart" width="400" height="200"></canvas>
            `;
            chartDiv.style.cssText = 'margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;';
            resultDiv.parentNode.insertBefore(chartDiv, resultDiv.nextSibling);
            return document.getElementById('performanceChart');
        }
        return null;
    }

    // Render performance chart
    renderPerformanceChart(canvas) {
        const methods = ['enhanced', 'frequency', 'weighted', 'hotcold'];
        const data = methods.map(method => this.getMethodPerformance(method).accuracy);
        const labels = ['Enhanced', 'Frequency', 'Weighted', 'Hot/Cold'];

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accuracy %',
                    data: data,
                    backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
                    borderColor: ['#388E3C', '#1976D2', '#F57C00', '#7B1FA2'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Method Performance Comparison'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Export performance data
    exportData() {
        const exportData = {
            methodStats: this.methodStats,
            globalStats: this.globalStats,
            exportDate: new Date().toISOString(),
            summary: {
                totalTests: this.globalStats.totalPredictions,
                bestMethod: this.globalStats.bestMethod,
                averageAccuracy: this.globalStats.averageAccuracy
            }
        };

        console.log('📁 PERFORMANCE DATA EXPORT:');
        console.log(JSON.stringify(exportData, null, 2));
        
        return exportData;
    }

    // Reset all statistics
    resetStats() {
        this.methodStats = {
            enhanced: { tests: 0, matches: 0, history: [] },
            frequency: { tests: 0, matches: 0, history: [] },
            weighted: { tests: 0, matches: 0, history: [] },
            hotcold: { tests: 0, matches: 0, history: [] }
        };
        this.globalStats = {
            totalPredictions: 0,
            totalMatches: 0,
            bestMethod: 'unknown',
            averageAccuracy: 0
        };
        
        localStorage.removeItem('totoPerformanceStats');
        console.log('🔄 Performance statistics reset');
    }
}

// Create global performance dashboard instance
window.performanceDashboard = new PerformanceDashboard();

// Enhanced prediction function with performance tracking
window.predictWithTracking = function() {
    if (typeof predict === 'function') {
        const method = document.getElementById('predictionMethod')?.value || 'unknown';
        
        predict();
        
        // Record the prediction
        setTimeout(() => {
            const resultElement = document.getElementById('result');
            if (resultElement) {
                const prediction = extractPredictionFromHTML(resultElement.innerHTML);
                if (prediction && prediction.length === 6) {
                    window.performanceDashboard.recordPrediction(method, prediction);
                    console.log(`📊 Recorded prediction for method: ${method}`);
                }
            }
        }, 500);
    }
};

// Test performance tracking with historical data
window.testPerformanceTracking = function() {
    console.log('🧪 TESTING PERFORMANCE TRACKING');
    console.log('=' .repeat(35));
    
    // Simulate some test predictions and results
    const testData = [
        { method: 'enhanced', prediction: [1, 15, 22, 31, 38, 45], actual: [1, 15, 22, 33, 40, 47], matches: 3 },
        { method: 'frequency', prediction: [5, 12, 19, 26, 33, 40], actual: [5, 12, 18, 25, 32, 39], matches: 2 },
        { method: 'weighted', prediction: [3, 7, 14, 21, 28, 35], actual: [2, 7, 13, 20, 28, 36], matches: 2 },
        { method: 'hotcold', prediction: [8, 16, 23, 30, 37, 44], actual: [8, 17, 24, 31, 38, 45], matches: 1 }
    ];
    
    testData.forEach(test => {
        window.performanceDashboard.recordPrediction(test.method, test.prediction, test.actual, test.matches);
    });
    
    console.log('✅ Test data recorded');
    window.performanceDashboard.displayDashboard();
};

// Helper function to extract prediction from HTML
function extractPredictionFromHTML(html) {
    try {
        const numberPattern = /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/;
        const match = html.match(numberPattern);
        
        if (match) {
            return [1, 2, 3, 4, 5, 6].map(i => parseInt(match[i]));
        }

        const numbers = html.match(/\b([1-9]|[1-4][0-9])\b/g);
        if (numbers && numbers.length >= 6) {
            return numbers.slice(0, 6).map(n => parseInt(n));
        }

        return null;
    } catch (error) {
        return null;
    }
}

console.log('\n📊 PERFORMANCE DASHBOARD READY!');
console.log('Commands:');
console.log('• predictWithTracking() - Run prediction with performance tracking');
console.log('• performanceDashboard.displayDashboard() - Show performance dashboard');
console.log('• performanceDashboard.createVisualDashboard() - Create visual charts');
console.log('• testPerformanceTracking() - Test with sample data');
console.log('• performanceDashboard.exportData() - Export performance data');
console.log('• performanceDashboard.resetStats() - Reset all statistics');