#!/usr/bin/env node

/**
 * 🔧 GitHub Actions Debug Script
 * This helps diagnose why the updateTotoCSV.cjs is failing
 */

console.log('🔧 GITHUB ACTIONS DEBUG SCRIPT');
console.log('==============================');

// Check environment
console.log('📋 Environment Check:');
console.log(`   Node.js version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Working directory: ${process.cwd()}`);
console.log(`   Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);

const fs = require('fs');
const path = require('path');

// Check required files
console.log('\n📁 File Check:');
const requiredFiles = [
  'package.json',
  'package-lock.json', 
  'updateTotoCSV.cjs',
  'totoResult.csv'
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} MISSING`);
  }
}

// Check modules
console.log('\n📦 Module Check:');
const requiredModules = ['node-fetch', 'cheerio', 'fs'];

for (const module of requiredModules) {
  try {
    require(module);
    console.log(`   ✅ ${module} available`);
  } catch (err) {
    console.log(`   ❌ ${module} NOT available: ${err.message}`);
  }
}

// Check CSV content
console.log('\n📄 CSV Check:');
try {
  if (fs.existsSync('totoResult.csv')) {
    const content = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = content.trim().split('\n');
    console.log(`   📊 CSV has ${lines.length} lines`);
    console.log(`   📈 Latest result: ${lines[0]}`);
    console.log(`   📉 Previous result: ${lines[1] || 'N/A'}`);
  }
} catch (err) {
  console.log(`   ❌ CSV read error: ${err.message}`);
}

// Test basic functionality
console.log('\n🧪 Basic Function Test:');
try {
  const fetch = require('node-fetch');
  console.log('   ✅ node-fetch imported successfully');
  
  const cheerio = require('cheerio');
  console.log('   ✅ cheerio imported successfully');
  
  // Test simple HTML parsing
  const $ = cheerio.load('<div>Test</div>');
  console.log('   ✅ cheerio parsing works');
  
} catch (err) {
  console.log(`   ❌ Function test failed: ${err.message}`);
}

// Check network access (simple test)
console.log('\n🌐 Network Test:');
async function testNetwork() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch('https://httpbin.org/status/200', { 
      timeout: 5000,
      headers: {
        'User-Agent': 'GitHub-Actions-Debug-Test'
      }
    });
    console.log(`   ✅ Network accessible (status: ${response.status})`);
  } catch (err) {
    console.log(`   ❌ Network test failed: ${err.message}`);
  }
}

// Run async tests
testNetwork().then(() => {
  console.log('\n🏁 Debug Complete');
  console.log('💡 If all checks pass, the issue might be with Singapore Pools parsing');
  console.log('🔍 Check the actual GitHub Actions logs for more details');
}).catch(err => {
  console.log('\n💥 Debug script error:', err.message);
});
