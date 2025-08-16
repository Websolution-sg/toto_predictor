// Test actual script execution
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 TESTING ACTUAL SCRIPT EXECUTION');
console.log('==================================');

// Get current CSV state
const beforeCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
console.log(`📋 Current CSV first entry: ${beforeCSV}`);

console.log('\n🚀 Executing updateTotoCSV.cjs...');

const child = spawn('node', ['updateTotoCSV.cjs'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
  process.stdout.write(data); // Show real-time output
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log(`\n📊 Process exited with code: ${code}`);
  
  // Check if CSV was updated
  const afterCSV = fs.readFileSync('totoResult.csv', 'utf8').trim().split('\n')[0];
  console.log(`📋 CSV after execution: ${afterCSV}`);
  
  if (beforeCSV !== afterCSV) {
    console.log('✅ CSV WAS UPDATED - New result fetched!');
  } else {
    console.log('ℹ️  CSV unchanged - Either same result or fetch failed');
  }
  
  console.log('\n🎯 EXECUTION ANALYSIS:');
  console.log(`   Exit code: ${code === 0 ? '✅ SUCCESS' : '❌ ERROR'}`);
  console.log(`   Output length: ${stdout.length} chars`);
  console.log(`   Error length: ${stderr.length} chars`);
  
  if (stdout.includes('SUCCESS') || stdout.includes('found')) {
    console.log('✅ Script found and processed results');
  }
  
  if (stdout.includes('failed') || stderr.length > 0) {
    console.log('⚠️  Script encountered issues');
  }
  
  console.log('\n🎉 TEST COMPLETE!');
});

// Set timeout to prevent hanging
setTimeout(() => {
  if (!child.killed) {
    console.log('\n⏰ Timeout reached, terminating process...');
    child.kill();
  }
}, 30000); // 30 second timeout
