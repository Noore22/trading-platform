import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.mt5_service import mt5_service
from config.settings import settings
from websocket.manager import ws_manager, SYMBOLS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/mt5", tags=["MT5"])


# --- Request Models ---

class BuyRequest(BaseModel):
    symbol: str
    volume: float
    sl: float = 0.0
    tp: float = 0.0
    comment: str = "MT5 Buy"
    magic: int = 234000


class SellRequest(BaseModel):
    symbol: str
    volume: float
    sl: float = 0.0
    tp: float = 0.0
    comment: str = "MT5 Sell"
    magic: int = 234000


class CloseRequest(BaseModel):
    ticket: int


class CloseAllRequest(BaseModel):
    pass


class ModifyRequest(BaseModel):
    ticket: int
    sl: float = 0.0
    tp: float = 0.0


class PartialCloseRequest(BaseModel):
    ticket: int
    volume: float


class PendingOrderRequest(BaseModel):
    symbol: str
    type: str
    volume: float
    price: float
    sl: float = 0.0
    tp: float = 0.0
    comment: str = "Pending Order"
    magic: int = 234000


class CancelOrderRequest(BaseModel):
    ticket: int


class ModifyOrderRequest(BaseModel):
    ticket: int
    price: float
    sl: float = 0.0
    tp: float = 0.0
    volume: Optional[float] = None


class ConnectRequest(BaseModel):
    account_id: Optional[int] = None


# --- Endpoints ---

@router.get("/account")
async def get_account():
    summary = mt5_service.get_account_summary()
    if not summary.get("connected"):
        return {"connected": False}
    return summary


@router.get("/positions")
async def get_positions():
    return mt5_service.get_open_positions()


@router.get("/orders")
async def get_orders():
    return mt5_service.get_pending_orders()


@router.get("/history")
async def get_history(days_back: int = 7):
    return mt5_service.get_trade_history(days_back)


@router.get("/history/orders")
async def get_history_orders(days_back: int = 7):
    return mt5_service.get_history_orders(days_back)


@router.get("/symbols")
async def get_symbols():
    return mt5_service.get_symbols()


@router.get("/symbols/{symbol}")
async def get_symbol_info(symbol: str):
    info = mt5_service.get_symbol_info(symbol)
    if info is None:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return info


@router.get("/tick")
async def get_tick(symbol: str = "EURUSD"):
    tick = mt5_service.get_tick(symbol)
    if tick is None:
        raise HTTPException(status_code=404, detail=f"Tick for {symbol} not found")
    return tick


@router.get("/prices")
async def get_prices():
    ticks = {}
    for sym in SYMBOLS:
        tick = mt5_service.get_tick(sym)
        if tick:
            ticks[sym] = tick
    return ticks


@router.get("/candles")
async def get_candles(symbol: str = "EURUSD", timeframe: str = "M1", count: int = 100):
    rates = mt5_service.get_rates(symbol, timeframe, count)
    if not rates:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")
    return rates


@router.get("/status")
async def get_mt5_status():
    summary = mt5_service.get_account_summary()
    connected = summary.get("connected", False)
    result = {
        "connected": connected,
        "account": summary.get("account_number", 0),
        "server": summary.get("server", ""),
        "broker": summary.get("broker", ""),
        "balance": summary.get("balance", 0),
        "equity": summary.get("equity", 0),
        "trade_allowed": summary.get("trade_allowed", False),
        "timestamp": datetime.utcnow().isoformat(),
    }
    if not connected and mt5_service.last_error:
        result["error"] = mt5_service.last_error
    return result


@router.post("/connect")
async def connect_mt5(req: ConnectRequest = ConnectRequest()):
    mt5_service.shutdown()
    success = mt5_service.initialize()
    if success:
        mt5_service.start_auto_reconnect()
        return {"status": "ok", "message": "MT5 connected successfully"}
    error = mt5_service.last_error or "Failed to connect MT5"
    return {"status": "error", "message": error}


@router.post("/disconnect")
async def disconnect_mt5():
    mt5_service.shutdown()
    return {"status": "ok", "message": "MT5 disconnected"}


@router.post("/buy")
async def place_buy(req: BuyRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.buy(req.symbol, req.volume, req.sl, req.tp, req.comment, req.magic)
    if result is None:
        raise HTTPException(status_code=500, detail="Order failed")
    if result.get("retcode") != 10009:
        raise HTTPException(status_code=400, detail=f"Order rejected: {result}")
    await ws_manager.broadcast_notification("success", "Buy Order",
                                            f"Buy {req.volume} {req.symbol}")
    return result


@router.post("/sell")
async def place_sell(req: SellRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.sell(req.symbol, req.volume, req.sl, req.tp, req.comment, req.magic)
    if result is None:
        raise HTTPException(status_code=500, detail="Order failed")
    if result.get("retcode") != 10009:
        raise HTTPException(status_code=400, detail=f"Order rejected: {result}")
    await ws_manager.broadcast_notification("success", "Sell Order",
                                            f"Sell {req.volume} {req.symbol}")
    return result


@router.post("/close")
async def close_position(req: CloseRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.close_position(req.ticket)
    if result is None:
        raise HTTPException(status_code=404, detail="Position not found")
    return result


@router.post("/close-all")
async def close_all_positions():
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    results = mt5_service.close_all_positions()
    return {"results": results, "count": len(results)}


@router.post("/modify")
async def modify_position(req: ModifyRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.modify_position(req.ticket, req.sl, req.tp)
    if result is None:
        raise HTTPException(status_code=404, detail="Position not found")
    return result


@router.post("/partial-close")
async def partial_close(req: PartialCloseRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.partial_close(req.ticket, req.volume)
    if result is None:
        raise HTTPException(status_code=404, detail="Position not found")
    return result


@router.post("/order")
async def place_pending_order(req: PendingOrderRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    import MetaTrader5 as mt5
    type_map = {
        "BUY_LIMIT": mt5.ORDER_TYPE_BUY_LIMIT,
        "SELL_LIMIT": mt5.ORDER_TYPE_SELL_LIMIT,
        "BUY_STOP": mt5.ORDER_TYPE_BUY_STOP,
        "SELL_STOP": mt5.ORDER_TYPE_SELL_STOP,
        "BUY_STOP_LIMIT": mt5.ORDER_TYPE_BUY_STOP_LIMIT,
        "SELL_STOP_LIMIT": mt5.ORDER_TYPE_SELL_STOP_LIMIT,
    }
    order_type = type_map.get(req.type.upper())
    if order_type is None:
        raise HTTPException(status_code=400, detail=f"Invalid order type: {req.type}")
    result = mt5_service.place_pending_order(
        req.symbol, order_type, req.volume, req.price,
        req.sl, req.tp, req.comment, req.magic
    )
    if result is None:
        raise HTTPException(status_code=500, detail="Order placement failed")
    return result


@router.delete("/order/{ticket}")
async def cancel_order(ticket: int):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.cancel_order(ticket)
    if result is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return result


@router.put("/order/{ticket}")
async def modify_order(ticket: int, req: ModifyOrderRequest):
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = mt5_service.modify_order(ticket, req.price, req.sl, req.tp, req.volume)
    if result is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return result


@router.get("/dashboard")
async def get_dashboard():
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
