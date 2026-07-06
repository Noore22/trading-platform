Write-Host "Cleaning up orphaned processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue

$BackendDir = Join-Path $PSScriptRoot "backend"
$FrontendDir = Join-Path $PSScriptRoot "frontend"
$LogDir = Join-Path $PSScriptRoot "logs"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$backendLog = Join-Path $LogDir "backend.log"
$frontendLog = Join-Path $LogDir "frontend.log"

Write-Host "Starting backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    param($dir, $log)
    Set-Location $dir
    python main.py *>&1 | Out-File $log -Encoding utf8
} -ArgumentList $BackendDir, $backendLog

Write-Host "Starting frontend..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    param($dir, $log)
    Set-Location $dir
    $env:NEXT_TELEMETRY_DISABLED="1"
    $env:CI="true"
    npm.cmd run dev -- -p 3001 *>&1 | Out-File $log -Encoding utf8
} -ArgumentList $FrontendDir, $frontendLog

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Backend:  http://127.0.0.1:8007" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor Green
Write-Host "  Login:    admin / admin123" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "  Backend:  $backendLog"
Write-Host "  Frontend: $frontendLog"
Write-Host ""
Write-Host "Press Ctrl+C to stop both." -ForegroundColor Red

try {
    while ($true) {
        Start-Sleep -Seconds 2
        $b = Receive-Job $backendJob -ErrorAction SilentlyContinue
        $f = Receive-Job $frontendJob -ErrorAction SilentlyContinue
        if ($b) { Write-Host "[backend] $b" -ForegroundColor Gray }
        if ($f) { Write-Host "[frontend] $f" -ForegroundColor Gray }
        if ($backendJob.State -eq 'Failed') { throw "Backend crashed" }
        if ($frontendJob.State -eq 'Failed') { throw "Frontend crashed" }
    }
} finally {
    Write-Host "`nStopping..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Yellow
}
