import json
import logging
from datetime import datetime
from typing import Optional

from services.mt5_service import mt5_service
from services.ai.base_service import BaseAIService

logger = logging.getLogger(__name__)

TECHNICAL_ANALYST_PROMPT = """You are an expert Technical Analyst for institutional trading. Analyze the provided market data and produce a structured technical assessment.

Your analysis must include:
1. TREND: Identify the primary trend (BULLISH, BEARISH, or RANGING) with strength (0-100)
2. KEY LEVELS: Identify support and resistance levels
3. INDICATORS: Interpret RSI, MACD, EMA crossovers
4. MOMENTUM: Assess momentum direction and strength
5. VOLATILITY: Analyze ATR and recent price ranges
6. TRADING SIGNAL: Give a clear signal with confidence score (0-100)

Return your analysis as a JSON object with these exact keys:
{"trend": "BULLISH/BEARISH/RANGING", "trend_strength": 0-100, "support": 0.0, "resistance": 0.0, "rsi_interpretation": "...", "macd_signal": "...", "momentum": "BULLISH/BEARISH/NEUTRAL", "momentum_strength": 0-100, "volatility": "HIGH/MEDIUM/LOW", "signal": "BUY/SELL/HOLD", "confidence": 0-100, "reasoning": "..."}
"""

class TechnicalService(BaseAIService):
    def __init__(self):
        super().__init__("Technical Analyst")

    def analyze(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            market_data = self._get_market_data(symbol, include_indicators=True)
            analysis = self._call_llm(self._quick_llm, TECHNICAL_ANALYST_PROMPT, market_data)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "technical",
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Technical analysis error for {symbol}: {e}")
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
                "trend": "NEUTRAL",
                "trend_strength": 50,
                "signal": "HOLD",
                "confidence": 50,
                "reasoning": text[:500],
            }

technical_service = TechnicalService()