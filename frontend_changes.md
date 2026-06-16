# Frontend Changes for MT5 Bot Integration

This document describes the Next.js 15 frontend modifications and UI components to support the **Best Gold Robot** strategy monitoring, status control, and risk management.

---

## 1. Component & Page Layouts

### A. Dashboard Widgets

We will add the following widgets to the main dashboard (`/dashboard`):

1. **Drawdown Gauge Card**: A circular radial gauge showing the current trailing equity drawdown percentage vs. the maximum daily loss limit. Under normal conditions it is green/blue, turning amber at 50% threshold, and flashing red at 80% to breach.
2. **Active Strategies Status Grid**: A grid of cards for Strategies A-H. Each card contains:
   - Strategy Name & Suffix (e.g. `Strategy A - Gold Trade Pro`).
   - Magic Number (e.g., `1001`).
   - A pulsing badge representing status: `Running` (Green), `Stopped` (Gray), or `Cooldown` (Yellow).
   - Live floating P&L for any active trades under this strategy.

---

### B. Strategy Monitoring Page (`/dashboard/strategies`)

A dedicated page to visualize sub-strategies A-H performance and telemetry.

```
+---------------------------------------------------------------------------------+
|  [Strategies Performance Overview]                                              |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | Strategy    | Magic  | Status  | Win Rate | Closed Profit | Active P&L    |  |
|  +-------------+--------+---------+----------+---------------+---------------+  |
|  | Strategy A  | 1001   | Running |  85.2%   |   $1,240.00   |   +$25.40 (1) |  |
|  | Strategy B  | 1002   | Stopped |   0.0%   |       $0.00   |     $0.00 (0) |  |
|  | Strategy C  | 1003   | Running |  78.1%   |     $520.00   |     $0.00 (0) |  |
|  | Strategy D  | 1004   | Running |  62.0%   |    -$110.00   |   -$14.20 (1) |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  +--------------------------------------+ +----------------------------------+  |
|  | [Live Pending Breakout Orders]       | | [Strategy Parameters (Read Only)]|  |
|  | Magic  | Type     | Price   | Distance| | - Fast MA Period: 10             |  |
|  | 1001   | BuyStop  | 2320.50 | 150 pts | | - Slow MA Period: 20             |  |
|  | 1001   | SellStop | 2295.00 | 290 pts | | - Entry Timeframe: H1 (60)       |  |
|  +--------------------------------------+ +----------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

### C. Bot Status & Control Page (`/dashboard/bot-control`)

Controls execution state and configuration presets.

- **Master Bot Controls**: Large premium toggle switches with glassmorphism styling to:
  - Start Robot execution.
  - Halt/Stop Robot (which triggers deletion of all pending breakout stop orders on MT5 terminal).
  - Emergency Close All Positions.
- **Strategy Selection**: Checkboxes to enable or disable individual strategies (A-H) dynamically.
- **Preset Configuration Manager**: A dropdown selector loaded with preset names (e.g. `Best Gold Robot_Prop_1`, `Best Gold Robot_Update_high_risk`). Clicking "Load Preset" maps settings in the database and updates terminal command list.

---

### D. Trade History Page Enhancements (`/dashboard/trades`)

Update the trade log table to support:
- A column showing **Strategy** derived from the magic number metadata.
- Filter dropdowns to show only trades matching a specific strategy (e.g. "Strategy A only").

---

### E. Risk Management Page (`/dashboard/risk`)

Input settings to adjust drawdown limits and capital protection.

- **Capital Protections Form**:
  - Daily Profit Target ($).
  - Daily Loss Limit ($).
  - Equity Trailing Stop Limit ($).
  - Toggles for `Auto-Close On Target` and `Auto-Disable On Target`.
- **Bot Parameters Form**:
  - Maximum Spread Filter (points).
  - Lot size step size ($ per 0.01 lot).
  - Manual lot size override settings.
  - Zone Recovery (Martingale grid) toggle switch.
