const fs = require('fs');

// Based on typical TOTO holiday schedule, some dates might not have draws
const holidayInfo = {
    '25-Dec-25': 'Christmas Day - likely no draw',
    '28-Dec-25': 'Weekend after Christmas',
    '29-Dec-25': 'New Year holiday period',
    '7-Dec-25': 'Saturday - should have draw',
    '14-Dec-25': 'Saturday - should have draw', 
    '15-Dec-25': 'Sunday - regular draw day',
    '18-Dec-25': 'Wednesday - not typical draw day',
    '21-Dec-25': 'Saturday - should have draw'
};

// Manual results that I can verify or estimate
const knownMissingResults = {
    // These would need to be manually added once verified
    // '15-Dec-25': { numbers: [?, ?, ?, ?, ?, ?], additional: ? },
    // '19-Dec-25': { numbers: [?, ?, ?, ?, ?, ?], additional: ? }
};

function analyzeMissingDates() {
    console.log('🎯 TOTO Missing Dates Analysis');
    console.log('==============================\n');
    
    const missingDates = [
        '7-Dec-25', '14-Dec-25', '15-Dec-25', '18-Dec-25', 
        '21-Dec-25', '25-Dec-25', '28-Dec-25', '29-Dec-25'
    ];
    
    console.log('🔍 Analyzing each missing date:\n');
    
    missingDates.forEach((date, index) => {
        const dateObj = new Date(2025, 11, parseInt(date.split('-')[0]));
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const likelihood = getLikelihood(date, dayName);
        
        console.log(`${index + 1}. ${date} (${dayName})`);
        console.log(`   Likelihood of draw: ${likelihood.status}`);
        console.log(`   Reason: ${likelihood.reason}`);
        
        if (holidayInfo[date]) {
            console.log(`   Holiday note: ${holidayInfo[date]}`);
        }
        console.log('');
    });
    
    console.log('📋 Recommendations:');
    console.log('===================\n');
    
    const probableDraws = ['7-Dec-25', '14-Dec-25', '15-Dec-25', '21-Dec-25'];
    const unlikelyDraws = ['18-Dec-25', '25-Dec-25', '28-Dec-25', '29-Dec-25'];
    
    console.log('✅ Likely had draws (need to find results):');
    probableDraws.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date}`);
    });
    
    console.log('\n❌ Unlikely to have draws (holiday/schedule):');
    unlikelyDraws.forEach((date, index) => {
        console.log(`   ${index + 1}. ${date}`);
    });
    
    console.log('\n🎯 Action Plan:');
    console.log('==============');
    console.log('1. Focus on finding results for likely draw dates');
    console.log('2. Check Singapore Pools archives or third-party sites');
    console.log('3. For Christmas week (Dec 25-29), confirm no draws occurred');
    console.log('4. Update CSV with confirmed results only');
    console.log('5. Mark missing dates as "no draw" if confirmed');
}

function getLikelihood(date, dayName) {
    const day = parseInt(date.split('-')[0]);
    
    // Regular TOTO draw days: Monday, Thursday, Sunday
    const regularDrawDays = ['Monday', 'Thursday', 'Sunday'];
    
    if (date === '25-Dec-25') {
        return { status: 'VERY LOW', reason: 'Christmas Day - typically no draws' };
    }
    
    if (day >= 26 && day <= 31) {
        return { status: 'LOW', reason: 'New Year holiday period - reduced schedule' };
    }
    
    if (date === '18-Dec-25') {
        return { status: 'LOW', reason: 'Wednesday - not a regular draw day' };
    }
    
    if (regularDrawDays.includes(dayName)) {
        return { status: 'HIGH', reason: `${dayName} is a regular draw day` };
    }
    
    if (dayName === 'Saturday') {
        return { status: 'MEDIUM', reason: 'Saturday sometimes has special draws' };
    }
    
    return { status: 'LOW', reason: `${dayName} is not typically a draw day` };
}

if (require.main === module) {
    analyzeMissingDates();
}