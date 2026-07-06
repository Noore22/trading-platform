import os
import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager

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

    def init_mt5():
        try:
            success = mt5_service.initialize()
            if success:
                logger.info("MT5 initialized successfully")
                mt5_service.start_auto_reconnect()
            else:
                logger.warning("MT5 initialization failed - check credentials")
        except Exception as e:
            logger.warning(f"MT5 initialization error: {e}")

    import threading
    threading.Thread(target=init_mt5, daemon=True).start()

    loop = asyncio.get_event_loop()
    await ws_manager.start(loop)
    logger.info("WebSocket Manager started")

    def init_ai():
        try:
            from services.ai.coordinator import ai_coordinator
            success = ai_coordinator.initialize_all()
            if success:
                logger.info("AI Coordinator initialized successfully")
            else:
                logger.warning("AI Coordinator initialization incomplete")
        except Exception as e:
            logger.warning(f"AI Coordinator initialization error: {e}")

    threading.Thread(target=init_ai, daemon=True).start()

    logger.info(f"{settings.APP_NAME} is fully operational!")
    yield

    logger.info("Shutting down...")
    mt5_service.shutdown()
    await ws_manager.stop()
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
    return {
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
        } if mt5_connected else {"connected": False},
        "websocket_connections": len(ws_manager._connections) if hasattr(ws_manager, '_connections') else 0,
        "timestamp": datetime.utcnow().isoformat(),
    }


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


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
