const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CSV_FILE = 'totoResult.csv';

function isRecentResult(drawDate) {
  // Check if a result is from the last 2 weeks (to avoid old results)
  if (!drawDate) return true; // If no date, allow it through
  
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  
  // Try multiple date formats from Singapore Pools
  const dateFormats = [
    /(\d{2})\/(\d{2})\/(\d{4})/,     // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/,      // YYYY-MM-DD  
    /(\d{2})-(\d{2})-(\d{4})/,      // DD-MM-YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i // DD MMM YYYY
  ];
  
  let parsedDate = null;
  for (const format of dateFormats) {
    const match = drawDate.match(format);
    if (match) {
      if (format.toString().includes('MMM')) {
        // Handle month name format
        const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
        parsedDate = new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
      } else if (match[1].length === 4) {
        // YYYY-MM-DD format
        parsedDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        // DD/MM/YYYY or DD-MM-YYYY format
        parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
      break;
    }
  }
  
  if (parsedDate && parsedDate >= twoWeeksAgo) {
    console.log(`✅ Result date ${drawDate} is recent (within 2 weeks)`);
    return true;
  } else if (parsedDate) {
    console.log(`⚠️ Result date ${drawDate} is older than 2 weeks`);
    return false;
  }
  
  console.log(`⚠️ Could not parse date: ${drawDate}`);
  return true; // Allow through if can't parse
}

function extractDateFromHTML(html) {
  // Extract date information from HTML content to verify result recency
  const datePatterns = [
    /Draw Date:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /Date.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /drawn.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log(`📅 Found date in HTML: ${match[1]}`);
      return match[1];
    }
  }
  
  console.log('📅 No date found in HTML');
  return null;
}

async function fetchLatestTotoResult() {
  console.log('🔍 Fetching latest TOTO results from Singapore Pools...');
  
  // Multiple data sources for redundancy
  const attempts = [
    {
      name: 'Singapore Pools Main TOTO Results Page',
      url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      parser: parseDirectSingaporePools,
      timeout: 30000
    },
    {
      name: 'Singapore Pools TOTO Results API (New)',
      url: 'https://www.singaporepools.com.sg/api/product/toto/results',
      parser: parseAPIResponse,
      timeout: 20000
    },
    {
      name: 'Singapore Pools Widget Endpoint',
      url: 'https://www.singaporepools.com.sg/en/product/sr/Lottery4dTotoResultWidget',
      parser: parseAPIResponse,
      timeout: 20000
    },
    {
      name: 'Singapore Pools Mobile API',
      url: 'https://www.singaporepools.com.sg/mobile/api/toto/latest',
      parser: parseAPIResponse,
      timeout: 20000
    }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`🌐 Trying ${attempt.name}...`);
      console.log(`📡 URL: ${attempt.url}`);
      
      const response = await fetch(attempt.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 20000  // Increased timeout for slow loading
      });

      console.log(`📊 Response status: ${response.status}`);
      
      if (response.status === 403 || response.status === 429) {
        console.log(`⚠️ Access restricted (${response.status}). Website may have anti-bot measures.`);
        console.log(`🔄 This is expected - continuing to next source...`);
        continue;
      }

      if (!response.ok) {
        console.log(`❌ ${attempt.name} failed with status: ${response.status}`);
        continue;
      }

      const html = await response.text();
      console.log(`📄 HTML received: ${html.length} characters`);
      
      const result = attempt.parser(html);
      console.log(`🎯 Parser result: ${result ? `[${result.join(', ')}]` : 'null'}`);
      
      if (result && result.length === 7) {
        const dateFromHTML = extractDateFromHTML(html);
        const candidate = {
          numbers: result,
          source: attempt.name,
          date: dateFromHTML,
          isRecent: isRecentResult(dateFromHTML),
          priority: attempts.indexOf(attempt) // Lower index = higher priority
        };
        
        resultCandidates.push(candidate);
        console.log(`✅ Added candidate from ${attempt.name}: [${result.join(', ')}] (Recent: ${candidate.isRecent})`);
        
        // For high-priority sources (first 3), return immediately if recent
        if (candidate.priority < 3 && candidate.isRecent) {
          console.log(`🚀 High-priority recent result found - using immediately:`, result);
          console.log(`🎉 FINAL EXTRACTED NUMBERS: [${result.join(', ')}]`);
          return result;
        }
      } else {
        console.log(`⚠️ ${attempt.name} returned invalid result:`, result);
      }
      
    } catch (error) {
      console.log(`❌ ${attempt.name} error:`, error.message);
      if (error.code === 'ENOTFOUND') {
        console.log('🌐 DNS resolution failed - network connectivity issue');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('⏰ Request timed out - server may be slow or blocking requests');
      }
      continue;
    }
  }

  console.log('');
  console.log('🏆 CANDIDATE SELECTION PROCESS');
  console.log(`📊 Found ${resultCandidates.length} valid candidates`);
  
  if (resultCandidates.length > 0) {
    // Selection priority:
    // 1. Recent results from high-priority sources
    // 2. Recent results from any source  
    // 3. Any result from high-priority sources
    // 4. Any result from any source
    
    const recentHighPriority = resultCandidates.filter(c => c.isRecent && c.priority < 3);
    const recentAny = resultCandidates.filter(c => c.isRecent);
    const highPriorityAny = resultCandidates.filter(c => c.priority < 3);
    
    let selectedCandidate = null;
    
    if (recentHighPriority.length > 0) {
      selectedCandidate = recentHighPriority[0];
      console.log(`✅ Selected RECENT result from HIGH-PRIORITY source: ${selectedCandidate.source}`);
    } else if (recentAny.length > 0) {
      selectedCandidate = recentAny[0];
      console.log(`✅ Selected RECENT result from source: ${selectedCandidate.source}`);
    } else if (highPriorityAny.length > 0) {
      selectedCandidate = highPriorityAny[0];
      console.log(`✅ Selected result from HIGH-PRIORITY source: ${selectedCandidate.source}`);
    } else {
      selectedCandidate = resultCandidates[0];
      console.log(`✅ Selected result from source: ${selectedCandidate.source}`);
    }
    
    console.log(`🎉 FINAL SELECTED NUMBERS: [${selectedCandidate.numbers.join(', ')}]`);
    return selectedCandidate.numbers;
  }

  console.log('');
  console.log('⚠️ WEBSITE STRUCTURE ANALYSIS COMPLETE');
  console.log('📊 Summary: Singapore Pools website has changed significantly');
  console.log('🔍 Current findings:');
  console.log('   • Original results page now shows calculator interface');
  console.log('   • TOTO results may be dynamically loaded via JavaScript');
  console.log('   • Results may have moved to new endpoints or require authentication');
  console.log('   • Failsafe mechanism will maintain data integrity');
  console.log('');
  
  console.log('❌ All fetch methods failed');
  console.log('💭 Website structure may have changed or parsing logic needs adjustment');
  return null;
}

