import asyncio
import json
import logging
import numpy as np
from typing import Dict, Set, List, Optional
from datetime import datetime

from fastapi import WebSocket

from config.settings import settings
from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD",
           "USDCAD", "NZDUSD", "EURJPY", "GBPJPY", "XAUUSD",
           "XAGUSD", "BTCUSD", "ETHUSD", "NAS100", "US30",
           "GER40", "SPX500"]


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0
    deltas = np.diff(prices[-period - 1:])
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gains)
    avg_loss = np.mean(losses)
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def calculate_macd(prices: List[float]) -> Dict:
    if len(prices) < 26:
        return {"macd": 0.0, "signal": 0.0, "histogram": 0.0}
    arr = np.array(prices[-26:])
    ema12 = np.mean(arr[-12:])
    ema26 = np.mean(arr)
    macd_val = ema12 - ema26
    signal = np.mean([macd_val])
    histogram = macd_val - signal
    return {"macd": float(macd_val), "signal": float(signal), "histogram": float(histogram)}


def calculate_ema(prices: List[float], period: int = 9) -> float:
    if len(prices) < period:
        return float(np.mean(prices)) if prices else 0.0
    return float(np.mean(prices[-period:]))


def calculate_atr(rates: List[Dict], period: int = 14) -> float:
    if len(rates) < period + 1:
        return 0.0
    tr_values = []
    for i in range(1, len(rates)):
        high = rates[i]["high"]
        low = rates[i]["low"]
        prev_close = rates[i - 1]["close"]
        tr = max(high - low, abs(high - prev_close), abs(low - prev_close))
        tr_values.append(tr)
    if len(tr_values) < period:
        return float(np.mean(tr_values)) if tr_values else 0.0
    return float(np.mean(tr_values[-period:]))


def compute_scanner_data() -> List[Dict]:
    result = []
    for sym in SYMBOLS:
        try:
            tick = mt5_service.get_tick(sym)
            if not tick:
                continue
            rates = mt5_service.get_rates(sym, "H1", 30)
            close_prices = [r["close"] for r in rates] if rates else []

            rsi_val = calculate_rsi(close_prices, 14) if close_prices else 50.0
            macd_data = calculate_macd(close_prices) if close_prices else {"macd": 0.0, "signal": 0.0, "histogram": 0.0}
            ema_val = calculate_ema(close_prices, 9) if close_prices else 0.0
            atr_val = calculate_atr(rates, 14) if rates else 0.0

            signal = "NEUTRAL"
            confidence = 0
            if rsi_val > 70:
                signal = "SELL"
                confidence = int(min((rsi_val - 70) * 3, 95))
            elif rsi_val < 30:
                signal = "BUY"
                confidence = int(min((30 - rsi_val) * 3, 95))

            trend = "BULLISH" if close_prices and close_prices[-1] > close_prices[0] else "BEARISH"
            spread = abs(tick.get("ask", 0) - tick.get("bid", 0))

            result.append({
                "symbol": sym,
                "bid": tick.get("bid", 0),
                "ask": tick.get("ask", 0),
                "last": tick.get("last", 0),
                "volume": tick.get("volume", 0),
                "spread": round(spread, 5),
                "signal": signal,
                "confidence": confidence,
                "trend": trend,
                "atr": round(atr_val, 5),
                "rsi": round(rsi_val, 1),
                "ema": round(ema_val, 5),
                "macd": round(macd_data.get("macd", 0), 5),
                "macd_signal": round(macd_data.get("signal", 0), 5),
                "macd_histogram": round(macd_data.get("histogram", 0), 5),
            })
        except Exception as e:
            logger.error(f"Scanner error for {sym}: {e}")
            continue
    return result


def compute_market_session() -> str:
    now = datetime.utcnow()
    hour = now.hour
    minute = now.minute
    current_minutes = hour * 60 + minute

    tokyo_open = 0
    tokyo_close = 9 * 60
    london_open = 7 * 60 + 60
    london_close = 16 * 60
    us_open = 13 * 60
    us_close = 22 * 60

    if tokyo_open <= current_minutes < tokyo_close:
        return "Tokyo"
    elif london_open <= current_minutes < london_close:
        return "London"
    elif us_open <= current_minutes < us_close:
        return "New York"
    else:
        return "Closed"


