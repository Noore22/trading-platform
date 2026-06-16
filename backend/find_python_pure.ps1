Write-Output "Searching paths..."
$paths = @(
    "C:\Python312\python.exe",
    "C:\Python311\python.exe",
    "C:\Python310\python.exe",
    "C:\Python39\python.exe",
    "C:\Program Files\Python312\python.exe",
    "C:\Program Files\Python311\python.exe",
    "C:\Program Files\Python310\python.exe",
    "C:\Program Files (x86)\Python312\python.exe",
    "C:\Program Files (x86)\Python311\python.exe",
    "C:\Program Files (x86)\Python310\python.exe"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Output "FOUND: $p"
    }
}
$user_python = Join-Path $env:LOCALAPPDATA "Programs\Python"
if (Test-Path $user_python) {
    Get-ChildItem -Path $user_python -Filter python.exe -Recurse | ForEach-Object { Write-Output "FOUND USER: $_.FullName" }
}