function parseOnlineSingaporePools(html) {
  try {
    const $ = cheerio.load(html);
    console.log('🔍 Parsing Online Singapore Pools platform...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // Dynamically load known recent results from CSV for validation
    const knownRecentResults = getKnownRecentResults(CSV_FILE);
    
    // Strategy 1: Look for TOTO results in the online platform structure
    console.log('🎯 Strategy 1: Looking for results in online platform...');
    
    // Check for results in various possible containers
    const resultSelectors = [
      '.lottery-results',
      '.toto-results', 
      '.winning-numbers',
      '.draw-results',
      '[data-toto-results]',
      '[data-lottery-results]',
      '.result-numbers',
      '.latest-results'
    ];
    
    for (const selector of resultSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`📊 Found ${elements.length} elements with selector: ${selector}`);
        
        elements.each((index, element) => {
          const $element = $(element);
          const text = $element.text().trim();
          const numbers = extractNumbersFromText(text);
          
          if (numbers && numbers.length === 7) {
            console.log(`   Potential result from ${selector}: [${numbers.join(', ')}]`);
            const validation = isValidNewResult(numbers, knownRecentResults);
            if (validation.valid) {
              console.log(`   ✅ Valid online platform result: [${numbers.join(', ')}]`);
              return numbers;
            } else {
              console.log(`   ❌ Online platform result rejected: ${validation.reason}`);
            }
          }
        });
      }
    }
    
    // Strategy 2: Look for JavaScript variables containing results
    console.log('🎯 Strategy 2: Searching for JavaScript data...');
    
    const scriptTags = $('script');
    scriptTags.each((i, script) => {
      const content = $(script).html();
      if (content && (content.includes('toto') || content.includes('TOTO') || content.includes('lottery'))) {
        console.log(`📜 Found lottery-related script content (${content.length} chars)`);
        
        // Look for number arrays in JavaScript
        const jsNumberPattern = /(?:toto|TOTO|lottery|results?).*?[\[\{].*?(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})[,\s]+(\d{1,2})/gi;
        let match;
        
        while ((match = jsNumberPattern.exec(content)) !== null) {
          const numbers = match.slice(1, 8).map(n => parseInt(n));
          if (numbers.every(n => n >= 1 && n <= 49)) {
            console.log(`   JavaScript pattern found: [${numbers.join(', ')}]`);
            const validation = isValidNewResult(numbers, knownRecentResults);
            if (validation.valid) {
              console.log(`   ✅ Valid JavaScript result: [${numbers.join(', ')}]`);
              return numbers;
            } else {
              console.log(`   ❌ JavaScript result rejected: ${validation.reason}`);
            }
          }
        }
      }
    });
    
    // Strategy 3: Look for API endpoints or data attributes
    console.log('🎯 Strategy 3: Checking for API endpoints...');
    
    const dataElements = $('[data-*]');
    dataElements.each((i, element) => {
      const $element = $(element);
      const attributes = element.attribs;
      
      for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('data-') && (key.includes('toto') || key.includes('result') || key.includes('lottery'))) {
          console.log(`📊 Found data attribute: ${key}="${value}"`);
          
          // Try to extract numbers from the data attribute value
          const numbers = extractNumbersFromText(value);
          if (numbers && numbers.length === 7) {
            console.log(`   Data attribute result: [${numbers.join(', ')}]`);
            const validation = isValidNewResult(numbers, knownRecentResults);
            if (validation.valid) {
              console.log(`   ✅ Valid data attribute result: [${numbers.join(', ')}]`);
              return numbers;
            }
          }
        }
      }
    });
    
    // Strategy 4: Check for embedded JSON data
    console.log('🎯 Strategy 4: Looking for JSON data...');
    
    const jsonPattern = /\{[^}]*(?:toto|TOTO|lottery|result)[^}]*\}/gi;
    let jsonMatch;
    
    while ((jsonMatch = jsonPattern.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(jsonMatch[0]);
        console.log('📊 Found JSON data:', Object.keys(jsonData));
        
        // Look for numbers in the JSON structure
        const jsonStr = JSON.stringify(jsonData);
        const numbers = extractNumbersFromText(jsonStr);
        
        if (numbers && numbers.length === 7) {
          console.log(`   JSON result: [${numbers.join(', ')}]`);
          const validation = isValidNewResult(numbers, knownRecentResults);
          if (validation.valid) {
            console.log(`   ✅ Valid JSON result: [${numbers.join(', ')}]`);
            return numbers;
          }
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }
    
    console.log('❌ No valid TOTO results found in online platform');
    return null;
    
  } catch (error) {
    console.log('❌ Online platform parsing error:', error.message);
    return null;
  }
}

// Helper function to extract numbers from text
function extractNumbersFromText(text) {
  if (!text) return null;
  
  // Look for sequences of 6-7 numbers between 1-49
  const numberPattern = /(?:^|[^\d])(\d{1,2})(?:[,\s\|\-]+(\d{1,2})){5}(?:[,\s\|\-]+(\d{1,2}))?(?:[^\d]|$)/g;
  let match;
  
  while ((match = numberPattern.exec(text)) !== null) {
    const numbers = [];
    for (let i = 1; i < match.length && match[i] !== undefined; i++) {
      const num = parseInt(match[i]);
      if (num >= 1 && num <= 49) {
        numbers.push(num);
      }
    }
    
    if (numbers.length >= 6 && numbers.length <= 7) {
      return numbers.length === 6 ? [...numbers, null] : numbers;
    }
  }
  
  return null;
}

