@echo off
title Trading Platform - MT5 Automation

:: Start backend in a new window
start "Backend" cmd /c "cd /d "%~dp0backend" && python main.py"

:: Wait briefly for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================
echo   Backend:  http://127.0.0.1:8007
echo   Frontend: http://localhost:3000
echo   Login:    admin / admin123
echo ============================================
echo.
echo Close the console windows to stop.
echo.
pause
