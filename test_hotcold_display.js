const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the HTML file
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Create a DOM environment
const dom = new JSDOM(htmlContent);
global.window = dom.window;
global.document = dom.window.document;

// Mock console to capture debug output
const debugLogs = [];
const originalLog = console.log;
console.log = function(...args) {
  debugLogs.push(args.join(' '));
  originalLog(...args);
};

// Mock displayPredictedNumbers to see what gets passed to it
let displayCallCount = 0;
let lastDisplayCall = null;

window.displayPredictedNumbers = function(numbers, _, scores, freq, compat, title, extraData) {
  displayCallCount++;
  lastDisplayCall = {
    numbers: numbers,
    scores: scores,
    freq: freq,
    compat: compat,
    title: title,
    extraData: extraData
  };
  console.log('DISPLAY FUNCTION CALLED:');
  console.log('  Numbers:', numbers);
  console.log('  Scores:', scores);
  console.log('  Title:', title);
};

// Set up the DOM elements needed
document.body.innerHTML = `
  <input id="includeAdd" type="checkbox">
  <select id="drawRange">
    <option value="50" selected>50 draws</option>
  </select>
  <input id="base1" value="16">
  <input id="base2" value="22">
  <input id="base3" value="10">
  <div id="results"></div>
`;

// Add sample historical data (simplified for testing)
const sampleData = [
  { numbers: [1, 12, 23, 34, 45, 49], additional: 7 },
  { numbers: [2, 13, 24, 35, 46, 48], additional: 8 },
  { numbers: [3, 14, 25, 36, 47, 40], additional: 9 },
  // Add more sample data as needed
];

// Repeat sample data to have enough draws
global.historical = [];
for (let i = 0; i < 20; i++) {
  global.historical.push(...sampleData);
}

console.log('Testing Hot/Cold Analysis with debug output...\n');

try {
  // Execute the Hot/Cold prediction function
  window.runHotColdPrediction();
  
  console.log('\n=== SUMMARY ===');
  console.log('Display function called:', displayCallCount, 'times');
  
  if (lastDisplayCall) {
    console.log('Last display call:');
    console.log('  Numbers received:', lastDisplayCall.numbers);
    console.log('  Numbers count:', lastDisplayCall.numbers ? lastDisplayCall.numbers.length : 0);
    console.log('  Scores received:', lastDisplayCall.scores ? lastDisplayCall.scores.length : 0);
    console.log('  Title:', lastDisplayCall.title);
  } else {
    console.log('NO DISPLAY FUNCTION CALLS MADE!');
  }
  
  console.log('\n=== DEBUG LOGS ===');
  debugLogs.forEach(log => {
    if (log.includes('Debug:')) {
      console.log(log);
    }
  });
  
} catch (error) {
  console.error('Error running Hot/Cold Analysis:', error);
  console.error(error.stack);
}