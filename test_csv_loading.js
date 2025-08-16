// Test script to verify CSV loading and cache-busting
const fs = require('fs');

console.log('🧪 TESTING CSV CACHE-BUSTING');
console.log('=============================');

// Read current CSV content
const csvContent = fs.readFileSync('totoResult.csv', 'utf8').trim();
const lines = csvContent.split('\n');
const firstLine = lines[0];

console.log('📊 Current CSV Status:');
console.log('  📋 First line:', firstLine);
console.log('  📋 Total lines:', lines.length);
console.log('  📋 Last modified:', fs.statSync('totoResult.csv').mtime);

// Simulate the HTML fetch process
console.log('\n🌐 Simulating HTML Fetch Process:');
console.log('  📡 URL would be: totoResult.csv?v=' + new Date().getTime());
console.log('  📊 Content that would be fetched:', firstLine);

// Parse as HTML would
const historical = lines.map(line => line.split(',').map(Number));
const recent = historical[0];

console.log('\n🎯 HTML Processing Result:');
console.log('  📋 Recent result:', recent);
console.log('  📋 Main numbers (base1-6):', recent.slice(0, 6));
console.log('  📋 Additional number:', recent[6]);

console.log('\n✅ If HTML is not showing this data, the issue is browser caching.');
console.log('💡 Solutions:');
console.log('  1. Hard refresh browser (Ctrl+Shift+R)');
console.log('  2. Clear browser cache');
console.log('  3. Use incognito/private browsing');
console.log('  4. Open http://localhost:8080 (server with no-cache headers)');
