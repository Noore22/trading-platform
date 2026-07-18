# Trading Platform - Session Context

## Current State (July 2026)
Backend successfully starts and serves all 16 API endpoints. MT5 not connected (no terminal installed). AI services need API keys.

## Recent Fixes
1. **MT5 timeouts** (`backend/services/mt5_service.py`): Added `mt5_call_with_timeout()` wrapper to prevent hangs on `mt5.initialize()`, `mt5.shutdown()`, `mt5.terminal_info()`.
2. **Lifespan hang** (`backend/main.py`): Replaced `await ws_manager.start(loop)` with direct `loop.create_task()` calls. Removed complex threading patterns that caused uvicorn to hang during startup.
3. **Missing packages** (`backend/requirements.txt`): Added langchain-core, langchain-openai, langgraph, openai, yfinance, httpx, pydantic-settings. All installed.
4. **Agent import** (`backend/routers/agents_router.py`): Made `tradingagents_service` import lazy to prevent startup crash.

## Running the Backend
```
cd backend
..\.venv\Scripts\python.exe main.py
```
Starts on http://127.0.0.1:8007. Health check: `GET /api/health`.

## API Endpoints (all verified working)
- `/api/health`, `/api/v1/health`, `/api/v1/status`
- `/api/account`, `/api/prices`, `/api/orders`, `/api/positions`
- `/api/history`, `/api/performance`, `/api/portfolio`, `/api/risk`
- `/api/settings`, `/api/logs`, `/api/signals`, `/api/system/status`
- `/api/v1/scanner`

## Key Infrastructure
- **DB**: SQLite via SQLAlchemy, tables auto-create via `Base.metadata.create_all()`
- **MT5**: Service with timeout-safe calls; background thread init on startup
- **WebSocket**: Manager initialized in lifespan via `loop.create_task()`
- **AI**: Coordinator loaded in background thread on startup
- **Auth**: JWT-based, default admin/admin123

## Remaining Work
- **Frontend**: `npm run build` times out (may need `npm install` or fix config). ESLint v10 removed some options in `.eslintrc`.
- **MT5**: Needs IC Markets Demo credentials in `.env` (MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, MT5_PATH). MT5 terminal not installed on this system.
- **AI**: Needs OPENAI_API_KEY in `.env`.
- **WebSocket**: Broadcast loop and heartbeat loop created in lifespan but no clients connect yet.