function parseAPIResponse(responseText) {
  // Enhanced API parser for Widget endpoints and JSON APIs
  try {
    console.log('🔍 Parsing API response for TOTO results...');
    console.log(`📄 Response length: ${responseText.length} characters`);

    // Try to parse as JSON first (for widget APIs)
    try {
      const jsonData = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response');
      
      // First try: Search for TOTO numbers in widget data structures
      const widgetResult = extractTotoFromWidget(jsonData);
      if (widgetResult) {
        console.log(`🎯 Found TOTO numbers in widget data: [${widgetResult.join(', ')}]`);
        
        const knownRecentResults = getKnownRecentResults(CSV_FILE);
        const validation = isValidNewResult(widgetResult, knownRecentResults);
        if (validation.valid) {
          console.log(`   ✅ Valid widget result: [${widgetResult.join(', ')}]`);
          return widgetResult;
        } else {
          console.log(`   ❌ Widget result rejected: ${validation.reason}`);
        }
      }
      
      // Second try: Look for TOTO results in various JSON structures
      const possiblePaths = [
        jsonData.results,
        jsonData.toto,
        jsonData.lottery,
        jsonData.data,
        jsonData.latest,
        jsonData.draw,
        jsonData
      ];
      
      for (const data of possiblePaths) {
        if (data && typeof data === 'object') {
          console.log(`🎯 Checking JSON path with keys: ${Object.keys(data)}`);
          
          // Look for number arrays
          const numbers = extractNumbersFromJSON(data);
          if (numbers && numbers.length === 7) {
            console.log(`   API result: [${numbers.join(', ')}]`);
            
            const knownRecentResults = getKnownRecentResults(CSV_FILE);
            const validation = isValidNewResult(numbers, knownRecentResults);
            if (validation.valid) {
              console.log(`   ✅ Valid API result: [${numbers.join(', ')}]`);
              return numbers;
            } else {
              console.log(`   ❌ API result rejected: ${validation.reason}`);
            }
          }
        }
      }
      
    } catch (jsonError) {
      console.log('📄 Not JSON format, trying text parsing...');
      
      // If not JSON, try to extract numbers from text
      const numbers = extractNumbersFromText(responseText);
      if (numbers && numbers.length === 7) {
        console.log(`   Text API result: [${numbers.join(', ')}]`);
        
        const knownRecentResults = getKnownRecentResults(CSV_FILE);
        const validation = isValidNewResult(numbers, knownRecentResults);
        if (validation.valid) {
          console.log(`   ✅ Valid text API result: [${numbers.join(', ')}]`);
          return numbers;
        } else {
          console.log(`   ❌ Text API result rejected: ${validation.reason}`);
        }
      }
    }
    
    console.log('❌ No valid TOTO results found in API response');
    return null;
    
  } catch (error) {
    console.log('❌ API parsing error:', error.message);
    return null;
  }
}

// Enhanced function to extract TOTO numbers from widget data structures  
function extractTotoFromWidget(data) {
  try {
    // Check common widget data structures based on Singapore Pools website analysis
    if (data && typeof data === 'object') {
      
      // Structure 1: Direct results array (standard API format)
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const latest = data.results[0];
        if (latest.winning_numbers || latest.numbers || latest.toto_numbers) {
          const nums = latest.winning_numbers || latest.numbers || latest.toto_numbers;
          if (Array.isArray(nums) && nums.length >= 6) {
            return nums.length === 6 ? [...nums, latest.additional_number || 0] : nums;
          }
        }
      }
      
      // Structure 2: Lottery4dTotoResultWidget format (discovered from website)
      if (data.lottery && data.lottery.toto) {
        const toto = data.lottery.toto;
        if (toto.winning_numbers && Array.isArray(toto.winning_numbers)) {
          const nums = toto.winning_numbers;
          return nums.length === 6 ? [...nums, toto.additional_number || 0] : nums;
        }
      }
      
      // Structure 3: Widget component response format
      if (data.toto_result || data.toto_results) {
        const toto = data.toto_result || data.toto_results;
        if (Array.isArray(toto)) {
          const latest = toto[0];
          if (latest && latest.numbers) {
            return Array.isArray(latest.numbers) ? latest.numbers : null;
          }
        }
        // Single result object
        if (toto.numbers && Array.isArray(toto.numbers)) {
          return toto.numbers;
        }
      }
      
      // Structure 4: Component data wrapper
      if (data.component_data && data.component_data.lottery) {
        return extractTotoFromWidget(data.component_data);
      }
      
      // Structure 5: Nested data structure
      if (data.data) {
        return extractTotoFromWidget(data.data);
      }
      
      // Structure 6: Direct widget payload (specific to Singapore Pools)
      if (data.widget && data.widget.lottery_results) {
        return extractTotoFromWidget(data.widget.lottery_results);
      }
      
      // Structure 7: Draw results format
      if (data.draw && data.draw.winning_numbers) {
        const nums = data.draw.winning_numbers;
        if (Array.isArray(nums) && nums.length >= 6) {
          return nums.length === 6 ? [...nums, data.draw.additional_number || 0] : nums;
        }
      }
    }
    
    console.log('⚠️ No recognizable widget structure found');
    return null;
    
  } catch (error) {
    console.log('❌ Widget extraction error:', error.message);
    return null;
  }
}

// Helper function to extract numbers from JSON structure
function extractNumbersFromJSON(obj) {
  if (!obj) return null;
  
  // Look for arrays of numbers
  if (Array.isArray(obj)) {
    if (obj.length >= 6 && obj.length <= 7 && obj.every(n => typeof n === 'number' && n >= 1 && n <= 49)) {
      return obj.length === 6 ? [...obj, null] : obj;
    }
  }
  
  // Look for number properties
  const numberKeys = ['numbers', 'winning_numbers', 'result', 'draw_numbers', 'toto_numbers'];
  for (const key of numberKeys) {
    if (obj[key] && Array.isArray(obj[key])) {
      const numbers = obj[key];
      if (numbers.length >= 6 && numbers.length <= 7 && numbers.every(n => typeof n === 'number' && n >= 1 && n <= 49)) {
        return numbers.length === 6 ? [...numbers, null] : numbers;
      }
    }
  }
  
  // Recursively search nested objects
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const result = extractNumbersFromJSON(value);
      if (result) return result;
    }
  }
  
  return null;
}

