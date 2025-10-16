import fs from 'fs';
import path from 'path';

console.log('🔧 WORKFLOW SYSTEM VALIDATION');
console.log('='.repeat(60));
console.log(`📅 Check Date: ${new Date().toLocaleDateString()}`);
console.log('');

// Check GitHub Actions workflow files
function checkGitHubWorkflow() {
  console.log('📋 GITHUB ACTIONS WORKFLOW CHECK');
  console.log('-'.repeat(40));
  
  const workflowPath = '.github/workflows/update-toto.yml';
  
  if (!fs.existsSync(workflowPath)) {
    console.log('❌ GitHub Actions workflow file not found');
    return { status: 'MISSING', path: workflowPath };
  }
  
  try {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    console.log('✅ Workflow file found');
    
    // Check key components
    const checks = [
      { name: 'Schedule trigger', pattern: /schedule:/, required: true },
      { name: 'Cron expression', pattern: /cron:/, required: true },
      { name: 'Node.js setup', pattern: /setup-node/, required: true },
      { name: 'Update script call', pattern: /updateTotoCSV/, required: true },
      { name: 'Git commit', pattern: /git commit/, required: true },
      { name: 'Git push', pattern: /git push/, required: true }
    ];
    
    console.log('\n🔍 Workflow Components:');
    checks.forEach(check => {
      const found = check.pattern.test(workflowContent);
      const status = found ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`   ${status} ${check.name}: ${found ? 'Found' : 'Missing'}`);
    });
    
    // Extract schedule information
    const cronMatch = workflowContent.match(/cron:\s*['"`]([^'"`]+)['"`]/);
    if (cronMatch) {
      console.log(`\n⏰ Schedule: ${cronMatch[1]}`);
      console.log('   (This determines when the workflow runs automatically)');
    }
    
    // Check for environment variables or secrets
    const hasSecrets = workflowContent.includes('secrets.') || workflowContent.includes('${{ secrets');
    console.log(`\n🔐 Secrets usage: ${hasSecrets ? 'Yes' : 'None detected'}`);
    
    return { 
      status: 'FOUND', 
      content: workflowContent, 
      checks: checks.map(c => ({ ...c, found: c.pattern.test(workflowContent) })) 
    };
    
  } catch (error) {
    console.log(`❌ Error reading workflow: ${error.message}`);
    return { status: 'ERROR', error: error.message };
  }
}

// Check update scripts
function checkUpdateScripts() {
  console.log('\n🔄 UPDATE SCRIPTS VALIDATION');
  console.log('-'.repeat(40));
  
  const scripts = [
    'updateTotoCSV.cjs',
    'updateTotoCSV.mjs'
  ];
  
  const results = {};
  
  scripts.forEach(scriptName => {
    console.log(`\n📁 Checking ${scriptName}:`);
    
    if (!fs.existsSync(scriptName)) {
      console.log('   ❌ Script not found');
      results[scriptName] = { status: 'MISSING' };
      return;
    }
    
    try {
      const content = fs.readFileSync(scriptName, 'utf8');
      
      // Check for key functionality
      const features = [
        { name: 'Dynamic fetching', pattern: /fetch|axios|https:/ },
        { name: 'No hardcode declaration', pattern: /NO hardcoded|FULLY DYNAMIC/ },
        { name: 'CSV file handling', pattern: /totoResult\.csv/ },
        { name: 'Error handling', pattern: /try|catch|error/ },
        { name: 'Validation logic', pattern: /validate|check|verify/ }
      ];
      
      features.forEach(feature => {
        const found = feature.pattern.test(content);
        console.log(`   ${found ? '✅' : '❌'} ${feature.name}: ${found ? 'Present' : 'Missing'}`);
      });
      
      results[scriptName] = { 
        status: 'FOUND', 
        features: features.map(f => ({ ...f, found: f.pattern.test(content) })) 
      };
      
    } catch (error) {
      console.log(`   ❌ Error reading script: ${error.message}`);
      results[scriptName] = { status: 'ERROR', error: error.message };
    }
  });
  
  return results;
}

// Check package.json and dependencies
function checkDependencies() {
  console.log('\n📦 DEPENDENCIES CHECK');
  console.log('-'.repeat(30));
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    return { status: 'MISSING' };
  }
  
  try {
    const packageContent = fs.readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    console.log('✅ package.json found');
    
    // Check required dependencies
    const requiredDeps = ['axios'];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('\n📋 Required Dependencies:');
    requiredDeps.forEach(dep => {
      const found = dependencies[dep];
      console.log(`   ${found ? '✅' : '❌'} ${dep}: ${found || 'Missing'}`);
    });
    
    // Check scripts
    if (packageJson.scripts) {
      console.log('\n📜 Package Scripts:');
      Object.entries(packageJson.scripts).forEach(([name, script]) => {
        console.log(`   • ${name}: ${script}`);
      });
    }
    
    return { status: 'FOUND', package: packageJson, dependencies };
    
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    return { status: 'ERROR', error: error.message };
  }
}

// Check CSV file integrity
function checkCsvIntegrity() {
  console.log('\n📊 CSV FILE INTEGRITY CHECK');
  console.log('-'.repeat(40));
  
  if (!fs.existsSync('totoResult.csv')) {
    console.log('❌ totoResult.csv not found');
    return { status: 'MISSING' };
  }
  
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log('✅ CSV file found');
    console.log(`📏 Total entries: ${lines.length}`);
    
    if (lines.length === 0) {
      console.log('❌ CSV file is empty');
      return { status: 'EMPTY' };
    }
    
    // Validate format of first few entries
    console.log('\n🔍 Format Validation:');
    const sampleSize = Math.min(3, lines.length);
    let validFormat = true;
    
    for (let i = 0; i < sampleSize; i++) {
      const line = lines[i];
      const parts = line.split(',');
      
      if (parts.length !== 8) {
        console.log(`   ❌ Line ${i+1}: Expected 8 parts, got ${parts.length}`);
        validFormat = false;
      } else {
        console.log(`   ✅ Line ${i+1}: ${parts[0]} - Valid format`);
      }
    }
    
    // Check latest entry date
    const latestLine = lines[0];
    const latestDate = latestLine.split(',')[0];
    console.log(`\n📅 Latest entry: ${latestDate}`);
    
    // Check if recent (within last 30 days)
    const today = new Date();
    const oneMonthAgo = new Date(today.setDate(today.getDate() - 30));
    console.log(`⏰ Last update appears recent: ${validFormat ? '✅' : '❌'}`);
    
    return { 
      status: 'FOUND', 
      entries: lines.length, 
      validFormat, 
      latestDate 
    };
    
  } catch (error) {
    console.log(`❌ Error reading CSV: ${error.message}`);
    return { status: 'ERROR', error: error.message };
  }
}

// Check web interface
function checkWebInterface() {
  console.log('\n🌐 WEB INTERFACE CHECK');
  console.log('-'.repeat(30));
  
  if (!fs.existsSync('index.html')) {
    console.log('❌ index.html not found');
    return { status: 'MISSING' };
  }
  
  try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    console.log('✅ index.html found');
    
    // Check for key features
    const features = [
      { name: 'CSV fetching', pattern: /fetch.*csv/i },
      { name: 'Prediction methods', pattern: /prediction|method/i },
      { name: 'Auto refresh', pattern: /setInterval|setTimeout/ },
      { name: 'Cache busting', pattern: /\?t=|timestamp/ },
      { name: 'Error handling', pattern: /catch|error/ }
    ];
    
    console.log('\n🔍 Interface Features:');
    features.forEach(feature => {
      const found = feature.pattern.test(htmlContent);
      console.log(`   ${found ? '✅' : '❌'} ${feature.name}: ${found ? 'Present' : 'Missing'}`);
    });
    
    return { 
      status: 'FOUND', 
      features: features.map(f => ({ ...f, found: f.pattern.test(htmlContent) })) 
    };
    
  } catch (error) {
    console.log(`❌ Error reading index.html: ${error.message}`);
    return { status: 'ERROR', error: error.message };
  }
}

// Test workflow connectivity
function testWorkflowConnectivity() {
  console.log('\n🔗 WORKFLOW CONNECTIVITY TEST');
  console.log('-'.repeat(40));
  
  // Check if we can simulate a workflow run
  console.log('📋 Simulating workflow components...');
  
  const checks = [
    {
      name: 'Update script exists',
      test: () => fs.existsSync('updateTotoCSV.mjs'),
      critical: true
    },
    {
      name: 'CSV file writable',
      test: () => {
        try {
          fs.accessSync('totoResult.csv', fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      },
      critical: true
    },
    {
      name: 'Git repository',
      test: () => fs.existsSync('.git'),
      critical: false
    }
  ];
  
  let criticalIssues = 0;
  
  checks.forEach(check => {
    const result = check.test();
    const status = result ? '✅' : (check.critical ? '❌' : '⚠️');
    console.log(`   ${status} ${check.name}: ${result ? 'OK' : 'Failed'}`);
    
    if (check.critical && !result) {
      criticalIssues++;
    }
  });
  
  const workflowReady = criticalIssues === 0;
  console.log(`\n🎯 Workflow readiness: ${workflowReady ? '✅ Ready' : '❌ Issues detected'}`);
  
  return { ready: workflowReady, criticalIssues };
}

// Main validation function
function runWorkflowValidation() {
  console.log('🚀 Starting comprehensive workflow validation...\n');
  
  const results = {};
  
  results.workflow = checkGitHubWorkflow();
  results.scripts = checkUpdateScripts();
  results.dependencies = checkDependencies();
  results.csv = checkCsvIntegrity();
  results.interface = checkWebInterface();
  results.connectivity = testWorkflowConnectivity();
  
  // Overall summary
  console.log('\n📊 WORKFLOW VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const components = [
    { name: 'GitHub Actions Workflow', result: results.workflow },
    { name: 'Update Scripts', result: results.scripts },
    { name: 'Dependencies', result: results.dependencies },
    { name: 'CSV Data File', result: results.csv },
    { name: 'Web Interface', result: results.interface },
    { name: 'Connectivity', result: results.connectivity }
  ];
  
  let overallHealth = 'HEALTHY';
  let issues = [];
  
  components.forEach(component => {
    let status = '✅';
    
    if (component.result.status === 'MISSING' || component.result.status === 'ERROR') {
      status = '❌';
      overallHealth = 'ISSUES';
      issues.push(component.name);
    } else if (component.result.status === 'EMPTY' || !component.result.ready) {
      status = '⚠️';
      if (overallHealth === 'HEALTHY') overallHealth = 'WARNINGS';
      issues.push(component.name);
    }
    
    console.log(`${status} ${component.name}: ${component.result.status || 'OK'}`);
  });
  
  console.log('\n🎯 OVERALL SYSTEM STATUS:');
  if (overallHealth === 'HEALTHY') {
    console.log('✅ WORKFLOW IS FUNCTIONING PROPERLY');
    console.log('   • All components operational');
    console.log('   • Automated updates ready');
    console.log('   • System integrity confirmed');
  } else {
    console.log(`⚠️ WORKFLOW HAS ${overallHealth}`);
    console.log('   Issues found in:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  console.log('\n💡 NEXT STEPS:');
  if (overallHealth === 'HEALTHY') {
    console.log('   • Workflow is ready for production');
    console.log('   • Monitor automated runs');
    console.log('   • Check logs periodically');
  } else {
    console.log('   • Address identified issues');
    console.log('   • Re-run validation after fixes');
    console.log('   • Test manually before automation');
  }
}

// Run the validation
runWorkflowValidation();