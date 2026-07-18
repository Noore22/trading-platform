import os
import logging
from datetime import datetime


from dotenv import load_dotenv

load_dotenv()

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings

from database.session import engine, Base

from services.mt5_service import mt5_service

from websocket.manager import ws_manager, SYMBOLS

from routers.mt5_router import router as mt5_router
from routers.auth import router as auth_router
from routers.ai_router import router as ai_router
from routers.agents_router import router as agents_router

logger = logging.getLogger("antigravity")

os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOG_FILE) if settings.LOG_FILE else logging.NullHandler(),
    ],
)


from contextlib import asynccontextmanager
import asyncio


async def _init_websocket_manager():
    """Start WebSocket broadcast and heartbeat loops."""
    ws_manager._running = True
    asyncio.create_task(ws_manager._broadcast_loop())
    asyncio.create_task(ws_manager._heartbeat_loop())
    logger.info("WebSocket broadcast and heartbeat loops started")


def _init_ai_coordinator():
    """Initialize all AI agent services in background."""
    try:
        from services.ai.coordinator import ai_coordinator
        logger.info("Initializing AI Coordinator...")
        success = ai_coordinator.initialize_all()
        if success:
            logger.info("AI Coordinator fully initialized (all agents online)")
        else:
            logger.warning("AI Coordinator partially initialized (some agents failed)")
    except Exception as e:
        logger.warning(f"AI Coordinator initialization failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}")

    os.makedirs("data", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized")

    if settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD:
        try:
            from database.session import SessionLocal
            from database.models import User
            from routers.auth import get_password_hash
            db = SessionLocal()
            admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
            if not admin_user:
                admin_user = User(
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL or f"{settings.ADMIN_USERNAME}@tradingplatform.local",
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    role="admin",
                )
                db.add(admin_user)
                db.commit()
                logger.info(f"Default admin user created ({settings.ADMIN_USERNAME})")
            db.close()
        except Exception as e:
            logger.warning(f"Admin user creation failed: {e}")

    import threading

    def init_mt5():
        try:
            success = mt5_service.initialize()
            if success:
                logger.info("MT5 initialized successfully")
                mt5_service.start_auto_reconnect()
            else:
                logger.warning("MT5 initialization failed - check credentials in .env")
        except Exception as e:
            logger.warning(f"MT5 initialization error: {e}")

    threading.Thread(target=init_mt5, daemon=True).start()
    threading.Thread(target=_init_ai_coordinator, daemon=True).start()

    try:
        await _init_websocket_manager()
    except Exception as e:
        logger.warning(f"WebSocket manager start failed: {e}")

    logger.info(f"{settings.APP_NAME} is fully operational!")
    yield

    logger.info("Shutting down...")
    mt5_service.shutdown()
    ws_manager._running = False
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    description="IC Markets MetaTrader 5 Trading Platform",
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


app.include_router(mt5_router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(agents_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "4.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/health")
async def health():
    mt5_connected = mt5_service.connected
    summary = mt5_service.get_account_summary()
    result = {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "4.0.0",
        "mt5_connected": mt5_connected,
        "mt5": {
            "connected": mt5_connected,
            "balance": summary.get("balance", 0),
            "equity": summary.get("equity", 0),
            "server": summary.get("server", ""),
            "account_number": summary.get("account_number", 0),
        } if mt5_connected else {"connected": False, "error": mt5_service.last_error or "Not connected"},
        "websocket_connections": len(ws_manager._connections) if hasattr(ws_manager, '_connections') else 0,
        "timestamp": datetime.utcnow().isoformat(),
    }
    return result


@app.get("/api/v1/health")
async def health_v1():
    mt5_connected = mt5_service.connected
    summary = mt5_service.get_account_summary()
    return {
        "status": "online",
        "mt5_connected": mt5_connected,
        "mt5": {
            "connected": mt5_connected,
            "balance": summary.get("balance", 0),
            "equity": summary.get("equity", 0),
            "profit": summary.get("profit", 0),
            "margin": summary.get("margin", 0),
            "free_margin": summary.get("free_margin", 0),
            "margin_level": summary.get("margin_level", 0),
            "leverage": summary.get("leverage", 0),
            "currency": summary.get("currency", "USD"),
            "server": summary.get("server", ""),
            "account_number": summary.get("account_number", 0),
            "broker": summary.get("broker", ""),
            "trade_allowed": summary.get("trade_allowed", False),
            "open_positions": summary.get("open_positions", 0),
            "floating_profit": summary.get("floating_profit", 0),
            "daily_profit": summary.get("daily_profit", 0),
            "weekly_profit": summary.get("weekly_profit", 0),
            "monthly_profit": summary.get("monthly_profit", 0),
            "drawdown": summary.get("drawdown", 0),
        } if mt5_connected else {"connected": False},
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/status")
async def api_status():
    summary = mt5_service.get_account_summary()
    mt5_connected = summary.get("connected", False)
    ws_connected = len(ws_manager._connections) > 0 if hasattr(ws_manager, '_connections') else False
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "4.0.0",
        "mt5": {
            "connected": mt5_connected,
            "balance": summary.get("balance", 0),
            "equity": summary.get("equity", 0),
            "profit": summary.get("profit", 0),
            "margin": summary.get("margin", 0),
            "free_margin": summary.get("free_margin", 0),
            "leverage": summary.get("leverage", 100),
            "currency": summary.get("currency", "USD"),
            "open_positions": summary.get("open_positions", 0),
        },
        "websocket": {
            "connected": ws_connected,
            "connections": len(ws_manager._connections) if hasattr(ws_manager, '_connections') else 0,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/dashboard")
async def dashboard():
    summary = mt5_service.get_account_summary_for_dashboard()
    positions = mt5_service.get_open_positions()
    orders = mt5_service.get_pending_orders()
    ticks = {}
    for sym in SYMBOLS:
        tick = mt5_service.get_tick(sym)
        if tick:
            ticks[sym] = tick
    if not summary.get("connected"):
        summary["error"] = mt5_service.last_error or "MT5 not connected"
    try:
        from services.ai.coordinator import ai_coordinator
        summary["ai_status"] = ai_coordinator.get_agent_status()
    except Exception:
        summary["ai_status"] = {"initialized": False}
    return {
        "mt5": summary,
        "positions": positions,
        "orders": orders,
        "market_ticks": ticks,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/scanner")
async def get_scanner():
    from websocket.manager import compute_scanner_data
    return compute_scanner_data()


# --- Additional API Endpoints for full dashboard coverage ---

@app.get("/api/account")
async def api_account():
    return mt5_service.get_account_summary()


@app.get("/api/prices")
async def api_prices():
    ticks = {}
    for sym in SYMBOLS:
        tick = mt5_service.get_tick(sym)
        if tick:
            ticks[sym] = tick
    return ticks


@app.get("/api/orders")
async def api_orders():
    return mt5_service.get_pending_orders()


@app.get("/api/positions")
async def api_positions():
    return mt5_service.get_open_positions()


@app.get("/api/history")
async def api_history(days_back: int = 7):
    return mt5_service.get_trade_history(days_back)


@app.get("/api/performance")
async def api_performance():
    summary = mt5_service.get_account_summary()
    positions = mt5_service.get_positions_summary()
    return {**summary, **positions, "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/portfolio")
async def api_portfolio():
    summary = mt5_service.get_account_summary()
    positions = mt5_service.get_open_positions()
    return {
        "balance": summary.get("balance", 0),
        "equity": summary.get("equity", 0),
        "margin": summary.get("margin", 0),
        "open_positions": len(positions),
        "positions": positions,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/risk")
async def api_risk():
    summary = mt5_service.get_account_summary()
    return {
        "drawdown": summary.get("drawdown", 0),
        "margin_level": summary.get("margin_level", 0),
        "leverage": summary.get("leverage", 100),
        "daily_loss": summary.get("daily_profit", 0),
        "open_positions": summary.get("open_positions", 0),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/settings")
async def api_settings():
    return {
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "risk_percent": settings.DEFAULT_RISK_PERCENT,
        "max_open_trades": settings.MAX_OPEN_TRADES,
        "max_daily_trades": settings.MAX_DAILY_TRADES,
        "max_drawdown_percent": settings.MAX_DRAWDOWN_PERCENT,
        "daily_loss_limit_percent": settings.DAILY_LOSS_LIMIT_PERCENT,
        "daily_profit_target_percent": settings.DAILY_PROFIT_TARGET_PERCENT,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/logs")
async def api_logs():
    try:
        from database.session import SessionLocal
        from database.models import AgentLog
        db = SessionLocal()
        logs = db.query(AgentLog).order_by(AgentLog.created_at.desc()).limit(100).all()
        db.close()
        return [
            {
                "id": l.id,
                "agent": l.agent_name,
                "status": l.status,
                "latency_ms": l.latency_ms,
                "error": l.error,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in logs
        ]
    except Exception as e:
        return {"error": str(e), "entries": []}


@app.get("/api/signals")
async def api_signals():
    try:
        from database.session import SessionLocal
        from database.models import AISignal
        db = SessionLocal()
        signals = db.query(AISignal).order_by(AISignal.created_at.desc()).limit(100).all()
        db.close()
        return [
            {
                "id": s.id,
                "symbol": s.symbol,
                "signal": s.signal,
                "confidence": s.confidence,
                "reason": s.reason,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in signals
        ]
    except Exception as e:
        return {"error": str(e), "entries": []}


@app.get("/api/system/status")
async def api_system_status():
    summary = mt5_service.get_account_summary()
    mt5_connected = summary.get("connected", False)
    ws_connected = len(ws_manager._connections) > 0 if hasattr(ws_manager, "_connections") else False
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "4.0.0",
        "backend": {"status": "online"},
        "mt5": {"connected": mt5_connected, "account": summary.get("account_number", 0), "server": summary.get("server", "")},
        "websocket": {"connected": ws_connected, "connections": len(ws_manager._connections) if hasattr(ws_manager, "_connections") else 0},
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level=settings.LOG_LEVEL.lower(),
    )
