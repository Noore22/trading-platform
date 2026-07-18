import logging
import asyncio
import concurrent.futures
from datetime import datetime
from typing import Optional

from config.settings import settings
from services.mt5_service import mt5_service

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

class AICoordinator:
    def __init__(self):
        self._running = False
        self._initialized = False
        self._last_analysis = {}
        self._init_error = ""

    def initialize_all(self) -> bool:
        results = []
        for service in [technical_service, news_service, sentiment_service,
                        fundamental_service, macro_service, risk_service, portfolio_service]:
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(service.initialize)
                    result = future.result(timeout=30)
                    results.append(result)
            except concurrent.futures.TimeoutError:
                logger.warning(f"AI service {service.name} init timed out after 30s")
                results.append(False)
            except Exception as e:
                logger.error(f"Failed to init {service.name}: {e}")
                results.append(False)
        self._initialized = any(results)
        self._init_error = "" if self._initialized else "All AI agents failed to initialize"
        logger.info(f"AI Coordinator initialized: {self._initialized} ({sum(results)}/7 agents)")
        return self._initialized

    def analyze_symbol(self, symbol: str) -> dict:
        if not self._initialized:
            self.initialize_all()
        try:
            technical = technical_service.analyze(symbol)
            news = news_service.analyze(symbol)
            sentiment = sentiment_service.analyze(symbol)
            fundamental = fundamental_service.analyze(symbol)
            macro = macro_service.analyze(symbol)
            risk = risk_service.analyze(symbol,
                proposed_signal=technical.get("signal", "HOLD"),
                proposed_volume=None)
            portfolio = portfolio_service.analyze(symbol)
            signal = signal_service.generate_signal(symbol, technical, sentiment, fundamental, risk, portfolio)

            result = {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "signal": signal,
                "technical": technical,
                "news": news,
                "sentiment": sentiment,
                "fundamental": fundamental,
                "macro": macro,
                "risk": risk,
                "portfolio": portfolio,
                "status": "success",
            }
            self._last_analysis[symbol] = result
            self._save_analysis_to_db(symbol, technical, sentiment, fundamental, signal)
            return result
        except Exception as e:
            logger.error(f"AI Coordinator analysis error for {symbol}: {e}")
            return {"symbol": symbol, "status": "error", "error": str(e)}

    async def analyze_symbol_async(self, symbol: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.analyze_symbol, symbol)

    def _save_analysis_to_db(self, symbol: str, technical: dict, sentiment: dict,
                             fundamental: dict, signal: dict):
        try:
            from database.session import SessionLocal
            from database.models import AISignal, AIAnalysis
            db = SessionLocal()
            from datetime import timedelta
            ai_signal = AISignal(
                symbol=symbol,
                signal=signal.get("signal", "HOLD"),
                confidence=signal.get("confidence", 0),
                technical_score=signal.get("technical_score", 0),
                sentiment_score=signal.get("sentiment_score", 0),
                fundamental_score=signal.get("fundamental_score", 0),
                risk_score=signal.get("risk_score", 0),
                reason=signal.get("reason", ""),
                created_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(minutes=settings.AI_SIGNAL_EXPIRY_MINUTES),
            )
            db.add(ai_signal)
            for atype, data in [("technical", technical), ("sentiment", sentiment), ("fundamental", fundamental)]:
                analysis = AIAnalysis(
                    symbol=symbol,
                    analysis_type=atype,
                    content=data.get("reasoning", str(data)),
                    score=data.get("confidence") or data.get("sentiment_score"),
                    agent_name=f"AI {atype.title()} Analyst",
                )
                db.add(analysis)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Failed to save analysis to DB: {e}")

    def get_analysis(self, symbol: str) -> Optional[dict]:
        return self._last_analysis.get(symbol)

    def get_all_analysis(self) -> dict:
        return self._last_analysis

    def execute_signal(self, symbol: str, auto_confirm: bool = False) -> dict:
        analysis = self.get_analysis(symbol)
        if not analysis or analysis.get("status") != "success":
            return {"status": "error", "error": f"No analysis for {symbol}"}
        signal = analysis.get("signal", {})
        if auto_confirm and signal.get("confidence", 0) >= 70:
            return execution_service.execute_signal(
                symbol, signal.get("signal", "HOLD"), signal.get("confidence", 0)
            )
        return {
            "status": "pending_confirmation",
            "symbol": symbol,
            "signal": signal.get("signal", "HOLD"),
            "confidence": signal.get("confidence", 0),
        }

    def get_agent_status(self) -> dict:
        return {
            "initialized": self._initialized,
            "init_error": self._init_error,
            "agents": {
                "technical": technical_service._initialized,
                "news": news_service._initialized,
                "sentiment": sentiment_service._initialized,
                "fundamental": fundamental_service._initialized,
                "macro": macro_service._initialized,
                "risk": risk_service._initialized,
                "portfolio": portfolio_service._initialized,
            },
            "mt5_connected": mt5_service.connected,
            "last_analysis_symbols": list(self._last_analysis.keys()),
            "timestamp": datetime.utcnow().isoformat(),
        }

ai_coordinator = AICoordinator()