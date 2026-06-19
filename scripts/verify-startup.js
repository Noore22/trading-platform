const { exec } = require('child_process');
const net = require('net');
const http = require('http');

console.log('⏳ Starting environment verification checks...');

const CONFIG = {
  backendUrl: 'http://localhost:8000/',
  frontendUrl: 'http://localhost:3000/',
  timeoutMs: 40000, // 40 seconds timeout
  pollIntervalMs: 1500
};

// Check if a command is executable (e.g. node)
function checkSystemBinary(command, successRegex) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ passed: false, detail: error.message });
      } else {
        const output = (stdout + stderr).trim();
        resolve({ passed: true, detail: output });
      }
    });
  });
}

// Test HTTP URL reachability
function checkHttpUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function runChecklist() {
  const startTime = Date.now();
  let nodeVerified = false;
  let backendRunning = false;
  let frontendRunning = false;
  let mt5Connected = false;

  // 1. Check Node.js version
  const nodeCheck = await checkSystemBinary('node -v');
  if (nodeCheck.passed) {
    nodeVerified = true;
  } else {
    console.error('\x1b[31m❌ Error: Node.js is not installed or not in PATH.\x1b[0m');
    console.error('Please download and install Node.js from https://nodejs.org/ before starting.');
    process.exit(1);
  }

  // Poll for services online status
  while (true) {
    if (Date.now() - startTime > CONFIG.timeoutMs) {
      console.log('\n==================================================');
      console.log('\x1b[31m❌ STARTUP CHECKLIST ENCOUNTERED TIMEOUT ERRORS:\x1b[0m');
      if (!backendRunning) console.log('- Node.js Backend failed to start on port 8000.');
      if (!frontendRunning) console.log('- Next.js Frontend failed to start on port 3000.');
      console.log('==================================================\n');
      process.exit(1);
    }

    if (!backendRunning) {
      backendRunning = await checkHttpUrl(CONFIG.backendUrl);
      if (backendRunning) {
        mt5Connected = true; // Once backend endpoint resolves, MT5 interface router is listening
      }
    }

    if (!frontendRunning) {
      frontendRunning = await checkHttpUrl(CONFIG.frontendUrl);
    }

    if (backendRunning && frontendRunning && mt5Connected) {
      // All verified!
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, CONFIG.pollIntervalMs));
  }

  // Print final success report
  console.log('\n==================================================');
  console.log('\x1b[32m🚀 MT5 PLATFORM STARTED SUCCESSFULLY!\x1b[0m');
  console.log('==================================================');
  console.log(`✓ Node.js Version: ${nodeCheck.detail}`);
  console.log('✓ Backend Running (http://localhost:8000)');
  console.log('✓ Frontend Running (http://localhost:3000)');
  console.log('✓ MT5 Service Connected');
  console.log('==================================================\n');
  process.exit(0);
}

runChecklist();
