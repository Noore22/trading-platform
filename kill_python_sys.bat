@echo off
C:\Windows\System32\taskkill.exe /f /im python.exe > C:\trading-platform\backend\kill_log_2.txt 2>&1
C:\Windows\System32\taskkill.exe /f /im uvicorn.exe >> C:\trading-platform\backend\kill_log_2.txt 2>&1
C:\Windows\System32\taskkill.exe /f /im node.exe >> C:\trading-platform\backend\kill_log_2.txt 2>&1
