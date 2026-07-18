import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime, timedelta
import time
import threading
import concurrent.futures
import logging
from typing import Optional, Dict, List, Any

from config.settings import settings

logger = logging.getLogger("MT5Service")


def mt5_call_with_timeout(func, *args, timeout=5.0, **kwargs):
    """Call an MT5 function with timeout to prevent hanging."""
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    try:
        future = executor.submit(func, *args, **kwargs)
        return future.result(timeout=timeout)
    except concurrent.futures.TimeoutError:
        logger.error(f"MT5 call {func.__name__} timed out after {timeout}s")
        return None
    except Exception as e:
        logger.error(f"MT5 call {func.__name__} error: {e}")
        return None
    finally:
        executor.shutdown(wait=False)


class MT5Service:
    def __init__(self):
        self.connected = False
        self.account_info = None
        self.terminal_info = None
        self._lock = threading.Lock()
        self._reconnect_thread: Optional[threading.Thread] = None
        self._running = False
        self._last_heartbeat: Optional[float] = None
        self.last_error: str = ""
        self.last_error_time: Optional[float] = None

    def initialize(self) -> bool:
        with self._lock:
            if self.connected:
                return True
            try:
                if settings.MT5_PATH:
                    initialized = mt5_call_with_timeout(
                        lambda: mt5.initialize(path=settings.MT5_PATH, timeout=10000),
                        timeout=10.0,
                    )
                else:
                    initialized = mt5_call_with_timeout(
                        lambda: mt5.initialize(timeout=10000),
                        timeout=10.0,
                    )

                if not initialized:
                    err = mt5.last_error()
                    self.last_error = f"MT5 initialize failed: {err}" if err else "MT5 initialize failed (timeout or no response)"
                    self.last_error_time = time.time()
                    logger.error(self.last_error)
                    self.connected = False
                    return False

                if settings.MT5_LOGIN and settings.MT5_PASSWORD:
                    login_result = mt5_call_with_timeout(
                        lambda: mt5.login(
                            login=settings.MT5_LOGIN,
                            password=settings.MT5_PASSWORD,
                            server=settings.MT5_SERVER,
                        ),
                        timeout=10.0,
                    )
                    if not login_result:
                        err = mt5.last_error()
                        self.last_error = f"MT5 login failed: {err}" if err else "MT5 login failed (invalid credentials or server)"
                        self.last_error_time = time.time()
                        logger.error(self.last_error)
                        mt5_call_with_timeout(mt5.shutdown, timeout=3.0)
                        self.connected = False
                        return False

                self.account_info = mt5_call_with_timeout(mt5.account_info, timeout=5.0)
                self.terminal_info = mt5_call_with_timeout(mt5.terminal_info, timeout=5.0)
                self.connected = self.account_info is not None
                self._last_heartbeat = time.time()
                if self.connected and self.account_info:
                    self.last_error = ""
                    logger.info(
                        f"MT5 Connected: {self.account_info.login} @ {self.account_info.server}"
                    )
                else:
                    self.last_error = "MT5 initialize succeeded but no account info returned"
                    self.last_error_time = time.time()
                    logger.warning(self.last_error)
                return self.connected
            except Exception as e:
                self.last_error = f"MT5 initialization error: {e}"
                self.last_error_time = time.time()
                logger.error(self.last_error)
                self.connected = False
                return False

    def check_connection(self) -> bool:
        if not self.connected:
            return False
        try:
            info = mt5_call_with_timeout(mt5.terminal_info, timeout=5.0)
            if info is None:
                self.connected = False
                return False
            self.terminal_info = info
            self._last_heartbeat = time.time()
            return True
        except Exception:
            self.connected = False
            return False

    def start_auto_reconnect(self):
        if self._reconnect_thread and self._reconnect_thread.is_alive():
            return
        self._running = True
        self._reconnect_thread = threading.Thread(target=self._reconnect_loop, daemon=True)
        self._reconnect_thread.start()

    def stop_auto_reconnect(self):
        self._running = False

    def _reconnect_loop(self):
        while self._running:
            time.sleep(5)
            if not self.check_connection():
                logger.warning("MT5 disconnected, attempting reconnect...")
                mt5_call_with_timeout(mt5.shutdown, timeout=3.0)
                time.sleep(2)
                self.initialize()

    def shutdown(self):
        self._running = False
        self.connected = False
        try:
            mt5_call_with_timeout(mt5.shutdown, timeout=3.0)
        except Exception:
            pass

    def get_account_summary(self) -> Dict:
        if not self.connected:
            return {"connected": False, "error": "MT5 not connected"}
        with self._lock:
            info = mt5.account_info()
            if info is None:
                return {"connected": False, "error": "MT5 unavailable"}
            positions = self.get_open_positions()
            today_profit = 0.0
            week_profit = 0.0
            month_profit = 0.0
            now = datetime.now()
            try:
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                week_start = today_start - timedelta(days=today_start.weekday())
                month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                today_deals = mt5.history_deals_get(today_start, now)
                week_deals = mt5.history_deals_get(week_start, now)
                month_deals = mt5.history_deals_get(month_start, now)
                if today_deals:
                    today_profit = sum(d.profit for d in today_deals)
                if week_deals:
                    week_profit = sum(d.profit for d in week_deals)
                if month_deals:
                    month_profit = sum(d.profit for d in month_deals)
            except Exception:
                pass
            drawdown = 0.0
            if info.balance > 0:
                drawdown = ((info.balance - info.equity) / info.balance) * 100
            return {
                "connected": True,
                "balance": info.balance,
                "equity": info.equity,
                "profit": info.profit,
                "margin": info.margin,
                "free_margin": info.margin_free,
                "margin_level": info.margin_level if hasattr(info, 'margin_level') else (
                    (info.equity / info.margin * 100) if info.margin > 0 else 0
                ),
                "leverage": info.leverage if hasattr(info, 'leverage') else 100,
                "currency": info.currency if hasattr(info, 'currency') else "USD",
                "server": info.server if hasattr(info, 'server') else "",
                "account_number": info.login,
                "broker": info.company if hasattr(info, 'company') else "",
                "trade_allowed": info.trade_allowed if hasattr(info, 'trade_allowed') else False,
                "open_positions": len(positions),
                "floating_profit": sum(p.get("profit", 0) for p in positions),
                "daily_profit": today_profit,
                "weekly_profit": week_profit,
                "monthly_profit": month_profit,
                "drawdown": drawdown,
            }

    def get_positions_summary(self) -> Dict:
        positions = self.get_open_positions()
        total_profit = sum(p.get("profit", 0) for p in positions)
        total_volume = sum(p.get("volume", 0) for p in positions)
        buy_positions = [p for p in positions if p.get("type") == "BUY"]
        sell_positions = [p for p in positions if p.get("type") == "SELL"]
        return {
            "total_positions": len(positions),
            "total_profit": total_profit,
            "total_volume": total_volume,
            "buy_count": len(buy_positions),
            "sell_count": len(sell_positions),
            "buy_profit": sum(p.get("profit", 0) for p in buy_positions),
            "sell_profit": sum(p.get("profit", 0) for p in sell_positions),
        }

    def get_symbol_info(self, symbol: str) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            info = mt5.symbol_info(symbol)
            if info is None:
                return None
            tick = mt5.symbol_info_tick(symbol)
            return {
                "symbol": symbol,
                "bid": tick.bid if tick else 0,
                "ask": tick.ask if tick else 0,
                "spread": info.spread,
                "digits": info.digits,
                "point": info.point,
                "trade_mode": info.trade_mode,
                "volume_min": info.volume_min,
                "volume_max": info.volume_max,
                "volume_step": info.volume_step,
                "session": {
                    "trade": (info.session_buy, info.session_sell)
                },
            }

    def get_symbols(self) -> List[Dict]:
        if not self.connected:
            return []
        with self._lock:
            symbols = mt5.symbols_get()
            if symbols is None:
                return []
            result = []
            for s in symbols:
                if s.visible:
                    tick = mt5.symbol_info_tick(s.name)
                    result.append({
                        "symbol": s.name,
                        "bid": tick.bid if tick else 0,
                        "ask": tick.ask if tick else 0,
                        "spread": s.spread,
                        "digits": s.digits,
                        "volume_min": s.volume_min,
                        "volume_max": s.volume_max,
                        "volume_step": s.volume_step,
                        "trade_mode": s.trade_mode,
                        "path": s.path,
                        "currency_base": s.currency_base if hasattr(s, 'currency_base') else "",
                        "currency_profit": s.currency_profit if hasattr(s, 'currency_profit') else "",
                    })
            return result

    def get_tick(self, symbol: str) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            tick = mt5.symbol_info_tick(symbol)
            if tick is None:
                return None
            return {
                "symbol": symbol,
                "bid": tick.bid,
                "ask": tick.ask,
                "last": tick.last,
                "volume": tick.volume,
                "time": tick.time,
                "time_msc": tick.time_msc,
                "flags": tick.flags,
            }

    def get_rates(self, symbol: str, timeframe: str = "M1", count: int = 100) -> List[Dict]:
        tf_map = {
            "M1": mt5.TIMEFRAME_M1, "M2": mt5.TIMEFRAME_M2, "M3": mt5.TIMEFRAME_M3,
            "M4": mt5.TIMEFRAME_M4, "M5": mt5.TIMEFRAME_M5, "M6": mt5.TIMEFRAME_M6,
            "M10": mt5.TIMEFRAME_M10, "M12": mt5.TIMEFRAME_M12, "M15": mt5.TIMEFRAME_M15,
            "M20": mt5.TIMEFRAME_M20, "M30": mt5.TIMEFRAME_M30,
            "H1": mt5.TIMEFRAME_H1, "H2": mt5.TIMEFRAME_H2, "H3": mt5.TIMEFRAME_H3,
            "H4": mt5.TIMEFRAME_H4, "H6": mt5.TIMEFRAME_H6, "H8": mt5.TIMEFRAME_H8,
            "H12": mt5.TIMEFRAME_H12,
            "D1": mt5.TIMEFRAME_D1, "W1": mt5.TIMEFRAME_W1, "MN1": mt5.TIMEFRAME_MN1,
            "1m": mt5.TIMEFRAME_M1, "5m": mt5.TIMEFRAME_M5, "15m": mt5.TIMEFRAME_M15,
            "1h": mt5.TIMEFRAME_H1, "4h": mt5.TIMEFRAME_H4, "1d": mt5.TIMEFRAME_D1,
            "1w": mt5.TIMEFRAME_W1, "1M": mt5.TIMEFRAME_MN1,
        }
        mt5_tf = tf_map.get(timeframe.upper(), mt5.TIMEFRAME_M1)
        if not self.connected:
            return []
        with self._lock:
            rates = mt5.copy_rates_from_pos(symbol, mt5_tf, 0, count)
            if rates is None:
                return []
            result = []
            for r in rates:
                result.append({
                    "time": r.time,
                    "open": r.open,
                    "high": r.high,
                    "low": r.low,
                    "close": r.close,
                    "tick_volume": r.tick_volume,
                    "spread": r.spread,
                    "real_volume": r.real_volume,
                })
            return result

    def get_open_positions(self) -> List[Dict]:
        if not self.connected:
            return []
        with self._lock:
            positions = mt5.positions_get()
            if positions is None:
                return []
            return [
                {
                    "ticket": p.ticket,
                    "symbol": p.symbol,
                    "type": "BUY" if p.type == mt5.POSITION_TYPE_BUY else "SELL",
                    "volume": p.volume,
                    "open_price": p.price_open,
                    "current_price": p.price_current,
                    "sl": p.sl,
                    "tp": p.tp,
                    "profit": p.profit,
                    "swap": p.swap,
                    "commission": p.commission,
                    "open_time": datetime.fromtimestamp(p.time).isoformat() if p.time else None,
                    "magic": p.magic,
                    "comment": p.comment,
                    "identifier": p.identifier,
                }
                for p in positions
            ]

    def get_pending_orders(self) -> List[Dict]:
        if not self.connected:
            return []
        with self._lock:
            orders = mt5.orders_get()
            if orders is None:
                return []
            type_map = {
                mt5.ORDER_TYPE_BUY_LIMIT: ("BUY", "LIMIT"),
                mt5.ORDER_TYPE_SELL_LIMIT: ("SELL", "LIMIT"),
                mt5.ORDER_TYPE_BUY_STOP: ("BUY", "STOP"),
                mt5.ORDER_TYPE_SELL_STOP: ("SELL", "STOP"),
                mt5.ORDER_TYPE_BUY_STOP_LIMIT: ("BUY", "STOP_LIMIT"),
                mt5.ORDER_TYPE_SELL_STOP_LIMIT: ("SELL", "STOP_LIMIT"),
            }
            return [
                {
                    "ticket": o.ticket,
                    "symbol": o.symbol,
                    "type": type_map.get(o.type, ("UNKNOWN", "UNKNOWN"))[0],
                    "type_name": type_map.get(o.type, ("UNKNOWN", "UNKNOWN"))[1],
                    "volume": o.volume,
                    "price": o.price_open,
                    "sl": o.sl,
                    "tp": o.tp,
                    "open_time": datetime.fromtimestamp(o.time_setup).isoformat() if o.time_setup else None,
                    "expiration": datetime.fromtimestamp(o.time_expiration).isoformat() if o.time_expiration and o.time_expiration > 0 else None,
                    "comment": o.comment,
                    "magic": o.magic,
                }
                for o in orders
            ]

    def get_trade_history(self, days_back: int = 7) -> List[Dict]:
        if not self.connected:
            return []
        now = datetime.now()
        from_date = now - timedelta(days=days_back)
        with self._lock:
            deals = mt5.history_deals_get(from_date, now)
            if deals is None:
                return []
            return [
                {
                    "ticket": d.ticket,
                    "symbol": d.symbol,
                    "type": "BUY" if d.type == mt5.DEAL_TYPE_BUY else "SELL",
                    "volume": d.volume,
                    "price": d.price,
                    "profit": d.profit,
                    "commission": d.commission,
                    "swap": d.swap,
                    "close_time": datetime.fromtimestamp(d.time).isoformat() if d.time else None,
                    "comment": d.comment,
                    "magic": d.magic,
                    "entry": "ENTRY" if d.entry == mt5.DEAL_ENTRY_IN else (
                        "EXIT" if d.entry == mt5.DEAL_ENTRY_OUT else "REVERSE"
                    ),
                }
                for d in deals
            ]

    def get_history_orders(self, days_back: int = 7) -> List[Dict]:
        if not self.connected:
            return []
        now = datetime.now()
        from_date = now - timedelta(days=days_back)
        with self._lock:
            orders = mt5.history_orders_get(from_date, now)
            if orders is None:
                return []
            return [
                {
                    "ticket": o.ticket,
                    "symbol": o.symbol,
                    "type": "BUY" if o.type in [
                        mt5.ORDER_TYPE_BUY, mt5.ORDER_TYPE_BUY_LIMIT,
                        mt5.ORDER_TYPE_BUY_STOP, mt5.ORDER_TYPE_BUY_STOP_LIMIT
                    ] else "SELL",
                    "volume": o.volume,
                    "price": o.price_open,
                    "sl": o.sl,
                    "tp": o.tp,
                    "profit": o.profit if hasattr(o, 'profit') else 0,
                    "open_time": datetime.fromtimestamp(o.time_setup).isoformat() if o.time_setup else None,
                    "close_time": datetime.fromtimestamp(o.time_done).isoformat() if o.time_done and o.time_done > 0 else None,
                    "comment": o.comment,
                    "magic": o.magic,
                    "state": o.state,
                }
                for o in orders
            ]

    def market_order(self, symbol: str, order_type: int, volume: float,
                     sl: float = 0.0, tp: float = 0.0, comment: str = "MT5 Trade",
                     magic: int = 234000, deviation: int = 20) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            tick = mt5.symbol_info_tick(symbol)
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
                "deviation": deviation,
                "magic": magic,
                "comment": comment,
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "comment": result.comment,
                "order": result.order,
                "deal": result.deal,
                "volume": result.volume,
                "price": result.price,
                "bid": result.bid,
                "ask": result.ask,
                "request_id": result.request_id if hasattr(result, 'request_id') else 0,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def buy(self, symbol: str, volume: float, sl: float = 0.0, tp: float = 0.0,
            comment: str = "MT5 Buy", magic: int = 234000) -> Optional[Dict]:
        return self.market_order(symbol, mt5.ORDER_TYPE_BUY, volume, sl, tp, comment, magic)

    def sell(self, symbol: str, volume: float, sl: float = 0.0, tp: float = 0.0,
             comment: str = "MT5 Sell", magic: int = 234000) -> Optional[Dict]:
        return self.market_order(symbol, mt5.ORDER_TYPE_SELL, volume, sl, tp, comment, magic)

    def close_position(self, ticket: int) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            positions = mt5.positions_get(ticket=ticket)
            if not positions:
                return None
            pos = positions[0]
            order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
            price = mt5.symbol_info_tick(pos.symbol).bid if order_type == mt5.ORDER_TYPE_SELL else mt5.symbol_info_tick(pos.symbol).ask
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": pos.symbol,
                "volume": pos.volume,
                "type": order_type,
                "position": ticket,
                "price": price,
                "deviation": 20,
                "magic": pos.magic,
                "comment": "Close",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "deal": result.deal,
                "price": result.price,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def close_all_positions(self) -> List[Dict]:
        positions = self.get_open_positions()
        results = []
        for p in positions:
            result = self.close_position(p["ticket"])
            results.append({
                "ticket": p["ticket"],
                "symbol": p["symbol"],
                "result": result,
            })
        return results

    def modify_position(self, ticket: int, sl: float = 0.0, tp: float = 0.0) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            positions = mt5.positions_get(ticket=ticket)
            if not positions:
                return None
            pos = positions[0]
            request = {
                "action": mt5.TRADE_ACTION_SLTP,
                "symbol": pos.symbol,
                "position": ticket,
                "sl": float(sl),
                "tp": float(tp),
                "magic": pos.magic,
                "comment": "Modify",
            }
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "deal": result.deal,
                "price": result.price,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def modify_position_sl(self, ticket: int, sl: float) -> Optional[Dict]:
        return self.modify_position(ticket, sl=sl)

    def modify_position_tp(self, ticket: int, tp: float) -> Optional[Dict]:
        return self.modify_position(ticket, tp=tp)

    def partial_close(self, ticket: int, volume: float) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            positions = mt5.positions_get(ticket=ticket)
            if not positions:
                return None
            pos = positions[0]
            if volume >= pos.volume:
                return self.close_position(ticket)
            order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
            price = mt5.symbol_info_tick(pos.symbol).bid if order_type == mt5.ORDER_TYPE_SELL else mt5.symbol_info_tick(pos.symbol).ask
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": pos.symbol,
                "volume": float(volume),
                "type": order_type,
                "position": ticket,
                "price": price,
                "deviation": 20,
                "magic": pos.magic,
                "comment": "Partial Close",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "deal": result.deal,
                "volume": result.volume,
                "price": result.price,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def place_pending_order(self, symbol: str, order_type: int, volume: float,
                            price: float, sl: float = 0.0, tp: float = 0.0,
                            comment: str = "Pending Order", magic: int = 234000,
                            expiration: Optional[datetime] = None) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            request = {
                "action": mt5.TRADE_ACTION_PENDING,
                "symbol": symbol,
                "volume": float(volume),
                "type": order_type,
                "price": price,
                "sl": float(sl),
                "tp": float(tp),
                "deviation": 20,
                "magic": magic,
                "comment": comment,
                "type_time": mt5.ORDER_TIME_GTC if not expiration else mt5.ORDER_TIME_SPECIFIED,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            if expiration:
                request["expiration"] = expiration
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "deal": result.deal,
                "volume": result.volume,
                "price": result.price,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def cancel_order(self, ticket: int) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            request = {
                "action": mt5.TRADE_ACTION_REMOVE,
                "order": ticket,
                "comment": "Cancel Order",
            }
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def modify_order(self, ticket: int, price: float, sl: float = 0.0, tp: float = 0.0,
                     volume: Optional[float] = None) -> Optional[Dict]:
        if not self.connected:
            return None
        with self._lock:
            request = {
                "action": mt5.TRADE_ACTION_MODIFY,
                "order": ticket,
                "price": price,
                "sl": float(sl),
                "tp": float(tp),
                "comment": "Modify Order",
            }
            if volume is not None:
                request["volume"] = float(volume)
            result = mt5.order_send(request)
            if result is None:
                return None
            return {
                "retcode": result.retcode,
                "order": result.order,
                "error": mt5.last_error() if result.retcode != mt5.TRADE_RETCODE_DONE else None,
            }

    def get_account_summary_for_dashboard(self) -> Dict:
        summary = self.get_account_summary()
        if not summary.get("connected"):
            return summary
        positions_summary = self.get_positions_summary()
        summary.update(positions_summary)
        return summary


mt5_service = MT5Service()
