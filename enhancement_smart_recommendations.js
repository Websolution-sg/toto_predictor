// SMART RECOMMENDATIONS ENHANCEMENT
// Intelligent recommendation system for optimal prediction strategies
// Works with existing TOTO prediction system

console.log('🧠 SMART RECOMMENDATIONS ENHANCEMENT LOADED');
console.log('=' .repeat(50));

class SmartRecommendations {
    constructor() {
        this.patternAnalysis = {};
        this.marketConditions = {};
        this.userPreferences = {
            riskLevel: 'medium', // low, medium, high
            preferredMethods: [],
            targetAccuracy: 25
        };
        this.initializeAnalysis();
    }

    // Initialize pattern analysis
    initializeAnalysis() {
        this.analyzeMarketConditions();
        this.analyzeNumberPatterns();
        this.generateRecommendations();
    }

    // Analyze current market conditions
    analyzeMarketConditions() {
        if (!window.results || window.results.length < 10) {
            this.marketConditions = {
                volatility: 'unknown',
                trend: 'unknown',
                stability: 'unknown'
            };
            return;
        }

        const recent10 = window.results.slice(0, 10);
        
        // Calculate volatility based on number distribution changes
        const volatility = this.calculateVolatility(recent10);
        
        // Analyze trend patterns
        const trend = this.analyzeTrend(recent10);
        
        // Calculate stability
        const stability = this.calculateStability(recent10);

        this.marketConditions = {
            volatility: this.categorizeVolatility(volatility),
            trend: trend,
            stability: this.categorizeStability(stability),
            score: {
                volatility: volatility,
                stabilityIndex: stability
            }
        };
    }

    // Calculate market volatility
    calculateVolatility(draws) {
        const frequencies = {};
        for (let i = 1; i <= 49; i++) frequencies[i] = 0;

        draws.forEach(draw => {
            for (let i = 1; i <= 6; i++) {
                const num = parseInt(draw[i]);
                if (frequencies[num] !== undefined) frequencies[num]++;
            }
        });

        const freqValues = Object.values(frequencies);
        const mean = freqValues.reduce((a, b) => a + b, 0) / freqValues.length;
        const variance = freqValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / freqValues.length;
        
        return Math.sqrt(variance);
    }

    // Analyze trend patterns
    analyzeTrend(draws) {
        const sums = draws.map(draw => {
            return draw.slice(1, 7).reduce((sum, num) => sum + parseInt(num), 0);
        });

        const firstHalf = sums.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const secondHalf = sums.slice(5).reduce((a, b) => a + b, 0) / 5;

        if (Math.abs(firstHalf - secondHalf) < 10) return 'stable';
        return firstHalf > secondHalf ? 'decreasing' : 'increasing';
    }

