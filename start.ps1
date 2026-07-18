<#
.SYNOPSIS
    AntiGravity AI Trading Platform - Startup Script
.DESCRIPTION
    Automatically activates venv, installs dependencies, runs migrations,
    starts backend, frontend, WebSocket, and MT5 connection.
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RootDir = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$LogDir = Join-Path $RootDir "logs"
$VenvDir = Join-Path $RootDir ".venv"
$DataDir = Join-Path $BackendDir "data"

# Colors
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Test-Command {
    param($Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# Cleanup orphaned processes
Write-Log "Cleaning up orphaned processes..." $Colors.Warning
Get-Process -Name "python*", "node*", "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Create directories
foreach ($dir in @($LogDir, $DataDir, (Join-Path $DataDir "tradingagents"))) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

# === PHASE 1: Check Python ===
Write-Log "=== Phase 1: Checking Python environment ===" $Colors.Header
$pythonExe = "python"
if (-not (Test-Command python)) {
    Write-Log "Python not found! Please install Python 3.10+" $Colors.Error
    exit 1
}

# Check virtual environment
$venvPython = Join-Path $VenvDir "Scripts\python.exe"
$venvPip = Join-Path $VenvDir "Scripts\pip.exe"
if (-not (Test-Path $venvPython)) {
    Write-Log "Virtual environment not found. Creating with python -m venv..." $Colors.Warning
    & $pythonExe -m venv $VenvDir
    if (-not (Test-Path $venvPython)) {
        Write-Log "Failed to create virtual environment" $Colors.Error
        exit 1
    }
    Write-Log "Virtual environment created" $Colors.Success
}

# === PHASE 2: Install Dependencies ===
Write-Log "=== Phase 2: Installing Python dependencies ===" $Colors.Header
$requirementsFile = Join-Path $BackendDir "requirements.txt"
if (Test-Path $requirementsFile) {
    Write-Log "Installing Python packages (this may take a few minutes)..." $Colors.Info
    & $venvPip install -r $requirementsFile *>&1 | Out-File (Join-Path $LogDir "pip_install.log")
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Some packages failed to install. Check logs/pip_install.log" $Colors.Warning
        Write-Log "Attempting to install core packages individually..." $Colors.Info
        & $venvPip install fastapi uvicorn sqlalchemy pydantic-settings python-dotenv MetaTrader5 pandas numpy python-multipart passlib[bcrypt] python-jose[cryptography] websockets pytz langchain-core langchain-openai langgraph openai yfinance httpx
    }
    Write-Log "Python packages installed" $Colors.Success
} else {
    Write-Log "requirements.txt not found at $requirementsFile" $Colors.Error
}

# === PHASE 3: Check .env ===
Write-Log "=== Phase 3: Checking configuration ===" $Colors.Header
$envFile = Join-Path $BackendDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Log ".env file not found! Creating from template..." $Colors.Warning
    $envContent = @(
        "# --- Application ---"
        "APP_NAME=`"AntiGravity AI Trading Platform V4`""
        "DEBUG=true"
        "ENVIRONMENT=development"
        "SECRET_KEY=d3b07384d113edec49eaa6238ad5ff00b798782fba79f225eb5cb181289196b0"
        "HOST=0.0.0.0"
        "PORT=8007"
        "ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
        ""
        "# --- Database ---"
        "DATABASE_URL=sqlite:///./data/trades.db"
        ""
        "# --- JWT ---"
        "JWT_SECRET=trading_platform_super_secret_key_2026"
        "JWT_ALGORITHM=HS256"
        "ACCESS_TOKEN_EXPIRE_MINUTES=1440"
        ""
        "# --- Admin ---"
        "ADMIN_USERNAME=admin"
        "ADMIN_PASSWORD=admin123"
        "ADMIN_EMAIL=admin@tradingplatform.local"
        ""
        "# --- IC Markets MT5 (fill in your credentials) ---"
        "MT5_LOGIN=0"
        "MT5_PASSWORD="
        "MT5_SERVER="
        "MT5_PATH="
        ""
        "# --- LLM / AI Provider Keys ---"
        "OPENAI_API_KEY="
        ""
        "# --- WebSocket ---"
        "WS_HEARTBEAT_INTERVAL=30"
        ""
        "# --- Logging ---"
        "LOG_LEVEL=INFO"
        "LOG_FILE=logs/trading.log"
    )
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-Log "Created .env file. Please edit it with your MT5 credentials and API keys before restarting." $Colors.Warning
    Write-Log "Continuing with default config..." $Colors.Info
}

# === PHASE 4: Start Backend ===
Write-Log "=== Phase 4: Starting Backend Server ===" $Colors.Header
$backendLog = Join-Path $LogDir "backend.log"
Set-Location $BackendDir
$backendJob = Start-Job -ScriptBlock {
    param($dir, $python, $logfile)
    Set-Location $dir
    $env:PYTHONUNBUFFERED = "1"
    & $python main.py *>&1 | Out-File $logfile -Encoding utf8
} -ArgumentList $BackendDir, $venvPython, $backendLog
Set-Location $RootDir

# Wait for backend to start
Write-Log "Waiting for backend to start..." $Colors.Info
$backendStarted = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:8007/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.status -eq "online") {
            $backendStarted = $true
            Write-Log "Backend ONLINE (http://127.0.0.1:8007)" $Colors.Success
            break
        }
    } catch {}
    if ($i % 10 -eq 0 -and $i -gt 0) {
        Write-Log "  Still waiting... ($i seconds)" $Colors.Info
        # Check if backend crashed
        if ($backendJob.State -eq "Failed") {
            $err = Receive-Job $backendJob
            Write-Log "Backend failed to start: $err" $Colors.Error
            break
        }
    }
}

if (-not $backendStarted) {
    Write-Log "Backend may not be fully started yet. Continuing..." $Colors.Warning
}

# === PHASE 5: Start Frontend ===
Write-Log "=== Phase 5: Starting Frontend ===" $Colors.Header
$frontendLog = Join-Path $LogDir "frontend.log"

# Check if node_modules exists
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Log "Installing frontend dependencies (npm install)..." $Colors.Info
    Set-Location $FrontendDir
    npm install *>&1 | Out-File (Join-Path $LogDir "npm_install.log")
    Set-Location $RootDir
    Write-Log "Frontend dependencies installed" $Colors.Success
}

$frontendJob = Start-Job -ScriptBlock {
    param($dir, $logfile)
    Set-Location $dir
    $env:NEXT_TELEMETRY_DISABLED = "1"
    npm.cmd run dev -- -p 3001 *>&1 | Out-File $logfile -Encoding utf8
} -ArgumentList $FrontendDir, $frontendLog

Start-Sleep -Seconds 3

# === PHASE 6: Verify Frontend ===
Write-Log "=== Phase 6: Verifying Frontend ===" $Colors.Header
$frontendStarted = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $req = [System.Net.WebRequest]::Create("http://localhost:3001")
        $req.Timeout = 2000
        $resp = $req.GetResponse()
        if ($resp.StatusCode -eq 200) {
            $frontendStarted = $true
            Write-Log "Frontend ONLINE (http://localhost:3001)" $Colors.Success
            $resp.Close()
            break
        }
        $resp.Close()
    } catch {}
    if ($frontendJob.State -eq "Failed") {
        Write-Log "Frontend may have startup issues. Check logs/frontend.log" $Colors.Warning
        break
    }
}
if (-not $frontendStarted) {
    Write-Log "Frontend did not respond on http://localhost:3001. Check logs/frontend.log" $Colors.Warning
}

# === PHASE 7: Verify APIs ===
Write-Log "=== Phase 7: Verifying API Endpoints ===" $Colors.Header
$apiEndpoints = @(
    "/api/health",
    "/api/v1/health",
    "/api/v1/status",
    "/api/v1/dashboard",
    "/api/mt5/status",
    "/api/account",
    "/api/prices",
    "/api/system/status"
)

foreach ($endpoint in $apiEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:8007$endpoint" -TimeoutSec 3 -ErrorAction SilentlyContinue
        Write-Log "  [OK] $endpoint - ONLINE" $Colors.Success
    } catch {
        Write-Log "  [FAIL] $endpoint - OFFLINE" $Colors.Warning
    }
}

# === PHASE 8: Startup Summary ===
Write-Log "=== Startup Complete ===" $Colors.Header
Write-Log ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  AntiGravity AI Trading Platform V4" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Backend:  http://127.0.0.1:8007" -ForegroundColor Cyan
Write-Host "  API Docs: http://127.0.0.1:8007/docs" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Login:    admin / admin123" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Log "Log files:" $Colors.Info
Write-Log "  Backend:  $backendLog" $Colors.Info
Write-Log "  Frontend: $frontendLog" $Colors.Info
Write-Log "  Pip:      $LogDir\pip_install.log" $Colors.Info
Write-Host ""

# Auto-recovery monitoring
Write-Log "Auto-recovery monitoring active. Press Ctrl+C to stop all services." $Colors.Warning

try {
    while ($true) {
        Start-Sleep -Seconds 5

        # Check backend health
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:8007/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($health.status -ne "online") {
                Write-Log "Backend health check failed, but process is running" $Colors.Warning
            }
        } catch {
            Write-Log "Backend unreachable! Attempting restart..." $Colors.Error
            Stop-Job $backendJob -ErrorAction SilentlyContinue
            Remove-Job $backendJob -ErrorAction SilentlyContinue
            Set-Location $BackendDir
            $backendJob = Start-Job -ScriptBlock {
                param($dir, $python, $logfile)
                Set-Location $dir
                & $python main.py *>&1 | Out-File $logfile -Encoding utf8 -Append
            } -ArgumentList $BackendDir, $venvPython, $backendLog
            Set-Location $RootDir
            Write-Log "Backend restart initiated" $Colors.Info
        }

        # Check frontend
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-Log "Frontend stopped! Restarting..." $Colors.Error
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            $frontendJob = Start-Job -ScriptBlock {
                param($dir, $logfile)
                Set-Location $dir
                $env:NEXT_TELEMETRY_DISABLED = "1"
                npm.cmd run dev -- -p 3001 *>&1 | Out-File $logfile -Encoding utf8
            } -ArgumentList $FrontendDir, $frontendLog
            Write-Log "Frontend restart initiated" $Colors.Info
        }

        # Check python process health
        if ($backendJob.State -eq "Failed") {
            $errLog = Receive-Job $backendJob -ErrorAction SilentlyContinue
            Write-Log "Backend process failed. Last output: $errLog" $Colors.Error
            Write-Log "Restarting backend..." $Colors.Info
            Remove-Job $backendJob -ErrorAction SilentlyContinue
            Set-Location $BackendDir
            $backendJob = Start-Job -ScriptBlock {
                param($dir, $python, $logfile)
                Set-Location $dir
                & $python main.py *>&1 | Out-File $logfile -Encoding utf8 -Append
            } -ArgumentList $BackendDir, $venvPython, $backendLog
            Set-Location $RootDir
            Write-Log "Waiting for backend to initialize after restart..." $Colors.Info
            Start-Sleep -Seconds 30
        }
    }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Get-Process -Name "python*", "node*", "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Yellow
}
