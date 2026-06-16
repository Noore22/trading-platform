# Diagnostic Report: Next.js Dashboard "Backend Server Offline"

This report explains the root cause of the connection error displayed on your Next.js dashboard and provides a step-by-step resolution guide.

---

## 1. Summary of the Issue

When you open the web dashboard, you initially see that the WebSockets are connected, but the MT5 Account shows **OFFLINE**. When you click the **Connect MT5** button to link the terminal, the entire page freezes, and after 10 seconds, it displays the **Backend Server Offline** screen.

---

## 2. Root Cause Analysis

The error is caused by a **Thread Pool Exhaustion Deadlock** in the FastAPI backend server:

```
+------------------+                    +------------------+                    +------------------+
| Next.js Frontend |                    | FastAPI Backend  |                    |   MT5 Terminal   |
|   (Port 3000)    |                    |   (Port 8000)    |                    |  (terminal64.exe)|
+--------+---------+                    +--------+---------+                    +--------+---------+
         |                                       |                                       |
         |  1. POST /connect                     |                                       |
         |-------------------------------------->|                                       |
         |                                       |  2. mt5.initialize() (Tries to start) |
         |                                       |-------------------------------------->|
         |                                       |                                       |
         |                                       |  3. HANGS (No GUI / UAC Block)        |
         |                                       | - - - - - - - - - - - - - - - - - - ->|
         |                                       |                                       |
         |  4. Thread Pool Exhausted (Deadlock)  |                                       |
         |     (Subsequent requests hang)        |                                       |
         |                                       |                                       |
         |  5. Timeout (10000ms)                 |                                       |
         |<- - - - - - - - - - - - - - - - - - - |                                       |
         |                                       |                                       |
         v                                       v                                       v
```

1. **Connection Trigger**: Clicking **Connect MT5** sends a `POST /api/v1/mt5/connect` request to the backend.
2. **Terminal Initialization**: The backend calls `mt5.initialize(path=...)` to connect to the MT5 terminal. Because the MetaTrader 5 Terminal is **not currently running** on your desktop, the library attempts to launch `terminal64.exe` programmatically.
3. **Execution Hang**: Since the backend was launched as an asynchronous background subprocess via `startup.ps1`, the child GUI process (`terminal64.exe`) lacks the interactive desktop session context or is blocked by User Account Control (UAC). This causes the `mt5.initialize()` function to **block and hang indefinitely**.
4. **Thread Deadlock**: The backend runs MT5 tasks inside a thread pool (`asyncio.to_thread`). Because Python threads cannot be aborted from the outside, the worker thread remains blocked. As the background sync loop and incoming status queries continue to call the MT5 API, they consume all available threads in the pool, leading to complete server starvation (deadlock).
5. **Port 8000 unresponsive**: The backend on port `8000` stops responding to all HTTP requests (including `/health`). The Next.js frontend logs an `API Timeout (10000ms)` and displays the **Backend Server Offline** error screen.

---

## 3. Step-by-Step Resolution Guide

Follow these steps to clear the deadlock and successfully connect the MT5 terminal:

### Step 1: Force Terminate Deadlocked Servers
You must first terminate the hanging Python and Node processes:
1. Double-click the file [kill_python.bat](file:///c:/trading-platform/kill_python.bat) in your project root, OR run it in a terminal:
   ```cmd
   c:\trading-platform\kill_python.bat
   ```
   *This will kill all active `python.exe` and `node.exe` tasks.*

### Step 2: Start MetaTrader 5 Manually
To prevent the Python library from attempting a headless launch (which hangs):
1. Open your **MetaTrader 5 Terminal** manually on your desktop first.
2. Keep the MT5 window open and logged into your account.

### Step 3: Relaunch the Platform
1. Run the launcher script [startup.ps1](file:///c:/trading-platform/startup.ps1) in PowerShell again to start both servers:
   ```powershell
   .\startup.ps1
   ```
2. Navigate to `http://localhost:3000` in your web browser.

### Step 4: Connect the Terminal
1. On the dashboard sidebar, verify your account details.
2. Click **Connect MT5**.
3. Because the MT5 Terminal is already active on your desktop, `mt5.initialize()` will link instantly (under 1 second), and your dashboard will immediately update to **CONNECTED** with live data feed.
