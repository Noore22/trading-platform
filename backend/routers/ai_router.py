import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from config.settings import settings
from services.mt5_service import mt5_service
from services.ai.coordinator import ai_coordinator
from services.ai.technical_service import technical_service
from services.ai.news_service import news_service
from services.ai.sentiment_service import sentiment_service
from services.ai.fundamental_service import fundamental_service
from services.ai.macro_service import macro_service
from services.ai.risk_service import risk_service
from services.ai.portfolio_service import portfolio_service
from services.ai.signal_service import signal_service
from services.ai.execution_service import execution_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.post("/analyze/{symbol}")
async def ai_analyze(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await ai_coordinator.analyze_symbol_async(symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.get("/signal/{symbol}")
async def get_ai_signal(symbol: str):
    symbol = symbol.upper()
    analysis = ai_coordinator.get_analysis(symbol)
    if analysis and analysis.get("status") == "success":
        return {
            "symbol": symbol,
            "signal": analysis.get("signal"),
            "timestamp": analysis.get("timestamp"),
        }
    signal = signal_service.get_latest_signal(symbol)
    if signal:
        return {"symbol": symbol, "signal": signal}
    return await ai_analyze(symbol)


@router.get("/signals")
async def get_all_signals():
    return signal_service.get_all_signals()


@router.post("/technical/{symbol}")
async def ai_technical(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, technical_service.analyze, symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.post("/news/{symbol}")
async def ai_news(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, news_service.analyze, symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.post("/sentiment/{symbol}")
async def ai_sentiment(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, sentiment_service.analyze, symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.post("/risk/{symbol}")
async def ai_risk(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, risk_service.analyze, symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.post("/portfolio")
async def ai_portfolio():
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, portfolio_service.analyze)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result


@router.get("/history")
async def ai_history(symbol: str = Query(None)):
    try:
        from database.session import SessionLocal
        from database.models import AISignal
        db = SessionLocal()
        query = db.query(AISignal).order_by(AISignal.created_at.desc()).limit(100)
        if symbol:
            query = query.filter(AISignal.symbol == symbol.upper())
        results = query.all()
        db.close()
        return [
            {
                "id": r.id,
                "symbol": r.symbol,
                "signal": r.signal,
                "confidence": r.confidence,
                "technical_score": r.technical_score,
                "sentiment_score": r.sentiment_score,
                "fundamental_score": r.fundamental_score,
                "risk_score": r.risk_score,
                "reason": r.reason,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents")
async def ai_agents_status():
    return ai_coordinator.get_agent_status()


@router.post("/initialize")
async def ai_initialize():
    success = ai_coordinator.initialize_all()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to initialize some AI services")
    return {"status": "initialized", "timestamp": datetime.utcnow().isoformat()}


@router.post("/execute/{symbol}")
async def ai_execute(symbol: str, auto_confirm: bool = Query(False)):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = ai_coordinator.execute_signal(symbol, auto_confirm=auto_confirm)
    return result


@router.get("/executions")
async def ai_executions(symbol: str = Query(None)):
    return execution_service.get_execution_history(symbol)


@router.get("/macro/{symbol}")
async def ai_macro(symbol: str):
    symbol = symbol.upper()
    if not mt5_service.connected:
        raise HTTPException(status_code=503, detail="MT5 not connected")
    result = await asyncio.get_event_loop().run_in_executor(None, macro_service.analyze, symbol)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))
    return result