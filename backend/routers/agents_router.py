import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException

from config.settings import settings
from services.forex_agent_service import forex_agent_service
from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


@router.post("/analyze/{symbol}")
async def analyze_symbol(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, forex_agent_service.analyze_symbol, symbol)
    return result


@router.post("/analyze-all")
async def analyze_all():
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, forex_agent_service.analyze_all_symbols)
    return result


@router.get("/result/{symbol}")
async def get_latest_result(symbol: str):
    symbol = symbol.upper()
    result = forex_agent_service.get_latest_result(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No analysis found for {symbol}")
    return result


@router.get("/status")
async def agent_status():
    return {
        "initialized": forex_agent_service._initialized,
        "provider": settings.AGENT_LLM_PROVIDER or "openai",
        "analyzed_symbols": list(forex_agent_service._agent_results.keys()),
        "mt5_connected": mt5_service.connected,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/initialize")
async def initialize_agents():
    success = forex_agent_service.initialize()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to initialize agent service")
    return {"status": "initialized", "timestamp": datetime.utcnow().isoformat()}

# --- TradingAgents (Deep Analysis) Endpoints ---

@router.post("/deep-analyze/{symbol}")
async def start_deep_analyze(symbol: str):
    symbol = symbol.upper()
    try:
        from services.tradingagents_service import tradingagents_service
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"TradingAgents service unavailable: {e}")
    if tradingagents_service.is_running(symbol):
        raise HTTPException(status_code=409, detail=f"Deep analysis already running for {symbol}")
        
    asyncio.create_task(tradingagents_service.analyze_symbol_async(symbol))
    return {"status": "started", "symbol": symbol, "message": "Deep analysis started in background."}

@router.get("/deep-result/{symbol}")
async def get_deep_result(symbol: str):
    symbol = symbol.upper()
    try:
        from services.tradingagents_service import tradingagents_service
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"TradingAgents service unavailable: {e}")
    if tradingagents_service.is_running(symbol):
        return {"status": "running", "symbol": symbol, "message": "Analysis in progress..."}
        
    result = tradingagents_service.get_latest_result(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No deep analysis result found for {symbol}")
        
    return result


