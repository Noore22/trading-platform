# Local Installation & Setup Guide

This guide details setting up the MT5 Trading Automation Platform locally for development and testing.

---

## Prerequisites

Before starting, ensure you have the following software installed:
- **Python 3.12+**
- **Node.js 18+** & npm
- **PostgreSQL 15+** (or use local SQLite for testing)
- **MetaTrader 5 Terminal** (running on Windows)

---

## Step 1: Database Setup

1. Create a PostgreSQL database named `trading_platform`:
   ```sql
   CREATE DATABASE trading_platform;
   ```
2. Run the schema script to provision tables:
   ```bash
   psql -U postgres -d trading_platform -f database/schema.sql
   ```
3. (Optional) Run the seed script to load mock dashboard data:
   ```bash
   psql -U postgres -d trading_platform -f database/seed.sql
   ```

---

## Step 2: FastAPI Backend Setup

1. Open a terminal in the `backend/` directory.
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env` template, and configure your Database URL:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trading_platform
   ```
5. Launch the backend development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend API is now running at `http://localhost:8000`. The interactive Swagger API docs are available at `http://localhost:8000/docs`.

---

## Step 3: Next.js Frontend Dashboard Setup

1. Open a terminal in the `frontend/` directory.
2. Install npm node modules:
   ```bash
   npm install
   ```
3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.
   - Log in using one of the seeded credentials:
     - **Admin**: `admin` / `admin123`
     - **Trader**: `trader` / `admin123`
     - **Viewer**: `viewer` / `admin123`

---

## Step 4: MetaTrader 5 EA Compilation & Configuration

1. In the Web Dashboard, go to **MT5 Accounts** and click **Register Account** (using `admin` user). Fill in your Account Name, Login number, Broker, and Server names.
2. Copy the generated **API Token** (e.g. `tok_3b4b8...`).
3. Copy all files from the `mt5-ea/` directory of this project:
   - `EA_Bot.mq5`
   - `TradeManager.mqh`
   - `RiskManager.mqh`
   - `ApiClient.mqh`
   - `TelegramManager.mqh`
   - `Config.mqh`
4. Paste these files into your MetaTrader 5 `MQL5/Experts/` folder:
   - In MT5 terminal, click **File** -> **Open Data Folder**.
   - Navigate to `MQL5/Experts/` and create a folder named `TradingPlatform/`. Place the files inside this directory.
5. Compile the Expert Advisor:
   - In MT5, open **MetaEditor** (F4).
   - In the navigator, open `Experts/TradingPlatform/EA_Bot.mq5` and click **Compile** at the top. Ensure there are no compilation errors.
6. Enable WebRequests:
   - In MT5 terminal, go to **Tools** -> **Options** -> **Expert Advisors**.
   - Check **Allow WebRequest for listed URL**.
   - Add your FastAPI backend URL (e.g. `http://127.0.0.1:8000` or `http://localhost:8000`).
7. Drag the `EA_Bot` onto a chart (e.g., EURUSD M15).
8. In the inputs dialog:
   - Set `InpApiBaseUrl` to `http://127.0.0.1:8000/api/v1` (or your VPS address).
   - Set `InpApiToken` to the **API Token** you copied from the Web Dashboard.
   - Click OK. Ensure **Algo Trading** button is enabled in the top toolbar.
9. Verify connection:
   - Check the **Experts** tab in MT5 toolbox. It should output:
     `API Request succeeded.`
   - Check the Web Dashboard. The account status will change to **ONLINE** and show live balance and equity updates.
