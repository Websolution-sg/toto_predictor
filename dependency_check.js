// DEPENDENCY CHECK AND ERROR DIAGNOSIS
console.log('🔍 NODE.JS DEPENDENCY DIAGNOSTIC');
console.log('================================\n');

// Check Node.js version
console.log('📋 Node.js version:', process.version);
console.log('📋 Platform:', process.platform);
console.log('📋 Current directory:', process.cwd());
console.log('');

// Test dependency loading
console.log('🧪 TESTING DEPENDENCIES:');
console.log('=========================');

try {
    console.log('📦 Testing node-fetch...');
    const fetch = require('node-fetch');
    console.log('✅ node-fetch loaded successfully');
    console.log('   Type:', typeof fetch);
} catch (error) {
    console.log('❌ node-fetch FAILED:', error.message);
    console.log('   Stack:', error.stack);
}

try {
    console.log('📦 Testing cheerio...');
    const cheerio = require('cheerio');
    console.log('✅ cheerio loaded successfully');
    console.log('   Type:', typeof cheerio.load);
} catch (error) {
    console.log('❌ cheerio FAILED:', error.message);
    console.log('   Stack:', error.stack);
}

console.log('');

// Test basic functionality
console.log('🧪 TESTING BASIC FUNCTIONALITY:');
console.log('===============================');

async function testBasicFunctionality() {
    try {
        // Test fetch
        console.log('📡 Testing fetch functionality...');
        const fetch = require('node-fetch');
        
        // Test with a simple URL first
        const response = await fetch('https://httpbin.org/get', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ Basic fetch works');
        console.log('   Status:', response.status);
        
        // Test cheerio
        console.log('📄 Testing cheerio functionality...');
        const cheerio = require('cheerio');
        const $ = cheerio.load('<div>Test</div>');
        const testText = $('div').text();
        
        console.log('✅ Basic cheerio works');
        console.log('   Parsed text:', testText);
        
        return true;
        
    } catch (error) {
        console.log('❌ FUNCTIONALITY TEST FAILED:', error.message);
        console.log('   Stack:', error.stack);
        return false;
    }
}

// Test your actual script
async function testYourScript() {
    console.log('');
    console.log('🧪 TESTING YOUR SCRIPT:');
    console.log('=======================');
    
    try {
        console.log('📄 Loading updateTotoCSV.cjs...');
        
        // Try to run just the import part
        const fs = require('fs');
        const scriptContent = fs.readFileSync('updateTotoCSV.cjs', 'utf8');
        
        console.log('✅ Script file loaded');
        console.log('   Length:', scriptContent.length, 'characters');
        
        // Check for syntax issues
        if (scriptContent.includes('require(')) {
            console.log('✅ Contains require statements');
        }
        
        if (scriptContent.includes('async')) {
            console.log('✅ Contains async functions');
        }
        
        // Try to run the script and catch the specific error
        console.log('🚀 Attempting to run script...');
        
        const { exec } = require('child_process');
        
        exec('node updateTotoCSV.cjs', { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.log('❌ SCRIPT ERROR (Exit code:', error.code, ')');
                console.log('Error message:', error.message);
            }
            
            if (stdout) {
                console.log('📤 STDOUT:');
                console.log(stdout);
            }
            
            if (stderr) {
                console.log('📤 STDERR:');
                console.log(stderr);
            }
            
            console.log('\n🎯 DIAGNOSIS COMPLETE');
        });
        
    } catch (error) {
        console.log('❌ SCRIPT LOADING FAILED:', error.message);
        console.log('   Stack:', error.stack);
    }
}

// Run all tests
(async () => {
    const basicWorking = await testBasicFunctionality();
    
    if (basicWorking) {
        console.log('✅ Basic functionality works - issue is likely in your script');
        await testYourScript();
    } else {
        console.log('❌ Basic functionality failed - dependency issue');
        console.log('');
        console.log('🛠️ SUGGESTED FIXES:');
        console.log('===================');
        console.log('1. Run: npm install');
        console.log('2. Run: npm install node-fetch@2.7.0 cheerio@1.0.0-rc.12');
        console.log('3. Check Node.js version (requires >= 18.0.0)');
    }
})();
