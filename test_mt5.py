import MetaTrader5 as mt5
import time

# Try initialize without any params (connect to existing terminal)
print("Attempting to connect to running terminal...")
init = mt5.initialize(timeout=30000)
print(f"Init result: {init}")
print(f"Error: {mt5.last_error()}")

if init:
    info = mt5.account_info()
    if info:
        print(f"Login: {info.login}, Server: {info.server}, Balance: {info.balance}")
    terminal = mt5.terminal_info()
    if terminal:
        print(f"Terminal: {terminal.name}, Build: {terminal.build}")

    # Now try to login to IC Markets
    print("\nLogging into IC Markets...")
    login = mt5.login(login=83462795, password="N@eemTrading1", server="ICMarkets-Demo")
    print(f"Login result: {login}")
    print(f"Login error: {mt5.last_error()}")

    if login:
        info = mt5.account_info()
        if info:
            print(f"IC Markets Account: {info.login} @ {info.server}")
            print(f"Broker: {info.company}")
            print(f"Balance: {info.balance}")
            print(f"Equity: {info.equity}")

    mt5.shutdown()
else:
    # Check if terminal is running by looking at processes
    import subprocess
    result = subprocess.run(["tasklist", "/FI", "IMAGENAME eq terminal64.exe"], capture_output=True, text=True)
    print(f"\nTerminal processes:\n{result.stdout}")

    # Try with path
    print("\nRetrying with path...")
    init2 = mt5.initialize(
        path=r"C:\Users\PuthawalaNuareMoazza\AppData\Roaming\MetaTrader 5\terminal64.exe",
        timeout=60000
    )
    print(f"Init2 result: {init2}")
    print(f"Error2: {mt5.last_error()}")

    if init2:
        info = mt5.account_info()
        if info:
            print(f"Login: {info.login}, Server: {info.server}")
        mt5.shutdown()
