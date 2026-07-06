import json
import logging
from datetime import datetime

from services.ai.base_service import BaseAIService

logger = logging.getLogger(__name__)

MACRO_ANALYST_PROMPT = """You are an expert Macro Analyst. Analyze the macroeconomic environment for trading.

Your analysis must include:
1. MARKET SESSION: Current trading session and its characteristics
2. LIQUIDITY: Assess market liquidity conditions
3. VOLATILITY EXPECTED: Expected volatility based on time of day and events
4. CORRELATIONS: Key intermarket relationships to watch
5. RISK ENVIRONMENT: Overall risk appetite (RISK-ON, RISK-OFF, NEUTRAL)
6. MACRO SIGNAL: How macro conditions affect trading

Return as JSON:
{"market_session": "...", "liquidity": "HIGH/MEDIUM/LOW", "expected_volatility": "HIGH/MEDIUM/LOW", "risk_environment": "RISK-ON/RISK-OFF/NEUTRAL", "key_levels": ["..."], "signal": "BUY/SELL/HOLD", "confidence": 0-100, "reasoning": "..."}
"""

class MacroService(BaseAIService):
    def __init__(self):
        super().__init__("Macro Analyst")

    def analyze(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            from websocket.manager import compute_market_session
            session = compute_market_session()
            data = f"Symbol: {symbol}\nMarket Session: {session}\nCurrent Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            analysis = self._call_llm(self._quick_llm, MACRO_ANALYST_PROMPT, data)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "macro",
                "market_session": session,
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Macro analysis error for {symbol}: {e}")
            return {"symbol": symbol, "status": "error", "error": str(e)}

    def _parse_json(self, text: str) -> dict:
        try:
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(text[json_start:json_end])
            return {}
        except json.JSONDecodeError:
            return {
                "risk_environment": "NEUTRAL",
                "signal": "HOLD",
                "confidence": 50,
                "reasoning": text[:500],
            }

macro_service = MacroService()