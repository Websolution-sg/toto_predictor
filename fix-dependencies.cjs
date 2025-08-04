#!/usr/bin/env node

/**
 * 🔧 Dependency Installation Fixer
 * Resolves common npm installation issues in GitHub Actions
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 DEPENDENCY INSTALLATION FIXER');
console.log('=================================');

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 60000 // 60 second timeout
    });
    console.log(`✅ ${description} successful`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function fixDependencies() {
  console.log('📊 Environment Check:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Working Dir: ${process.cwd()}`);
  
  // Check if package files exist
  console.log('\n📁 Package Files:');
  const packageExists = fs.existsSync('package.json');
  const lockExists = fs.existsSync('package-lock.json');
  console.log(`   package.json: ${packageExists ? '✅' : '❌'}`);
  console.log(`   package-lock.json: ${lockExists ? '✅' : '❌'}`);
  
  if (!packageExists) {
    console.log('💥 FATAL: package.json missing!');
    process.exit(1);
  }
  
  // Clear npm cache
  console.log('\n🧹 Clearing npm cache...');
  runCommand('npm cache clean --force', 'Cache cleaning');
  
  // Try installation strategies in order
  const strategies = [
    {
      name: 'npm ci (fast install)',
      condition: lockExists,
      command: 'npm ci --no-optional --no-audit',
      cleanup: null
    },
    {
      name: 'npm install with lock removal',
      condition: lockExists,
      command: 'npm install --no-optional --no-audit',
      cleanup: () => {
        if (fs.existsSync('package-lock.json')) {
          fs.unlinkSync('package-lock.json');
          console.log('🗑️ Removed corrupted package-lock.json');
        }
      }
    },
    {
      name: 'Fresh npm install',
      condition: true,
      command: 'npm install --no-optional --no-audit',
      cleanup: null
    },
    {
      name: 'Manual install of critical dependencies',
      condition: true,
      command: 'npm install node-fetch@2.7.0 cheerio@1.0.0-rc.12 --no-optional --no-audit',
      cleanup: null
    }
  ];
  
  console.log('\n📦 Trying installation strategies...');
  
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    
    if (!strategy.condition) {
      console.log(`⏭️ Skipping ${strategy.name} (condition not met)`);
      continue;
    }
    
    console.log(`\n🎯 Strategy ${i + 1}: ${strategy.name}`);
    
    // Run cleanup if specified
    if (strategy.cleanup) {
      strategy.cleanup();
    }
    
    const result = runCommand(strategy.command, strategy.name);
    
    if (result.success) {
      console.log('✅ Installation successful! Verifying...');
      
      // Test if critical modules can be loaded
      const testResult = runCommand(
        'node -e "require(\'node-fetch\'); require(\'cheerio\'); console.log(\'✅ All modules loaded successfully\')"',
        'Module verification'
      );
      
      if (testResult.success) {
        console.log('🎉 Dependencies successfully installed and verified!');
        return true;
      } else {
        console.log('⚠️ Installation succeeded but modules failed to load');
      }
    }
  }
  
  console.log('\n💥 All installation strategies failed!');
  console.log('🔍 This might indicate:');
  console.log('   • Network connectivity issues');
  console.log('   • Node.js version incompatibility');
  console.log('   • npm registry problems');
  console.log('   • Package corruption');
  
  return false;
}

// Run the fix
fixDependencies().then(success => {
  if (success) {
    console.log('\n✅ DEPENDENCY INSTALLATION COMPLETED SUCCESSFULLY');
    process.exit(0);
  } else {
    console.log('\n❌ DEPENDENCY INSTALLATION FAILED');
    console.log('💡 Manual intervention may be required');
    process.exit(1);
  }
}).catch(error => {
  console.log('\n💥 SCRIPT ERROR:', error.message);
  process.exit(1);
});
