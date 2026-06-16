@echo off
taskkill /f /im python.exe > C:\trading-platform\backend\kill_log.txt 2>&1
taskkill /f /im uvicorn.exe >> C:\trading-platform\backend\kill_log.txt 2>&1
taskkill /f /im node.exe >> C:\trading-platform\backend\kill_log.txt 2>&1
