// Enhanced TOTO Results Fetching with Multiple Data Sources
// Updated for Singapore Pools website structure changes (August 2025)

const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchFromMultipleSources() {
  console.log('🔍 Enhanced TOTO fetching with multiple data sources...');
  
  // Strategy 1: Try official Singapore Pools results API/endpoints
  const officialSources = [
    {
      name: 'Singapore Pools Results Page',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      method: 'parseOfficialResults'
    },
    {
      name: 'Singapore Pools Mobile Results', 
      url: 'https://m.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      method: 'parseOfficialResults'
    },
    {
      name: 'Singapore Pools Lottery Microsite',
      url: 'https://www.singaporepools.com.sg/ms/lotteryhomepage/toto/index.html',
      method: 'parseMicrosite'
    }
  ];
  
  // Strategy 2: Try alternative result sources
  const alternativeSources = [
    {
      name: 'Singapore Pools Facebook Results',
      url: 'https://www.facebook.com/singaporepoolsresults',
      method: 'parseSocialMedia'
    },
    {
      name: 'Singapore Pools Twitter Results', 
      url: 'https://twitter.com/sgpools',
      method: 'parseSocialMedia'
    }
  ];

  // Try official sources first
  for (const source of officialSources) {
    try {
      console.log(`🌐 Trying ${source.name}...`);
      const result = await fetchFromSource(source);
      if (result && result.length === 7) {
        console.log(`✅ Success from ${source.name}: [${result.join(', ')}]`);
        return result;
      }
    } catch (error) {
      console.log(`❌ ${source.name} failed: ${error.message}`);
    }
  }

  // Try alternative sources
  console.log('🔄 Trying alternative sources...');
  for (const source of alternativeSources) {
    try {
      console.log(`🌐 Trying ${source.name}...`);
      const result = await fetchFromSource(source);
      if (result && result.length === 7) {
        console.log(`✅ Success from ${source.name}: [${result.join(', ')}]`);
        return result;
      }
    } catch (error) {
      console.log(`❌ ${source.name} failed: ${error.message}`);
    }
  }

  console.log('❌ All sources failed - activating manual fallback');
  return null;
}

async function fetchFromSource(source) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    timeout: 20000
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  console.log(`📄 Fetched ${html.length} characters from ${source.name}`);
  
  // Apply appropriate parsing method
  switch (source.method) {
    case 'parseOfficialResults':
      return parseOfficialResults(html);
    case 'parseMicrosite':
      return parseMicrosite(html);
    case 'parseSocialMedia':
      return parseSocialMedia(html);
    default:
      return parseOfficialResults(html);
  }
}

function parseOfficialResults(html) {
  try {
    const $ = cheerio.load(html);
    console.log('🔍 Parsing official results page...');
    
    // Strategy 1: Look for JavaScript variables containing results
    const scriptTags = $('script');
    scriptTags.each((i, script) => {
      const content = $(script).html();
      if (content && content.includes('toto') || content.includes('TOTO')) {
        console.log(`📜 Found TOTO-related script content`);
        // Look for number patterns in JavaScript
        const numberPattern = /(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/g;
        const matches = content.match(numberPattern);
        if (matches) {
          console.log('📊 Found potential number patterns in JavaScript');
        }
      }
    });
    
    // Strategy 2: Look for new table/div structures
    const resultContainers = $('.results, .toto-results, .winning-numbers, .draw-results');
    if (resultContainers.length > 0) {
      console.log(`📊 Found ${resultContainers.length} result containers`);
      // Parse new structure
    }
    
    // Strategy 3: Look for embedded data or API calls
    const dataAttributes = $('[data-toto], [data-results], [data-numbers]');
    if (dataAttributes.length > 0) {
      console.log(`📊 Found ${dataAttributes.length} data attributes`);
    }
    
    return null; // Return null if no results found
  } catch (error) {
    console.log('❌ Official parsing failed:', error.message);
    return null;
  }
}

function parseMicrosite(html) {
  // Parse lottery microsite for results
  return null; // Placeholder
}

function parseSocialMedia(html) {
  // Parse social media for latest results posts
  return null; // Placeholder
}

// Export for use in main script
module.exports = {
  fetchFromMultipleSources,
  fetchFromSource,
  parseOfficialResults
};
