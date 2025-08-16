/**
 * Direct CSV Content Comparison Script
 */

const https = require('https');
const fs = require('fs');

console.log('🔍 CSV CONTENT COMPARISON');
console.log('========================\n');

// Function to fetch remote CSV
function fetchRemoteCSV() {
  return new Promise((resolve, reject) => {
    https.get('https://websolution-sg.github.io/toto_predictor/totoResult.csv', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function compareCSVContent() {
  try {
    // Get local CSV content
    console.log('📄 Reading local CSV content...');
    const localCSV = fs.readFileSync('totoResult.csv', 'utf8');
    const localLines = localCSV.trim().split('\n');
    
    console.log(`📊 Local CSV: ${localLines.length} lines`);
    console.log(`🎯 Local first line: ${localLines[0]}`);
    console.log(`📅 Local second line: ${localLines[1]}`);
    console.log(`📈 Local third line: ${localLines[2]}`);
    
    // Get remote CSV content
    console.log('\n📡 Fetching remote CSV content...');
    const remoteCSV = await fetchRemoteCSV();
    const remoteLines = remoteCSV.trim().split('\n');
    
    console.log(`📊 Remote CSV: ${remoteLines.length} lines`);
    console.log(`🎯 Remote first line: ${remoteLines[0]}`);
    console.log(`📅 Remote second line: ${remoteLines[1]}`);
    console.log(`📈 Remote third line: ${remoteLines[2]}`);
    
    // Compare content
    console.log('\n🔍 COMPARISON ANALYSIS:');
    console.log('======================');
    
    if (localCSV.trim() === remoteCSV.trim()) {
      console.log('✅ Local and remote CSV content MATCH perfectly');
    } else {
      console.log('❌ Local and remote CSV content DO NOT MATCH');
      console.log('\n📋 Differences detected:');
      
      // Check line count
      if (localLines.length !== remoteLines.length) {
        console.log(`   Line count: Local(${localLines.length}) vs Remote(${remoteLines.length})`);
      }
      
      // Check first few lines
      for (let i = 0; i < Math.min(5, localLines.length, remoteLines.length); i++) {
        if (localLines[i] !== remoteLines[i]) {
          console.log(`   Line ${i + 1}: Local(${localLines[i]}) vs Remote(${remoteLines[i]})`);
        }
      }
      
      console.log('\n💡 This explains why the website shows different data!');
      console.log('🔄 The remote version needs to be updated with local changes.');
    }
    
    // Check if local has the expected latest result
    if (localLines[0].includes('22,25,29,31,34,43,11')) {
      console.log('\n✅ Local CSV has expected latest result: 22,25,29,31,34,43,11');
    } else {
      console.log('\n⚠️ Local CSV does not have expected latest result');
    }
    
    // Check if remote has the expected latest result
    if (remoteLines[0].includes('22,25,29,31,34,43,11')) {
      console.log('✅ Remote CSV has expected latest result: 22,25,29,31,34,43,11');
    } else {
      console.log('❌ Remote CSV does not have expected latest result');
      console.log('🚨 THIS IS THE PROBLEM - Remote CSV is outdated!');
    }
    
  } catch (error) {
    console.log('❌ Error during comparison:', error.message);
  }
}

compareCSVContent();