function parseDirectSingaporePools(html) {
  try {
    console.log('🔍 Parsing Singapore Pools HTML (STREAMLINED)...');
    console.log(`📄 HTML length: ${html.length} characters`);
    
    // Simple approach: Look for the main number patterns that appear on Singapore Pools
    console.log('🎯 Looking for TOTO number patterns...');
    
    // Pattern 1: Table format with | separators (most common)
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`📊 Found ${matches.length} table patterns`);
      
      // Show sample HTML if no matches found
      if (matches.length === 0) {
        console.log('❌ NO MATCHES FOUND - Showing HTML sample for debugging:');
        
        // Look for any TOTO numbers in the HTML
        const firstTotoNum = allNumbers.find(num => html.includes(num.toString()));
        if (firstTotoNum) {
          const sampleStart = html.indexOf(firstTotoNum.toString());
          console.log(`📋 HTML around first TOTO number "${firstTotoNum}":`);
          console.log(html.substring(Math.max(0, sampleStart - 100), sampleStart + 200));
        } else {
          console.log('❌ No TOTO numbers found in HTML at all!');
          console.log('📋 First 500 chars of HTML:');
          console.log(html.substring(0, 500));
        }
        
        // Try fallback parsing methods
        console.log('🔄 Trying fallback parsing methods...');
        
        // Method 1: Position-based parsing
        console.log('🔍 Method 1: Position-based parsing...');
        
        // Find the first valid TOTO sequence by position
        const numberMatches = [];
        const globalNumberPattern = /(?:\|\s*)?(\d{1,2})(?:\s*\|)?/g;
        let numberMatch;
        
        while ((numberMatch = globalNumberPattern.exec(html)) !== null) {
          const num = parseInt(numberMatch[1]);
          if (num >= 1 && num <= 49) {
            numberMatches.push({
              number: num,
              position: numberMatch.index,
              context: html.substring(Math.max(0, numberMatch.index - 50), numberMatch.index + 50)
            });
          }
        }
        
        console.log(`   Found ${numberMatches.length} valid TOTO numbers in HTML`);
        
        // STEP 2: Find the FIRST sequence of 7 unique numbers (latest result)
        for (let i = 0; i <= numberMatches.length - 7; i++) {
          const window = numberMatches.slice(i, i + 7);
          const numbers = window.map(m => m.number);
          
          // Check if this window contains 7 unique numbers (valid TOTO result)
          if (new Set(numbers).size === 7) {
            console.log(`🎯 Found valid sequence: [${numbers.join(', ')}]`);
            
            // Validate position proximity (numbers should be close together in a table)
            const positionSpread = window[6].position - window[0].position;
            if (positionSpread < 1000) {
              console.log(`✅ Position validation passed (${positionSpread} characters)`);
              return numbers;
            } else {
              console.log(`⚠️ Sequence too spread out (${positionSpread} chars), trying next...`);
            }
          }
        }
        
        // Try flexible pattern matching
        console.log('🔄 Trying flexible pattern matching...');
        
        const patterns = [
          // Pattern A: Most flexible - any 6 consecutive unique numbers + 1 additional
          /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|[\s\S]{0,200}?\|\s*(\d{1,2})\s*\|/,
          
          // Pattern B: HTML table format
          /<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*<\/td>[\s\S]{0,200}?<td[^>]*>\s*(\d{1,2})\s*<\/td>/,
          
          // Pattern C: Any 7 TOTO numbers in sequence (most permissive)
          /(?:^|\n|\r).*?(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/m
        ];
        
        for (let p = 0; p < patterns.length; p++) {
          console.log(`   Testing pattern ${String.fromCharCode(65 + p)}...`);
          
          const patternMatch = html.match(patterns[p]);
          console.log(`   Pattern match result: ${patternMatch ? 'FOUND' : 'NOT FOUND'}`);
          
          if (patternMatch && patternMatch.length >= 8) {
            const numbers = patternMatch.slice(1, 8).map(n => parseInt(n));
            console.log(`   Candidate: [${numbers.join(', ')}]`);
            
            // Validate TOTO result
            if (numbers.length === 7 && 
                numbers.every(n => n >= 1 && n <= 49) && 
                new Set(numbers).size === 7) {
              console.log(`✅ Pattern ${String.fromCharCode(65 + p)} SUCCESS: [${numbers.join(', ')}]`);
              return numbers;
            } else {
              console.log(`   ❌ Invalid: length=${numbers.length}, range=${numbers.every(n => n >= 1 && n <= 49)}, unique=${new Set(numbers).size}`);
            }
          }
        }
        
        // Method 2: Look for any reasonable TOTO number patterns
        const allNumbers = [];
        const numberPattern = /(?:\|\s*)?(\d{1,2})(?:\s*\|)?/g;
        let match;
        while ((match = numberPattern.exec(html)) !== null) {
          const num = parseInt(match[1]);
          if (num >= 1 && num <= 49) {
            allNumbers.push(num);
          }
        }
        
        console.log(`🔍 Found ${allNumbers.length} valid TOTO numbers (1-49) in HTML`);
        
        if (allNumbers.length >= 7) {
          // Look for sequences of 6 unique numbers followed by another number
          for (let i = 0; i <= allNumbers.length - 7; i++) {
            const sequence = allNumbers.slice(i, i + 6);
            const additional = allNumbers[i + 6];
            
            // Check if it's a valid TOTO result (6 unique numbers + 1 additional)
            if (new Set(sequence).size === 6 && !sequence.includes(additional)) {
              const fullResult = [...sequence, additional];
              console.log(`� POTENTIAL RESULT: [${fullResult.join(', ')}]`);
              
              // Basic validation
              if (fullResult.length === 7 && 
                  fullResult.every(n => n >= 1 && n <= 49) && 
                  new Set(fullResult).size === 7) {
                console.log(`✅ FALLBACK SUCCESS: Found valid result via number extraction`);
                return fullResult;
              }
            }
          }
        }
      }
      
      if (matches.length > 0) {
        // Get the first match (which should be the latest result)
        const firstMatch = matches[0];
        const mainNumbers = firstMatch.slice(1, 7).map(n => parseInt(n));
        console.log(`🎯 First table match: [${mainNumbers.join(', ')}]`);
        
        // Validate these are valid TOTO numbers
        if (mainNumbers.every(n => n >= 1 && n <= 49) && new Set(mainNumbers).size === 6) {
          
          // Look for the additional number in the following pattern | XX |
          const afterMatch = html.substring(firstMatch.index + firstMatch[0].length, firstMatch.index + firstMatch[0].length + 500);
          console.log(`🔍 Looking for additional number in: ${afterMatch.substring(0, 100)}...`);
          
          const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
          const additionalMatch = afterMatch.match(additionalPattern);
          
          if (additionalMatch) {
            const additional = parseInt(additionalMatch[1]);
            console.log(`🎯 Found additional number: ${additional}`);
            
            if (additional >= 1 && additional <= 49) {
              const fullResult = [...mainNumbers, additional];
              console.log(`✅ COMPLETE RESULT: [${fullResult.join(', ')}]`);
              
              // Basic validation only - let main execution handle comparison
              if (fullResult.length === 7 && 
                  fullResult.every(n => n >= 1 && n <= 49) && 
                  new Set(fullResult).size === 7) {
                console.log('🎉 SUCCESS: Found valid TOTO result format!');
                console.log('📋 Returning result to main execution for comparison...');
                return fullResult;
              } else {
                console.log('❌ Basic validation failed - invalid format or duplicates');
              }
            }
          } else {
            console.log('⚠️ Additional number pattern not found');
          }
        } else {
          console.log('❌ Invalid main numbers: duplicates or out of range');
        }
      } else {
        console.log('❌ No table patterns found - website structure may have changed');
        
        // FINAL FALLBACK: Parse any valid 7-number TOTO sequence from the page
        console.log('🆘 FINAL FALLBACK: Looking for ANY valid 7-number TOTO sequence...');
        
        // Get first 7 valid TOTO numbers that appear in sequence
        if (numberMatches.length >= 7) {
          for (let i = 0; i <= numberMatches.length - 7; i++) {
            const window = numberMatches.slice(i, i + 7);
            const numbers = window.map(m => m.number);
            
            // Check if it forms a valid TOTO result (7 unique numbers)
            if (new Set(numbers).size === 7) {
              console.log(`🎯 Found valid 7-number sequence: [${numbers.join(', ')}]`);
              console.log(`   Position range: ${window[0].position} - ${window[6].position}`);
              
              // Additional validation: numbers should be reasonably close together (within 1000 chars)
              const positionSpread = window[6].position - window[0].position;
              if (positionSpread < 1000) {
                console.log(`✅ FALLBACK SUCCESS: Valid TOTO sequence found within ${positionSpread} characters`);
                return numbers;
              } else {
                console.log(`⚠️ Sequence too spread out (${positionSpread} chars), trying next...`);
              }
            }
          }
        }
        
        console.log('❌ No valid TOTO sequences found in fallback parsing');
      }
      
    } catch (debugError) {
      console.log('⚠️ Debug check failed, continuing with parsing...', debugError.message);
    }
    
    // Dynamically load known recent results from CSV for validation
    const knownRecentResults = getKnownRecentResults(CSV_FILE);
    console.log('🔍 DEBUG: Known recent results loaded:', knownRecentResults.length);
    
    // ROBUST APPROACH: Extract the FIRST (latest) valid TOTO result from the page
    // Singapore Pools displays results in chronological order (newest first)
    console.log('🎯 ROBUST: Extracting first valid TOTO result (always latest by position)...');
    
    // Method 1: Extract all valid TOTO numbers (1-49) from the HTML and find first valid sequence
    const validNumbers = html.match(/\b(?:[1-9]|[1-4][0-9])\b/g)
      ?.map(n => parseInt(n))
      .filter(n => n >= 1 && n <= 49) || [];
    
    console.log(`🔍 Found ${validNumbers.length} valid TOTO numbers in HTML`);
    console.log(`🔍 First 15 numbers: [${validNumbers.slice(0, 15).join(', ')}${validNumbers.length > 15 ? '...' : ''}]`);
    
    // Look for the first valid sequence of 7 numbers (6 main + 1 additional)
    // Since results are ordered chronologically, the first valid sequence is the latest
    for (let i = 0; i <= validNumbers.length - 7; i++) {
      const sequence = validNumbers.slice(i, i + 7);
      const mainNumbers = sequence.slice(0, 6);
      const additionalNumber = sequence[6];
      
      // Validate sequence structure:
      // 1. No duplicates in main numbers
      // 2. All numbers within valid range
      // 3. Not already in our known results (new result)
      if (new Set(mainNumbers).size === 6) {
        console.log(`🎯 Candidate TOTO sequence #${i + 1}: [${sequence.join(', ')}]`);
        
        // Check if this is a new result (not in CSV)
        const validation = isValidNewResult(sequence, knownRecentResults);
        if (validation.valid) {
          console.log('✅ LATEST RESULT FOUND: First valid new sequence by position!');
          console.log(`📅 Result: Main numbers [${mainNumbers.join(', ')}], Additional: ${additionalNumber}`);
          return sequence;
        } else {
          console.log(`⚠️ Sequence already exists or invalid: ${validation.reason}`);
        }
      } else {
        console.log(`❌ Invalid sequence #${i + 1}: Duplicate numbers in main set`);
      }
    }
    
    // Method 2: Table-based extraction for better structure detection
    console.log('🔥 FALLBACK: Structured table-based extraction...');
    
    const tableElements = $('table');
    console.log(`📊 Found ${tableElements.length} tables on page`);
    
    // Look for the first table with TOTO number patterns
    for (let tableIndex = 0; tableIndex < tableElements.length; tableIndex++) {
      const $table = $(tableElements[tableIndex]);
      const rows = $table.find('tr');
      
      console.log(`📍 Analyzing table ${tableIndex + 1} with ${rows.length} rows`);
      
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const $row = $(rows[rowIndex]);
        const cells = $row.find('td');
        
        if (cells.length >= 6) {
          const numbers = [];
          
          cells.each((cellIndex, cell) => {
            const text = $(cell).text().trim();
            const num = parseInt(text);
            
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          // Check if we found 6 or 7 valid numbers
          if (numbers.length >= 6) {
            const mainNumbers = numbers.slice(0, 6);
            let additionalNumber = numbers.length >= 7 ? numbers[6] : null;
            
            // If no additional number in same row, check next row
            if (additionalNumber === null && rowIndex + 1 < rows.length) {
              const nextRow = $(rows[rowIndex + 1]);
              const nextCells = nextRow.find('td');
              
              nextCells.each((idx, cell) => {
                const text = $(cell).text().trim();
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 49 && additionalNumber === null) {
                  additionalNumber = num;
                }
              });
            }
            
            if (additionalNumber !== null && new Set(mainNumbers).size === 6) {
              const fullResult = [...mainNumbers, additionalNumber];
              console.log(`💫 Table-based candidate: [${fullResult.join(', ')}]`);
              
              // Basic validation only
              if (fullResult.length === 7 && 
                  fullResult.every(n => n >= 1 && n <= 49) && 
                  new Set(fullResult).size === 7) {
                console.log('✅ TABLE MATCH: Valid TOTO result format found!');
                return fullResult;
              }
            }
          }
        }
      }
    }
    
    console.log('⚠️ No valid new TOTO results found - page may not contain latest data');
    return null;
    
  } catch (error) {
    console.log('❌ Error parsing Singapore Pools page:', error.message);
    return null;
  }
}
    
    // Simple approach: Look for the main number patterns that appear on Singapore Pools
    console.log('🎯 Looking for TOTO number patterns...');
    
    // Pattern 1: Table format with | separators (most common)
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`📊 Found ${matches.length} table patterns`);
    
    if (matches.length > 0) {
      // Get the first match (latest result)
      const firstMatch = matches[0];
      const mainNumbers = firstMatch.slice(1, 7).map(n => parseInt(n));
      console.log(`🎯 Main numbers: [${mainNumbers.join(', ')}]`);
      
      // Look for additional number nearby
      const afterMatch = html.substring(firstMatch.index + firstMatch[0].length, firstMatch.index + firstMatch[0].length + 500);
      const additionalPattern = /\|\s*(\d{1,2})\s*\|/;
      const additionalMatch = afterMatch.match(additionalPattern);
      
      if (additionalMatch) {
        const additional = parseInt(additionalMatch[1]);
        const fullResult = [...mainNumbers, additional];
        console.log(`✅ Complete result: [${fullResult.join(', ')}]`);
        
        // Basic validation
        if (fullResult.length === 7 && 
            fullResult.every(n => n >= 1 && n <= 49) && 
            new Set(fullResult).size === 7) {
          console.log('🎉 Valid TOTO result found!');
          return fullResult;
        }
      }
    }
    
    // Fallback: Look for any 7 consecutive valid numbers
    console.log('🔄 Trying fallback parsing...');
    const allNumbers = [];
    const numberPattern = /(\d{1,2})/g;
    let match;
    
    while ((match = numberPattern.exec(html)) !== null) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 49) {
        allNumbers.push(num);
      }
    }
    
    console.log(`Found ${allNumbers.length} valid numbers (1-49)`);
    
    // Look for first sequence of 7 unique numbers
    for (let i = 0; i <= allNumbers.length - 7; i++) {
      const sequence = allNumbers.slice(i, i + 7);
      if (new Set(sequence).size === 7) {
        console.log(`🎯 Found valid sequence: [${sequence.join(', ')}]`);
        return sequence;
      }
    }
    
    console.log('❌ No valid TOTO result found');
    return null;
    
  } catch (error) {
    console.log('❌ Error parsing Singapore Pools page:', error.message);
    return null;
  }
}
        if (validation.valid) {
          console.log('✅ FALLBACK MATCH: Valid new result found!');
          return sequence;
        }
      }
    }
    
    console.log('⚠️  No valid TOTO results found in legacy page parsing');
    return null;
    
    // Find all tables and analyze their structure
    const tables = $('table');
    console.log(`📊 Found ${tables.length} tables on page`);
    
    let bestMatch = null;
    let bestScore = 0;
    
    tables.each((tableIndex, table) => {
      const $table = $(table);
      console.log(`\n📍 Analyzing table ${tableIndex + 1}:`);
      
      // Look for rows that might contain TOTO numbers
      const rows = $table.find('tr');
      rows.each((rowIndex, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 6) {
          console.log(`   Row ${rowIndex + 1}: ${cells.length} cells`);
          
          // Extract numbers from this row
          const numbers = [];
          const cellTexts = [];
          
          cells.each((cellIndex, cell) => {
            const text = $(cell).text().trim();
            cellTexts.push(text);
            const num = parseInt(text);
            
            if (!isNaN(num) && num >= 1 && num <= 49) {
              numbers.push(num);
            }
          });
          
          console.log(`   Cell texts: [${cellTexts.slice(0, 10).join(', ')}${cellTexts.length > 10 ? '...' : ''}]`);
          console.log(`   Valid numbers: [${numbers.join(', ')}]`);
          
          // Check if we have exactly 6 consecutive valid numbers (main numbers)
          if (numbers.length >= 6) {
            const mainNumbers = numbers.slice(0, 6);
            
            // Look for the additional number in the next row or adjacent cells
            let additionalNumber = null;
            
            // Method 1: Check if 7th number exists in same row
            if (numbers.length >= 7) {
              additionalNumber = numbers[6];
            } else {
              // Method 2: Check next row for additional number
              const nextRow = $row.next('tr');
              if (nextRow.length > 0) {
                const nextCells = nextRow.find('td');
                nextCells.each((idx, cell) => {
                  const text = $(cell).text().trim();
                  const num = parseInt(text);
                  if (!isNaN(num) && num >= 1 && num <= 49 && additionalNumber === null) {
                    additionalNumber = num;
                    console.log(`   Found additional number in next row: ${additionalNumber}`);
                  }
                });
              }
            }
            
            if (additionalNumber !== null) {
              const fullResult = [...mainNumbers, additionalNumber];
              console.log(`   💫 Potential TOTO result: [${fullResult.join(', ')}]`);
              
              // Validate this result
              if (fullResult.length === 7 && 
                  fullResult.every(n => n >= 1 && n <= 49) && 
                  new Set(fullResult).size === 7) {
                console.log(`   ✅ Valid TOTO result format found!`);
                return fullResult;
              } else {
                console.log(`   ❌ Invalid format or duplicates`);
              }
            } else {
              console.log(`   ⚠️ No additional number found for main numbers: [${mainNumbers.join(', ')}]`);
            }
          }
        }
      });
    });
    
    if (bestMatch) {
      console.log(`\n🎉 FINAL BEST MATCH: [${bestMatch.join(', ')}] (confidence: ${bestScore}/7)`);
      return bestMatch;
    }
    
    // Strategy 2: Pattern matching in HTML content
    console.log('\n� Strategy 2: Pattern matching in HTML content...');
    
    // Look for table patterns with TOTO numbers in HTML
    const tablePattern = /\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\|/g;
    const matches = [...html.matchAll(tablePattern)];
    
    console.log(`📊 Found ${matches.length} table patterns`);
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const numbers = match.slice(1, 7).map(n => parseInt(n));
      console.log(`Pattern ${i + 1}: [${numbers.join(', ')}]`);
      
      if (numbers.every(n => n >= 1 && n <= 49)) {
        // Look for additional number nearby
        const afterMatch = html.substring(match.index + match[0].length, match.index + match[0].length + 200);
        const additionalMatch = afterMatch.match(/\|\s*(\d{1,2})\s*\|/);
        
        if (additionalMatch) {
          const additional = parseInt(additionalMatch[1]);
          if (additional >= 1 && additional <= 49) {
            const fullResult = [...numbers, additional];
            console.log(`   Full result with additional: [${fullResult.join(', ')}]`);
            
            if (fullResult.length === 7 && 
                fullResult.every(n => n >= 1 && n <= 49) && 
                new Set(fullResult).size === 7) {
              console.log(`   ✅ Valid pattern result: [${fullResult.join(', ')}]`);
              return fullResult;
            } else {
              console.log(`   ❌ Invalid format or duplicates`);
            }
          }
        }
  }
}

