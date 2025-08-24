const puppeteer = require('puppeteer');

async function debugSingaporePools() {
  let browser;
  try {
    console.log('🔍 Debugging Singapore Pools website structure...');
    
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📡 Navigating to Singapore Pools 4D results page...');
    await page.goto('https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📄 Page title:', await page.title());
    
    // Take a screenshot
    await page.screenshot({path: 'singapore-pools-debug.png'});
    console.log('📸 Screenshot saved as singapore-pools-debug.png');
    
    // Check for various table selectors
    const selectors = [
      'table',
      '.table',
      '.results-table',
      '.table-responsive',
      '.draw-results',
      '#results',
      '.results',
      '[class*="result"]',
      '[class*="table"]',
      '.data-table'
    ];
    
    console.log('\n🔍 Checking for table elements...');
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
          
          // Get some content from the first element
          const text = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el ? el.textContent.substring(0, 200) : 'No content';
          }, selector);
          console.log(`   Content preview: ${text.replace(/\s+/g, ' ').trim()}`);
        } else {
          console.log(`❌ No elements found with selector: ${selector}`);
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}: ${error.message}`);
      }
    }
    
    // Check for any text containing "4D" or numbers
    console.log('\n🔍 Searching for 4D-related content...');
    const textContent = await page.evaluate(() => {
      const body = document.body;
      return body ? body.textContent : 'No body content';
    });
    
    const has4D = textContent.includes('4D') || textContent.includes('4d');
    const hasNumbers = /\d{4}/.test(textContent);
    
    console.log(`📝 Page contains "4D": ${has4D}`);
    console.log(`📝 Page contains 4-digit numbers: ${hasNumbers}`);
    
    if (hasNumbers) {
      const numbers = textContent.match(/\d{4}/g);
      console.log(`📝 Sample 4-digit numbers found: ${numbers ? numbers.slice(0, 5).join(', ') : 'none'}`);
    }
    
    // Wait for user to examine the browser
    console.log('\n⏸️  Browser is open for manual inspection. Press Ctrl+C when done.');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugSingaporePools();
