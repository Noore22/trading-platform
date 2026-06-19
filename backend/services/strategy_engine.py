import time
import random
from services.mt5_engine import mt5_engine
from services.risk_manager import risk_manager

class StrategyEngine:
    def __init__(self):
        self.is_running = False
        self.active_pairs = [
            "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", 
            "USDCHF", "NZDUSD", "XAUUSD", "XAGUSD"
        ]
        self.ai_signals = {}
        
    def run(self):
        self.is_running = True
        print("Strategy Engine background loop started.")
        while self.is_running:
            try:
                if mt5_engine.connected:
                    self._generate_signals()
                    self._check_auto_trades()
            except Exception as e:
                print(f"Strategy Engine Error: {e}")
                
            time.sleep(5)  # Poll every 5 seconds
            
    def stop(self):
        self.is_running = False
        print("Strategy Engine stopped.")

    def _generate_signals(self):
        # Placeholder for complex TA logic using pandas_ta
        # In a real system, fetch last 200 candles and calculate EMA50, EMA200, RSI, ADX
        for pair in self.active_pairs:
            tick = mt5_engine.get_live_tick(pair)
            if not tick:
                continue
                
            # Mock AI logic based on random walk for demonstration
            # In production: df.ta.ema(length=50) > df.ta.ema(length=200)
            score = random.randint(40, 95)
            direction = "BUY" if random.random() > 0.5 else "SELL"
            
            # Formulate AI Analyst reason
            reasons = []
            if score > 80:
                reasons = ["EMA Bullish", "RSI Strong", "High Volume", "Trend Confirmed"]
            elif score > 60:
                reasons = ["EMA Breakout", "RSI Divergence"]
            else:
                reasons = ["Consolidating", "Low Volume"]
                
            self.ai_signals[pair] = {
                "symbol": pair,
                "direction": direction,
                "confidence": score,
                "reasons": reasons,
                "timestamp": time.time(),
                "price": tick["last"]
            }

    def _check_auto_trades(self):
        # Simple loop to check if we should auto-execute based on signal
        # Only execute if confidence > 90 and risk manager approves
        account_summary = mt5_engine.get_account_summary()
        open_positions = mt5_engine.get_open_positions()
        
        # Check risk limits globally
        can_trade, reason = risk_manager.can_open_trade(account_summary, open_positions)
        if not can_trade:
            # print(f"Risk Manager Blocked Trade: {reason}")
            return
            
        for pair, signal in self.ai_signals.items():
            if signal["confidence"] >= 90:
                # Mock execution logic
                print(f"Auto-Trading Signal Triggered: {signal['direction']} {pair}")
                # We would call mt5_engine.open_trade here.
                # To prevent spamming in demo, we reset confidence after trigger
                signal["confidence"] = 50 

strategy_engine = StrategyEngine()
