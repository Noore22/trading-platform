# Platform User & Operator Guide

Welcome to the MT5 Trading Automation Platform! This guide explains how to manage accounts, control bots, enter manual orders, and configure risk guardrails.

---

## User Roles & Permissions

The platform supports Role-Based Access Control (RBAC):
- **Admin**: Full system access. Can add/remove MT5 account connections, update targets, parameters, and execute manual trades.
- **Trader**: Operational access. Can start/stop/pause bots, update settings, modify SL/TP, and execute manual trades. Cannot add/remove accounts.
- **Viewer**: Read-only access. Can inspect active trades, history stats, charts, and logs. All form inputs and control buttons are disabled.

---

## 1. Bot Control Panel

The Control Panel at the top of the **Dashboard** operates the Expert Advisor running inside MetaTrader 5:

- **Start Bot**: Activates the EA. The bot status changes to `RUNNING` in the database. The EA will begin monitoring markets and executing strategy rules.
- **Stop Bot**: Deactivates the EA. Status changes to `STOPPED`. The EA halts strategy scans and ignores automatic entry indicators.
- **Pause Bot**: Temporarily halts operations. Status changes to `PAUSED`.
- **Restart Bot**: Commands the EA to reload its internal metrics and reboot indicators.
- **Enable / Disable Auto Trading**: Switches the automated trading flag on the EA settings, which decides whether the local EMA crossover strategy should execute trades.

### Emergency Protections
- **Close All Trades**: Instantly closes every open position across all symbols on the terminal.
- **Close Buys**: Closes only long positions.
- **Close Sells**: Closes only short positions.

---

## 2. Trade Control Terminal

The **Trade Control** view splits between placing new orders and managing existing ones:

### Placing Orders
Use the **Manual Deal Ticket** on the left:
1. Enter the target **Asset Symbol** (e.g. `EURUSD`, `XAUUSD`, `GBPUSD`).
2. Set the **Lots Volume** (e.g. `0.1` lots).
3. Set optional **Stop Loss (SL)** and **Take Profit (TP)** price limits. Set to `0.0` to omit.
4. Set **Trailing Points** if you want the stop loss to adjust as price moves in your favor.
5. Click **Buy Market** or **Sell Market** to dispatch the execution command.

### Modifying Running Positions
In the **Active Positions** tab:
- Click the **Edit Icon** (pencil) on a trade row to adjust its SL/TP parameters dynamically. Click Save to dispatch.
- Click **Partial** to close a fraction of the lots (e.g. close `0.05` out of a `0.10` lot trade).
- Click the **Delete Icon** (trash bin) to trigger an immediate market close for that specific position.

---

## 3. Safeguards & Safeguards Guardrails

The **Bot Settings** view allows you to customize automated safety constraints:

- **Daily Profit Target**: If the sum of today's closed trade profits and current floating profits reaches this value, automated protections are triggered.
- **Daily Loss Protection Limit**: If today's losses exceed this value, protections are triggered.
- **Auto-Close Checkbox**: When checked, the system instantly sends close commands for all active trades upon target/limit hits.
- **Auto-Disable Checkbox**: When checked, the system disables the EA auto-trading flag, preventing the bot from initiating new positions.

---

## 4. Advanced Analytics & Log Auditing

- **Analytics Dashboard**: Consult cumulative equity growth, symbol performance breakdowns (to identify which symbols make the most profit), and strategy comparisons.
- **Console Log Monitor**: View connection signals, indicators setup logs, and risk warnings directly from the terminal console.
