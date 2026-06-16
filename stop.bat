@echo off
title MT5 Trading Platform - Stop services
echo Stopping MT5 Trading Automation Platform services...

:: Stop port 3000 (Next.js Frontend)
echo Checking port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Terminating PID %%a listening on port 3000...
    taskkill /f /pid %%a
)

:: Stop port 8000 (FastAPI Backend)
echo Checking port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminating PID %%a listening on port 8000...
    taskkill /f /pid %%a
)

echo.
echo ==================================================
echo 🛑 SERVICES STOPPED SUCCESSFULLY!
echo ==================================================
pause
