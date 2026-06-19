# MT5 Trading Platform Launcher

Write-Host "=== MT5 Trading Platform ===" -ForegroundColor Cyan

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "[INFO] Starting Backend..." -ForegroundColor Green

$backendCommand = @"
cd '$ProjectRoot\backend'

npm install
npm start > server.log 2>&1
"@

Start-Process powershell `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "[INFO] Starting Frontend..." -ForegroundColor Green

$frontendCommand = @"
cd '$ProjectRoot\frontend'

npm install
npm run dev
"@

Start-Process powershell `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontendCommand

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Frontend : http://localhost:3000" -ForegroundColor Green
Write-Host "Backend  : http://localhost:8000" -ForegroundColor Green
Write-Host "Swagger  : http://localhost:8000/docs" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
