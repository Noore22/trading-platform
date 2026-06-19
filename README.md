# 📈 MT5 Forex Auto Trading Platform

An institutional-grade, fully automated Forex trading platform powered by MetaTrader 5, Python FastAPI, and Next.js. 

This platform replaces legacy polling mechanisms (like Twelve Data) with direct, high-frequency WebSocket streams native to MT5. All trade executions are securely routed through a centralized Risk Manager.

---

## 🚀 Features

### 🧠 Core Architecture
- **MetaTrader 5 Direct Bridge**: Natively connects to the physical MT5 Desktop Client via the official `MetaTrader5` Python package.
- **Python FastAPI Backend**: High-performance asynchronous API and WebSocket server.
- **Centralized Risk Manager**: An unbreakable gatekeeper that intercepts all manual and algorithmic trade requests to enforce strict risk parameters.
- **Live WebSocket Feeds**: Pushes tick data, AI signals, and MT5 account equity updates to the React frontend every second.

### 📊 Strategy & AI Engine
- Supports **EURUSD, GBPUSD, USDJPY, AUDUSD, USDCHF, USDCAD, NZDUSD, XAUUSD, XAGUSD**.
- Multi-Timeframe Confirmation algorithms.
- **Autonomous Strategies**:
  - EMA Trend Strategy (EMA50 vs EMA200)
  - RSI Scalping Strategy
  - Volume Breakout Strategy
- **AI Signal Dashboard**: Displays real-time signal directions and confidence scores.

### 🛡️ Institutional Risk Management
- **Risk Per Trade**: Automatically calculates precise lot sizes (e.g., 1% risk).
- **Hard Stops**: Enforces a Max Daily Loss limit (e.g., 3%).
- **Profit Targets**: Auto-halts trading when the Max Daily Profit (e.g., 5%) is hit.
- **Trade Constraints**: Limits maximum open trades and max consecutive losses.
- **Position Manager**: Automatically handles Trailing Stops and Break Even mechanics.
- **News Filter**: Suspends trading activity around high-impact economic events.

### 🖥️ Professional Trading Terminal (UI)
- Built with **Next.js, React, TypeScript, and Tailwind CSS**.
- **Dense Grid Layout**: Edge-to-edge UI optimized for power users, mirroring Binance and TradingView.
- **Dedicated Workspaces**:
  - `/terminal`: The execution grid (Market Watch, Live Chart, Order Entry, Open Positions).
  - `/bots`: Strategy deployment and Risk Manager configuration.
  - `/portfolio`: Equity curve mapping and asset allocation.
  - `/scanner`: AI Analyst insights and Top Movers.

---

## 📁 System Blueprint

```text
trading-platform/
│
├── backend/                  # Python FastAPI Core
│   ├── main.py               # FastAPI entry point & MT5 initializer
│   ├── requirements.txt      
│   ├── sockets/              
│   │   └── ws_manager.py     # Live WebSocket Broadcaster
│   └── services/             
│       ├── mt5_engine.py     # MT5 connection, ticks, and execution
│       ├── risk_manager.py   # Position sizing & daily limits gatekeeper
│       └── strategy_engine.py# AI and algorithmic signal generation
│
└── frontend/                 # Next.js React UI
    ├── package.json
    └── src/
        ├── app/              # Next.js Pages (Terminal, Bots, Portfolio)
        ├── components/       # Layouts, Navbar, TradingView Charts
        ├── hooks/            # useMT5WebSocket.ts
        └── store/            # Zustand state management
```

---

## 🛠️ Installation & Setup

### Prerequisites
1. **Windows OS**: Required for MetaTrader 5.
2. **MetaTrader 5 Desktop Terminal**: Installed and logged into a Broker Account (Demo or Live). 
3. **Auto Trading Enabled**: "Allow Auto Trading" must be enabled in your MT5 Terminal options.
4. **Python 3.10+**: Installed and added to system PATH.
5. **Node.js**: Installed for the frontend.

### 1. Start the Backend (FastAPI + MT5)

Open a PowerShell terminal and run:

```bash
cd backend
pip install fastapi uvicorn MetaTrader5 pandas
python main.py
```
*Note: Make sure your MT5 application is actively running in the background before starting the Python server.*

### 2. Start the Frontend (Next.js)

Open a new PowerShell terminal and run:

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Platform
Navigate to **`http://localhost:3000`** in your browser. 
Log in to view the Dashboard, or head directly to the **`/terminal`** to begin trading.

---

## 🔐 Disclaimer

This software is for educational and experimental purposes. Algorithmic trading carries significant financial risk. Always test heavily on a MetaTrader 5 **Demo Account** before deploying real capital. The centralized Risk Manager is designed to protect equity, but unexpected market volatility (slippage) can bypass logical constraints.
