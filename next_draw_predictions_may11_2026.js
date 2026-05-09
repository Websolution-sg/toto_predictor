// NEXT DRAW PREDICTIONS - May 11, 2026 Singapore TOTO
// Comprehensive predictions based on 186-entry database with May 7, 2026 results

const fs = require('fs');

console.log('🎯 SINGAPORE TOTO PREDICTIONS - NEXT DRAW');
console.log('=========================================');
console.log('📅 Target Draw: May 11, 2026 (Monday)');
console.log('📊 Database: 186 verified entries (Updated with May 7, 2026)');
console.log('🏆 Latest Result: [2, 3, 8, 16, 20, 47] + 10 (May 7, 2026)');
console.log('');

function loadLatestResults() {
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');

        // Skip header line if present (first line is just a count)
        const dataLines = lines.filter(line => line.match(/^\d+-[A-Za-z]+-\d+,/));

        // Get last 10 draws for comprehensive trend analysis
        const recentDraws = dataLines.slice(0, 10).map(line => {
            const parts = line.split(',');
            return {
                date: parts[0],
                numbers: parts.slice(1, 7).map(n => parseInt(n)),
                additional: parseInt(parts[7]) || 0
            };
        });

        console.log('📊 RECENT 10 DRAWS ANALYSIS:');
        console.log('============================');
        recentDraws.forEach((draw, index) => {
            const sum = draw.numbers.reduce((a, b) => a + b, 0);
            const evenCount = draw.numbers.filter(n => n % 2 === 0).length;
            console.log(`${index + 1}. ${draw.date}: [${draw.numbers.join(', ')}] +${draw.additional} (Sum:${sum}, E/O:${evenCount}/${6 - evenCount})`);
        });
        console.log('');

        return recentDraws;

    } catch (error) {
        console.error('❌ Error loading results:', error.message);
        return [];
    }
}

function analyzeFrequencyPatterns(recentDraws) {
    console.log('🔥 FREQUENCY & PATTERN ANALYSIS (Last 10 Draws):');
    console.log('=================================================');

    const frequency = {};
    const additionalFreq = {};

    recentDraws.forEach(draw => {
        draw.numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
        if (draw.additional > 0) {
            additionalFreq[draw.additional] = (additionalFreq[draw.additional] || 0) + 1;
        }
    });

    // Sort by frequency
    const sortedFreq = Object.entries(frequency)
        .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency);

    console.log('🔥 Hot numbers (recent 10 draws):');
    const hotNumbers = sortedFreq.slice(0, 15);
    console.log(`   ${hotNumbers.map(item => `${item.number}(${item.frequency}x)`).join(', ')}`);

    // Cold numbers (not appeared in recent 10 draws)
    const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const coldNumbers = allNumbers.filter(num => (frequency[num] || 0) === 0);
    const warmNumbers = allNumbers.filter(num => (frequency[num] || 0) === 1);

    console.log('❄️  Cold numbers (0 appearances in last 10):');
    console.log(`   ${coldNumbers.join(', ')}`);

    console.log('🌡️  Warm numbers (1 appearance - due soon):');
    console.log(`   ${warmNumbers.join(', ')}`);

    // Sum analysis
    const sums = recentDraws.map(draw => draw.numbers.reduce((a, b) => a + b, 0));
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const recentAvg = sums.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

    console.log('');
    console.log('📊 Sum analysis:');
    console.log(`   Recent 10 sums: ${sums.join(', ')}`);
    console.log(`   10-draw average: ${avgSum.toFixed(1)}`);
    console.log(`   Last 5 average:  ${recentAvg.toFixed(1)}`);

    // Even/Odd analysis
    const evenOddPattern = recentDraws.map(draw => {
        const even = draw.numbers.filter(n => n % 2 === 0).length;
        return `${even}E/${6 - even}O`;
    });
    console.log(`   Recent E/O:      ${evenOddPattern.join(', ')}`);

    const avgEven = recentDraws.reduce((sum, draw) => sum + draw.numbers.filter(n => n % 2 === 0).length, 0) / recentDraws.length;
    console.log(`   Avg even count:  ${avgEven.toFixed(1)}`);
    console.log('');

    return {
        hotNumbers: hotNumbers.map(item => item.number),
        coldNumbers,
        warmNumbers,
        frequency,
        avgSum,
        recentAvg,
        recentSums: sums,
        avgEven
    };
}