    // Calculate stability index
    calculateStability(draws) {
        let stability = 0;
        
        // Check for consistent patterns
        const patterns = {
            evenOdd: [],
            lowHigh: [],
            consecutive: []
        };

        draws.forEach(draw => {
            const numbers = draw.slice(1, 7).map(n => parseInt(n));
            
            // Even/Odd ratio
            const evenCount = numbers.filter(n => n % 2 === 0).length;
            patterns.evenOdd.push(evenCount);
            
            // Low/High ratio (1-24 vs 25-49)
            const lowCount = numbers.filter(n => n <= 24).length;
            patterns.lowHigh.push(lowCount);
            
            // Consecutive numbers
            const sorted = [...numbers].sort((a, b) => a - b);
            let consecutives = 0;
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i + 1] - sorted[i] === 1) consecutives++;
            }
            patterns.consecutive.push(consecutives);
        });

        // Calculate variance in patterns (lower variance = higher stability)
        Object.values(patterns).forEach(pattern => {
            const mean = pattern.reduce((a, b) => a + b, 0) / pattern.length;
            const variance = pattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pattern.length;
            stability += (1 / (1 + variance)); // Inverse relationship
        });

        return stability / 3; // Average stability across patterns
    }

    // Categorize volatility
    categorizeVolatility(volatility) {
        if (volatility > 2.0) return 'high';
        if (volatility > 1.5) return 'medium';
        return 'low';
    }

    // Categorize stability
    categorizeStability(stability) {
        if (stability > 0.8) return 'high';
        if (stability > 0.6) return 'medium';
        return 'low';
    }

    // Analyze number patterns
    analyzeNumberPatterns() {
        if (!window.results || window.results.length < 20) {
            this.patternAnalysis = { insufficient_data: true };
            return;
        }

        const recent20 = window.results.slice(0, 20);
        
        this.patternAnalysis = {
            hotNumbers: this.findHotNumbers(recent20),
            coldNumbers: this.findColdNumbers(recent20),
            patterns: this.detectPatterns(recent20),
            recommendations: this.generatePatternRecommendations(recent20)
        };
    }

    // Find hot numbers (frequently appearing)
    findHotNumbers(draws) {
        const frequency = {};
        for (let i = 1; i <= 49; i++) frequency[i] = 0;

        draws.forEach(draw => {
            for (let i = 1; i <= 6; i++) {
                const num = parseInt(draw[i]);
                if (frequency[num] !== undefined) frequency[num]++;
            }
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));
    }

    // Find cold numbers (rarely appearing)
    findColdNumbers(draws) {
        const frequency = {};
        for (let i = 1; i <= 49; i++) frequency[i] = 0;

        draws.forEach(draw => {
            for (let i = 1; i <= 6; i++) {
                const num = parseInt(draw[i]);
                if (frequency[num] !== undefined) frequency[num]++;
            }
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => a - b)
            .slice(0, 10)
            .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));
    }

    // Detect specific patterns
    detectPatterns(draws) {
        const patterns = {
            consecutiveFrequency: 0,
            evenOddBalance: [],
            sumDistribution: [],
            gapPatterns: []
        };

        draws.forEach(draw => {
            const numbers = draw.slice(1, 7).map(n => parseInt(n)).sort((a, b) => a - b);
            
            // Count consecutive numbers
            let consecutives = 0;
            for (let i = 0; i < numbers.length - 1; i++) {
                if (numbers[i + 1] - numbers[i] === 1) consecutives++;
            }
            patterns.consecutiveFrequency += consecutives;

            // Even/Odd balance
            const evenCount = numbers.filter(n => n % 2 === 0).length;
            patterns.evenOddBalance.push(evenCount);

            // Sum
            const sum = numbers.reduce((a, b) => a + b, 0);
            patterns.sumDistribution.push(sum);

            // Gaps between numbers
            const gaps = [];
            for (let i = 0; i < numbers.length - 1; i++) {
                gaps.push(numbers[i + 1] - numbers[i]);
            }
            patterns.gapPatterns.push(gaps);
        });

        return patterns;
    }

    // Generate pattern-based recommendations
    generatePatternRecommendations(draws) {
        const recommendations = [];

        // Hot/Cold analysis
        const hot = this.findHotNumbers(draws).slice(0, 5);
        const cold = this.findColdNumbers(draws).slice(0, 5);

        recommendations.push({
            type: 'hot_numbers',
            message: `Consider including hot numbers: ${hot.map(h => h.number).join(', ')}`,
            confidence: 'medium',
            numbers: hot.map(h => h.number)
        });

        recommendations.push({
            type: 'cold_numbers', 
            message: `Cold numbers due for appearance: ${cold.map(c => c.number).join(', ')}`,
            confidence: 'low',
            numbers: cold.map(c => c.number)
        });

        // Pattern recommendations based on market conditions
        if (this.marketConditions.volatility === 'high') {
            recommendations.push({
                type: 'strategy',
                message: 'High volatility detected - use shorter range (20 draws) for predictions',
                confidence: 'high'
            });
        } else if (this.marketConditions.volatility === 'low') {
            recommendations.push({
                type: 'strategy',
                message: 'Low volatility - longer range (100 draws) may be more effective',
                confidence: 'medium'
            });
        }

        return recommendations;
    }

    // Get optimal method recommendation
    getOptimalMethodRecommendation() {
        // Check if we have performance data
        if (window.performanceDashboard) {
            const methods = ['enhanced', 'frequency', 'weighted', 'hotcold'];
            const performances = methods.map(method => ({
                method,
                ...window.performanceDashboard.getMethodPerformance(method)
            })).filter(p => p.tests > 0);

            if (performances.length > 0) {
                const best = performances.sort((a, b) => b.accuracy - a.accuracy)[0];
                return {
                    method: best.method,
                    reason: `Best performing method (${best.accuracy}% accuracy)`,
                    confidence: best.tests >= 5 ? 'high' : 'medium'
                };
            }
        }

        // Fallback to market condition based recommendation
        const volatility = this.marketConditions.volatility;
        const stability = this.marketConditions.stability;

        if (volatility === 'low' && stability === 'high') {
            return {
                method: 'frequency',
                reason: 'Stable market favors frequency-based analysis',
                confidence: 'medium'
            };
        } else if (volatility === 'high') {
            return {
                method: 'weighted',
                reason: 'High volatility favors recent-weighted analysis',
                confidence: 'medium'
            };
        } else {
            return {
                method: 'enhanced',
                reason: 'Balanced conditions favor ensemble approach',
                confidence: 'medium'
            };
        }
    }

    // Get optimal range recommendation
    getOptimalRangeRecommendation() {
        const volatility = this.marketConditions.volatility;
        const trend = this.marketConditions.trend;

        if (volatility === 'high') {
            return {
                range: 20,
                reason: 'High volatility - focus on recent patterns',
                confidence: 'high'
            };
        } else if (volatility === 'low' && trend === 'stable') {
            return {
                range: 100,
                reason: 'Stable conditions - use longer historical data',
                confidence: 'medium'
            };
        } else {
            return {
                range: 50,
                reason: 'Balanced approach for current conditions',
                confidence: 'medium'
            };
        }
    }

    // Generate comprehensive recommendations
    generateRecommendations() {
        const methodRec = this.getOptimalMethodRecommendation();
        const rangeRec = this.getOptimalRangeRecommendation();

        return {
            method: methodRec,
            range: rangeRec,
            patterns: this.patternAnalysis.recommendations || [],
            marketConditions: this.marketConditions,
            summary: this.generateSummary(methodRec, rangeRec)
        };
    }

    // Generate recommendation summary
    generateSummary(methodRec, rangeRec) {
        const confidence = methodRec.confidence === 'high' && rangeRec.confidence === 'high' ? 'high' :
                          methodRec.confidence === 'low' || rangeRec.confidence === 'low' ? 'low' : 'medium';
        
        return {
            primaryMethod: methodRec.method,
            primaryRange: rangeRec.range,
            overallConfidence: confidence,
            keyInsights: [
                `Market volatility: ${this.marketConditions.volatility}`,
                `Trend: ${this.marketConditions.trend}`,
                `Recommended strategy: ${methodRec.method} with ${rangeRec.range} draws`
            ]
        };
    }

    // Display smart recommendations
    displayRecommendations() {
        const recommendations = this.generateRecommendations();
        
        console.log('\n🧠 SMART RECOMMENDATIONS');
        console.log('=' .repeat(30));
        
        console.log('\n🎯 OPTIMAL STRATEGY:');
        console.log(`Method: ${recommendations.method.method} (${recommendations.method.confidence} confidence)`);
        console.log(`Reason: ${recommendations.method.reason}`);
        console.log(`Range: ${recommendations.range.range} draws (${recommendations.range.confidence} confidence)`);
        console.log(`Reason: ${recommendations.range.reason}`);
        
        console.log('\n📊 MARKET CONDITIONS:');
        console.log(`Volatility: ${recommendations.marketConditions.volatility}`);
        console.log(`Trend: ${recommendations.marketConditions.trend}`);
        console.log(`Stability: ${recommendations.marketConditions.stability}`);
        
        if (recommendations.patterns.length > 0) {
            console.log('\n🎲 PATTERN INSIGHTS:');
            recommendations.patterns.forEach(pattern => {
                console.log(`• ${pattern.message} (${pattern.confidence} confidence)`);
            });
        }

        console.log('\n💡 KEY INSIGHTS:');
        recommendations.summary.keyInsights.forEach(insight => {
            console.log(`• ${insight}`);
        });

        return recommendations;
    }

    // Apply recommendations automatically
    applyRecommendations() {
        const recommendations = this.generateRecommendations();
        
        // Set method
        const methodSelect = document.getElementById('predictionMethod');
        if (methodSelect) {
            methodSelect.value = recommendations.method.method;
            console.log(`✅ Applied method: ${recommendations.method.method}`);
        }

        // Set range
        const rangeSelect = document.getElementById('drawRange');
        if (rangeSelect) {
            rangeSelect.value = recommendations.range.range;
            console.log(`✅ Applied range: ${recommendations.range.range}`);
        }

        console.log('🎯 Recommendations applied to UI');
        return recommendations;
    }

    // Get personalized recommendations based on user risk preference
    getPersonalizedRecommendations(riskLevel = 'medium') {
        const baseRec = this.generateRecommendations();
        
        if (riskLevel === 'low') {
            // Conservative approach
            return {
                ...baseRec,
                method: { method: 'frequency', reason: 'Conservative frequency-based approach', confidence: 'high' },
                range: { range: 100, reason: 'Longer range for stability', confidence: 'high' }
            };
        } else if (riskLevel === 'high') {
            // Aggressive approach
            return {
                ...baseRec,
                method: { method: 'enhanced', reason: 'Aggressive ensemble approach', confidence: 'medium' },
                range: { range: 20, reason: 'Recent patterns for quick adaptation', confidence: 'medium' }
            };
        }
        
        return baseRec; // Medium risk - use standard recommendations
    }
}

