console.log('🧪 SIMPLE NODE.JS TEST');
console.log('====================');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

try {
    const fs = require('fs');
    console.log('✅ fs module loaded');
    
    const fetch = require('node-fetch');
    console.log('✅ node-fetch loaded');
    
    const cheerio = require('cheerio');
    console.log('✅ cheerio loaded');
    
    console.log('🎉 All dependencies working!');
    
} catch (error) {
    console.log('❌ Dependency error:', error.message);
}

console.log('✅ Test completed successfully');
