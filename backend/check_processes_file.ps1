Get-Process | Where-Object { $_.Name -like "*python*" -or $_.Name -like "*uvicorn*" } | Select-Object Id, Name, Path | Out-File -FilePath C:\trading-platform\backend\processes.txt
