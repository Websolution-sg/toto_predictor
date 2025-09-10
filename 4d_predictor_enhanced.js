// Enhanced 4D Predictor Features with Comprehensive Analysis

class Enhanced4DPredictor {
    constructor() {
        this.historicalData = [];
        this.digitFrequency = Array(10).fill(0);
        this.positionFrequency = Array(4).fill().map(() => Array(10).fill(0));
        this.pairFrequency = new Map();
        this.recentTrends = new Map();
        this.numberGaps = new Map();
        this.sequencePatterns = new Map();
        this.categoryWeights = {
            first: 1.0,
            second: 0.8,
            third: 0.6,
            starter: 0.4,
            consolation: 0.2
        };
    }

    analyzeHistoricalData(data) {
        this.historicalData = data;
        this.analyzeDigitFrequency();
        this.analyzePositionalFrequency();
        this.analyzePairPatterns();
    }

    analyzeDigitFrequency() {
        this.digitFrequency = Array(10).fill(0);
        this.historicalData.forEach(draw => {
            const numbers = [draw.first, draw.second, draw.third];
            numbers.forEach(num => {
                if (num) {
                    String(num).padStart(4, '0').split('').forEach(digit => {
                        this.digitFrequency[parseInt(digit)]++;
                    });
                }
            });
        });
    }

    analyzePositionalFrequency() {
        this.positionFrequency = Array(4).fill().map(() => Array(10).fill(0));
        this.historicalData.forEach(draw => {
            const numbers = [draw.first, draw.second, draw.third];
            numbers.forEach(num => {
                if (num) {
                    String(num).padStart(4, '0').split('').forEach((digit, pos) => {
                        this.positionFrequency[pos][parseInt(digit)]++;
                    });
                }
            });
        });
    }

    analyzePairPatterns() {
        this.pairFrequency.clear();
        this.historicalData.forEach(draw => {
            const numbers = [draw.first, draw.second, draw.third];
            numbers.forEach(num => {
                if (num) {
                    const digits = String(num).padStart(4, '0').split('');
                    for (let i = 0; i < digits.length - 1; i++) {
                        const pair = digits[i] + digits[i + 1];
                        this.pairFrequency.set(pair, (this.pairFrequency.get(pair) || 0) + 1);
                    }
                }
            });
        });
    }

    generatePredictions(options = {}) {
        const {
            count = 5,
            minDigitSum = 0,
            maxDigitSum = 36,
            excludeDigits = [],
            requireDigits = [],
            probabilityThreshold = 0.1
        } = options;

        const predictions = [];
        const seen = new Set();

        while (predictions.length < count) {
            const prediction = this.generateSinglePrediction(options);
            const predictionStr = prediction.number.toString();
            
            if (!seen.has(predictionStr) && 
                this.validatePrediction(prediction.number, options)) {
                predictions.push(prediction);
                seen.add(predictionStr);
            }
        }

        return predictions.sort((a, b) => b.probability - a.probability);
    }

    generateSinglePrediction(options) {
        const number = [];
        let probability = 1;

        // Generate each digit based on positional frequency
        for (let pos = 0; pos < 4; pos++) {
            const posFreq = this.positionFrequency[pos];
            const total = posFreq.reduce((a, b) => a + b, 0);
            
            // Weight random selection by frequency
            let rand = Math.random() * total;
            let digit = 0;
            
            for (let i = 0; i < posFreq.length; i++) {
                if (rand < posFreq[i]) {
                    digit = i;
                    break;
                }
                rand -= posFreq[i];
            }
            
            number.push(digit);
            probability *= (posFreq[digit] / total);
        }

        return {
            number: parseInt(number.join('')),
            probability: probability,
            analysis: this.analyzePrediction(number)
        };
    }

    validatePrediction(number, options) {
        const digits = String(number).padStart(4, '0').split('').map(Number);
        const digitSum = digits.reduce((a, b) => a + b, 0);

        // Check digit sum constraints
        if (options.minDigitSum && digitSum < options.minDigitSum) return false;
        if (options.maxDigitSum && digitSum > options.maxDigitSum) return false;

        // Check excluded digits
        if (options.excludeDigits && 
            digits.some(d => options.excludeDigits.includes(d))) return false;

        // Check required digits
        if (options.requireDigits && 
            !options.requireDigits.every(d => digits.includes(d))) return false;

        return true;
    }

    analyzePrediction(digits) {
        const digitSum = digits.reduce((a, b) => a + b, 0);
        const evenCount = digits.filter(d => d % 2 === 0).length;
        const oddCount = 4 - evenCount;
        
        // Calculate pattern score based on pair frequency
        let patternScore = 0;
        for (let i = 0; i < digits.length - 1; i++) {
            const pair = digits[i].toString() + digits[i + 1].toString();
            patternScore += (this.pairFrequency.get(pair) || 0);
        }

        return {
            digitSum,
            evenOddRatio: `${evenCount}:${oddCount}`,
            patternScore: patternScore / 3, // Normalize score
            digitFrequency: digits.map(d => this.digitFrequency[d])
        };
    }

    getDigitStatistics() {
        return {
            mostFrequent: this.digitFrequency
                .map((freq, digit) => ({ digit, freq }))
                .sort((a, b) => b.freq - a.freq)
                .slice(0, 3),
            positionPreference: this.positionFrequency.map((freqs, pos) => ({
                position: pos + 1,
                preferredDigits: freqs
                    .map((freq, digit) => ({ digit, freq }))
                    .sort((a, b) => b.freq - a.freq)
                    .slice(0, 3)
            })),
            commonPairs: Array.from(this.pairFrequency.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }
}
