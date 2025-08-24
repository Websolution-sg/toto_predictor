const puppeteer = require('puppeteer');

async function debugCompleteStructure() {
  let browser;
  try {
    console.log('🔍 Debugging Singapore Pools complete data structure...');
    
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📡 Navigating to Singapore Pools 4D results page...');
    await page.goto('https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📄 Page title:', await page.title());
    
    // Extract detailed structure information
    const analysisResult = await page.evaluate(() => {
      const analysis = {
        totalTables: 0,
        tablesWithData: [],
        allText: '',
        drawNumberLocations: [],
        prizePatterns: [],
        rowAnalysis: []
      };
      
      // Analyze all tables
      const tables = document.querySelectorAll('table, .table');
      analysis.totalTables = tables.length;
      
      tables.forEach((table, index) => {
        const tableText = table.textContent.trim();
        
        if (tableText.includes('Draw No') || tableText.match(/\d{4}/)) {
          const tableInfo = {
            index: index,
            hasDrawNo: tableText.includes('Draw No'),
            drawNumbers: tableText.match(/Draw\s+No\.?\s+(\d{4})/gi) || [],
            allNumbers: tableText.match(/\b\d{4}\b/g) || [],
            rowCount: table.querySelectorAll('tr').length,
            cellCounts: [],
            rowTexts: []
          };
          
          // Analyze each row in this table
          const rows = table.querySelectorAll('tr');
          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td, th');
            const rowText = row.textContent.trim();
            tableInfo.cellCounts.push(cells.length);
            
            if (rowText) {
              tableInfo.rowTexts.push({
                rowIndex: rowIndex,
                cellCount: cells.length,
                text: rowText.substring(0, 100), // First 100 chars
                numbers: rowText.match(/\b\d{4}\b/g) || [],
                hasStarter: rowText.toLowerCase().includes('starter'),
                hasConsolation: rowText.toLowerCase().includes('consolation'),
                hasPrize: rowText.toLowerCase().includes('prize')
              });
            }
          });
          
          analysis.tablesWithData.push(tableInfo);
        }
      });
      
      // Look for specific patterns
      const bodyText = document.body.textContent;
      analysis.allText = bodyText.substring(0, 500); // First 500 chars
      
      // Find draw number patterns
      const drawMatches = bodyText.match(/Draw\s+No\.?\s+(\d{4})/gi) || [];
      analysis.drawNumberLocations = drawMatches;
      
      // Find prize patterns
      const prizePatterns = [
        bodyText.match(/1st\s+Prize[:\s]*(\d{4})/gi) || [],
        bodyText.match(/2nd\s+Prize[:\s]*(\d{4})/gi) || [],
        bodyText.match(/3rd\s+Prize[:\s]*(\d{4})/gi) || [],
        bodyText.match(/Starter[:\s]*(\d{4})/gi) || [],
        bodyText.match(/Consolation[:\s]*(\d{4})/gi) || []
      ];
      analysis.prizePatterns = prizePatterns;
      
      return analysis;
    });
    
    console.log('\n📊 Complete Analysis Results:');
    console.log('==========================================');
    console.log(`Total tables found: ${analysisResult.totalTables}`);
    console.log(`Tables with 4D data: ${analysisResult.tablesWithData.length}`);
    console.log(`Draw number patterns: ${JSON.stringify(analysisResult.drawNumberLocations)}`);
    console.log(`Prize patterns found: ${JSON.stringify(analysisResult.prizePatterns)}`);
    
    // Analyze each table with data
    analysisResult.tablesWithData.forEach((table, index) => {
      console.log(`\n📋 Table ${table.index} Analysis:`);
      console.log(`  - Has Draw No: ${table.hasDrawNo}`);
      console.log(`  - Draw Numbers: ${JSON.stringify(table.drawNumbers)}`);
      console.log(`  - All 4-digit numbers: ${table.allNumbers.slice(0, 20).join(', ')}${table.allNumbers.length > 20 ? '...' : ''}`);
      console.log(`  - Row count: ${table.rowCount}`);
      console.log(`  - Cell counts per row: ${table.cellCounts.join(', ')}`);
      
      // Show interesting rows
      console.log(`  - Interesting rows:`);
      table.rowTexts.forEach(row => {
        if (row.numbers.length > 0 || row.hasPrize || row.hasStarter || row.hasConsolation) {
          console.log(`    Row ${row.rowIndex} (${row.cellCount} cells): ${row.text}`);
          console.log(`      Numbers: ${row.numbers.join(', ')}`);
          console.log(`      Has Prize: ${row.hasPrize}, Starter: ${row.hasStarter}, Consolation: ${row.hasConsolation}`);
        }
      });
    });
    
    console.log('\n📄 Page Text Sample:');
    console.log(analysisResult.allText);
    
    console.log('\n⏸️  Browser is open for manual inspection. Check the actual website structure.');
    console.log('Press Ctrl+C when done analyzing...');
    await new Promise(resolve => setTimeout(resolve, 120000)); // Wait 2 minutes
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugCompleteStructure();
