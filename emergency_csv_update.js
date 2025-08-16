/**
 * EMERGENCY CSV UPDATE SCRIPT
 * This script will force update the CSV and push immediately
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚨 EMERGENCY CSV UPDATE SCRIPT');
console.log('==============================\n');

function executeCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`💻 Command: ${command}`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Success');
    if (result.trim()) {
      console.log(`📄 Output: ${result.trim()}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.stdout) console.log(`📤 Stdout: ${error.stdout}`);
    if (error.stderr) console.log(`📥 Stderr: ${error.stderr}`);
    return false;
  }
}

function emergencyUpdate() {
  console.log('🎯 STRATEGY: Emergency CSV push with immediate deployment');
  console.log('=========================================================\n');
  
  // Step 1: Verify local CSV content
  console.log('📋 Step 1: Verifying local CSV content...');
  try {
    const csvContent = fs.readFileSync('totoResult.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    console.log(`📊 Local CSV has ${lines.length} lines`);
    console.log(`🎯 First line: ${lines[0]}`);
    
    if (lines[0] !== '22,25,29,31,34,43,11') {
      console.log('❌ Local CSV does not have expected content!');
      return false;
    }
    console.log('✅ Local CSV verified correct');
  } catch (error) {
    console.log(`❌ Cannot read local CSV: ${error.message}`);
    return false;
  }
  
  // Step 2: Force add CSV file
  console.log('\n📋 Step 2: Force adding CSV to git...');
  if (!executeCommand('git add totoResult.csv --force', 'Force adding CSV file')) {
    return false;
  }
  
  // Step 3: Check git status
  console.log('\n📋 Step 3: Checking git status...');
  executeCommand('git status --porcelain', 'Checking what will be committed');
  
  // Step 4: Create emergency commit
  console.log('\n📋 Step 4: Creating emergency commit...');
  const timestamp = new Date().toISOString();
  const commitMessage = `🚨 EMERGENCY: Force update CSV with latest TOTO result 22,25,29,31,34,43,11 - ${timestamp}`;
  if (!executeCommand(`git commit -m "${commitMessage}" --allow-empty`, 'Emergency commit')) {
    return false;
  }
  
  // Step 5: Push with force if needed
  console.log('\n📋 Step 5: Force pushing to remote...');
  if (!executeCommand('git push origin main --force-with-lease', 'Force push to remote')) {
    console.log('⚠️ Force push failed, trying regular push...');
    if (!executeCommand('git push origin main', 'Regular push to remote')) {
      return false;
    }
  }
  
  // Step 6: Verify push
  console.log('\n📋 Step 6: Verifying push...');
  executeCommand('git log --oneline -1', 'Latest commit on remote');
  
  console.log('\n🎉 EMERGENCY UPDATE COMPLETE!');
  console.log('=============================');
  console.log('✅ CSV forcefully updated and pushed');
  console.log('🔄 GitHub Actions should trigger immediately');
  console.log('⏱️ Allow 5-10 minutes for deployment');
  console.log('');
  console.log('🔗 Monitor at: https://github.com/Websolution-sg/toto_predictor/actions');
  console.log('🌐 Test at: https://websolution-sg.github.io/toto_predictor/');
  
  return true;
}

// Execute emergency update
if (emergencyUpdate()) {
  console.log('\n✅ EMERGENCY UPDATE SUCCESSFUL');
  console.log('If this still doesn\'t work, there may be a GitHub Pages service issue.');
} else {
  console.log('\n❌ EMERGENCY UPDATE FAILED');
  console.log('Manual intervention required.');
}