// Create global smart recommendations instance
window.smartRecommendations = new SmartRecommendations();

// Auto-apply recommendations and predict
window.predictWithRecommendations = function(riskLevel = 'medium') {
    console.log(`🧠 Applying smart recommendations (Risk: ${riskLevel})`);
    
    const recommendations = window.smartRecommendations.getPersonalizedRecommendations(riskLevel);
    window.smartRecommendations.displayRecommendations();
    
    // Apply to UI
    const methodSelect = document.getElementById('predictionMethod');
    const rangeSelect = document.getElementById('drawRange');
    
    if (methodSelect) methodSelect.value = recommendations.method.method;
    if (rangeSelect) rangeSelect.value = recommendations.range.range;
    
    // Run prediction
    if (typeof predict === 'function') {
        setTimeout(predict, 100); // Small delay to ensure UI updates
    }
    
    return recommendations;
};

console.log('\n🧠 SMART RECOMMENDATIONS READY!');
console.log('Commands:');
console.log('• smartRecommendations.displayRecommendations() - Show all recommendations');
console.log('• smartRecommendations.applyRecommendations() - Apply to UI');
console.log('• predictWithRecommendations("low"|"medium"|"high") - Auto-apply and predict');
console.log('• smartRecommendations.getPersonalizedRecommendations(riskLevel)');