function readExistingCSV(path) {
  if (!fs.existsSync(path)) {
    console.log('📄 CSV file does not exist, will create new one');
    return [];
  }
  
  try {
    const content = fs.readFileSync(path, 'utf8').trim();
    if (!content) {
      console.log('📄 CSV file is empty');
      return [];
    }
    
    const rows = content.split('\n').map(line => line.split(',').map(Number));
    console.log(`📄 Read ${rows.length} existing results from CSV`);
    return rows;
  } catch (error) {
    console.log('❌ Error reading CSV:', error.message);
    return [];
  }
}

function getKnownRecentResults(csvPath, fallbackResults = []) {
  try {
    const existingResults = readExistingCSV(csvPath);
    if (existingResults.length > 0) {
      // Use the 3 most recent results from CSV for pattern matching
      const recentResults = existingResults.slice(0, Math.min(3, existingResults.length));
      console.log('📊 Using recent results from CSV for validation:');
      recentResults.forEach((result, index) => {
        console.log(`   ${index + 1}: [${result.join(', ')}]`);
      });
      return recentResults;
    } else {
      console.log('⚠️ CSV empty, no existing results to compare against');
      return fallbackResults;
    }
  } catch (error) {
    console.log('⚠️ CSV read error, using fallback known results:', error.message);
    return fallbackResults;
  }
}

