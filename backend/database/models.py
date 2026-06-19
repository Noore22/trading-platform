from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database.session import Base

class TradeHistory(Base):
    __tablename__ = "trade_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer, index=True)
    symbol = Column(String, index=True)
    strategy_name = Column(String)
    signal_type = Column(String) # 'BUY' or 'SELL'
    lot_size = Column(Float)
    entry_price = Column(Float)
    exit_price = Column(Float, nullable=True)
    profit = Column(Float, default=0.0)
    status = Column(String) # 'OPEN', 'CLOSED', 'PARTIAL'
    timestamp = Column(DateTime, default=datetime.utcnow)
    close_time = Column(DateTime, nullable=True)

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True)
    setting_value = Column(String)
