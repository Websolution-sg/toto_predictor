// Test script specifically for online.singaporepools.com platform
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

console.log('🧪 Testing Online Singapore Pools Platform');
console.log('==========================================');
console.log('Target: https://online.singaporepools.com/en/lottery');

async function testOnlinePlatform() {
  try {
    const testUrls = [
      'https://online.singaporepools.com/en/lottery',
      'https://online.singaporepools.com/en/lottery/lottery-draws',
      'https://online.singaporepools.com/en/lottery/toto-self-pick'
    ];

    for (const url of testUrls) {
      console.log(`\n🌐 Testing: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const html = await response.text();
        console.log(`📄 HTML length: ${html.length} characters`);
        
        // Analyze content
        const $ = cheerio.load(html);
        
        // Check for TOTO-related content
        const totoText = html.toLowerCase();
        const hasToto = totoText.includes('toto');
        const hasResults = totoText.includes('result');
        const hasNumbers = /\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}[,\s]+\d{1,2}/.test(html);
        
        console.log(`🔍 Content Analysis:`);
        console.log(`   Contains 'TOTO': ${hasToto}`);
        console.log(`   Contains 'result': ${hasResults}`);
        console.log(`   Has number patterns: ${hasNumbers}`);
        
        // Look for specific elements
        const forms = $('form');
        const tables = $('table');
        const divs = $('div[class*="result"], div[class*="toto"], div[class*="lottery"]');
        
        console.log(`📊 Structure:`);
        console.log(`   Forms found: ${forms.length}`);
        console.log(`   Tables found: ${tables.length}`);
        console.log(`   Result-related divs: ${divs.length}`);
        
        // Check for JavaScript that might load results
        const scripts = $('script');
        let hasResultsJS = false;
        scripts.each((i, script) => {
          const content = $(script).html();
          if (content && (content.includes('result') || content.includes('toto') || content.includes('lottery'))) {
            hasResultsJS = true;
          }
        });
        console.log(`   JavaScript with results: ${hasResultsJS}`);
        
        // Sample some content for manual inspection
        console.log(`📝 Sample content (first 300 chars):`);
        console.log(`   ${html.substring(0, 300)}...`);
        
      } else {
        console.log(`❌ Failed to fetch: ${response.status} ${response.statusText}`);
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('✅ Successfully tested online Singapore Pools platform');
    console.log('🔍 Need to check if results are loaded dynamically via JavaScript');
    console.log('💡 May require browser automation (Puppeteer) to get full content');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOnlinePlatform();
