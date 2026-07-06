# AntiGravity AI Trading Platform V3.0

**Institutional-grade automated Forex & Crypto trading platform** with direct exchange APIs (Binance, Bybit), AI-powered trading agents, MT5 compatibility, and a premium black/yellow institutional UI.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                      │
│  React 19 · TypeScript · Zustand · React Query · Recharts    │
│  Tailwind CSS · Framer Motion · Lucide Icons                 │
│  Theme: Black (#0B0B0B) + Yellow (#FFD400)                   │
├──────────────────────────────────────────────────────────────┤
│                     Backend (FastAPI)                         │
│  SQLAlchemy · WebSocket · JWT Auth · Exchange Clients        │
│  AI Agents · Strategy Engine · Risk Engine · Execution Engine │
├──────────────────────┬───────────────────────────────────────┤
│     PostgreSQL       │            Redis                      │
│  (or SQLite dev)     │     (caching/pub-sub)                │
└──────────────────────┴───────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, defaults to SQLite)

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r ../requirements.txt
python main.py
# → http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Docker
```bash
docker-compose up -d
```

---

## Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

---

## Theme System

| Token | Color | Hex |
|-------|-------|-----|
| Background | Black | `#0B0B0B` |
| Cards | Dark Gray | `#161616` |
| Sidebar | Dark | `#111111` |
| Navbar | Dark | `#151515` |
| Primary | Yellow | `#FFD400` |
| Secondary | White | `#FFFFFF` |
| Borders | Gray | `#2B2B2B` |
| Success | Green | `#00C853` |
| Danger | Red | `#FF1744` |
| Warning | Orange | `#FF9800` |
| Info | Blue | `#2196F3` |

---

## Pages (20 Screens)

### Trading
| Page | Route | Status |
|------|-------|--------|
| Dashboard | `/dashboard` | ✅ Live metrics, ticker, charts |
| Terminal | `/terminal` | ✅ Full trading terminal |
| Trades | `/trades` | ✅ Order panel + positions + history |
| Trade History | `/trade-history` | ✅ Historical closed trades |
| Orders | `/orders` | ✅ Pending orders |
| Positions | `/positions` | ✅ Open positions |

### Accounts
| Page | Route | Status |
|------|-------|--------|
| Accounts | `/accounts` | ✅ Register/delete/manage accounts |
| Settings | `/settings` | ✅ Targets + trading parameters |
| Connection | `/connection` | ✅ MT5 + API credentials |

### Analytics
| Page | Route | Status |
|------|-------|--------|
| Analytics | `/analytics` | ✅ Performance metrics + charts |
| Portfolio | `/portfolio` | ✅ Allocation & exposure |
| Risk | `/risk` | ✅ Risk rules + kill switch |

### Automation
| Page | Route | Status |
|------|-------|--------|
| Bots | `/bots` | ✅ Algorithm management |
| Strategies | `/strategies` | ✅ Strategy configurator |
| Agents | `/agents` | ✅ AI trading agents |

### Market
| Page | Route | Status |
|------|-------|--------|
| Scanner | `/scanner` | ✅ Market screener |
| News | `/news` | ✅ Economic calendar |

### System
| Page | Route | Status |
|------|-------|--------|
| Logs | `/logs` | ✅ Activity logs |
| Login | `/login` | ✅ Authentication |

---

## API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login (form-encoded) |
| GET | `/me` | Current user profile |

### Accounts (`/api/v1/accounts/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all accounts |
| POST | `/` | Create account |
| PUT | `/{id}` | Update account |
| DELETE | `/{id}` | Delete account |

### Trades (`/api/v1/trades/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List trades (filters) |
| POST | `/manual-trade` | Execute trade |
| POST | `/modify-sl-tp` | Modify SL/TP |
| POST | `/partial-close` | Partial close |
| POST | `/close-group` | Close group |

### Settings (`/api/v1/settings/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/{account_id}` | Get settings |
| PUT | `/{account_id}` | Update settings |
| POST | `/{account_id}/control` | Bot start/stop/pause |