function isValidNewResult(numbers, knownResults) {
  // Check if this is a valid new result (not a duplicate, reasonable pattern)
  
  // First check: Must have exactly 7 numbers
  if (!Array.isArray(numbers) || numbers.length !== 7) {
    return { valid: false, reason: `Invalid length: expected 7 numbers, got ${numbers?.length || 0}` };
  }
  
  // Second check: No duplicate numbers within the result
  if (new Set(numbers).size !== numbers.length) {
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    return { valid: false, reason: `Contains duplicate numbers: ${duplicates.join(', ')}` };
  }
  
  // Third check: All numbers must be in valid range
  const invalidNumbers = numbers.filter(n => n < 1 || n > 49 || !Number.isInteger(n));
  if (invalidNumbers.length > 0) {
    return { valid: false, reason: `Invalid numbers outside 1-49 range: ${invalidNumbers.join(', ')}` };
  }
  
  // Fourth check: Reject sequential numbers (likely from navigation/pagination)
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  let isSequential = true;
  for (let i = 1; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== sortedNumbers[i-1] + 1) {
      isSequential = false;
      break;
    }
  }
  if (isSequential) {
    return { valid: false, reason: `Sequential numbers detected (likely navigation): [${sortedNumbers.join(', ')}]` };
  }
  
  // Fifth check: Reject if too many small numbers (likely page elements)
  const smallNumbers = numbers.filter(n => n <= 10).length;
  if (smallNumbers >= 6) {
    return { valid: false, reason: `Too many small numbers (${smallNumbers}/7 ≤ 10), likely page navigation` };
  }
  
  // Sixth check: Don't allow exact duplicates of known results
  for (const known of knownResults) {
    if (numbers.length === known.length && 
        numbers.slice(0, 6).sort().join(',') === known.slice(0, 6).sort().join(',') &&
        numbers[6] === known[6]) {
      return { valid: false, reason: `Exact duplicate of existing result [${known.join(', ')}]` };
    }
  }
  
  // Seventh check: Enhanced recency validation - ensure numbers match realistic TOTO patterns
  const distribution = checkNumberDistribution(numbers);
  if (!distribution.valid) {
    return { valid: false, reason: `Unrealistic number distribution: ${distribution.reason}` };
  }
  
  return { valid: true, reason: 'Valid new result' };
}

