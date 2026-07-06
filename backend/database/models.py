from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="trader")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    settings = relationship("UserSettings", back_populates="user", uselist=False)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String, default="dark")
    default_leverage = Column(Integer, default=100)
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="settings")


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer, unique=True, index=True)
    symbol = Column(String, index=True)
    type = Column(String)
    volume = Column(Float)
    open_price = Column(Float)
    close_price = Column(Float, nullable=True)
    sl = Column(Float, nullable=True)
    tp = Column(Float, nullable=True)
    profit = Column(Float, default=0.0)
    commission = Column(Float, default=0.0)
    swap = Column(Float, default=0.0)
    status = Column(String, default="OPEN")
    open_time = Column(DateTime, default=datetime.utcnow)
    close_time = Column(DateTime, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    level = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AISignal(Base):
    __tablename__ = "ai_signals"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    signal = Column(String)
    confidence = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)
    fundamental_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    portfolio_score = Column(Float, default=0.0)
    reason = Column(Text, nullable=True)
    strategy = Column(String, nullable=True)
    time_horizon = Column(String, nullable=True)
    price_target = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    analysis_type = Column(String)
    content = Column(Text)
    summary = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    metadata_json = Column(Text, nullable=True)
    agent_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    decision = Column(String)
    action = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    volume = Column(Float, nullable=True)
    entry_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    reason = Column(Text, nullable=True)
    risk_level = Column(String, nullable=True)
    executed = Column(Boolean, default=False)
    executed_at = Column(DateTime, nullable=True)
    execution_ticket = Column(Integer, nullable=True)
    execution_price = Column(Float, nullable=True)
    execution_result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, index=True)
    symbol = Column(String, nullable=True)
    status = Column(String)
    latency_ms = Column(Float, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    decision = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsCache(Base):
    __tablename__ = "news_cache"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    title = Column(String)
    source = Column(String, nullable=True)
    url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    sentiment = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    impact = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    cached_at = Column(DateTime, default=datetime.utcnow)


class PortfolioScore(Base):
    __tablename__ = "portfolio_scores"

    id = Column(Integer, primary_key=True, index=True)
    total_balance = Column(Float, default=0.0)
    total_equity = Column(Float, default=0.0)
    total_exposure = Column(Float, default=0.0)
    total_risk = Column(Float, default=0.0)
    diversification_score = Column(Float, default=0.0)
    correlation_score = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    profit_factor = Column(Float, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