### Targets (`/api/v1/targets/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/{account_id}` | Get targets |
| PUT | `/{account_id}` | Update targets |

### Analytics (`/api/v1/analytics/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/{account_id}/stats` | Trade statistics |
| GET | `/{account_id}/charts` | Chart data |

### Logs (`/api/v1/logs/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/{account_id}` | Activity logs |

### Algorithms (`/api/v1/algorithms/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List algorithms |
| GET | `/active` | Active algorithm |
| POST | `/{id}/start` | Start algorithm |
| POST | `/{id}/stop` | Stop algorithm |
| POST | `/{id}/settings` | Update config |

### MT5 (`/api/v1/mt5/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/account` | Account info |
| GET | `/status` | Connection status |
| GET | `/positions` | Open positions |
| GET | `/orders` | Pending orders |
| GET | `/history` | Trade history |
| POST | `/buy` | Buy market |
| POST | `/sell` | Sell market |
| POST | `/close` | Close position |
| POST | `/close-all` | Close all |
| POST | `/modify-sl-tp` | Modify SL/TP |
| POST | `/partial-close` | Partial close |
| POST | `/order` | Place pending order |
| DELETE | `/order/{ticket}` | Cancel order |

### AI Agents (`/api/v1/agents/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Agent status |
| POST | `/analyze` | Run analysis |
| GET | `/signal` | Get signal |
| POST | `/execute` | Execute trade |

---

## Database Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (admin/trader/viewer) |
| `accounts` | Trading accounts (balance, equity, profit) |
| `exchange_accounts` | Exchange API credentials |
| `settings` | Per-account trading settings |
| `targets` | Profit/loss targets |
| `trades` | Trade records |
| `orders` | Pending orders |
| `closed_trades` | Archived closed trades |
| `signals` | Trading signals |
| `strategies` | Strategy configs |
| `strategy_performance` | Strategy metrics |
| `risk_settings` | Risk management rules |
| `symbols` | Tradable symbols |
| `candles` | OHLC candle data |
| `notifications` | User notifications |
| `audit_logs` | System audit trail |
| `logs` | Per-account activity logs |
| `wallet` | Balance snapshots |
| `market_data` | Cached prices |
| `system_metrics` | Health metrics |
| `ai_decisions` | AI decision audit trail |
| `economic_events` | Calendar events |

---

## Project Structure

```
├── backend/
│   ├── agents/          # AI trading agents
│   ├── bot/             # Bot manager
│   ├── config/          # Settings
│   ├── database/        # Models + session
│   ├── execution/       # Execution engine
│   ├── exchange/        # Exchange clients
│   ├── market/          # Market data
│   ├── risk/            # Risk engine
│   ├── routers/         # FastAPI routes
│   ├── services/        # MT5 engine, etc.
│   ├── strategies/      # Trading strategies
│   └── websocket/       # WS manager
├── frontend/
│   ├── src/
│   │   ├── app/         # 20 pages
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API + WebSocket
│   │   └── store/       # Zustand state
├── docker/
├── docker-compose.yml
└── requirements.txt
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000/ws
```

### Backend (`.env` in `backend/`)
- `DATABASE_URL` — Connection string (default: sqlite:///./data/trades.db)
- `SECRET_KEY` — JWT signing key
- `JWT_SECRET` — Auth secret
- `BINANCE_API_KEY` / `BINANCE_API_SECRET` — Binance credentials
- `BYBIT_API_KEY` / `BYBIT_API_SECRET` — Bybit credentials
- `ENVIRONMENT` — Runtime env (development/production)
- `LOG_LEVEL` — Logging level

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| State | Zustand 5, React Query 5 |
| Styling | Tailwind CSS 3.4 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Animations | CSS keyframes |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.x |
| Auth | JWT + bcrypt |
| Exchanges | Binance, Bybit, TwelveData |
| AI | OpenAI/GPT integration |
| Database | PostgreSQL 15 / SQLite |
| Cache | Redis 7 |
| Container | Docker + Compose |
