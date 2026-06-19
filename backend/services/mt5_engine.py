import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime
import time
import threading

from database.session import SessionLocal
from database.models import TradeHistory

class MT5Engine:
    def __init__(self):
        self.connected = False
        self.account_info = None
        self.lock = threading.Lock()

    def initialize(self):
        with self.lock:
            # Initialize MT5 connection
            if not mt5.initialize():
                print("initialize() failed, error code =", mt5.last_error())
                self.connected = False
                return False
                
            self.connected = True
            self.account_info = mt5.account_info()
            print("MT5 Connected Successfully!")
            return True
        
    def check_connection(self):
        # Try to reconnect if not connected, or verify connection is still alive
        with self.lock:
            info = mt5.terminal_info()
            
        if not self.connected or info is None:
            self.connected = False
            self.initialize()
            
        return self.connected

    def get_terminal_info(self):
        if not self.connected:
            return None
            
        with self.lock:
            return mt5.terminal_info()

    def get_account_summary(self):
        if not self.connected:
            return None
        
        with self.lock:
            info = mt5.account_info()
            
        if info is None:
            return None
            
        return {
            "balance": info.balance,
            "equity": info.equity,
            "margin": info.margin,
            "free_margin": info.margin_free,
            "leverage": info.leverage,
            "currency": info.currency
        }

    def get_live_tick(self, symbol):
        if not self.connected:
            return None
            
        with self.lock:
            tick = mt5.symbol_info_tick(symbol)
            
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
            # order_type: mt5.ORDER_TYPE_BUY or mt5.ORDER_TYPE_SELL
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
                "deviation": 20,
                "magic": 234000,
                "comment": "Auto-Trade",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            
            result = mt5.order_send(request)
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            print(f"Order failed: {result.retcode}")
            return None
            
        # Log to database
        db = SessionLocal()
        try:
            new_trade = TradeHistory(
                ticket=result.order,
                symbol=symbol,
                strategy_name="AI Analyst", # Defaulting for now
                signal_type="BUY" if order_type == mt5.ORDER_TYPE_BUY else "SELL",
                lot_size=float(volume),
                entry_price=result.price,
                status="OPEN"
            )
            db.add(new_trade)
            db.commit()
        except Exception as e:
            print(f"Failed to log trade to DB: {e}")
        finally:
            db.close()
            
        return result

    def get_open_positions(self):
        if not self.connected:
            return []
            
        with self.lock:
            positions = mt5.positions_get()
            
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

mt5_engine = MT5Engine()
