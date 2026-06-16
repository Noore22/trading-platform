Get-ChildItem -Path "C:\Program Files" -ErrorAction SilentlyContinue | Select-Object Name | Out-File -FilePath C:\trading-platform\backend\program_files.txt
Get-ChildItem -Path "C:\Program Files (x86)" -ErrorAction SilentlyContinue | Select-Object Name | Out-File -FilePath C:\trading-platform\backend\program_files_x86.txt
