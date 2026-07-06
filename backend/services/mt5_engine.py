import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime
import time
import threading
import concurrent.futures
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MT5_STATUS")

from database.session import SessionLocal
from database.models import Trade

def mt5_call_with_timeout(func, *args, timeout=2.0, **kwargs):
    start = time.time()
    func_name = func.__name__
    logger.info(f"[MT5 STATUS] {func_name} start")
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args, **kwargs)
            result = future.result(timeout=timeout)
            logger.info(f"[MT5 STATUS] {func_name} end - took {time.time()-start:.2f}s")
            return result
    except concurrent.futures.TimeoutError:
        logger.error(f"[MT5 STATUS] {func_name} timed out after {time.time()-start:.2f}s")
        return None
    except Exception as e:
        logger.error(f"[MT5 STATUS] {func_name} error: {e}")
        return None

class MT5Engine:
    def __init__(self):
        self.connected = False
        self.account_info = None
        self.cached_account_summary = None
        self.lock = threading.Lock()

    def initialize(self):
        with self.lock:
            # Initialize MT5 connection
            result = mt5_call_with_timeout(mt5.initialize)
            if not result:
                logger.error("initialize() failed or timed out")
                self.connected = False
                return False
                
            self.connected = True
            
            # Optionally perform mt5.login() if you have credentials
            # login_result = mt5_call_with_timeout(mt5.login, login, password, server)
            
            self.account_info = mt5_call_with_timeout(mt5.account_info)
            logger.info("MT5 Connected Successfully!")
            return True
        
    def check_connection(self):
        with self.lock:
            info = mt5_call_with_timeout(mt5.terminal_info)
            
        if not self.connected or info is None:
            self.connected = False
            # Don't infinite loop reconnect here, let a background worker handle it
            
        return self.connected

    def get_terminal_info(self):
        if not self.connected:
            return None
        with self.lock:
            return mt5_call_with_timeout(mt5.terminal_info)

    def get_account_summary(self):
        if not self.connected:
            return {"connected": False, "error": "MT5 unavailable"}
        
        with self.lock:
            info = mt5_call_with_timeout(mt5.account_info)
            
        if info is None:
            if self.cached_account_summary:
                return self.cached_account_summary
            return {"connected": False, "error": "MT5 unavailable"}
            
        summary = {
            "connected": True,
            "balance": info.balance,
            "equity": info.equity,
            "profit": info.profit,
            "margin": info.margin,
            "free_margin": info.margin_free,
            "leverage": getattr(info, 'leverage', 100),
            "currency": getattr(info, 'currency', 'USD'),
            "open_positions": len(self.get_open_positions())
        }
        self.cached_account_summary = summary
        return summary

    def get_live_tick(self, symbol):
        if not self.connected:
            return None
        with self.lock:
            tick = mt5_call_with_timeout(mt5.symbol_info_tick, symbol)
            
        if tick is None:
            return None
            
        return {
            "symbol": symbol,
            "bid": tick.bid,
            "ask": tick.ask,
            "last": tick.last,
            "time": tick.time
        }

    def open_trade(self, symbol, order_type, volume, sl=0.0, tp=0.0):
        if not self.connected:
            return None

        with self.lock:
            tick = mt5_call_with_timeout(mt5.symbol_info_tick, symbol)
            if tick is None:
                return None
            price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid
            
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": float(volume),
                "type": order_type,
                "price": price,
                "sl": float(sl),
                "tp": float(tp),
                "deviation": 20,
                "magic": 234000,
                "comment": "Auto-Trade",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            
            result = mt5_call_with_timeout(mt5.order_send, request)
            
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Order failed or timed out: {result.retcode if result else 'timeout'}")
            return None
            
        # Log to database
        db = SessionLocal()
        try:
            new_trade = Trade(
                symbol=symbol,
                type="BUY" if order_type == mt5.ORDER_TYPE_BUY else "SELL",
                volume=float(volume),
                profit=0.0,
                status="OPEN"
            )
            db.add(new_trade)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to log trade to DB: {e}")
        finally:
            db.close()
            
        return result

    def get_open_positions(self):
        if not self.connected:
            return []
            
        with self.lock:
            positions = mt5_call_with_timeout(mt5.positions_get)
            
        if positions is None:
            return []
            
        return [
            {
                "ticket": p.ticket,
                "symbol": p.symbol,
                "type": "BUY" if p.type == 0 else "SELL",
                "volume": p.volume,
                "open_price": p.price_open,
                "sl": p.sl,
                "tp": p.tp,
                "profit": p.profit
            }
            for p in positions
        ]

    def get_pending_orders(self):
        if not self.connected:
            return []
        with self.lock:
            orders = mt5_call_with_timeout(mt5.orders_get)
        if orders is None:
            return []
        return [
            {
                "ticket": o.ticket,
                "symbol": o.symbol,
                "type": "BUY" if o.type == 0 else "SELL",
                "type_name": "LIMIT" if o.type in [2, 4] else "STOP",
                "volume": o.volume,
                "price": o.price_open,
                "sl": o.sl,
                "tp": o.tp,
                "open_time": datetime.fromtimestamp(o.time_setup).isoformat() if o.time_setup else None,
                "expiration": datetime.fromtimestamp(o.time_expiration).isoformat() if o.time_expiration and o.time_expiration > 0 else None,
                "comment": o.comment,
            }
            for o in orders
        ]

    def get_trade_history(self, days_back=7):
        if not self.connected:
            return []
        from datetime import timedelta
        now = datetime.now()
        from_date = now - timedelta(days=days_back)
        with self.lock:
            history = mt5_call_with_timeout(mt5.history_deals_get, from_date, now)
        if history is None:
            return []
        return [
            {
                "ticket": d.ticket,
                "symbol": d.symbol,
                "type": "BUY" if d.type == 0 else "SELL",
                "volume": d.volume,
                "price": d.price,
                "profit": d.profit,
                "close_time": datetime.fromtimestamp(d.time).isoformat() if d.time else None,
                "comment": d.comment,
            }
            for d in history
        ]

    def manage_trailing_stops(self, trail_pips=15):
        """Legacy method for algo engine compatibility."""
        if not self.connected:
            return
        with self.lock:
            positions = mt5_call_with_timeout(mt5.positions_get)
            if positions is None:
                return
            for pos in positions:
                logger.info(f"Trailing stop check for ticket {pos.ticket}")


mt5_engine = MT5Engine()
