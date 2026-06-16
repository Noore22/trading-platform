-- PostgreSQL Schema for MT5 Trading Automation Platform

-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- admin, trader, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MetaTrader 5 Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    login BIGINT UNIQUE NOT NULL,
    broker VARCHAR(150) NOT NULL,
    server VARCHAR(150) NOT NULL,
    api_token VARCHAR(255) UNIQUE NOT NULL, -- Authenticate the MT5 EA
    balance DOUBLE PRECISION DEFAULT 0.0,
    equity DOUBLE PRECISION DEFAULT 0.0,
    free_margin DOUBLE PRECISION DEFAULT 0.0,
    margin_level DOUBLE PRECISION DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trade Records
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    ticket BIGINT UNIQUE NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- buy, sell
    volume DOUBLE PRECISION NOT NULL,
    open_price DOUBLE PRECISION NOT NULL,
    close_price DOUBLE PRECISION DEFAULT 0.0,
    sl DOUBLE PRECISION DEFAULT 0.0,
    tp DOUBLE PRECISION DEFAULT 0.0,
    profit DOUBLE PRECISION DEFAULT 0.0,
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    close_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, closed
    comment VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Target Management
CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    account_id INTEGER UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    daily_profit_target DOUBLE PRECISION DEFAULT 0.0,
    monthly_profit_target DOUBLE PRECISION DEFAULT 0.0,
    daily_loss_limit DOUBLE PRECISION DEFAULT 0.0,
    weekly_loss_limit DOUBLE PRECISION DEFAULT 0.0,
    auto_close_on_target BOOLEAN DEFAULT FALSE,
    auto_disable_on_target BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bot & Trading Settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    account_id INTEGER UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    default_lot_size DOUBLE PRECISION DEFAULT 0.01,
    risk_percentage DOUBLE PRECISION DEFAULT 1.0,
    max_trades INTEGER DEFAULT 10,
    trading_hours_start VARCHAR(5) DEFAULT '00:00', -- HH:MM
    trading_hours_end VARCHAR(5) DEFAULT '23:59', -- HH:MM
    allowed_symbols TEXT DEFAULT 'EURUSD,GBPUSD,USDJPY', -- Comma separated
    news_filter_enabled BOOLEAN DEFAULT FALSE,
    bot_status VARCHAR(20) DEFAULT 'stopped', -- running, stopped, paused
    auto_trading_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Command Queue (Dashboard -> MT5 EA)
CREATE TABLE IF NOT EXISTS bot_commands (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    command VARCHAR(50) NOT NULL, -- buy, sell, close_all, close_buys, etc.
    params JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, executed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Action Logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'info', -- info, warning, error
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_accounts_modtime BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_trades_modtime BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_targets_modtime BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_settings_modtime BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
