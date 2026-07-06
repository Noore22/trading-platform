"""
MT5 Connection Debug Script v2
Tests various initialization approaches
"""
import MetaTrader5 as mt5
import time
import os
import subprocess

MT5_PATH = r"C:\Users\PuthawalaNuareMoazza\AppData\Roaming\MetaTrader 5\terminal64.exe"
LOGIN = 83462795
PASSWORD = "N@eemTrading1"
SERVER = "ICMarkets-Demo"

# Kill any existing terminal processes
os.system("taskkill /f /im terminal64.exe 2>nul")
time.sleep(5)

# Create fresh origin.txt
origin_path = os.path.join(os.path.dirname(MT5_PATH), "origin.txt")
with open(origin_path, "w") as f:
    f.write("127.0.0.1\nlocalhost\n")
print(f"Created {origin_path}")

# Approach 1: Initialize with all params
print("\n=== Approach 1: initialize(path, login, password, server) ===")
result = mt5.initialize(
    path=MT5_PATH,
    login=LOGIN,
    password=PASSWORD,
    server=SERVER,
    timeout=120000
)
print(f"Result: {result}")
print(f"Error: {mt5.last_error()}")

if result:
    info = mt5.account_info()
    if info:
        print(f"  Connected: {info.login} @ {info.server}")
        print(f"  Broker: {info.company}")
        print(f"  Balance: {info.balance}")
    mt5.shutdown()
    print("SUCCESS!")
    exit(0)

# Approach 2: Initialize without path, then login
print("\n=== Approach 2: initialize(), then login() ===")
mt5.shutdown()
time.sleep(2)

result = mt5.initialize(timeout=30000)
print(f"Result: {result}")
print(f"Error: {mt5.last_error()}")

if result:
    login_result = mt5.login(login=LOGIN, password=PASSWORD, server=SERVER)
    print(f"Login result: {login_result}")
    print(f"Login error: {mt5.last_error()}")
    if login_result:
        info = mt5.account_info()
        if info:
            print(f"  Connected: {info.login} @ {info.server}")
        print("SUCCESS!")
        exit(0)
    mt5.shutdown()

# Approach 3: Start terminal manually, wait, then init
print("\n=== Approach 3: Manual start, wait, then init ===")
mt5.shutdown()
time.sleep(2)

proc = subprocess.Popen([MT5_PATH], shell=True)
print(f"Started terminal, PID: {proc.pid}")
print("Waiting 30 seconds for terminal to start...")
time.sleep(30)

result = mt5.initialize(timeout=30000)
print(f"Result: {result}")
print(f"Error: {mt5.last_error()}")

if result:
    login_result = mt5.login(login=LOGIN, password=PASSWORD, server=SERVER)
    print(f"Login result: {login_result}")
    if login_result:
        info = mt5.account_info()
        if info:
            print(f"  Connected: {info.login} @ {info.server}")
        print("SUCCESS!")
        exit(0)
    mt5.shutdown()
else:
    # Check if terminal is running
    check = subprocess.run(["tasklist", "/FI", "IMAGENAME eq terminal64.exe"], capture_output=True, text=True)
    print(f"Terminal running? {check.stdout.count('terminal64') > 0}")
    
    # Try with path
    mt5.shutdown()
    time.sleep(2)
    result = mt5.initialize(path=MT5_PATH, timeout=30000)
    print(f"Init with path: {result}")
    print(f"Error: {mt5.last_error()}")

print("\n=== All approaches failed ===")
print(f"Last error: {mt5.last_error()}")
print(f"Terminal processes:")
os.system("tasklist /FI \"IMAGENAME eq terminal64.exe\"")
