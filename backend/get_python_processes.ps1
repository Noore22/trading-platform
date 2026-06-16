Get-Process | Where-Object { $_.Path -like "*python*" } | Select-Object Id, Name, Path | Out-File -FilePath C:\trading-platform\backend\python_processes.txt
