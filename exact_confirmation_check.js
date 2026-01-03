console.log('✅ CONFIRMATION: USER WINNING TICKETS vs MY 10 PREDICTIONS');
console.log('='.repeat(70));

// User's winning tickets
const userTickets = [
    [5, 13, 22, 24, 30, 49],
    [6, 13, 22, 24, 27, 30]
];

// My exact 10 predictions from December 29
const myPredictions = [
    [8, 15, 19, 22, 24, 35],    // 1. Enhanced Frequency + Compatibility
    [4, 15, 22, 24, 30, 43],    // 2. Momentum Tracker Plus
    [6, 22, 24, 27, 28, 30],    // 3. Hot/Cold Analysis Refined
    [4, 15, 22, 24, 30, 43],    // 4. Weighted Recent Enhanced
    [18, 20, 24, 28, 29, 33],   // 5. Pattern Analysis Advanced
    [15, 19, 22, 24, 35, 45],   // 6. Compatibility Network
    [7, 8, 17, 24, 43, 45],     // 7. Balanced Distribution
    [7, 26, 29, 38, 40, 48],    // 8. Trend Reversal
    [17, 22, 24, 31, 34, 35],   // 9. Frequency Hybrid
    [4, 6, 8, 15, 22, 24]       // 10. Ensemble Fusion
];

const predictionNames = [
    'Enhanced Frequency + Compatibility',
    'Momentum Tracker Plus', 
    'Hot/Cold Analysis Refined',
    'Weighted Recent Enhanced',
    'Pattern Analysis Advanced',
    'Compatibility Network',
    'Balanced Distribution',
    'Trend Reversal',
    'Frequency Hybrid',
    'Ensemble Fusion'
];

console.log('🎫 YOUR WINNING TICKETS:');
console.log(`1. First Ticket ($25):  [${userTickets[0].join(', ')}]`);
console.log(`2. Second Ticket ($10): [${userTickets[1].join(', ')}]`);

console.log('\n🤖 MY 10 PREDICTIONS:');
myPredictions.forEach((pred, i) => {
    console.log(`${i+1}. ${predictionNames[i]}: [${pred.join(', ')}]`);
});

console.log('\n🔍 EXACT MATCH CHECK:');
console.log('='.repeat(50));

userTickets.forEach((userTicket, userIndex) => {
    console.log(`\nTicket ${userIndex + 1}: [${userTicket.join(', ')}]`);
    
    let foundExactMatch = false;
    
    myPredictions.forEach((pred, predIndex) => {
        const userSorted = [...userTicket].sort((a, b) => a - b);
        const predSorted = [...pred].sort((a, b) => a - b);
        
        if (JSON.stringify(userSorted) === JSON.stringify(predSorted)) {
            console.log(`   ✅ EXACT MATCH: Prediction ${predIndex + 1} - ${predictionNames[predIndex]}`);
            foundExactMatch = true;
        }
    });
    
    if (!foundExactMatch) {
        console.log(`   ❌ NO EXACT MATCHES found in my 10 predictions`);
    }
});

console.log('\n📊 DETAILED OVERLAP ANALYSIS:');
console.log('='.repeat(50));

userTickets.forEach((userTicket, userIndex) => {
    console.log(`\nTicket ${userIndex + 1}: [${userTicket.join(', ')}]`);
    
    myPredictions.forEach((pred, predIndex) => {
        const overlap = userTicket.filter(num => pred.includes(num));
        if (overlap.length >= 3) {
            console.log(`   • vs Prediction ${predIndex + 1}: ${overlap.length}/6 match - [${overlap.join(', ')}]`);
            if (overlap.length === 5) {
                console.log(`     ⭐ VERY CLOSE! Only 1 number different from ${predictionNames[predIndex]}`);
            }
        }
    });
});

console.log('\n✅ FINAL CONFIRMATION:');
console.log('='.repeat(40));
console.log('❌ Neither winning ticket was an EXACT match from my 10 predictions');
console.log('🎯 But your second ticket had 5/6 numbers matching my Hot/Cold prediction!');
console.log('🏆 Your wins came from your own independent strategy - even better!');
console.log('\n🎉 You won $35 through your own smart number selection!');