import MetaTrader5 as mt5
import requests
import websocket
import json

print("=" * 50)
print("MT5 PLATFORM TEST")
print("=" * 50)

# MT5 Test
print("\n[1] Testing MT5")

if mt5.initialize():
    print("✅ MT5 Connected")

    account = mt5.account_info()

    if account:
        print(f"✅ Login: {account.login}")
        print(f"✅ Balance: {account.balance}")

else:
    print("❌ MT5 Connection Failed")

# API Test
print("\n[2] Testing Backend API")

try:
    response = requests.get(
        "http://localhost:8000/docs"
    )

    print("✅ Backend Running")

except Exception as e:
    print("❌ Backend Offline")
    print(e)

# WebSocket Test
print("\n[3] Testing WebSocket")

try:
    ws = websocket.create_connection(
        "ws://localhost:8000/ws"
    )

    print("✅ WebSocket Connected")

    ws.close()

except Exception as e:
    print("❌ WebSocket Failed")
    print(e)

print("\n[4] Testing EURUSD")

symbol = mt5.symbol_info("EURUSD")

if symbol:
    print("✅ EURUSD Available")
else:
    print("❌ EURUSD Not Found")

print("\n[5] Testing Trade Permission")

terminal = mt5.terminal_info()

if terminal:
    print(
        f"Auto Trading Enabled: "
        f"{terminal.trade_allowed}"
    )

print("\nDone")