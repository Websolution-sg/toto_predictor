
// Enhanced Position-based Analysis
function runPositionAnalysis() {
  const range = parseInt(document.getElementById('drawRange').value);
  const draws = historical4D.slice(0, range);
  
  console.log('🎯 Running Position-based Analysis on', draws.length, 'draws');
  
  // Track digit transitions and patterns by position
  const positionPatterns = [[], [], [], []]; // For positions 0-3
  const digitTransitions = [{}, {}, {}, {}];
  
  const includeFirst = document.getElementById('analyze1st').checked;
  const includeSecond = document.getElementById('analyze2nd').checked;
  const includeThird = document.getElementById('analyze3rd').checked;
  const includeStarter = document.getElementById('analyzeStarter').checked;
  const includeConsolation = document.getElementById('analyzeConsolation').checked;
  
  // Collect all numbers based on user selection
  let allNumbers = [];
  draws.forEach(draw => {
    if (includeFirst) allNumbers.push(draw.first);
    if (includeSecond) allNumbers.push(draw.second);
    if (includeThird) allNumbers.push(draw.third);
    if (includeStarter) allNumbers.push(...draw.starter);
    if (includeConsolation) allNumbers.push(...draw.consolation);
  });
  
  // Analyze digit patterns by position
  for (let i = 0; i < allNumbers.length - 1; i++) {
    const current = allNumbers[i].padStart(4, '0');
    const next = allNumbers[i + 1].padStart(4, '0');
    
    for (let pos = 0; pos < 4; pos++) {
      const currentDigit = parseInt(current[pos]);
      const nextDigit = parseInt(next[pos]);
      
      // Track transitions
      if (!digitTransitions[pos][currentDigit]) {
        digitTransitions[pos][currentDigit] = {};
      }
      if (!digitTransitions[pos][currentDigit][nextDigit]) {
        digitTransitions[pos][currentDigit][nextDigit] = 0;
      }
      digitTransitions[pos][currentDigit][nextDigit]++;
    }
  }
  
  // Generate predictions based on position patterns
  const predictions = generatePositionPredictions(digitTransitions, allNumbers);
  displayPredictions(predictions, 'Position-based Analysis');
}

// Generate predictions using position-based patterns
function generatePositionPredictions(transitions, recentNumbers) {
  const predictions = [];
  const lastNumber = recentNumbers[0].padStart(4, '0');
  
  // Method 1: Most likely next digits based on transitions
  for (let attempt = 0; attempt < 10; attempt++) {
    let prediction = '';
    
    for (let pos = 0; pos < 4; pos++) {
      const lastDigit = parseInt(lastNumber[pos]);
      const posTransitions = transitions[pos][lastDigit] || {};
      
      // Get most likely next digits
      const sortedTransitions = Object.entries(posTransitions)
        .sort((a, b) => b[1] - a[1])
        .map(([digit]) => digit);
      
      if (sortedTransitions.length > 0) {
        // Use different ranking for variety
        const index = Math.min(attempt % 3, sortedTransitions.length - 1);
        prediction += sortedTransitions[index];
      } else {
        // Fallback to random if no transition data
        prediction += Math.floor(Math.random() * 10);
      }
    }
    
    if (!predictions.includes(prediction)) {
      predictions.push(prediction);
    }
  }
  
  // Method 2: Hot and cold digit combinations
  const hotDigits = findHotDigits(recentNumbers.slice(0, 10));
  const coldDigits = findColdDigits(recentNumbers);
  
  for (let i = 0; i < 3; i++) {
    let hotCombination = '';
    let coldCombination = '';
    
    for (let pos = 0; pos < 4; pos++) {
      hotCombination += hotDigits[pos][i % hotDigits[pos].length];
      coldCombination += coldDigits[pos][i % coldDigits[pos].length];
    }
    
    if (!predictions.includes(hotCombination)) predictions.push(hotCombination);
    if (!predictions.includes(coldCombination)) predictions.push(coldCombination);
  }
  
  return predictions.slice(0, 6);
}

// Enhanced Pattern Recognition Analysis
function runPatternAnalysis() {
  const range = parseInt(document.getElementById('drawRange').value);
  const draws = historical4D.slice(0, range);
  
  console.log('🔍 Running Pattern Recognition on', draws.length, 'draws');
  
  const includeFirst = document.getElementById('analyze1st').checked;
  const includeSecond = document.getElementById('analyze2nd').checked;
  const includeThird = document.getElementById('analyze3rd').checked;
  const includeStarter = document.getElementById('analyzeStarter').checked;
  const includeConsolation = document.getElementById('analyzeConsolation').checked;
  
  let allNumbers = [];
  draws.forEach(draw => {
    if (includeFirst) allNumbers.push(draw.first);
    if (includeSecond) allNumbers.push(draw.second);
    if (includeThird) allNumbers.push(draw.third);
    if (includeStarter) allNumbers.push(...draw.starter);
    if (includeConsolation) allNumbers.push(...draw.consolation);
  });
  
  const predictions = generatePatternPredictions(allNumbers, draws);
  displayPredictions(predictions, 'Advanced Pattern Recognition');
}

