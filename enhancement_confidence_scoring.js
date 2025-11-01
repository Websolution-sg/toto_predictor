// CONFIDENCE SCORING ENHANCEMENT
// Add-on module for prediction confidence analysis
// Works with existing TOTO prediction system without modifying original code

console.log('🎯 CONFIDENCE SCORING ENHANCEMENT LOADED');
console.log('=' .repeat(45));

// Confidence scoring system
class PredictionConfidence {
    constructor() {
        this.historicalAccuracy = {};
        this.initializeMethodTracking();
    }

    // Initialize tracking for all prediction methods
    initializeMethodTracking() {
        const methods = ['enhanced', 'frequency', 'weighted', 'hotcold'];
        methods.forEach(method => {
            this.historicalAccuracy[method] = {
                total: 0,
                correct: 0,
                recentPerformance: []
            };
        });
    }

    // Calculate frequency-based confidence score
    calculateFrequencyScore(prediction, historicalData, range = 50) {
        if (!historicalData || historicalData.length === 0) return 0;

        const recentDraws = historicalData.slice(0, Math.min(range, historicalData.length));
        const frequency = {};
        
        // Initialize frequency counter
        for (let i = 1; i <= 49; i++) frequency[i] = 0;
        
        // Count frequencies in recent draws
        recentDraws.forEach(draw => {
            for (let i = 1; i <= 6; i++) {
                const num = parseInt(draw[i]);
                if (frequency[num] !== undefined) frequency[num]++;
            }
        });

        // Calculate confidence based on how frequently predicted numbers appear
        let totalFrequency = 0;
        prediction.forEach(num => {
            totalFrequency += frequency[num] || 0;
        });

        const maxPossibleFrequency = recentDraws.length * 6;
        return Math.min(100, (totalFrequency / maxPossibleFrequency) * 100 * 8); // Scale up for readability
    }

    // Calculate pattern strength score
    calculatePatternScore(prediction) {
        let score = 0;
        const sorted = [...prediction].sort((a, b) => a - b);

        // Check for good distribution across number ranges
        const ranges = { low: 0, mid: 0, high: 0 };
        sorted.forEach(num => {
            if (num <= 16) ranges.low++;
            else if (num <= 33) ranges.mid++;
            else ranges.high++;
        });

        // Balanced distribution gets higher score
        const balance = Math.min(ranges.low, ranges.mid, ranges.high);
        score += balance * 15;

        // Check even/odd balance
        const evenCount = prediction.filter(n => n % 2 === 0).length;
        const oddCount = 6 - evenCount;
        const evenOddBalance = Math.abs(evenCount - oddCount);
        score += (3 - evenOddBalance) * 10; // Closer to 3-3 balance is better

        // Check for appropriate gaps between numbers
        let gapScore = 0;
        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = sorted[i + 1] - sorted[i];
            if (gap >= 2 && gap <= 8) gapScore += 5; // Good gap range
        }
        score += gapScore;

        // Avoid too many consecutive numbers
        let consecutives = 0;
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) consecutives++;
        }
        score -= consecutives * 15; // Penalty for consecutives

        return Math.max(0, Math.min(100, score));
    }

    // Calculate overall prediction confidence
    calculateOverallConfidence(prediction, method = 'unknown', range = 50) {
        if (!prediction || prediction.length !== 6) return 0;

        const frequencyScore = this.calculateFrequencyScore(prediction, window.results || [], range);
        const patternScore = this.calculatePatternScore(prediction);
        
        // Get method-specific historical performance
        const methodPerformance = this.getMethodPerformance(method);
        
        // Weighted combination
        const weights = {
            frequency: 0.4,
            pattern: 0.3,
            historical: 0.3
        };

        const overallScore = 
            (frequencyScore * weights.frequency) +
            (patternScore * weights.pattern) +
            (methodPerformance * weights.historical);

        return Math.round(overallScore);
    }

    // Get historical performance for a method
    getMethodPerformance(method) {
        if (!this.historicalAccuracy[method] || this.historicalAccuracy[method].total === 0) {
            return 50; // Default neutral score
        }

        const accuracy = (this.historicalAccuracy[method].correct / this.historicalAccuracy[method].total) * 100;
        return Math.min(100, accuracy * 2); // Scale up for confidence scoring
    }

    // Update method performance (call this when you get actual results)
    updateMethodPerformance(method, prediction, actualResult) {
        if (!this.historicalAccuracy[method]) return;

        const matches = prediction.filter(num => actualResult.includes(num)).length;
        const isGoodPrediction = matches >= 2; // 2+ matches considered good

        this.historicalAccuracy[method].total++;
        if (isGoodPrediction) {
            this.historicalAccuracy[method].correct++;
        }

        // Keep only recent performance (last 20 predictions)
        this.historicalAccuracy[method].recentPerformance.push(matches);
        if (this.historicalAccuracy[method].recentPerformance.length > 20) {
            this.historicalAccuracy[method].recentPerformance.shift();
        }
    }

    // Get confidence level description
    getConfidenceDescription(score) {
        if (score >= 80) return { level: 'Very High', color: '#4CAF50', emoji: '🎯' };
        if (score >= 65) return { level: 'High', color: '#8BC34A', emoji: '✨' };
        if (score >= 50) return { level: 'Medium', color: '#FFC107', emoji: '⚡' };
        if (score >= 35) return { level: 'Low', color: '#FF9800', emoji: '⚠️' };
        return { level: 'Very Low', color: '#F44336', emoji: '❌' };
    }

    // Display confidence metrics in console
    displayConfidenceReport(prediction, method, range) {
        const confidence = this.calculateOverallConfidence(prediction, method, range);
        const description = this.getConfidenceDescription(confidence);
        
        console.log(`\n${description.emoji} CONFIDENCE ANALYSIS`);
        console.log('=' .repeat(25));
        console.log(`Prediction: [${prediction.join(', ')}]`);
        console.log(`Method: ${method}`);
        console.log(`Range: ${range} draws`);
        console.log(`Overall Confidence: ${confidence}% (${description.level})`);
        
        const freqScore = this.calculateFrequencyScore(prediction, window.results || [], range);
        const patternScore = this.calculatePatternScore(prediction);
        const methodScore = this.getMethodPerformance(method);
        
        console.log(`\nComponent Scores:`);
        console.log(`• Frequency Score: ${Math.round(freqScore)}%`);
        console.log(`• Pattern Score: ${Math.round(patternScore)}%`);
        console.log(`• Method Performance: ${Math.round(methodScore)}%`);
        
        return {
            overall: confidence,
            components: {
                frequency: Math.round(freqScore),
                pattern: Math.round(patternScore),
                method: Math.round(methodScore)
            },
            description: description
        };
    }
}

