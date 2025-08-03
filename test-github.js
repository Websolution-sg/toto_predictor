const fs = require('fs');
const path = require('path');

// Test script to validate GitHub Actions workflow
function validateWorkflow() {
  const workflowPath = path.join(__dirname, '.github', 'workflows', 'update-toto.yml');
  
  try {
    if (fs.existsSync(workflowPath)) {
      console.log('✅ GitHub Actions workflow file exists');
      
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for required components
      const checks = [
        { name: 'Cron schedule', pattern: /cron:.*\*.*\*.*\*/ },
        { name: 'Manual trigger', pattern: /workflow_dispatch/ },
        { name: 'Node.js setup', pattern: /uses:.*setup-node/ },
        { name: 'Install dependencies', pattern: /npm install/ },
        { name: 'Git configuration', pattern: /git config/ },
        { name: 'Auto commit', pattern: /git commit/ }
      ];
      
      checks.forEach(check => {
        if (check.pattern.test(workflowContent)) {
          console.log(`✅ ${check.name} - Found`);
        } else {
          console.log(`❌ ${check.name} - Missing`);
        }
      });
      
    } else {
      console.log('❌ GitHub Actions workflow file not found');
    }
  } catch (error) {
    console.log('❌ Error reading workflow file:', error.message);
  }
}

// Test package.json structure
function validatePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  
  try {
    if (fs.existsSync(packagePath)) {
      console.log('\n✅ package.json file exists');
      
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check required fields
      const requiredFields = ['name', 'version', 'description', 'scripts', 'repository'];
      
      requiredFields.forEach(field => {
        if (packageData[field]) {
          console.log(`✅ ${field} - Present`);
        } else {
          console.log(`❌ ${field} - Missing`);
        }
      });
      
      // Check scripts
      const requiredScripts = ['start', 'test'];
      requiredScripts.forEach(script => {
        if (packageData.scripts && packageData.scripts[script]) {
          console.log(`✅ Script '${script}' - Present`);
        } else {
          console.log(`❌ Script '${script}' - Missing`);
        }
      });
      
    } else {
      console.log('❌ package.json file not found');
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
}

// Test CSV data integrity
function validateCsvData() {
  const csvPath = path.join(__dirname, 'totoResult.csv');
  
  try {
    if (fs.existsSync(csvPath)) {
      console.log('\n✅ totoResult.csv file exists');
      
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.trim().split('\n');
      
      console.log(`✅ CSV contains ${lines.length} historical results`);
      
      // Validate first few lines
      const sampleLines = lines.slice(0, 3);
      let validLines = 0;
      
      sampleLines.forEach((line, index) => {
        const numbers = line.split(',').map(n => parseInt(n.trim()));
        if (numbers.length === 7 && numbers.every(n => n >= 1 && n <= 49)) {
          validLines++;
        }
      });
      
      if (validLines === sampleLines.length) {
        console.log('✅ CSV data format is valid');
      } else {
        console.log(`❌ CSV data format issues found (${validLines}/${sampleLines.length} valid)`);
      }
      
    } else {
      console.log('❌ totoResult.csv file not found');
    }
  } catch (error) {
    console.log('❌ Error reading CSV file:', error.message);
  }
}

// Test HTML file structure
function validateHtmlStructure() {
  const htmlPath = path.join(__dirname, 'index.html');
  
  try {
    if (fs.existsSync(htmlPath)) {
      console.log('\n✅ index.html file exists');
      
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Check for essential components
      const htmlChecks = [
        { name: 'Chart.js CDN', pattern: /chart\.js/ },
        { name: 'CSV fetch', pattern: /fetch.*totoResult\.csv/ },
        { name: 'Predict function', pattern: /function predict\(\)/ },
        { name: 'Manual entry function', pattern: /function manuallyUpdateResults/ },
        { name: 'Fetch latest function', pattern: /function fetchLatestTotoResults/ }
      ];
      
      htmlChecks.forEach(check => {
        if (check.pattern.test(htmlContent)) {
          console.log(`✅ ${check.name} - Found`);
        } else {
          console.log(`❌ ${check.name} - Missing`);
        }
      });
      
      // Check file size
      const fileSizeKB = Math.round(fs.statSync(htmlPath).size / 1024);
      console.log(`📊 HTML file size: ${fileSizeKB} KB`);
      
    } else {
      console.log('❌ index.html file not found');
    }
  } catch (error) {
    console.log('❌ Error reading HTML file:', error.message);
  }
}

// Run all tests
console.log('🧪 GitHub Repository Testing\n');
console.log('==========================================');

validateWorkflow();
validatePackageJson();
validateCsvData();
validateHtmlStructure();

console.log('\n==========================================');
console.log('🏁 Testing Complete!');
console.log('\n💡 Next steps:');
console.log('1. Check GitHub Actions tab for workflow status');
console.log('2. Test the live GitHub Pages site');
console.log('3. Manually trigger the workflow if needed');
console.log('4. Monitor for any runtime errors in browser console');
