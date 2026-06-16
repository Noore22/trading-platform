# Risk Assessment for MT5 Bot Integration

This document outlines the security, performance, and operational risks associated with integrating the **Best Gold Robot** into the algo trading platform.

---

## 1. Security Risks

> [!WARNING]
> **Decompiled Source Exposure**: The source file `Best Gold Robot.mq4` is a de-obfuscated/decompiled version of the Expert Advisor obtained from a third-party site (`ForexCracked.com`). 
> Decompiled code can contain malicious payloads, backdoors, or logic modifications that are difficult to scan. It is critical to run this EA inside a sandboxed Windows environment with restricted network access (i.e. only allowed to communicate with the broker's IP address and our FastAPI API gateway).

- **Dummy License Check**: The analysis shows that the license validation logic was bypassed by setting the validation flag to `true` unconditionally. While this allows unrestricted execution, it highlights that the code was tampered with, increasing the probability of security exploits.
- **REST Token Exposure**: The EA uses the `X-MT5-Token` HTTP header to authenticate with `/api/v1/mt5/sync`. This token is stored in cleartext in the `.set` preset files or input properties of the EA. If an attacker gains access to the MT5 terminal directory, they can steal the API token and issue unauthorized orders or commands to the backend database.

---

## 2. Performance Risks

- **Database Lock Contention (SQLite)**: The 1-second polling interval of `mt5_service.py` to synchronize open positions can cause high write load on the SQLite database. If SQLite is locked, API calls from the Next.js frontend will experience latency.
  - *Mitigation*: We must rely on the memory cache (`_mt5_cache` protected by `_cache_lock`) for UI reads and only write to the database when a state change is detected (e.g. ticket count changes or trade profit fluctuates beyond a minor threshold).
- **MT5 API Thread Blockage**: The standard `MetaTrader5` python package makes synchronous blocking calls. If the MT5 terminal hangs or suffers network lag, Python's thread-pool workers will block, delaying API response times.
  - *Mitigation*: The project currently uses `asyncio.to_thread` with `asyncio.wait_for` timeout protection, which is correct and should be maintained.

---

## 3. Trading & Logic Risks

> [!CAUTION]
> **Zone Recovery (Grid/Martingale)**: The bot includes an optional Zone Recovery mechanism (`UseZoneRecovery = true`). When price moves against a trade, it opens opposite hedged positions with an increased lot size multiplier (up to 5x lot size). 
> In a strong trending market without mean reversion (e.g. news events), this recovery system can escalate drawdown rapidly and lead to margin calls (account blow-up).

- **News Spikes**: The bot does not have an active news-filter API integration. If high-impact news occurs, support/resistance lines are easily broken, triggering false breakout stop entries.
- **Slippage on Breakouts**: Breakout orders (`BuyStop` / `SellStop`) are executed at the market price when the breakout level is breached. During high volatility, slippage can result in entries far worse than the calculated levels, severely reducing the win rate.

---

## 4. MT5 Compatibility Issues

- **MQL4 vs MQL5 Symbol Info**: The de-obfuscated source code is written in MQL4. MT5 uses MQL5, which handles order execution and tick properties differently (e.g., MQL5 uses `PositionGetInteger` and `HistoryDealGetDouble` rather than `OrderSelect`). The compiled binary `Best Gold Robot.ex5` is compiled for MT5 and should be utilized; the MQL4 source should only serve as a logic map.
- **Point Scaling Differences**: Gold (XAUUSD) has different tick sizes across brokers (e.g., 2 or 3 decimals). If the point value is not normalized (1 point = 0.01 or 0.1 depending on digits), the bot's default Stop Loss of `1300` points could execute as $13.00 instead of $130.00, leading to premature stopouts.

---

## 5. Required Environment Variables

To operate securely and maintain communication channels:

```ini
# MetaTrader 5 configuration
MT5_TERMINAL_PATH="C:\\Users\\PuthawalaNuareMoazza\\AppData\\Roaming\\MetaTrader 5\\terminal64.exe"

# Database path
DATABASE_URL="sqlite:///./backend/trading_platform.db"

# Notification settings
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# Security
SECRET_KEY="generate-a-secure-secret-key-for-jwt"
```