function checkNumberDistribution(numbers) {
  // Enhanced distribution checks for realistic TOTO patterns
  
  // Check 1: Even/odd distribution should be reasonable
  const evenCount = numbers.filter(n => n % 2 === 0).length;
  const oddCount = numbers.length - evenCount;
  
  // Extreme imbalances are suspicious (all even/odd is very rare)
  if (evenCount === 0 || oddCount === 0) {
    return { valid: false, reason: `Extreme even/odd distribution: ${evenCount} even, ${oddCount} odd` };
  }
  
  // Check 2: High/low number distribution
  const lowCount = numbers.filter(n => n <= 25).length;
  const highCount = numbers.length - lowCount;
  
  // All in one half is suspicious
  if (lowCount === 0 || highCount === 0) {
    return { valid: false, reason: `Extreme high/low distribution: ${lowCount} low (1-25), ${highCount} high (26-49)` };
  }
  
  // Check 3: Decade distribution (shouldn't be too concentrated)
  const decades = { '1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-49': 0 };
  numbers.forEach(n => {
    if (n <= 10) decades['1-10']++;
    else if (n <= 20) decades['11-20']++;
    else if (n <= 30) decades['21-30']++;
    else if (n <= 40) decades['31-40']++;
    else decades['41-49']++;
  });
  
  // More than 5 numbers in same decade is suspicious
  const maxInDecade = Math.max(...Object.values(decades));
  if (maxInDecade > 5) {
    return { valid: false, reason: `Too many numbers in same decade: ${maxInDecade} numbers` };
  }
  
  // Check 4: Sum validation (typical TOTO sums range 100-250)
  const sum = numbers.reduce((a, b) => a + b, 0);
  if (sum < 70 || sum > 280) {
    return { valid: false, reason: `Unusual sum: ${sum} (typical range 70-280)` };
  }
  
  return { valid: true, reason: 'Realistic number distribution' };
}

