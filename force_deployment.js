/**
 * GitHub Actions Workflow Trigger Script
 * This script will force a manual deployment by making a small change
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 GITHUB ACTIONS DEPLOYMENT TRIGGER');
console.log('=====================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`💻 Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log('✅ Success:', output.trim());
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

function triggerDeployment() {
  console.log('🎯 Strategy: Force GitHub Pages rebuild by triggering workflow');
  console.log('================================================================\n');
  
  // Step 1: Create a deployment trigger timestamp
  const timestamp = new Date().toISOString();
  const triggerContent = `# GitHub Pages Deployment Trigger

**Trigger Time:** ${timestamp}
**Purpose:** Force GitHub Pages to rebuild and deploy latest CSV changes
**Expected Result:** 22,25,29,31,34,43,11

## Status
- Latest local commit has correct CSV data
- Remote GitHub Pages serving outdated CSV
- Manual deployment trigger activated

## What This Does
1. Creates a small file change
2. Commits and pushes to trigger GitHub Actions
3. Forces GitHub Pages static site generator to rebuild
4. Updates the live website with latest CSV data

**Trigger ID:** ${Date.now()}
`;

  console.log('📝 Step 1: Creating deployment trigger file...');
  fs.writeFileSync('FORCE_DEPLOYMENT_TRIGGER.md', triggerContent);
  console.log('✅ Trigger file created');
  
  // Step 2: Add and commit
  console.log('\n📋 Step 2: Adding changes to git...');
  if (!runCommand('git add FORCE_DEPLOYMENT_TRIGGER.md', 'Adding trigger file')) {
    return false;
  }
  
  console.log('\n📋 Step 3: Committing changes...');
  const commitMessage = `🚀 Force GitHub Pages deployment - Fix CSV lag issue (${timestamp})`;
  if (!runCommand(`git commit -m "${commitMessage}"`, 'Committing trigger')) {
    return false;
  }
  
  // Step 3: Push to trigger GitHub Actions
  console.log('\n📋 Step 4: Pushing to trigger GitHub Actions...');
  if (!runCommand('git push origin main', 'Pushing to trigger deployment')) {
    return false;
  }
  
  console.log('\n🎉 DEPLOYMENT TRIGGER COMPLETE!');
  console.log('===============================');
  console.log('✅ Changes pushed successfully');
  console.log('🔄 GitHub Actions should start within 1-2 minutes');
  console.log('⏱️ Full deployment expected in 5-10 minutes');
  console.log('🌐 Website should show: 22,25,29,31,34,43,11');
  console.log('');
  console.log('🔗 Monitor progress at:');
  console.log('   https://github.com/Websolution-sg/toto_predictor/actions');
  console.log('');
  console.log('📊 Test website in 10 minutes:');
  console.log('   https://websolution-sg.github.io/toto_predictor/');
  
  return true;
}

// Execute the deployment trigger
console.log('🚀 Initiating forced deployment...\n');
const success = triggerDeployment();

if (success) {
  console.log('\n✅ ALL STEPS COMPLETED SUCCESSFULLY');
  console.log('The deployment lag should now be resolved!');
} else {
  console.log('\n❌ SOME STEPS FAILED');
  console.log('Please check the errors above and try again.');
}