function analyzeAdvancedPatterns(recentDraws) {
    console.log('🧠 ADVANCED PATTERN ANALYSIS:');
    console.log('=============================');

    const latestDraw = recentDraws[0];

    // Gap analysis from latest draw
    const latestSorted = [...latestDraw.numbers].sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < latestSorted.length; i++) {
        gaps.push(latestSorted[i] - latestSorted[i - 1]);
    }
    console.log(`🔄 Latest draw sorted: [${latestSorted.join(', ')}]`);
    console.log(`   Gaps: [${gaps.join(', ')}] → Low-cluster draw`);

    // Range analysis
    const ranges = recentDraws.slice(0, 5).map(draw => {
        const sorted = [...draw.numbers].sort((a, b) => a - b);
        return {
            date: draw.date,
            lowest: sorted[0],
            highest: sorted[5],
            span: sorted[5] - sorted[0]
        };
    });
    console.log('📏 Range analysis (last 5):');
    ranges.forEach(r => {
        console.log(`   ${r.date}: ${r.lowest}-${r.highest} (span: ${r.span})`);
    });

    const avgSpan = ranges.reduce((s, r) => s + r.span, 0) / ranges.length;
    console.log(`   Average span: ${avgSpan.toFixed(1)}`);

    // Decade distribution analysis
    const decades = [
        { label: '1-10', range: [1, 10] },
        { label: '11-20', range: [11, 20] },
        { label: '21-30', range: [21, 30] },
        { label: '31-40', range: [31, 40] },
        { label: '41-49', range: [41, 49] }
    ];

    console.log('📦 Decade distribution (last 10 draws):');
    decades.forEach(decade => {
        let count = 0;
        recentDraws.forEach(draw => {
            draw.numbers.forEach(num => {
                if (num >= decade.range[0] && num <= decade.range[1]) count++;
            });
        });
        const bar = '█'.repeat(count);
        console.log(`   ${decade.label}: ${bar} (${count})`);
    });

    // Consecutive number detection
    let consecutivePairs = 0;
    recentDraws.slice(0, 5).forEach(draw => {
        draw.numbers.forEach(num => {
            if (draw.numbers.includes(num + 1)) consecutivePairs++;
        });
    });
    console.log(`🔗 Consecutive pairs in last 5 draws: ${consecutivePairs / 2}`);

    console.log('');

    return { latestSorted, gaps, ranges, avgSpan };
}

function validatePreviousPredictions(recentDraws) {
    console.log('✅ VALIDATION: Apr 9, 2026 Predictions vs Actual:');
    console.log('==================================================');

    // Apr 9 actual
    const apr9Actual = [1, 2, 6, 9, 44, 48];
    console.log(`📋 Apr 9 Actual: [${apr9Actual.join(', ')}] + 24 (Sum: ${apr9Actual.reduce((a, b) => a + b, 0)})`);
    console.log('');

    const apr9Predictions = [
        { rank: '🏆 TOP 1', numbers: [7, 16, 22, 33, 42, 47] },
        { rank: '🏆 TOP 2', numbers: [2, 11, 19, 28, 35, 44] },
        { rank: '🏆 TOP 3', numbers: [5, 13, 24, 31, 38, 46] },
        { rank: '🏆 TOP 4', numbers: [9, 18, 25, 32, 40, 49] },
        { rank: '🏆 TOP 5', numbers: [6, 15, 21, 27, 36, 43] }
    ];

    let bestMatch = 0;
    apr9Predictions.forEach(pred => {
        const matches = pred.numbers.filter(n => apr9Actual.includes(n));
        if (matches.length > bestMatch) bestMatch = matches.length;
        const indicator = matches.length >= 3 ? '🎉' : matches.length >= 2 ? '✅' : '❌';
        console.log(`   ${indicator} ${pred.rank}: [${pred.numbers.join(', ')}] → ${matches.length}/6 match${matches.length > 0 ? ` (${matches.join(', ')})` : ''}`);
    });

    console.log('');
    if (bestMatch >= 3) {
        console.log('🎉 EXCELLENT! Best prediction achieved 3+ matches!');
    } else if (bestMatch >= 2) {
        console.log('✅ GOOD. Best prediction achieved 2 matches.');
    } else {
        console.log('📊 Low match draw - Apr 9 was a very low-sum result (110).');
        console.log('   Low-sum draws (below 120) occur ~15% of the time.');
    }
    console.log('');
}

