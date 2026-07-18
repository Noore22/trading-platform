# Trading Platform - Session Context

## Current State (July 2026)
Backend successfully starts and serves all 16 API endpoints. MT5 not connected (no terminal installed). AI services need API keys.

## Recent Fixes
1. **MT5 timeouts** (`backend/services/mt5_service.py`): Added `mt5_call_with_timeout()` wrapper to prevent hangs on `mt5.initialize()`, `mt5.shutdown()`, `mt5.terminal_info()`.
2. **MT5 initialize() hangs create_server() on Windows** (`backend/services/mt5_service.py`): Calling `mt5.initialize()` WITHOUT the `timeout` kwarg from any thread causes the main thread's `ProactorEventLoop.create_server()` to hang indefinitely on Python 3.13 Windows. **Fix**: Always pass `timeout=10000` directly to `mt5.initialize()`. Also wrapped `mt5.login()` in a lambda to prevent parameter collision with the timeout wrapper.
3. **Server lifespan** (`backend/main.py`): Uses `@asynccontextmanager` pattern. MT5 init runs in a daemon background thread (not in lifespan directly) to prevent blocking. Backend starts successfully and serves requests.
4. **Missing packages** (`backend/requirements.txt`): Added langchain-core, langchain-openai, langgraph, openai, yfinance, httpx, pydantic-settings. All installed.

## Running the Backend
```
cd backend
..\.venv\Scripts\python.exe main.py
```
Starts on http://127.0.0.1:8007 after ~15s (waiting for MT5 init timeout). Health check: `GET /api/health`.

## API Endpoints (all 16 verified working)
- `/api/health`, `/api/v1/health`, `/api/v1/status`
- `/api/account`, `/api/prices`, `/api/orders`, `/api/positions`
- `/api/history`, `/api/performance`, `/api/portfolio`, `/api/risk`
- `/api/settings`, `/api/logs`, `/api/signals`, `/api/system/status`
- `/api/v1/scanner`

## Key Infrastructure
- **DB**: SQLite via SQLAlchemy, tables auto-create via `Base.metadata.create_all()`
- **MT5**: Service with timeout-safe calls; background thread init on startup; `mt5.initialize(timeout=10000)` to prevent event loop hang
- **WebSocket**: Manager with `_broadcast_loop` and `_heartbeat_loop` -- tasks need to be created in lifespan
- **AI**: Coordinator loaded in background thread on startup
- **Auth**: JWT-based, default admin/admin123

## Critical Debugging Findings
- **Root cause of server hang**: `mt5.initialize(timeout=10000)` MUST be called with explicit timeout on Windows Python 3.13. Default `mt5.initialize()` (no timeout arg) causes `ProactorEventLoop.create_server()` to hang indefinitely if an MT5 init thread was ever started. This is a Windows I/O completion port conflict between MT5's C extension and Python's proactor.
- **uvicorn.Server startup flow**: `serve()` -> `_serve()` -> `startup()` -> `lifespan.startup()` (ASGI lifespan protocol) -> TCP `create_server()` -> `main_loop()`. If `create_server()` hangs, the server never accepts connections but the process stays alive.
- **uvicorn on Windows**: `capture_signals()` uses `signal.signal()` which is OK on Python 3.13. No longer an issue.
- **Start-Process limitation**: PowerShell `Start-Process` and `Start-Job` don't reliably test server because signal behavior differs from direct terminal launch. Use `subprocess.Popen` for reliable subprocess testing.

## Remaining Work
- **Frontend**: `npm run build` times out (may need `npm install` or fix config). ESLint v10 removed some options in `.eslintrc`.
- **MT5**: Needs IC Markets Demo credentials in `.env` (MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, MT5_PATH). MT5 terminal not installed on this system.
- **AI**: Needs OPENAI_API_KEY in `.env`. Coordinator `initialize_all()` calls `create_llm_client()` which hangs on NVIDIA API validation -- needs timeout wrapper.
- **WebSocket**: Broadcast loop and heartbeat loop not yet created in lifespan (need `asyncio.create_task()` calls).