// Generate predictions using pattern recognition
function generatePatternPredictions(numbers, draws) {
  const predictions = [];
  
  // Pattern 1: Sequential patterns (1234, 2345, etc.)
  const sequences = findSequentialPatterns(numbers);
  predictions.push(...sequences.slice(0, 2));
  
  // Pattern 2: Repeated digit patterns (1122, 3344, etc.)
  const repeats = findRepeatedDigitPatterns(numbers);
  predictions.push(...repeats.slice(0, 2));
  
  // Pattern 3: Mirror patterns (1221, 3443, etc.)
  const mirrors = findMirrorPatterns(numbers);
  predictions.push(...mirrors.slice(0, 1));
  
  // Pattern 4: Sum-based patterns
  const sumPatterns = findSumBasedPatterns(numbers);
  predictions.push(...sumPatterns.slice(0, 2));
  
  // Pattern 5: Date-based patterns
  const datePatterns = generateDateBasedPatterns(draws);
  predictions.push(...datePatterns.slice(0, 1));
  
  // Remove duplicates and ensure 4-digit format
  const uniquePredictions = [...new Set(predictions)]
    .map(num => num.padStart(4, '0'))
    .filter(num => num.length === 4);
  
  return uniquePredictions.slice(0, 6);
}

// Helper Functions for Pattern Analysis

function findHotDigits(recentNumbers) {
  const positionCounts = [new Array(10).fill(0), new Array(10).fill(0), 
                         new Array(10).fill(0), new Array(10).fill(0)];
  
  recentNumbers.forEach(num => {
    const digits = num.padStart(4, '0').split('').map(d => parseInt(d));
    digits.forEach((digit, pos) => {
      positionCounts[pos][digit]++;
    });
  });
  
  return positionCounts.map(counts => 
    counts.map((count, digit) => ({ digit, count }))
          .sort((a, b) => b.count - a.count)
          .map(item => item.digit)
  );
}

function findColdDigits(numbers) {
  const positionCounts = [new Array(10).fill(0), new Array(10).fill(0), 
                         new Array(10).fill(0), new Array(10).fill(0)];
  
  numbers.forEach(num => {
    const digits = num.padStart(4, '0').split('').map(d => parseInt(d));
    digits.forEach((digit, pos) => {
      positionCounts[pos][digit]++;
    });
  });
  
  return positionCounts.map(counts => 
    counts.map((count, digit) => ({ digit, count }))
          .sort((a, b) => a.count - b.count)
          .map(item => item.digit)
  );
}

function findSequentialPatterns(numbers) {
  const patterns = [];
  
  // Find common sequential increments
  const increments = [1, -1, 2, -2, 3, -3];
  
  increments.forEach(inc => {
    for (let start = 0; start <= 9; start++) {
      let pattern = '';
      let current = start;
      
      for (let i = 0; i < 4; i++) {
        if (current >= 0 && current <= 9) {
          pattern += current;
          current += inc;
        } else {
          break;
        }
      }
      
      if (pattern.length === 4) {
        patterns.push(pattern);
      }
    }
  });
  
  return patterns.slice(0, 5);
}

function findRepeatedDigitPatterns(numbers) {
  const patterns = [];
  
  // AABB patterns
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      if (a !== b) {
        patterns.push(a.toString() + a.toString() + b.toString() + b.toString());
      }
    }
  }
  
  // ABAB patterns
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      if (a !== b) {
        patterns.push(a.toString() + b.toString() + a.toString() + b.toString());
      }
    }
  }
  
  return patterns.slice(0, 10);
}

function findMirrorPatterns(numbers) {
  const patterns = [];
  
  // ABBA patterns
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      if (a !== b) {
        patterns.push(a.toString() + b.toString() + b.toString() + a.toString());
      }
    }
  }
  
  return patterns.slice(0, 8);
}

function findSumBasedPatterns(numbers) {
  const patterns = [];
  const commonSums = [10, 15, 20, 25, 30];
  
  commonSums.forEach(targetSum => {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        for (let c = 0; c <= 9; c++) {
          const d = targetSum - a - b - c;
          if (d >= 0 && d <= 9) {
            patterns.push(a.toString() + b.toString() + c.toString() + d.toString());
          }
        }
      }
    }
  });
  
  return patterns.slice(0, 15);
}

function generateDateBasedPatterns(draws) {
  const patterns = [];
  const today = new Date();
  
  // Current date patterns
  const year = today.getFullYear().toString().slice(-2);
  const month = today.getMonth().toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  patterns.push(month + day);
  patterns.push(day + month);
  patterns.push(year + month);
  patterns.push(year + day);
  
  return patterns;
}

// Advanced Analytics Display
function displayAdvancedAnalytics(method, data) {
  const analyticsDiv = document.getElementById('analytics');
  
  let html = '<div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">';
  html += '<h4>📊 Advanced Analytics - ' + method + '</h4>';
  
  if (data.confidence) {
    html += '<div><strong>Confidence Score:</strong> ' + data.confidence + '%</div>';
  }
  
  if (data.patterns) {
    html += '<div><strong>Patterns Detected:</strong> ' + data.patterns.join(', ') + '</div>';
  }
  
  if (data.trends) {
    html += '<div><strong>Trends:</strong> ' + data.trends + '</div>';
  }
  
  html += '</div>';
  analyticsDiv.innerHTML = html;
}