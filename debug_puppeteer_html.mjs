import puppeteer from 'puppeteer';
import fs from 'fs';

const TOTO_URL = 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TOTO_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('body');
  // Save the full HTML for inspection
  const html = await page.content();
  await browser.close();
  fs.writeFileSync('puppeteer_toto_results.html', html);
  console.log('✅ Saved rendered HTML to puppeteer_toto_results.html');
})();
