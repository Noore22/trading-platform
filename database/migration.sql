-- SQLite Database Migration Script
-- MT5 Algo Trading Platform

-- A. Update existing 'trades' table to support multi-strategy magic numbers and strategy names
-- (We use TRY-CATCH style logic in application code, but these are raw commands for manual DB execution)

-- Note: SQLite does not support ADD COLUMN IF NOT EXISTS. Run these commands if columns are missing.
-- ALTER TABLE trades ADD COLUMN magic_number INTEGER;
-- ALTER TABLE trades ADD COLUMN strategy_name VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_trades_magic_number ON trades(magic_number);
CREATE INDEX IF NOT EXISTS idx_trades_strategy_name ON trades(strategy_name);

-- B. Create new 'bot_settings' table for strategy-specific configurations
CREATE TABLE IF NOT EXISTS bot_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL UNIQUE,
    magic_number_base INTEGER DEFAULT 1000,
    run_strategy_a BOOLEAN DEFAULT 1,
    run_strategy_b BOOLEAN DEFAULT 0,
    run_strategy_c BOOLEAN DEFAULT 1,
    run_strategy_d BOOLEAN DEFAULT 1,
    run_strategy_e BOOLEAN DEFAULT 1,
    run_strategy_f BOOLEAN DEFAULT 1,
    run_strategy_g BOOLEAN DEFAULT 1,
    run_strategy_h BOOLEAN DEFAULT 1,
    max_spread REAL DEFAULT 500.0,
    lotsize_calculation_method VARCHAR(50) DEFAULT 'Lots_Per_Balance',
    start_lots REAL DEFAULT 0.01,
    lotsize_step INTEGER DEFAULT 600,
    max_risk_per_trade REAL DEFAULT 2.0,
    use_equity BOOLEAN DEFAULT 0,
    only_up BOOLEAN DEFAULT 1,
    use_zone_recovery BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bot_settings_account ON bot_settings(account_id);
