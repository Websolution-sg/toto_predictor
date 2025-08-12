// Simple test to verify parsing logic works
const cheerio = require('cheerio');

// Mock HTML structure based on Singapore Pools
const mockHTML = `
<html>
<body>
<table>
  <tr>
    <td>9</td>
    <td>24</td>
    <td>31</td>
    <td>34</td>
    <td>43</td>
    <td>44</td>
  </tr>
  <tr>
    <td>1</td>
  </tr>
</table>
<table>
  <tr>
    <td>2</td>
    <td>15</td>
    <td>28</td>
    <td>39</td>
    <td>42</td>
    <td>44</td>
  </tr>
  <tr>
    <td>5</td>
  </tr>
</table>
</body>
</html>
`;

function testParsing() {
  const $ = cheerio.load(mockHTML);
  console.log('🧪 Testing parsing logic...');
  
  const tables = $('table');
  console.log(`Found ${tables.length} tables`);
  
  tables.each((tableIndex, table) => {
    const $table = $(table);
    const rows = $table.find('tr');
    
    console.log(`\nTable ${tableIndex + 1}:`);
    rows.each((rowIndex, row) => {
      const $row = $(row);
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
        
        console.log(`  Row ${rowIndex + 1}: [${numbers.join(', ')}]`);
        
        if (numbers.length >= 6) {
          const mainNumbers = numbers.slice(0, 6);
          
          // Look for additional number in next row
          const nextRow = $row.next('tr');
          if (nextRow.length > 0) {
            const nextCells = nextRow.find('td');
            let additionalNumber = null;
            
            nextCells.each((idx, cell) => {
              const text = $(cell).text().trim();
              const num = parseInt(text);
              if (!isNaN(num) && num >= 1 && num <= 49 && additionalNumber === null) {
                additionalNumber = num;
              }
            });
            
            if (additionalNumber !== null) {
              const fullResult = [...mainNumbers, additionalNumber];
              console.log(`  ✅ Complete result: [${fullResult.join(', ')}]`);
              
              if (tableIndex === 0) {
                console.log('  🎯 This should be the latest result!');
                return fullResult;
              }
            }
          }
        }
      }
    });
  });
}

// Test it
if (typeof module !== 'undefined') {
  testParsing();
}

module.exports = { testParsing };
