#!/usr/bin/env node

/**
 * 🧪 GitHub Actions Test Script
 * This simulates running the updateTotoCSV.cjs script in GitHub Actions environment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 GITHUB ACTIONS SIMULATION TEST');
console.log('================================');

// Simulate GitHub Actions environment variables
process.env.GITHUB_ACTIONS = 'true';
process.env.GITHUB_WORKSPACE = process.cwd();

async function testGitHubActionsFlow() {
  console.log('📋 Test Environment:');
  console.log(`   Working Directory: ${process.cwd()}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  
  // Check if package.json exists
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json found');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`   Dependencies: ${Object.keys(packageJson.dependencies || {}).join(', ')}`);
  } else {
    console.log('❌ package.json NOT found');
    return false;
  }
  
  // Check if updateTotoCSV.cjs exists
  const scriptPath = path.join(process.cwd(), 'updateTotoCSV.cjs');
  if (fs.existsSync(scriptPath)) {
    console.log('✅ updateTotoCSV.cjs found');
  } else {
    console.log('❌ updateTotoCSV.cjs NOT found');
    return false;
  }
  
  // Check current CSV state
  const csvPath = path.join(process.cwd(), 'totoResult.csv');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    console.log('✅ totoResult.csv found');
    console.log(`   Current latest result: ${lines[0]}`);
    console.log(`   Total results: ${lines.length}`);
    
    // Check if latest result is what we expect
    const expectedLatest = '30,32,40,43,45,49,5';
    if (lines[0] === expectedLatest) {
      console.log('✅ CSV contains the expected latest result');
    } else {
      console.log(`❌ CSV latest result mismatch:`);
      console.log(`   Expected: ${expectedLatest}`);
      console.log(`   Found: ${lines[0]}`);
    }
  } else {
    console.log('❌ totoResult.csv NOT found');
    return false;
  }
  
  console.log('\n🔧 Testing script execution...');
  
  try {
    // Try to require the main modules
    console.log('📦 Testing module imports...');
    
    try {
      const fetch = require('node-fetch');
      console.log('✅ node-fetch import successful');
    } catch (err) {
      console.log('❌ node-fetch import failed:', err.message);
      return false;
    }
    
    try {
      const cheerio = require('cheerio');
      console.log('✅ cheerio import successful');
    } catch (err) {
      console.log('❌ cheerio import failed:', err.message);
      return false;
    }
    
    // Run the actual script
    console.log('\n🎯 Running updateTotoCSV.cjs...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('node', ['updateTotoCSV.cjs'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data;
        console.log('📤', data.toString().trim());
      });
      
      child.stderr.on('data', (data) => {
        stderr += data;
        console.log('📤 [ERROR]', data.toString().trim());
      });
      
      const timeout = setTimeout(() => {
        console.log('⏰ Script timeout after 30 seconds');
        child.kill();
        resolve(false);
      }, 30000);
      
      child.on('close', (code) => {
        clearTimeout(timeout);
        console.log(`\n📊 Script finished with exit code: ${code}`);
        
        if (code === 0) {
          console.log('✅ Script executed successfully');
          
          // Check if CSV was updated
          if (fs.existsSync(csvPath)) {
            const newCsvContent = fs.readFileSync(csvPath, 'utf8');
            const newLines = newCsvContent.trim().split('\n');
            console.log(`   Updated CSV latest result: ${newLines[0]}`);
            console.log(`   Updated CSV total results: ${newLines.length}`);
          }
          
          resolve(true);
        } else {
          console.log(`❌ Script failed with exit code: ${code}`);
          console.log('STDOUT:', stdout);
          console.log('STDERR:', stderr);
          resolve(false);
        }
      });
      
      child.on('error', (err) => {
        clearTimeout(timeout);
        console.log('❌ Script execution error:', err.message);
        resolve(false);
      });
    });
    
  } catch (error) {
    console.log('❌ Test execution error:', error.message);
    return false;
  }
}

// Run the test
testGitHubActionsFlow().then(success => {
  console.log('\n🏁 FINAL RESULT:');
  if (success) {
    console.log('✅ GitHub Actions workflow should work correctly');
    console.log('🎉 Your TOTO fetching is ready for automated updates!');
  } else {
    console.log('❌ GitHub Actions workflow may have issues');
    console.log('🔧 Please check the errors above and fix before deployment');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.log('💥 Test crashed:', error.message);
  process.exit(1);
});
