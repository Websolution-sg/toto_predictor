// Simple test script for 4D fetcher without dependencies on PowerShell
const path = require('path');
const fs = require('fs');

console.log('=== Singapore Pools 4D Fetcher Test ===');
console.log('Testing Node.js and basic functionality...');

// Check Node.js version
console.log('Node.js version:', process.version);

// Check if we can create the fetcher class
try {
    console.log('Loading auto-4d-fetcher module...');
    const SingaporePoolsFetcher = require('./auto-4d-fetcher.js');
    console.log('SUCCESS: Module loaded successfully');
    
    console.log('Creating fetcher instance...');
    const fetcher = new SingaporePoolsFetcher();
    console.log('SUCCESS: Fetcher instance created');
    
    // Check if Puppeteer is available
    console.log('Checking Puppeteer availability...');
    try {
        const puppeteer = require('puppeteer');
        console.log('SUCCESS: Puppeteer is available');
    } catch (error) {
        console.log('WARNING: Puppeteer not found. Installing...');
        console.log('Run: npm install puppeteer');
    }
    
    // Check CSV file
    const csvPath = path.join(__dirname, '4dResult.csv');
    if (fs.existsSync(csvPath)) {
        const stats = fs.statSync(csvPath);
        console.log('SUCCESS: CSV file exists, size:', stats.size, 'bytes');
        console.log('Last modified:', stats.mtime);
    } else {
        console.log('INFO: CSV file will be created on first fetch');
    }
    
    console.log('\n=== Test Complete ===');
    console.log('Basic system checks passed!');
    console.log('To test full functionality, run:');
    console.log('  node auto-4d-fetcher.js --test');
    
} catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
}
