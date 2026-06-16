Get-ChildItem -Path "C:\Program Files" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Out-File -FilePath C:\trading-platform\backend\program_files_utf8.txt -Encoding ascii
Get-ChildItem -Path "C:\Program Files (x86)" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Out-File -FilePath C:\trading-platform\backend\program_files_x86_utf8.txt -Encoding ascii
