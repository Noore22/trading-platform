import math

class RiskManager:
    def __init__(self):
        # Global risk constraints
        self.max_daily_loss_pct = 0.03  # 3%
        self.max_daily_profit_pct = 0.05 # 5%
        self.risk_per_trade_pct = 0.01  # 1%
        self.max_trades_per_day = 20
        self.max_open_trades = 5
        
        self.daily_trades_count = 0
        self.daily_start_balance = 0.0

    def set_start_balance(self, balance: float):
        self.daily_start_balance = balance
        self.daily_trades_count = 0

    def can_open_trade(self, account_summary, open_positions):
        if not account_summary:
            return False, "Account info unavailable"

        # Check total open trades
        if len(open_positions) >= self.max_open_trades:
            return False, f"Max open trades ({self.max_open_trades}) reached"

        # Check daily trade limit
        if self.daily_trades_count >= self.max_trades_per_day:
            return False, "Max daily trades reached"

        # Check daily loss limit
        current_equity = account_summary["equity"]
        if self.daily_start_balance > 0:
            loss_pct = (self.daily_start_balance - current_equity) / self.daily_start_balance
            if loss_pct >= self.max_daily_loss_pct:
                return False, f"Max daily loss ({self.max_daily_loss_pct*100}%) exceeded"
                
            profit_pct = (current_equity - self.daily_start_balance) / self.daily_start_balance
            if profit_pct >= self.max_daily_profit_pct:
                return False, f"Max daily profit ({self.max_daily_profit_pct*100}%) reached"

        return True, "Trade approved by Risk Manager"

    def calculate_lot_size(self, account_summary, stop_loss_pips):
        # Calculate lot size based on 1% risk
        if not account_summary or stop_loss_pips <= 0:
            return 0.01
            
        risk_amount = account_summary["balance"] * self.risk_per_trade_pct
        # Assuming standard 1 pip value is $10 for 1 standard lot
        pip_value = 10.0
        
        lots = risk_amount / (stop_loss_pips * pip_value)
        # Round to nearest 0.01
        lots = math.floor(lots * 100) / 100.0
        
        # Min lot size
        if lots < 0.01:
            lots = 0.01
            
        return lots

risk_manager = RiskManager()
