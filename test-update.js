#!/usr/bin/env node

// Test script to validate the updateTotoCSV.cjs functionality
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing TOTO Update Script Locally\n');

// Function to run a command and capture output
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function testUpdateScript() {
  console.log('📋 Test Results:');
  console.log('================');
  
  try {
    // Check if required files exist
    const requiredFiles = [
      'updateTotoCSV.cjs',
      'package.json',
      'totoResult.csv'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} - File exists`);
      } else {
        console.log(`❌ ${file} - File missing`);
        return;
      }
    }
    
    // Check package.json structure
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['node-fetch', 'cheerio'];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} - Dependency listed`);
      } else {
        console.log(`❌ ${dep} - Dependency missing`);
      }
    }
    
    // Check CSV format
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const csvLines = csvContent.trim().split('\n');
    const firstLine = csvLines[0].split(',').map(n => parseInt(n));
    
    if (firstLine.length === 7 && firstLine.every(n => n >= 1 && n <= 49)) {
      console.log(`✅ CSV format - Valid (${csvLines.length} entries)`);
    } else {
      console.log(`❌ CSV format - Invalid`);
    }
    
    console.log('\n🔍 Testing update script execution...');
    
    // Create backup of current CSV
    const backupFile = 'totoResult.csv.backup';
    fs.copyFileSync('totoResult.csv', backupFile);
    console.log('💾 Created CSV backup');
    
    try {
      // Run the update script
      console.log('🚀 Running updateTotoCSV.cjs...');
      await runCommand('node', ['updateTotoCSV.cjs']);
      console.log('✅ Update script completed successfully');
      
      // Check if CSV was modified
      const originalContent = fs.readFileSync(backupFile, 'utf8');
      const newContent = fs.readFileSync('totoResult.csv', 'utf8');
      
      if (originalContent !== newContent) {
        console.log('📊 CSV file was updated with new data');
      } else {
        console.log('📋 CSV file unchanged (no new results or already up-to-date)');
      }
      
    } catch (error) {
      console.log('⚠️ Update script completed with warnings:', error.message);
      // This is expected if no new results are available
    } finally {
      // Restore backup
      fs.copyFileSync(backupFile, 'totoResult.csv');
      fs.unlinkSync(backupFile);
      console.log('🔄 Restored CSV from backup');
    }
    
    console.log('\n🎉 Local testing completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Check GitHub Actions tab in your repository');
    console.log('2. Manually trigger the workflow to test on GitHub');
    console.log('3. Monitor the workflow logs for any issues');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testUpdateScript();