// Create global confidence analyzer instance
window.confidenceAnalyzer = new PredictionConfidence();

// Enhanced predict function wrapper (doesn't modify original)
window.predictWithConfidence = function() {
    // Call original predict function
    if (typeof predict === 'function') {
        predict();
        
        // Extract current prediction settings
        const method = document.getElementById('predictionMethod')?.value || 'unknown';
        const range = parseInt(document.getElementById('drawRange')?.value) || 50;
        
        // Try to extract prediction from result display
        setTimeout(() => {
            const resultElement = document.getElementById('result');
            if (resultElement) {
                const prediction = extractPredictionFromResult(resultElement.innerHTML);
                if (prediction && prediction.length === 6) {
                    const confidence = window.confidenceAnalyzer.displayConfidenceReport(prediction, method, range);
                    
                    // Add confidence display to UI if element exists
                    updateConfidenceDisplay(confidence);
                }
            }
        }, 500);
    } else {
        console.log('❌ Original predict() function not found');
    }
};

// Extract prediction numbers from result HTML
function extractPredictionFromResult(html) {
    try {
        // Look for number patterns in the HTML
        const numberPattern = /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/;
        const match = html.match(numberPattern);
        
        if (match) {
            return [1, 2, 3, 4, 5, 6].map(i => parseInt(match[i]));
        }

        // Alternative: extract all numbers and take first 6
        const numbers = html.match(/\b([1-9]|[1-4][0-9])\b/g);
        if (numbers && numbers.length >= 6) {
            return numbers.slice(0, 6).map(n => parseInt(n));
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Update confidence display in UI
function updateConfidenceDisplay(confidence) {
    // Try to find or create confidence display area
    let confidenceDiv = document.getElementById('confidenceDisplay');
    
    if (!confidenceDiv) {
        // Create confidence display if it doesn't exist
        const resultDiv = document.getElementById('result');
        if (resultDiv && resultDiv.parentNode) {
            confidenceDiv = document.createElement('div');
            confidenceDiv.id = 'confidenceDisplay';
            confidenceDiv.style.cssText = `
                margin-top: 15px;
                padding: 10px;
                border: 2px solid ${confidence.description.color};
                border-radius: 8px;
                background-color: ${confidence.description.color}20;
            `;
            resultDiv.parentNode.insertBefore(confidenceDiv, resultDiv.nextSibling);
        }
    }
    
    if (confidenceDiv) {
        confidenceDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: ${confidence.description.color};">
                ${confidence.description.emoji} Prediction Confidence: ${confidence.overall}%
            </h3>
            <p style="margin: 5px 0; font-weight: bold; color: ${confidence.description.color};">
                Level: ${confidence.description.level}
            </p>
            <div style="font-size: 0.9em; margin-top: 8px;">
                <div>📊 Frequency Score: ${confidence.components.frequency}%</div>
                <div>🎯 Pattern Score: ${confidence.components.pattern}%</div>
                <div>📈 Method Performance: ${confidence.components.method}%</div>
            </div>
        `;
    }
}

// Test function for confidence scoring
window.testConfidenceScoring = function() {
    console.log('🧪 TESTING CONFIDENCE SCORING SYSTEM');
    console.log('=' .repeat(40));
    
    // Test with sample predictions
    const testPredictions = [
        { prediction: [1, 15, 22, 31, 38, 45], method: 'frequency' },
        { prediction: [5, 12, 19, 26, 33, 40], method: 'weighted' },
        { prediction: [3, 7, 14, 21, 28, 35], method: 'hotcold' }
    ];
    
    testPredictions.forEach((test, index) => {
        console.log(`\nTest ${index + 1}:`);
        window.confidenceAnalyzer.displayConfidenceReport(test.prediction, test.method, 50);
    });
    
    console.log('\n✅ Confidence scoring test complete!');
};

console.log('\n🚀 CONFIDENCE SCORING READY!');
console.log('Usage:');
console.log('• predictWithConfidence() - Run prediction with confidence analysis');
console.log('• testConfidenceScoring() - Test the confidence scoring system');
console.log('• confidenceAnalyzer.displayConfidenceReport(prediction, method, range)');