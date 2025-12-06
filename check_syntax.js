const fs = require('fs');

try {
  // Read the HTML file to check for syntax errors
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  // Extract just the JavaScript content between script tags
  const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
  
  if (!scriptMatch) {
    console.log('No script tags found');
    process.exit(1);
  }
  
  // Get the main script content
  const scriptContent = scriptMatch[scriptMatch.length - 1]; // Get the last script tag
  const jsCode = scriptContent.replace(/<\/?script[^>]*>/g, '');
  
  // Check for runHotColdPrediction function
  const functionMatch = jsCode.match(/function\s+runHotColdPrediction\s*\(/);
  if (functionMatch) {
    console.log('✓ runHotColdPrediction function found');
  } else {
    console.log('✗ runHotColdPrediction function NOT found');
  }
  
  // Check for basic syntax by trying to parse as much as possible
  console.log('Checking for potential syntax issues...');
  
  // Look for common JavaScript syntax errors
  const lines = jsCode.split('\n');
  let braceCount = 0;
  let inFunction = false;
  let lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    
    // Count braces
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    // Check if we're in runHotColdPrediction
    if (line.includes('function runHotColdPrediction')) {
      inFunction = true;
      console.log(`Found runHotColdPrediction at line ${lineNum}`);
    }
    
    if (inFunction && line.includes('displayPredictedNumbers')) {
      console.log(`Found displayPredictedNumbers call at line ${lineNum}`);
      console.log(`Line content: ${line.trim()}`);
    }
  }
  
  console.log(`Final brace balance: ${braceCount} (should be 0 or close to 0)`);
  
} catch (error) {
  console.error('Error reading HTML file:', error);
}