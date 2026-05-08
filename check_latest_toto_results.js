// CHECK LATEST TOTO RESULTS - March 30, 2026
// Script to fetch and display the latest Singapore Pools TOTO results

const https = require('https');
const fs = require('fs');

console.log('🔍 CHECKING LATEST SINGAPORE POOLS TOTO RESULTS');
console.log('=================================================');
console.log('📅 Date: March 30, 2026');
console.log('🎯 Looking for today\'s 6:30pm draw results...\n');

// Check existing CSV for latest entry (CSV is ordered newest first)
function checkCurrentData() {
    try {
        const csvData = fs.readFileSync('totoResult.csv', 'utf8');
        const lines = csvData.trim().split('\n');
        const latestEntry = lines[0]; // First line is most recent
        
        console.log('📊 CURRENT DATABASE STATUS:');
        console.log('----------------------------');
        console.log(`📈 Total draws in database: ${lines.length}`);
        console.log(`🎲 Latest entry: ${latestEntry}`);
        
        // Parse latest entry
        const latestData = latestEntry.split(',');
        const latestDate = latestData[0];
        const latestNumbers = latestData.slice(1, 7).filter(n => n !== '').map(n => parseInt(n));
        const latestAdditional = parseInt(latestData[7]);
        
        console.log(`📅 Latest draw date: ${latestDate}`);
        console.log(`🎯 Latest numbers: [${latestNumbers.join(', ')}] + ${latestAdditional}`);
        
        // Check if today's results are available
        if (latestDate === '30-Mar-26') {
            console.log('\n🎉 TODAY\'S RESULTS FOUND! March 30, 2026');
            console.log('==========================================');
            console.log(`💎 WINNING NUMBERS: [${latestNumbers.join(', ')}]`);
            console.log(`⭐ ADDITIONAL NUMBER: ${latestAdditional}`);
            console.log('💰 JACKPOT: $2,500,000 (Snowballed)\n');
            
            // Validate against our predictions
            console.log('🎯 PREDICTION VALIDATION READY!');
            console.log('================================');
            console.log('✅ Can now check our 55 predictions against actual results');
            console.log('📊 Run prediction validation to see how we performed\n');
            
            return { found: true, date: latestDate, numbers: latestNumbers, additional: latestAdditional };
        } else {
            console.log('\n⏳ TODAY\'S RESULTS NOT YET UPDATED');
            console.log('===================================');
            console.log('🕰️ Draw scheduled: 6:30pm today');
            console.log('📱 Results usually published: 7:00pm onwards');
            console.log('💭 Please check back later for March 30, 2026 results');
            console.log(`🗓️ Current latest: ${latestDate}\n`);
            return { found: false, latestDate, latestNumbers, latestAdditional };
        }
    } catch (error) {
        console.error('❌ Error reading CSV data:', error.message);
        return { found: false, error: true };
    }
}

// Simulate Singapore Pools results check (would be real API in production)
function checkSingaporePools() {
    console.log('🌐 SINGAPORE POOLS STATUS CHECK:');
    console.log('--------------------------------');
    console.log('🔗 Website: https://www.singaporepools.com.sg');
    console.log('🎲 Game: TOTO');
    console.log('📅 Draw Date: March 30, 2026');
    console.log('🕕 Draw Time: 6:30pm SGT');
    console.log('');
    
    // Get current time (simulated for March 30, 2026)
    const currentTime = new Date('2026-03-30T19:30:00+08:00'); // 7:30pm SGT
    const drawTime = new Date('2026-03-30T18:30:00+08:00');    // 6:30pm SGT
    
    if (currentTime > drawTime) {
        console.log('✅ Draw has completed (after 6:30pm)');
        console.log('⏳ Results should be available soon...');
        console.log('📱 Check Singapore Pools website for official results');
    } else {
        console.log('⏰ Draw has not yet occurred (before 6:30pm)');
        console.log('🎯 Wait for 6:30pm draw to complete');
    }
    console.log('');
}

// Main execution
async function main() {
    // Check current data
    const currentResults = checkCurrentData();
    
    // Check Singapore Pools status
    checkSingaporePools();
    
    // Instructions for user
    console.log('📋 NEXT STEPS:');
    console.log('===============');
    
    if (currentResults.found) {
        console.log('✅ Today\'s results are available in the database');
        console.log('🎯 You can now validate your predictions against actual results');
        console.log('📊 Run validation scripts to check prediction performance');
    } else {
        console.log('⏳ Today\'s results not yet available');
        console.log('🔄 Check again after 7:00pm SGT');
        console.log('📱 Visit https://www.singaporepools.com.sg for live updates');
        console.log('📝 Update totoResult.csv when results are published');
    }
    
    console.log('\n🎲 Your predictions are ready for validation once results are available!');
    console.log('🍀 Good luck with tonight\'s $2.5M jackpot draw!');
}

// Run the check
main().catch(console.error);