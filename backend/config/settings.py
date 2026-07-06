import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AntiGravity AI Trading Platform V4"
    DEBUG: bool = False
    SECRET_KEY: str = ""
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite:///./data/trades.db"

    HOST: str = "0.0.0.0"
    PORT: int = 8007
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""
    ADMIN_EMAIL: str = ""

    MT5_LOGIN: int = 0
    MT5_PASSWORD: str = ""
    MT5_SERVER: str = ""
    MT5_PATH: str = ""

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    DEFAULT_RISK_PERCENT: float = 1.0
    MAX_OPEN_TRADES: int = 5
    MAX_DAILY_TRADES: int = 10
    MAX_DRAWDOWN_PERCENT: float = 10.0
    DAILY_LOSS_LIMIT_PERCENT: float = 3.0
    DAILY_PROFIT_TARGET_PERCENT: float = 5.0

    DEFAULT_SLIPPAGE: float = 0.001
    ORDER_TIMEOUT_SECONDS: int = 30
    TRAILING_STOP_ENABLED: bool = True
    BREAKEVEN_ENABLED: bool = True

    WS_HEARTBEAT_INTERVAL: int = 30

    AGENT_LLM_PROVIDER: str = "openai"
    AGENT_DEEP_MODEL: str = "gpt-4o"
    AGENT_QUICK_MODEL: str = "gpt-4o-mini"
    AGENT_TEMPERATURE: float = 0.2
    AGENT_REASONING_EFFORT: str = "medium"
    AGENT_MAX_DEBATE_ROUNDS: int = 1
    AGENT_MAX_RISK_ROUNDS: int = 1
    AGENT_CHECKPOINT_ENABLED: bool = False
    AGENT_AUTO_ANALYZE_INTERVAL: int = 300

    AI_SIGNAL_EXPIRY_MINUTES: int = 60
    AI_NEWS_CACHE_TTL: int = 1800
    AI_MAX_POSITION_RISK_PERCENT: float = 2.0
    AI_DAILY_TRADE_LIMIT: int = 10

    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/trading.log"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
