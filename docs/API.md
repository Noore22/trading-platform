# Backend REST API Reference

The backend exposes a JSON REST API under `/api/v1` for web dashboard clients, and a terminal synchronization gateway for MetaTrader 5 Expert Advisors.

---

## Authentication

Authentication for web users is handled via JWT tokens. Include the token in the HTTP `Authorization` header of all protected requests:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

MT5 terminal requests are authenticated via an account-specific token sent in the headers:
```http
X-MT5-Token: <ACCOUNT_API_TOKEN>
```

---

## API Routers & Endpoints

### 1. Authentication Router (`/api/v1/auth`)

#### `POST /auth/login`
Authenticates a user via standard form data. Returns a JWT access token. Used by Swagger or standard HTTP client forms.
- **Request Body (Form)**: `username=<username>&password=<password>`
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

#### `POST /auth/login-json`
Alternative JSON body format login, preferred by frontend scripts.
- **Request Body (JSON)**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

#### `GET /auth/me`
Fetches profile parameters for the current authenticated user.
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "email": "admin@tradingplatform.local",
    "role": "admin"
  }
  ```

---

### 2. MT5 Accounts Router (`/api/v1/accounts`)

#### `GET /accounts`
Retrieve a list of all registered accounts.
- **Response (200 OK)**: Array of Accounts.

#### `POST /accounts`
Register a new MT5 account on the system (Admin only). Generates an API token.
- **Request Body (JSON)**:
  ```json
  {
    "name": "Live Swing Bot",
    "login": 8920138,
    "broker": "IC Markets Ltd",
    "server": "ICMarkets-Demo"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 3,
    "name": "Live Swing Bot",
    "login": 8920138,
    "broker": "IC Markets Ltd",
    "server": "ICMarkets-Demo",
    "api_token": "tok_3b4b882312b9d2a09...",
    "balance": 0.0,
    "equity": 0.0,
    "free_margin": 0.0,
    "margin_level": 0.0,
    "is_active": true
  }
  ```

#### `DELETE /accounts/{account_id}`
Removes an account, settings, targets, and logs from the database (Admin only).

---

### 3. Trade Management Router (`/api/v1/trades`)

#### `GET /trades/`
Query trade list with parameters.
- **Query Parameters**:
  - `account_id` (integer, optional)
  - `status` (string: `open` or `closed`, optional)
  - `symbol` (string, optional)

#### `POST /trades/manual-trade`
Dispatches a manual order command to the MT5 command queue (Trader or Admin only).
- **Query Parameter**: `account_id` (integer)
- **Request Body (JSON)**:
  ```json
  {
    "symbol": "EURUSD",
    "type": "buy",
    "volume": 0.1,
    "sl": 1.08250,
    "tp": 1.08700
  }
  ```

#### `POST /trades/modify-sl-tp`
Modifies stop loss/take profit for an active ticket.
- **Request Body (JSON)**:
  ```json
  {
    "ticket": 100006,
    "sl": 1.08300,
    "tp": 1.08650
  }
  ```

#### `POST /trades/partial-close`
Closes a portion of an active trade.
- **Request Body (JSON)**:
  ```json
  {
    "ticket": 100006,
    "volume": 0.05
  }
  ```

#### `POST /trades/close-group`
Initiates emergency closures for all, buy, or sell positions.
- **Query Parameters**: `account_id` (int), `action` (string: `close_all`, `close_buys`, `close_sells`)

---

### 4. Targets Safeguard Router (`/api/v1/targets`)

#### `GET /targets/{account_id}`
Returns configured profit targets and loss safety thresholds.

#### `PUT /targets/{account_id}`
Updates safeguards (Trader/Admin only).
- **Request Body (JSON)**:
  ```json
  {
    "daily_profit_target": 1000.0,
    "monthly_profit_target": 8000.0,
    "daily_loss_limit": 500.0,
    "weekly_loss_limit": 2000.0,
    "auto_close_on_target": true,
    "auto_disable_on_target": true
  }
  ```

---

### 5. Bot Settings Router (`/api/v1/settings`)

#### `GET /settings/{account_id}`
Returns lot size, hours, allowed symbols, news filter configurations.

#### `PUT /settings/{account_id}`
Updates operational parameters (Trader/Admin only).

#### `POST /settings/{account_id}/control`
Triggers state shifts on the EA bot engine (Start, Stop, Pause, Restart, Enable/Disable auto-trading).
- **Query Parameter**: `action` (string)

---

### 6. MT5 EA Gateway (`/api/v1/mt5`)

#### `POST /mt5/sync`
Synchronizes terminal status, open/closed trades, and retrieves queued dashboard commands. Called exclusively by the EA.
- **Headers**: `X-MT5-Token: <api_token>`
- **Request Body (JSON)**:
  ```json
  {
    "balance": 102450.50,
    "equity": 102920.25,
    "free_margin": 98420.25,
    "margin_level": 2287.11,
    "trades": [
      {
        "ticket": 100006,
        "symbol": "EURUSD",
        "type": "buy",
        "volume": 0.25,
        "open_price": 1.08420,
        "close_price": 1.08510,
        "sl": 1.08250,
        "tp": 1.08700,
        "profit": 225.00,
        "open_time": 1717932000,
        "status": "open",
        "comment": "scalp_active_buy"
      }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "bot_status": "running",
    "auto_trading_enabled": true,
    "commands": [
      {
        "id": 45,
        "command": "modify_sl_tp",
        "params": {
          "ticket": 100006,
          "sl": 1.08300,
          "tp": 1.08650
        }
      }
    ]
  }
  ```
