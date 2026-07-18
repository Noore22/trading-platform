@echo off
title AntiGravity AI Trading Platform V4
cd /d "%~dp0"

echo ^============================================
echo ^  AntiGravity AI Trading Platform V4
echo ^============================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Installing Python dependencies...
.venv\Scripts\pip.exe install -r backend\requirements.txt

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo Starting Backend Server...
start "AntiGravity-Backend" /B .venv\Scripts\python.exe backend\main.py

echo Starting Frontend...
set NEXT_TELEMETRY_DISABLED=1
start "AntiGravity-Frontend" /B cmd /c "cd frontend && npm run dev -- -p 3001"

echo.
echo Backend:  http://127.0.0.1:8007
echo Frontend: http://localhost:3001
echo Login:    admin / admin123
echo.
echo Close this window to stop all services.
echo.

:wait
timeout /t 5 /nobreak >nul
goto wait
