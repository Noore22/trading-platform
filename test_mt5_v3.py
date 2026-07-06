"""
MT5 Connection Debug v3 - Proper origin.txt before terminal start
"""
import MetaTrader5 as mt5
import time
import os
import subprocess

MT5_DIR = r"C:\Users\PuthawalaNuareMoazza\AppData\Roaming\MetaTrader 5"
MT5_PATH = os.path.join(MT5_DIR, "terminal64.exe")
LOGIN = 83462795
PASSWORD = "N@eemTrading1"
SERVER = "ICMarkets-Demo"

# Kill all existing terminal processes
os.system("taskkill /f /im terminal64.exe 2>nul")
time.sleep(5)

# Ensure origin.txt exists in the terminal dir BEFORE starting terminal
origin_path = os.path.join(MT5_DIR, "origin.txt")
with open(origin_path, "w") as f:
    f.write("127.0.0.1\nlocalhost\n")
print(f"Created/updated {origin_path}")

# Also try putting origin.txt in the terminal executable directory (same dir)
# (Already in the same dir since this is portable installation)

# Check that accounts.dat exists - if not, we need to create it
accounts_path = os.path.join(MT5_DIR, "Config", "accounts.dat")
if not os.path.exists(accounts_path):
    print("WARNING: accounts.dat not found! Terminal won't auto-login.")
    print("Creating a minimal accounts.dat...")
    # Create minimal accounts.dat with IC Markets credentials
    # This is a simple placeholder - actual binary format is complex
    with open(accounts_path, "wb") as f:
        f.write(b"")  # Empty accounts.dat - terminal will still show login

print(f"\naccounts.dat exists: {os.path.exists(accounts_path)}")

# Start the terminal manually
print("Starting terminal manually...")
proc = subprocess.Popen([MT5_PATH], shell=True)
print(f"Terminal started, waiting 20 seconds...")
time.sleep(20)

print("\n=== Trying mt5.initialize() ===")
result = mt5.initialize(timeout=60000)
print(f"Result: {result}")
print(f"Error: {mt5.last_error()}")

if result:
    info = mt5.account_info()
    if info:
        print(f"  Connected: {info.login} @ {info.server}")
        print(f"  Broker: {info.company}")
        print(f"  Balance: {info.balance}")
    print("SUCCESS on initialize!")
    
    # Try to login to IC Markets
    print("\n=== Trying mt5.login() ===")
    login_result = mt5.login(login=LOGIN, password=PASSWORD, server=SERVER, timeout=60000)
    print(f"Login result: {login_result}")
    print(f"Login error: {mt5.last_error()}")
    
    if login_result:
        info = mt5.account_info()
        if info:
            print(f"  IC Markets: {info.login} @ {info.server}")
            print(f"  Broker: {info.company}")
            print(f"  Balance: {info.balance}")
            print(f"  Equity: {info.equity}")
    
    mt5.shutdown()
    print("\n=== TEST PASSED ===")
else:
    # Check terminal log for clues
    log_dir = os.path.join(MT5_DIR, "logs")
    log_files = [f for f in os.listdir(log_dir) if f.endswith(".log")]
    if log_files:
        latest_log = max(log_files)
        with open(os.path.join(log_dir, latest_log), "r", errors="replace") as f:
            lines = f.readlines()
            last_20 = lines[-20:] if len(lines) >= 20 else lines
            print(f"\nLast {len(last_20)} lines of {latest_log}:")
            for line in last_20:
                print(f"  {line.rstrip()}")
    
    print(f"\n=== TEST FAILED: {mt5.last_error()} ===")