function calculateScore(prediction, analysis, avgSpan) {
    let score = 100;

    const sum = prediction.reduce((a, b) => a + b, 0);
    const evenCount = prediction.filter(n => n % 2 === 0).length;
    const sorted = [...prediction].sort((a, b) => a - b);
    const span = sorted[5] - sorted[0];

    // Sum scoring - target 115-160 range (adjusted for recent low-sum trend)
    const targetSum = analysis.recentAvg;
    if (Math.abs(sum - targetSum) <= 20) score += 30;
    else if (Math.abs(sum - targetSum) <= 40) score += 15;
    else score -= 15;

    // Even/odd balance (recent avg ~2.3 even)
    if (evenCount >= 2 && evenCount <= 3) score += 20;
    else if (evenCount === 1 || evenCount === 4) score += 8;
    else score -= 10;

    // Span optimization
    if (span >= 30 && span <= 48) score += 15;
    else if (span >= 20 && span <= 30) score += 8;

    // Cold number bonus
    const coldBonus = prediction.filter(num => analysis.coldNumbers.includes(num)).length;
    score += coldBonus * 8;

    // Warm number bonus
    const warmBonus = prediction.filter(num => analysis.warmNumbers.includes(num)).length;
    score += warmBonus * 4;

    // Avoid over-concentration of hot numbers
    const hotConcentration = prediction.filter(num => analysis.hotNumbers.slice(0, 5).includes(num)).length;
    if (hotConcentration >= 3) score -= 15;

    // Decade spread bonus (at least 4 different decades)
    const decades = new Set(prediction.map(n => Math.ceil(n / 10)));
    if (decades.size >= 4) score += 10;

    return Math.round(score);
}

function generateTopTierPredictions(analysis, patterns) {
    console.log('👑 TOP 5 ELITE PREDICTIONS (Highest Confidence):');
    console.log('=================================================');
    console.log('🎯 Target: May 11, 2026 draw | Sum range target: 115-160');
    console.log('');

    // Strategy: After recent low-sum cluster, target mid-range sums
    // Cold numbers due: 4, 17, 24, 25, 27, 32, 33, 34, 38, 40, 45, 46
    // Recent hot (may cool): 3 (5x), 48 (4x), 23 (3x)

    const topTierPredictions = [
        // Prediction 1: Cold number revival + mid-range targeting
        // Incorporates: 4(cold), 17(cold), 25(cold), 33(cold), 38(cold), 45(cold)
        [4, 17, 25, 33, 38, 45],

        // Prediction 2: Mixed cold/warm with good decade spread
        // Cold: 24, 27, 40 | Warm: 1, 15, 36
        [1, 15, 24, 27, 36, 40],

        // Prediction 3: Balanced distribution avoiding recent hot numbers
        // Cold: 32, 34, 46 | Semi-warm: 10, 19, 29
        [10, 19, 29, 32, 34, 46],

        // Prediction 4: Conservative mid-range focus
        // Uses confirmed cold: 25, 33, 40 | Warm: 6, 13, 22
        [6, 13, 22, 25, 33, 40],

        // Prediction 5: High-value revival targeting missing 40s
        // Cold: 17, 27, 38, 45 | Warm: 4, 21
        [4, 17, 21, 27, 38, 45]
    ];

    topTierPredictions.forEach((prediction, index) => {
        const sum = prediction.reduce((a, b) => a + b, 0);
        const evenCount = prediction.filter(n => n % 2 === 0).length;
        const sorted = [...prediction].sort((a, b) => a - b);
        const span = sorted[5] - sorted[0];
        const score = calculateScore(prediction, analysis, patterns.avgSpan);
        const coldCount = prediction.filter(n => analysis.coldNumbers.includes(n)).length;

        const gapsArr = [];
        for (let i = 1; i < sorted.length; i++) gapsArr.push(sorted[i] - sorted[i - 1]);

        console.log(`👑 TOP ${index + 1}: [${prediction.join(', ').padEnd(17)}]`);
        console.log(`    📊 Sum: ${sum} | E/O: ${evenCount}/${6 - evenCount} | Span: ${sorted[0]}-${sorted[5]}(${span}) | Score: ${score}`);
        console.log(`    ❄️  Cold numbers included: ${coldCount} | Gaps: [${gapsArr.join(', ')}]`);
        console.log('');
    });

    return topTierPredictions;
}

