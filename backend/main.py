import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import threading
import asyncio

# Import database
from database.session import engine, Base, get_db
from database.models import TradeHistory

# Import our services
from services.mt5_engine import mt5_engine
from services.strategy_engine import strategy_engine
from services.risk_manager import risk_manager
from sockets.ws_manager import ws_manager

app = FastAPI(title="MT5 Algo Trading Backend")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Starting up FastAPI Server and connecting to MT5...")
    
    # Initialize SQLite Database
    Base.metadata.create_all(bind=engine)
    
    # Initialize MT5
    def init_mt5_bg():
        try:
            success = mt5_engine.initialize()
            if success:
                print("MT5 Initialized successfully.")
            else:
                print("Failed to initialize MT5. Ensure MT5 Desktop Terminal is running.")
        except Exception as e:
            print("MetaTrader5 package may not be installed or supported:", e)

    # Initialize MT5 in a background thread to prevent blocking the event loop on IPC timeout
    threading.Thread(target=init_mt5_bg, daemon=True).start()
    
    # ALWAYS start background loops so auto-reconnect can function!
    threading.Thread(target=strategy_engine.run, daemon=True).start()
    asyncio.create_task(ws_manager.run_broadcast_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming commands from UI (e.g., execute manual trade)
            pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "MT5 FastAPI Backend is running"}

@app.get("/health")
@app.get("/api/v1/health")
def get_health():
    return {
        "status": "online",
        "mt5_connected": getattr(mt5_engine, "connected", False),
        "active_bots": 1 if getattr(strategy_engine, "is_running", False) else 0
    }

@app.get("/api/trades/history")
def get_trade_history(db: Session = Depends(get_db)):
    trades = db.query(TradeHistory).order_by(TradeHistory.timestamp.desc()).all()
    
    winning_trades = len([t for t in trades if (t.profit or 0) > 0])
    losing_trades = len([t for t in trades if (t.profit or 0) < 0])
    total_trades = len(trades)
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    net_profit = sum((t.profit or 0) for t in trades)
    gross_profit = sum((t.profit or 0) for t in trades if (t.profit or 0) > 0)
    gross_loss = sum((t.profit or 0) for t in trades if (t.profit or 0) < 0)
    
    return {
        "summary": {
            "total_trades": total_trades,
            "winning_trades": winning_trades,
            "losing_trades": losing_trades,
            "win_rate": round(win_rate, 2),
            "net_profit": round(net_profit, 2),
            "gross_profit": round(gross_profit, 2),
            "gross_loss": round(gross_loss, 2)
        },
        "trades": trades
    }

# --- Legacy Node.js API Compatibility Endpoints ---

@app.get("/api/v1/auth/me")
def get_me():
    return {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "email": "admin@tradingplatform.local"
    }

@app.get("/api/v1/accounts/")
def get_accounts():
    summary = mt5_engine.get_account_summary() or {}
    return [
        {
            "id": 1,
            "name": "Primary MT5 Account",
            "login": "12345678",
            "broker": "MetaQuotes",
            "server": "MetaQuotes-Demo",
            "balance": summary.get("balance", 0.0),
            "equity": summary.get("equity", 0.0)
        }
    ]

@app.get("/api/v1/mt5/status")
def get_mt5_status():
    return {
        "connected": mt5_engine.connected,
        "bot_running": getattr(strategy_engine, "is_running", False)
    }

@app.get("/api/v1/mt5/positions")
def get_mt5_positions():
    return mt5_engine.get_open_positions() if mt5_engine.connected else []

@app.get("/api/v1/mt5/orders")
def get_pending_orders():
    return [] # Implement if needed

@app.get("/api/v1/mt5/history")
def get_mt5_history(days_back: int = 7):
    return [] # We use /api/trades/history for this now

@app.get("/api/v1/mt5/bot/status")
def get_bot_status():
    return {}

@app.post("/api/v1/mt5/connect")
def connect_mt5():
    return {"status": "ok", "message": "MT5 connection handled by background worker."}

@app.get("/api/v1/settings/{account_id}")
def get_settings(account_id: int):
    return {
        "max_drawdown_limit": 10.0,
        "daily_profit_target": 100.0,
        "max_open_trades": 5,
        "risk_per_trade": 1.0,
        "trailing_stop": True,
        "bot_status": "stopped"
    }

@app.get("/api/v1/targets/{account_id}")
def get_targets(account_id: int):
    return {
        "daily_target": 100.0,
        "weekly_target": 500.0,
        "monthly_target": 2000.0
    }

@app.get("/api/v1/logs/{account_id}")
def get_logs(account_id: int, limit: int = 50):
    return [
        {
            "id": 1,
            "account_id": account_id,
            "level": "info",
            "message": "MT5 Auto Trading engine active and polling for updates.",
            "created_at": "2026-06-19T00:00:00Z"
        }
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
