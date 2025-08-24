// TOTO to 4D Converter Script
// This script converts TOTO results to 4D format using digit combinations

function convertTotoTo4D() {
  const totoData = [
    [4,13,22,36,38,46,12],
    [1,4,18,24,37,42,26],
    [22,25,29,31,34,43,11],
    [9,24,31,34,43,44,1],
    [2,15,28,39,42,44,5]
    // Add more TOTO data as needed
  ];
  
  const converted4D = [];
  
  totoData.forEach((totoRow, index) => {
    // Extract digits from TOTO numbers to create 4D numbers
    const digits = totoRow.join('').split('').map(d => parseInt(d));
    
    // Create 4D numbers using different digit combination strategies
    const first = (digits[0] || 0).toString() + 
                  (digits[1] || 0).toString() + 
                  (digits[2] || 0).toString() + 
                  (digits[3] || 0).toString();
    
    const second = (digits[4] || 0).toString() + 
                   (digits[5] || 0).toString() + 
                   (digits[6] || 0).toString() + 
                   (digits[7] || 0).toString();
    
    const third = (digits[8] || 0).toString() + 
                  (digits[9] || 0).toString() + 
                  (digits[10] || 0).toString() + 
                  (digits[11] || 0).toString();
    
    // Generate starter and consolation prizes
    const starter1 = (digits[12] || 0).toString() + 
                     (digits[13] || 0).toString() + 
                     (digits[14] || 0).toString() + 
                     (digits[15] || 0).toString();
    
    const starter2 = (digits[16] || 0).toString() + 
                     (digits[17] || 0).toString() + 
                     (digits[18] || 0).toString() + 
                     (digits[19] || 0).toString();
    
    // Create consolation prizes
    const consolation = [];
    for(let i = 0; i < 10; i++) {
      const base = (i * 4);
      consolation.push(
        (digits[base + 20] || Math.floor(Math.random() * 10)).toString() +
        (digits[base + 21] || Math.floor(Math.random() * 10)).toString() +
        (digits[base + 22] || Math.floor(Math.random() * 10)).toString() +
        (digits[base + 23] || Math.floor(Math.random() * 10)).toString()
      );
    }
    
    const drawNumber = 4593 - index;
    const drawDate = new Date(2024, 7, 21 - (index * 3)).toISOString().split('T')[0];
    
    converted4D.push({
      draw: drawNumber,
      date: drawDate,
      first: first.padStart(4, '0'),
      second: second.padStart(4, '0'),
      third: third.padStart(4, '0'),
      starter: [starter1.padStart(4, '0'), starter2.padStart(4, '0')],
      consolation: consolation.map(c => c.padStart(4, '0'))
    });
  });
  
  return converted4D;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertTotoTo4D };
}