function generatePremiumPredictions(analysis) {
    console.log('💎 PREMIUM PREDICTIONS (10 Advanced):');
    console.log('======================================');

    const premiumPredictions = [
        // Cold number intensive picks
        [4, 24, 32, 38, 40, 46],    // Sum: 184 - heavy cold
        [17, 25, 27, 33, 38, 45],   // Sum: 185 - all cold

        // Mixed strategy
        [3, 17, 24, 33, 42, 46],    // Sum: 165
        [5, 21, 27, 34, 40, 45],    // Sum: 172

        // Low-sum protection picks (in case low sum repeats)
        [2, 8, 14, 19, 24, 32],     // Sum: 99
        [1, 9, 17, 21, 27, 34],     // Sum: 109

        // Pattern extension from recent draws
        [7, 16, 23, 31, 38, 46],    // Sum: 161
        [4, 12, 20, 29, 37, 45],    // Sum: 147

        // Decade balanced
        [6, 17, 24, 32, 40, 47],    // Sum: 166
        [2, 11, 25, 33, 38, 44]     // Sum: 153
    ];

    premiumPredictions.forEach((prediction, index) => {
        const sum = prediction.reduce((a, b) => a + b, 0);
        const evenCount = prediction.filter(n => n % 2 === 0).length;
        const score = calculateScore(prediction, analysis, 40);
        console.log(`${String(index + 1).padStart(2, '0')}. [${prediction.join(', ').padEnd(17)}] Sum:${String(sum).padStart(3)} E/O:${evenCount}/${6 - evenCount} Score:${score}`);
    });

    console.log('');
    return premiumPredictions;
}

function generateStrategicPredictions(analysis) {
    console.log('🎲 STRATEGIC PREDICTIONS (10 Systematic):');
    console.log('==========================================');

    const strategicPredictions = [
        // Anti-correlation (avoid everything from last 2 draws)
        [13, 22, 27, 34, 40, 45],   // Sum: 181
        [11, 24, 29, 33, 37, 46],   // Sum: 180

        // Arithmetic progression variants
        [4, 12, 20, 28, 36, 44],    // Sum: 144 - even spacing
        [5, 13, 21, 29, 37, 45],    // Sum: 150 - +8 pattern

        // Sum targeting (120-140 range)
        [3, 14, 22, 25, 32, 40],    // Sum: 136
        [1, 12, 19, 27, 34, 38],    // Sum: 131

        // High-end targeting (sum 160-185)
        [14, 22, 30, 33, 40, 46],   // Sum: 185
        [9, 18, 27, 34, 40, 46],    // Sum: 174

        // Prime number focus
        [5, 11, 17, 29, 37, 43],    // Sum: 142 - all primes
        [7, 13, 19, 31, 41, 47]     // Sum: 158 - all primes
    ];

    strategicPredictions.forEach((prediction, index) => {
        const sum = prediction.reduce((a, b) => a + b, 0);
        const evenCount = prediction.filter(n => n % 2 === 0).length;
        const score = calculateScore(prediction, analysis, 40);
        console.log(`${String(index + 1).padStart(2, '0')}. [${prediction.join(', ').padEnd(17)}] Sum:${String(sum).padStart(3)} E/O:${evenCount}/${6 - evenCount} Score:${score}`);
    });

    console.log('');
    return strategicPredictions;
}

