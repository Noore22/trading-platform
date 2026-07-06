import os
import subprocess

# Check MT5 named pipes
result = subprocess.run(
    ['powershell', '-Command', 'Get-ChildItem -Path "\\\\.\\pipe\\" -Filter "MT5*" | Select-Object Name'],
    capture_output=True, text=True
)
print(f"MT5 pipes: {result.stdout}")

# Try to access the known pipe
pipe_paths = [
    r"\\.\pipe\MT5.Terminal.3952588A9C52BB134978B6FA81D833A3F77CC77C5273FA7F60148BA07882B300",
]

for pipe_path in pipe_paths:
    try:
        f = open(pipe_path, "rb")
        print(f"Pipe {pipe_path} is accessible")
        f.close()
    except Exception as e:
        print(f"Pipe {pipe_path} error: {e}")

# Check if MT5 terminal is running
result2 = subprocess.run(["tasklist", "/FI", "IMAGENAME eq terminal64.exe"], capture_output=True, text=True)
print(f"\nTerminal processes:\n{result2.stdout}")
