# API Changes for MT5 Bot Integration

This document outlines the API endpoints and WebSocket specifications to support the **Best Gold Robot** integration.

---

## 1. REST API Endpoints

### A. Bot Settings Management

#### `GET /api/v1/mt5/bot-settings`
Retrieve active settings and strategy configuration for the running bot.

- **Response (200 OK)**:
```json
{
  "account_id": 1,
  "magic_number_base": 1000,
  "run_strategy_a": true,
  "run_strategy_b": false,
  "run_strategy_c": true,
  "run_strategy_d": true,
  "run_strategy_e": true,
  "run_strategy_f": true,
  "run_strategy_g": true,
  "run_strategy_h": true,
  "max_spread": 500.0,
  "lotsize_calculation_method": "Lots_Per_Balance",
  "start_lots": 0.01,
  "lotsize_step": 600,
  "max_risk_per_trade": 2.0,
  "use_equity": false,
  "only_up": true,
  "use_zone_recovery": false
}
```

#### `PUT /api/v1/mt5/bot-settings`
Update configuration settings and strategy toggles.

- **Request Body**:
Same format as the `GET` response schema.
- **Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Bot settings updated successfully"
}
```

---

### B. Strategy Telemetry

#### `GET /api/v1/mt5/strategy-metrics`
Get real-time performance metrics broken down by individual strategies (Strategy A-H).

- **Response (200 OK)**:
```json
{
  "strategies": [
    {
      "name": "Strategy A (XAUUSD_A)",
      "magic_number": 1001,
      "status": "running",
      "trades_count": 24,
      "win_rate": 83.3,
      "net_profit": 1240.50,
      "active_positions_count": 1
    },
    {
      "name": "Strategy C (XAUUSD_C)",
      "magic_number": 1003,
      "status": "running",
      "trades_count": 12,
      "win_rate": 75.0,
      "net_profit": 520.20,
      "active_positions_count": 0
    }
  ]
}
```

---

### C. Bot Commands

#### `POST /api/v1/mt5/bot-control`
Initiate bot execution state changes (Start, Stop, Pause, Emergency Close).

- **Request Body**:
```json
{
  "action": "stop", // start, stop, pause, emergency_close
  "strategy_index": null // Optional index 0-7 to target specific sub-strategies
}
```
- **Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Command 'stop' queued successfully for execution."
}
```

---

## 2. WebSocket Events

WebSockets broadcast real-time updates to the dashboard at a 1-second interval.

### Event: `terminal_sync`
The sync payload broadcast from [mt5_service.py](file:///c:/trading-platform/backend/app/services/mt5_service.py#L774-L793) will be updated to include active strategy positions:

```json
{
  "type": "terminal_sync",
  "connected": true,
  "account_id": 1,
  "balance": 10450.25,
  "equity": 10480.10,
  "floating_profit": 29.85,
  "daily_profit": 150.50,
  "timestamp": "2026-06-13T12:00:00Z",
  "active_strategies": {
    "1001": { "name": "Strategy A", "positions": 1, "profit": 29.85 },
    "1003": { "name": "Strategy C", "positions": 0, "profit": 0.0 }
  }
}
```