class WebSocketManager:
    def __init__(self):
        self._connections: Set[WebSocket] = set()
        self._running = False

    async def start(self, loop: asyncio.AbstractEventLoop):
        if self._running:
            return
        self._running = True
        loop.create_task(self._broadcast_loop())
        loop.create_task(self._heartbeat_loop())
        logger.info("WebSocket Manager started")

    async def stop(self):
        self._running = False
        for ws in list(self._connections):
            try:
                await ws.close()
            except Exception:
                pass
        self._connections.clear()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._connections.add(websocket)
        summary = mt5_service.get_account_summary()
        ticks = {}
        for sym in SYMBOLS:
            tick = mt5_service.get_tick(sym)
            if tick:
                ticks[sym] = tick
        candles = {}
        for sym in SYMBOLS:
            rates = mt5_service.get_rates(sym, "M5", 50)
            if rates:
                candles[sym] = rates
        await self._send(websocket, {
            "type": "connection_established",
            "data": {
                "timestamp": datetime.utcnow().isoformat(),
                "server": settings.APP_NAME,
                "mt5": summary,
                "market_ticks": ticks,
                "candles": candles,
            }
        })

    def disconnect(self, websocket: WebSocket):
        self._connections.discard(websocket)

    async def _send(self, websocket: WebSocket, message: Dict):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: Dict):
        disconnected = set()
        for ws in list(self._connections):
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.add(ws)
        for ws in disconnected:
            self.disconnect(ws)

    async def handle_message(self, websocket: WebSocket, message: str):
        try:
            data = json.loads(message)
            action = data.get("action", "")
            if action == "ping":
                await self._send(websocket, {"type": "pong", "data": {}})
            elif action == "subscribe":
                symbols = data.get("symbols", [])
                await self._send(websocket, {
                    "type": "subscribed",
                    "data": {"symbols": symbols}
                })
        except json.JSONDecodeError:
            pass

    async def _heartbeat_loop(self):
        while self._running:
            await asyncio.sleep(settings.WS_HEARTBEAT_INTERVAL)
            await self.broadcast({
                "type": "heartbeat",
                "data": {"timestamp": datetime.utcnow().isoformat()}
            })

    async def _broadcast_loop(self):
        while self._running:
            await asyncio.sleep(1)
            try:
                summary = mt5_service.get_account_summary()
                positions = mt5_service.get_open_positions()
                orders = mt5_service.get_pending_orders()
                ticks = {}
                candles = {}
                for sym in SYMBOLS:
                    tick = mt5_service.get_tick(sym)
                    if tick:
                        ticks[sym] = tick
                    rates = mt5_service.get_rates(sym, "M5", 3)
                    if rates:
                        candles[sym] = rates
                scanner = compute_scanner_data()
                market_session = compute_market_session()
                ai_signals = {}
                ai_status = {"initialized": False}
                try:
                    from services.ai.coordinator import ai_coordinator
                    ai_signals = {}
                    for sym in SYMBOLS:
                        analysis = ai_coordinator.get_analysis(sym)
                        if analysis and analysis.get("status") == "success":
                            ai_signals[sym] = analysis.get("signal", {})
                    ai_status = ai_coordinator.get_agent_status()
                except Exception:
                    pass
                dashboard_data = {
                    "type": "dashboard_update",
                    "data": {
                        "mt5": summary,
                        "market_ticks": ticks,
                        "candles": candles,
                        "positions": positions,
                        "orders": orders,
                        "scanner": scanner,
                        "market_session": market_session,
                        "ai_signals": ai_signals,
                        "ai_status": ai_status,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                }
                await self.broadcast(dashboard_data)
            except Exception as e:
                logger.error(f"Broadcast loop error: {e}")

    async def broadcast_notification(self, level: str, title: str, message: str):
        await self.broadcast({
            "type": "notification",
            "data": {
                "level": level,
                "title": title,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            }
        })


ws_manager = WebSocketManager()
