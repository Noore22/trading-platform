# MT5 Trading Automation Platform

A production-ready algorithmic trading management system connecting MetaTrader 5 terminals to a modern Next.js web dashboard.

---

## Repository Directory Structure

```
trading-platform/
│
├── frontend/             # Next.js 15 Web Dashboard Application
│   ├── src/
│   │   ├── app/          # Dashboard, Trades, Analytics, Accounts, Settings, Login pages
│   │   ├── components/   # Sidebar layouts, visual charts, forms
│   │   ├── hooks/        # Real-time WebSocket hook connection manager
│   │   ├── services/     # API fetch requests service layer
│   │   └── store/        # Zustand global client-side state store
│   └── package.json
│
├── backend/              # FastAPI Python Web Gateway Service
│   ├── app/
│   │   ├── api/          # REST route handlers (Auth, Accounts, Trades, Settings, MT5 Gateway)
│   │   ├── core/         # DB session hooks, Security tokens, config settings
│   │   ├── models/       # SQLAlchemy database schemas
│   │   ├── schemas/      # Pydantic request/response model formats
│   │   └── services/     # Target monitoring, Telegram alert handlers
│   ├── main.py           # Server entrypoint with DB migrations & seeds
│   └── requirements.txt
│
├── mt5-ea/               # MetaTrader 5 Expert Advisor (MQL5)
│   ├── EA_Bot.mq5        # Main EA loop (event handler, indicators, polling timer)
│   ├── TradeManager.mqh  # CTrade wrapper for order executions
│   ├── RiskManager.mqh   # Local safety checks & allowed hours rules
│   ├── TelegramManager.mqh # Direct MQL5 to Telegram client requests
│   ├── ApiClient.mqh     # WebRequest wrapper for syncing with FastAPI
│   └── Config.mqh        # Input properties & global configurations
│
├── database/             # PostgreSQL migrations & datasets
│   ├── schema.sql        # Database tables schema script
│   └── seed.sql          # Seed data script for sandbox environments
│
├── docs/                 # Platform user & developer documents
│   ├── API.md            # API routes list & schema formats
│   ├── INSTALL.md        # Sandbox local deployment guide
│   ├── DEPLOYMENT.md     # Production deployment instructions
│   └── USER_GUIDE.md     # Operators manual guide
│
├── docker/               # Container configurations
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend
│
├── docker-compose.yml    # Main Docker compose orchestrator file
└── README.md             # Project summary README (This file)
```

---

## Technical Stack Summary

### Frontend (Next.js Dashboard)
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Store**: Zustand
- **Charting**: Recharts

### Backend (FastAPI Gateway)
- **Framework**: FastAPI (Python 3.12)
- **ORM & DB**: SQLAlchemy, PostgreSQL
- **Security**: JWT Authentication (python-jose, passlib bcrypt)
- **Real-Time**: WebSockets
- **Notifications**: Telegram Bot Integrations, SMTP

---

## Quick Start (Local Run)

1. **Launch Database**: Setup PostgreSQL and run `database/schema.sql` and `database/seed.sql`.
2. **Start Backend**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn backend.main:app --reload --port 8000
   ```
3. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Log In**: Navigate to `http://localhost:3000` and use one of the seeded credentials:
   - **Admin**: `admin` / `admin123`
   - **Trader**: `trader` / `admin123`
   - **Viewer**: `viewer` / `admin123`
5. **Configure MT5 EA**: Read [docs/INSTALL.md](file:///c:/trading-platform/docs/INSTALL.md) for compiling and installing the Expert Advisor on your MetaTrader 5 terminal.
