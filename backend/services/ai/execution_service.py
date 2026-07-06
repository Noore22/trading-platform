import logging
from datetime import datetime
from typing import Optional

from services.mt5_service import mt5_service
from config.settings import settings

logger = logging.getLogger(__name__)

class ExecutionService:
    def __init__(self):
        self._execution_log = {}
        self._daily_trades = 0
        self._last_reset_date = datetime.now().date()

    def _check_daily_limit(self) -> bool:
        today = datetime.now().date()
        if today != self._last_reset_date:
            self._daily_trades = 0
            self._last_reset_date = today
        return self._daily_trades < settings.AI_DAILY_TRADE_LIMIT

    def execute_signal(self, symbol: str, signal: str, confidence: float,
                       volume: Optional[float] = None, signal_data: Optional[dict] = None) -> dict:
        if not mt5_service.connected:
            return {"status": "error", "error": "MT5 not connected"}
        if not self._check_daily_limit():
            return {"status": "error", "error": "Daily trade limit reached"}
        if signal == "HOLD":
            return {"status": "skipped", "reason": "Signal is HOLD"}
        if confidence < 60:
            return {"status": "skipped", "reason": f"Confidence {confidence}% below 60% threshold"}

        try:
            account = mt5_service.get_account_summary()
            balance = account.get("balance", 0)
            risk_percent = settings.AI_MAX_POSITION_RISK_PERCENT
            tick = mt5_service.get_tick(symbol)
            if not tick:
                return {"status": "error", "error": f"Cannot get price for {symbol}"}

            if volume is None:
                risk_amount = balance * (risk_percent / 100.0)
                price = tick.ask if signal.upper() == "BUY" else tick.bid
                volume = round(risk_amount / (price * 100000), 2)
                volume = max(0.01, min(volume, 10.0))

            if signal.upper() == "BUY":
                result = mt5_service.buy(symbol, volume)
            elif signal.upper() == "SELL":
                result = mt5_service.sell(symbol, volume)
            else:
                return {"status": "skipped", "reason": f"Unknown signal: {signal}"}

            if result and result.get("retcode") == 10009:
                self._daily_trades += 1
                order = result.get("order", 0)
                self._log_execution(symbol, signal, volume, order, result)
                return {
                    "status": "executed",
                    "symbol": symbol,
                    "signal": signal,
                    "volume": volume,
                    "order": order,
                    "price": result.get("price", 0),
                    "deal": result.get("deal", 0),
                }
            else:
                error_msg = result.get("comment", "Unknown error") if result else "Order failed"
                return {"status": "error", "error": error_msg}
        except Exception as e:
            logger.error(f"Execution error for {symbol}: {e}")
            return {"status": "error", "error": str(e)}

    def _log_execution(self, symbol: str, signal: str, volume: float, order: int, result: dict):
        try:
            from database.session import SessionLocal
            from database.models import AIDecision
            db = SessionLocal()
            decision = AIDecision(
                symbol=symbol,
                decision=signal,
                action="BUY" if signal.upper() == "BUY" else "SELL",
                volume=volume,
                executed=True,
                execution_ticket=order,
                execution_price=result.get("price", 0),
                execution_result=str(result),
            )
            db.add(decision)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Failed to log execution: {e}")

    def get_execution_history(self, symbol: Optional[str] = None) -> list:
        try:
            from database.session import SessionLocal
            from database.models import AIDecision
            db = SessionLocal()
            query = db.query(AIDecision)
            if symbol:
                query = query.filter(AIDecision.symbol == symbol)
            results = query.order_by(AIDecision.created_at.desc()).limit(100).all()
            db.close()
            return [
                {
                    "id": r.id,
                    "symbol": r.symbol,
                    "decision": r.decision,
                    "action": r.action,
                    "volume": r.volume,
                    "entry_price": r.entry_price,
                    "executed": r.executed,
                    "execution_ticket": r.execution_ticket,
                    "execution_price": r.execution_price,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in results
            ]
        except Exception as e:
            logger.error(f"Failed to get execution history: {e}")
            return []

execution_service = ExecutionService()