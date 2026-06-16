# MT5 Trading Automation Platform - Full Project Documentation

This document serves as a comprehensive overview of the MT5 Trading Automation Platform, combining the repository structure, system status, error diagnostics, and recent integration plans for the **Best Gold Robot**.

---

## 1. Platform Overview

A production-ready algorithmic trading management system connecting MetaTrader 5 terminals to a modern Next.js web dashboard.

### Technical Stack
* **Frontend:** Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS, Zustand, Recharts
* **Backend:** FastAPI (Python 3.12), SQLAlchemy, PostgreSQL/SQLite, JWT Authentication, WebSockets
* **Trading Terminal:** MetaTrader 5 Expert Advisor (MQL5)

### Repository Directory Structure
* `frontend/` - Next.js 15 Web Dashboard Application
* `backend/` - FastAPI Python Web Gateway Service
* `mt5-ea/` - MetaTrader 5 Expert Advisor (MQL5)
* `database/` - Database schemas and seeds
* `docs/` - User and developer documentation
* `docker/` - Container configurations
* `scripts/` - Batch and PowerShell startup/shutdown scripts

---

## 2. System Audit & Status (Recovery Report)

A recent comprehensive audit was performed across the architecture targeting event loop conflicts, database locks, and frontend error boundaries.

### Resolved Issues
* **GET /mt5/status Timeout:** Routed MT5 operations into a background worker thread; status returned immediately from memory cache under lock to prevent 10s timeouts.
* **Database Connection Lockups:** Increased SQLite timeout to 30.0s and enabled WAL mode connection pragmas to resolve concurrent write locks.
* **Next.js Dev Overlay Block:** Replaced `console.error` with `console.warn` for transient network issues to prevent the UI from blocking.
* **Sandbox Login Failure:** Force-seeded validated PBKDF2 hashes for default users (`admin`, `trader`, `viewer`) on startup.

### Offline Diagnosis (Thread Pool Exhaustion Deadlock)
The backend was previously experiencing a deadlock when the frontend attempted to connect to an offline MT5 terminal. 
* **Cause:** The `mt5.initialize()` function blocked the asynchronous thread pool when trying to launch `terminal64.exe` headlessly, consuming all available threads.
* **Solution:** Users must start the MetaTrader 5 Terminal manually on their desktop first before launching the backend platform.

---

## 3. Best Gold Robot Integration

The platform is being updated to support the **Best Gold Robot** and its multi-strategy management capabilities (Strategies A-H).

### Database Changes
* **`trades` Table:** Added `magic_number` and `strategy_name` columns to associate trades with their specific sub-strategies.
* **`bot_settings` Table:** Created a new table to store global input parameters and active strategy toggles (e.g., `run_strategy_a`, `lotsize_calculation_method`, `max_risk_per_trade`).

### API Updates
* **Bot Settings Management:** `GET/PUT /api/v1/mt5/bot-settings` to retrieve and update configuration toggles.
* **Strategy Telemetry:** `GET /api/v1/mt5/strategy-metrics` for real-time performance metrics broken down by individual strategies.
* **Bot Commands:** `POST /api/v1/mt5/bot-control` to initiate state changes (Start, Stop, Pause, Emergency Close).
* **WebSocket Updates:** `terminal_sync` events now include `active_strategies` with position counts and floating profit.

### Frontend Enhancements
* **Dashboard Widgets:** Added a Drawdown Gauge Card and Active Strategies Status Grid.
* **Strategy Monitoring Page (`/dashboard/strategies`):** A dedicated view for sub-strategies performance and telemetry.
* **Bot Status & Control Page (`/dashboard/bot-control`):** Master controls for execution state and preset configuration management.
* **Trade History Filters:** Added strategy-based filtering in `/dashboard/trades`.
* **Risk Management Page (`/dashboard/risk`):** UI for configuring capital protection rules, target limits, and zone recovery settings.

---

## 4. Quick Start (Local Run)

1. **Launch Database**: Setup database and run `database/schema.sql` and `database/seed.sql`.
2. **Start Platform**: Use the provided `startup.ps1` script to run both backend and frontend servers.
3. **Log In**: Navigate to `http://localhost:3000` (`admin` / `admin123`).
4. **Connect MT5**: Open your MT5 Terminal manually on your desktop, then click **Connect MT5** in the dashboard.
