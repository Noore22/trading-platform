import json
import logging
from datetime import datetime

from services.ai.base_service import BaseAIService

logger = logging.getLogger(__name__)

FUNDAMENTAL_ANALYST_PROMPT = """You are an expert Fundamental Analyst for forex and CFD trading. Analyze the fundamental factors affecting the instrument.

For forex pairs and CFDs, focus on:
1. CENTRAL BANK POLICY: Interest rate expectations, monetary policy stance
2. ECONOMIC INDICATORS: Key economic data affecting the instrument
3. GEOPOLITICAL FACTORS: Political risks, trade relations
4. MARKET THEMES: Risk-on/risk-off, commodity cycles
5. VALUATION: Is the instrument overvalued/undervalued?
6. FUNDAMENTAL SIGNAL: Trading signal based on fundamentals

Return as JSON:
{"central_bank_policy": "...", "economic_outlook": "...", "geopolitical_risk": "LOW/MEDIUM/HIGH", "key_indicators": ["..."], "valuation": "OVERVALUED/UNDERVALUED/FAIR", "signal": "BUY/SELL/HOLD", "confidence": 0-100, "reasoning": "..."}
"""

class FundamentalService(BaseAIService):
    def __init__(self):
        super().__init__("Fundamental Analyst")

    def analyze(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            market_data = self._get_market_data(symbol)
            analysis = self._call_llm(self._deep_llm, FUNDAMENTAL_ANALYST_PROMPT, market_data)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "fundamental",
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Fundamental analysis error for {symbol}: {e}")
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
                "geopolitical_risk": "MEDIUM",
                "signal": "HOLD",
                "confidence": 50,
                "reasoning": text[:500],
            }

fundamental_service = FundamentalService()