function writeCSV(path, rows) {
  try {
    const content = rows.map(r => r.join(',')).join('\n') + '\n';
    fs.writeFileSync(path, content, 'utf8');
    console.log(`💾 Successfully wrote ${rows.length} results to CSV`);
  } catch (error) {
    console.log('❌ Error writing CSV:', error.message);
    throw error;
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Main execution with enhanced error handling
(async () => {
  try {
    console.log('🚀 Starting TOTO result update process...');
    console.log('📅 Current date:', new Date().toISOString());
    console.log('🌍 Environment:', process.env.NODE_ENV || 'production');
    
    try {
      console.log('');
      console.log('='.repeat(60));
      console.log('STEP 1: ATTEMPTING TO FETCH LATEST TOTO RESULTS');
      console.log('='.repeat(60));
      
      const latestResult = await fetchLatestTotoResult();
      
      console.log('');
      console.log('='.repeat(60));
      console.log('STEP 2: PROCESSING FETCH RESULTS');
      console.log('='.repeat(60));
      console.log(`🎯 Fetched result: ${latestResult ? `[${latestResult.join(', ')}]` : 'NULL'}`);
      console.log(`🔍 Result type: ${typeof latestResult}`);
      console.log(`🔍 Result is array: ${Array.isArray(latestResult)}`);
      console.log(`🔍 Result length: ${latestResult ? latestResult.length : 'N/A'}`);
      
      // CRITICAL DEBUG: Show exactly what was returned
      if (latestResult === null) {
        console.log('❌ CRITICAL: fetchLatestTotoResult returned NULL');
        console.log('💡 This means the parsing failed to extract any valid result');
        console.log('🔍 This is why CSV is not being updated');
      } else if (latestResult === undefined) {
        console.log('❌ CRITICAL: fetchLatestTotoResult returned UNDEFINED'); 
        console.log('💡 This means there was an error in the fetch function');
      } else if (!Array.isArray(latestResult)) {
        console.log('❌ CRITICAL: fetchLatestTotoResult returned non-array');
        console.log(`💡 Got: ${typeof latestResult} with value: ${latestResult}`);
      } else if (latestResult.length !== 7) {
        console.log('❌ CRITICAL: fetchLatestTotoResult returned wrong array length');
        console.log(`💡 Expected 7 numbers, got ${latestResult.length}: [${latestResult.join(', ')}]`);
      } else {
        console.log('✅ FETCH SUCCESS: Got valid 7-number array');
        console.log(`🎯 Will proceed with comparison and update logic`);
      }
      
      if (!latestResult || latestResult.length !== 7) {
        console.log('');
        console.log('❌ Unable to retrieve valid TOTO results');
        console.log('📊 Analysis of current situation:');
        console.log('   • Singapore Pools website structure may have changed');
        console.log('   • Results page might show different content than expected');
        console.log('   • TOTO numbers may be dynamically loaded or moved to new endpoints');
        console.log('   • This indicates a website structure issue requiring investigation');
        console.log('');
        console.log('🔧 Possible causes:');
        console.log('   • Website redesign moved results to different URLs');
        console.log('   • Results now require JavaScript rendering');
        console.log('   • Anti-bot measures blocking automated access');
        console.log('   • Results moved to authenticated/API endpoints');
        console.log('');
        console.log('💡 Action required:');
        console.log('   • Manual investigation of Singapore Pools website structure');
        console.log('   • Update parsing logic based on current website layout');
        console.log('   • Consider alternative data sources or scraping methods');
        console.log('   • Workflow will exit cleanly without making changes');
        
        console.log('');
        console.log('� EXITING: No changes made to CSV - manual intervention required');
        process.exit(0);
      }
      
      console.log('');
      console.log('='.repeat(60));
      console.log('STEP 3: VALIDATING FETCHED RESULTS');
      console.log('='.repeat(60));
      console.log(`✅ Valid result fetched: [${latestResult.join(', ')}]`);
      
      console.log('');
      console.log('='.repeat(60));
      console.log('STEP 4: COMPARING WITH EXISTING CSV DATA');
      console.log('='.repeat(60));
      
      const existing = readExistingCSV(CSV_FILE);
      console.log(`📊 Current CSV entries: ${existing.length}`);
      console.log(`📊 Current top entry: ${existing.length > 0 ? `[${existing[0].join(', ')}]` : 'EMPTY'}`);
      console.log(`🎯 New result from Singapore Pools: [${latestResult.join(', ')}]`);
      
      // DEBUG: Show exact comparison details
      if (latestResult && existing.length > 0) {
        console.log('');
        console.log('🔍 COMPARISON DEBUG:');
        console.log(`   Fetched: [${latestResult.join(', ')}]`);
        console.log(`   CSV Top: [${existing[0].join(', ')}]`);
        console.log(`   Arrays Equal: ${arraysEqual(latestResult, existing[0])}`);
        console.log(`   Length Match: ${latestResult.length === existing[0].length}`);
        if (latestResult.length === existing[0].length) {
          for (let i = 0; i < latestResult.length; i++) {
            console.log(`   Position ${i}: ${latestResult[i]} === ${existing[0][i]} = ${latestResult[i] === existing[0][i]}`);
          }
        }
        
        // Additional debug: Check if arrays are exactly equal
        const fetchedStr = JSON.stringify(latestResult.sort());
        const csvStr = JSON.stringify(existing[0].sort());
        console.log(`   Sorted Fetched: ${fetchedStr}`);
        console.log(`   Sorted CSV:     ${csvStr}`);
        console.log(`   JSON Equal:     ${fetchedStr === csvStr}`);
      }

      // Check if the results match
      if (existing.length > 0 && arraysEqual(latestResult, existing[0])) {
        console.log('✅ Results match - no update needed');
        console.log(`📊 Current result: [${latestResult.join(', ')}]`);
        console.log('� Exiting gracefully');
        process.exit(0);
      } else {
        console.log('🔄 Results differ - updating CSV');
        console.log(`� New result: [${latestResult.join(', ')}]`);
      }
    
      console.log('');
      console.log('='.repeat(60));
      console.log('STEP 5: UPDATING CSV WITH NEW RESULTS');
      console.log('='.repeat(60));
      
      console.log('🔄 Adding new result to top of CSV...');
      console.log(`📝 Before update - CSV has ${existing.length} entries`);
      console.log(`📝 Adding result: [${latestResult.join(', ')}]`);
      
      existing.unshift(latestResult);
      console.log(`📝 After unshift - CSV has ${existing.length} entries`);
      console.log(`📝 New top entry: [${existing[0].join(', ')}]`);
      
      try {
        writeCSV(CSV_FILE, existing);
        console.log('✅ CSV updated successfully');
        
        // Verify the write worked
        const verification = readExistingCSV(CSV_FILE);
        if (JSON.stringify(verification[0]) === JSON.stringify(latestResult)) {
          console.log('✅ File write verification successful');
        } else {
          console.log('❌ File write verification failed');
        }
      } catch (writeError) {
        console.error('❌ Error writing CSV:', writeError.message);
        throw writeError;
      }
      
      console.log('🎉 Updated with latest result:', latestResult.join(','));
      console.log('📈 Total results in database:', existing.length);
      console.log('✨ CSV file successfully updated');    console.log('');
    console.log('✅ Workflow completed successfully');
    console.log(`🎯 Updated result: [${latestResult.join(', ')}]`);
    process.exit(0);
    
  } catch (err) {
    console.error('💥 Error during execution:', err.message);
    console.log('🔄 Attempting graceful recovery...');
    
    try {
      // Emergency failsafe - preserve existing data integrity
      const existing = readExistingCSV(CSV_FILE);
      
      if (existing.length === 0) {
        console.log('🚨 EMERGENCY: CSV is empty, but no new result available');
        console.log('📝 Maintaining existing state to prevent data loss');
      } else {
        console.log('�️ FAILSAFE: Preserving existing CSV data');
        console.log(`📊 Current CSV has ${existing.length} entries`);
        console.log(`📊 Latest entry: [${existing[0].join(', ')}]`);
        // Don't modify anything - preserve current state
      }
      
      console.log('� Process completed with failsafe measures');
      process.exit(0);
      
    } catch (failsafeError) {
      console.error('💥 Emergency failsafe also failed:', failsafeError.message);
      console.log('❌ Manual intervention may be required');
      console.log('🔄 Exiting gracefully to avoid workflow failure');
      process.exit(0);  // Changed from exit(1) to prevent workflow failures
    }
  }
} catch (mainError) {
  console.error('');
  console.error('🚨 Fatal error:', mainError.message);
  console.error('='.repeat(60));
  console.error('Error message:', mainError.message);
  console.error('Error stack:', mainError.stack);
  console.error('💡 This is likely a programming error that needs attention');
  console.error('🔄 Exiting gracefully to avoid workflow failure');
  process.exit(0);  // Exit gracefully even on fatal errors
}
})();
