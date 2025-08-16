console.log("Testing basic Node.js execution...");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);

// Test if dependencies are available
try {
  const fetch = require('node-fetch');
  console.log("✅ node-fetch is available");
} catch (e) {
  console.log("❌ node-fetch not available:", e.message);
}

try {
  const cheerio = require('cheerio');
  console.log("✅ cheerio is available");
} catch (e) {
  console.log("❌ cheerio not available:", e.message);
}

console.log("Basic test completed!");
