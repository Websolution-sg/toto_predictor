#!/usr/bin/env node
/**
 * 🔍 WORKFLOW VALIDATION SCRIPT
 * Simulates GitHub Actions workflow components locally
 */

import fs from 'fs';
import path from 'path';

const CSV_FILE = 'totoResult.csv';

console.log('🎯 WORKFLOW VALIDATION STARTED');
console.log('===============================');

// ✅ STEP 1: Environment Check
console.log('\n📋 STEP 1: Environment Validation');
console.log('Node.js version:', process.version);
console.log('Working directory:', process.cwd());
console.log('CSV file exists:', fs.existsSync(CSV_FILE));

// ✅ STEP 2: Dependencies Check
console.log('\n📋 STEP 2: Dependencies Validation');
try {
  const axios = await import('axios');
  console.log('✅ axios: Available');
} catch (err) {
  console.log('❌ axios: Missing -', err.message);
}

try {
  const cheerio = await import('cheerio');
  console.log('✅ cheerio: Available');
} catch (err) {
  console.log('❌ cheerio: Missing -', err.message);
}

// ✅ STEP 3: CSV Current State
console.log('\n📋 STEP 3: Current CSV State');
if (fs.existsSync(CSV_FILE)) {
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  console.log('📊 CSV rows:', lines.length);
  console.log('📄 Latest entry:', lines[lines.length - 1]);
  console.log('📄 Sample entries:');
  lines.slice(-3).forEach((line, i) => {
    console.log(`   ${i + 1}: ${line}`);
  });
} else {
  console.log('❌ CSV file not found');
}

// ✅ STEP 4: Update Script Test
console.log('\n📋 STEP 4: Update Script Validation');
console.log('🔍 Testing updateTotoCSV.mjs availability...');

if (fs.existsSync('updateTotoCSV.mjs')) {
  console.log('✅ updateTotoCSV.mjs: Found');
  
  // Test import
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    console.log('🚀 Running update script test...');
    const { stdout, stderr } = await execAsync('node updateTotoCSV.mjs');
    
    console.log('📤 Script output:');
    if (stdout) console.log(stdout);
    if (stderr) console.log('⚠️ Warnings:', stderr);
    
  } catch (err) {
    console.log('⚠️ Script execution:', err.message);
  }
} else {
  console.log('❌ updateTotoCSV.mjs: Not found');
}

// ✅ STEP 5: Git Status Simulation
console.log('\n📋 STEP 5: Git Status Simulation');
try {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const { stdout } = await execAsync('git status --porcelain');
  
  if (stdout.trim()) {
    console.log('📝 Changes detected:');
    console.log(stdout);
  } else {
    console.log('📋 No changes detected');
  }
} catch (err) {
  console.log('⚠️ Git check failed:', err.message);
}

// ✅ STEP 6: Schedule Validation
console.log('\n📋 STEP 6: Schedule Validation');
const now = new Date();
const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday
const hour = now.getHours();

console.log('📅 Current time:', now.toISOString());
console.log('📅 Day of week:', dayOfWeek === 1 ? 'Monday' : dayOfWeek === 4 ? 'Thursday' : 'Other');
console.log('🕐 Current hour UTC:', hour);

const isScheduledDay = dayOfWeek === 1 || dayOfWeek === 4;
const isScheduledTime = hour === 1;

console.log('⏰ Would trigger automatically:', isScheduledDay && isScheduledTime ? '✅ YES' : '❌ NO');
console.log('📋 Manual trigger: Always available');

// ✅ STEP 7: Website Status
console.log('\n📋 STEP 7: Website Integration Check');
if (fs.existsSync('index.html')) {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  const has4D = htmlContent.includes('4D') || htmlContent.includes('4d');
  const hasTOTO = htmlContent.includes('TOTO') || htmlContent.includes('toto');
  
  console.log('🌐 index.html: Found');
  console.log('🎯 TOTO integration:', hasTOTO ? '✅ Present' : '❌ Missing');
  console.log('🚫 4D references:', has4D ? '⚠️ Found (should be removed)' : '✅ Clean');
} else {
  console.log('❌ index.html: Not found');
}

console.log('\n🎉 WORKFLOW VALIDATION COMPLETED');
console.log('=================================');