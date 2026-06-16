# Database Changes for MT5 Bot Integration

This document outlines the SQLite schema modifications required to support multi-strategy tracking, parameters, and historical metrics for the **Best Gold Robot**.

---

## 1. Schema Modifications

### A. Modifications to Existing Tables

#### Table: `trades`
We will add `magic_number` and `strategy_name` columns to associate each executed trade with its respective sub-strategy (A-H).

```sql
ALTER TABLE trades ADD COLUMN magic_number INTEGER;
ALTER TABLE trades ADD COLUMN strategy_name VARCHAR(50);
CREATE INDEX idx_trades_magic_number ON trades(magic_number);
CREATE INDEX idx_trades_strategy_name ON trades(strategy_name);
```

### B. New Tables

#### Table: `bot_settings`
This table stores the global input parameters and active strategy toggles for the **Best Gold Robot** instance running on the MT5 terminal.

```sql
CREATE TABLE bot_settings (
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
CREATE UNIQUE INDEX uq_bot_settings_account ON bot_settings(account_id);
```

---

## 2. SQLAlchemy Models

We will update the SQLAlchemy model definitions in [models.py](file:///c:/trading-platform/backend/app/models/models.py) as follows:

```diff
# In app/models/models.py

class Account(Base):
    __tablename__ = "accounts"
    # ... existing columns ...
    
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
    target = relationship("Target", uselist=False, back_populates="account", cascade="all, delete-orphan")
    setting = relationship("Setting", uselist=False, back_populates="account", cascade="all, delete-orphan")
+   bot_setting = relationship("BotSetting", uselist=False, back_populates="account", cascade="all, delete-orphan")
    commands = relationship("BotCommand", back_populates="account", cascade="all, delete-orphan")
    logs = relationship("Log", back_populates="account", cascade="all, delete-orphan")

class Trade(Base):
    __tablename__ = "trades"
    # ... existing columns ...
+   magic_number = Column(Integer, index=True, nullable=True)
+   strategy_name = Column(String(50), index=True, nullable=True)
    
    account = relationship("Account", back_populates="trades")

+class BotSetting(Base):
+    __tablename__ = "bot_settings"
+
+    id = Column(Integer, primary_key=True, index=True)
+    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), unique=True)
+    magic_number_base = Column(Integer, default=1000)
+    run_strategy_a = Column(Boolean, default=True)
+    run_strategy_b = Column(Boolean, default=False)
+    run_strategy_c = Column(Boolean, default=True)
+    run_strategy_d = Column(Boolean, default=True)
+    run_strategy_e = Column(Boolean, default=True)
+    run_strategy_f = Column(Boolean, default=True)
+    run_strategy_g = Column(Boolean, default=True)
+    run_strategy_h = Column(Boolean, default=True)
+    max_spread = Column(Float, default=500.0)
+    lotsize_calculation_method = Column(String(50), default="Lots_Per_Balance")
+    start_lots = Column(Float, default=0.01)
+    lotsize_step = Column(Integer, default=600)
+    max_risk_per_trade = Column(Float, default=2.0)
+    use_equity = Column(Boolean, default=False)
+    only_up = Column(Boolean, default=True)
+    use_zone_recovery = Column(Boolean, default=False)
+    created_at = Column(DateTime(timezone=True), server_default=func.now())
+    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
+
+    account = relationship("Account", back_populates="bot_setting")
```

---

## 3. Database Migration Steps

The database schema is automatically updated on application startup in [main.py](file:///c:/trading-platform/backend/main.py#L35) using `Base.metadata.create_all(bind=engine)`. 

For existing SQLite databases:
1. The new tables will be automatically created on startup.
2. For existing columns in the `trades` table, the server will issue schema modification logs.