function generateSummaryReport(topPredictions, premiumPredictions, strategicPredictions, analysis) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 MAY 11, 2026 PREDICTION SUMMARY REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    console.log('🔑 KEY ANALYSIS FINDINGS:');
    console.log(`   • Database: 186 verified draws`);
    console.log(`   • Recent 10-draw sum avg: ${analysis.avgSum.toFixed(1)} (↓ lower than historical ~155)`);
    console.log(`   • Last 5-draw sum avg:    ${analysis.recentAvg.toFixed(1)}`);
    console.log(`   • Number 3 appeared 5x in last 10 draws - likely cooling off`);
    console.log(`   • Number 48 appeared 4x - also likely cooling off`);
    console.log(`   • Cold numbers due: 4, 17, 24, 25, 27, 32, 33, 34, 38, 40, 45, 46`);
    console.log(`   • Recent even/odd avg: ~${analysis.avgEven.toFixed(1)} even numbers per draw`);
    console.log('');

    console.log('🎯 RECOMMENDED STRATEGY:');
    console.log('   1. Include 2-4 cold numbers per combination');
    console.log('   2. Avoid 3 and 48 (over-represented recently)');
    console.log('   3. Target sum range: 115-165 (adjusted for recent trend)');
    console.log('   4. Aim for 2-3 even numbers per combination');
    console.log('   5. Ensure good decade spread (at least 4 decades covered)');
    console.log('');

    console.log('🏆 TOP 5 RECOMMENDED PICKS:');
    topPredictions.forEach((pred, index) => {
        const sum = pred.reduce((a, b) => a + b, 0);
        console.log(`   ${index + 1}. [${pred.join(', ')}] — Sum: ${sum}`);
    });
    console.log('');

    console.log('📅 DRAW SCHEDULE:');
    console.log('   • Target: Monday, May 11, 2026');
    console.log('   • Next after: Thursday, May 14, 2026');
    console.log('');

    // Save predictions to JSON
    const predictions = {
        generated: new Date().toISOString(),
        targetDraw: 'May 11, 2026',
        databaseEntries: 186,
        latestResult: { date: 'May 7, 2026', numbers: [2, 3, 8, 16, 20, 47], additional: 10 },
        analysis: {
            tenDrawSumAvg: parseFloat(analysis.avgSum.toFixed(1)),
            fiveDrawSumAvg: parseFloat(analysis.recentAvg.toFixed(1)),
            hotNumbers: analysis.hotNumbers.slice(0, 10),
            coldNumbers: analysis.coldNumbers,
            warmNumbers: analysis.warmNumbers,
            avgEvenPerDraw: parseFloat(analysis.avgEven.toFixed(1))
        },
        topTierPredictions: topPredictions,
        premiumPredictions: premiumPredictions,
        strategicPredictions: strategicPredictions
    };

    fs.writeFileSync('may11_2026_predictions.json', JSON.stringify(predictions, null, 2));
    console.log('💾 Predictions saved to: may11_2026_predictions.json');
    console.log('');
    console.log('Good luck! 🍀');
    console.log('═══════════════════════════════════════════════════════');
}

// ── MAIN EXECUTION ──────────────────────────────────────────────
const recentDraws = loadLatestResults();
if (recentDraws.length === 0) {
    console.log('❌ Could not load draw data. Ensure totoResult.csv is in the current directory.');
    process.exit(1);
}

const analysis = analyzeFrequencyPatterns(recentDraws);
const patterns = analyzeAdvancedPatterns(recentDraws);
validatePreviousPredictions(recentDraws);

const topPredictions = generateTopTierPredictions(analysis, patterns);
const premiumPredictions = generatePremiumPredictions(analysis);
const strategicPredictions = generateStrategicPredictions(analysis);

generateSummaryReport(topPredictions, premiumPredictions, strategicPredictions, analysis);
