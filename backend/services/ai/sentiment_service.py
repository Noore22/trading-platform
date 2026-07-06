import json
import logging
from datetime import datetime

from services.ai.base_service import BaseAIService

logger = logging.getLogger(__name__)

SENTIMENT_ANALYST_PROMPT = """You are an expert Sentiment Analyst. Analyze market sentiment for the given instrument.

Your analysis must include:
1. OVERALL SENTIMENT: BULLISH, BEARISH, or NEUTRAL
2. SENTIMENT SCORE: 0 (very bearish) to 100 (very bullish)
3. CONFIDENCE: How reliable the sentiment signal is (0-100)
4. KEY DRIVERS: What's driving market sentiment
5. RISK EVENTS: Upcoming events that could shift sentiment
6. POSITIONING: How the market is positioned

Return as JSON:
{"overall_sentiment": "BULLISH/BEARISH/NEUTRAL", "sentiment_score": 0-100, "confidence": 0-100, "key_drivers": ["..."], "risk_events": ["..."], "positioning": "...", "narrative": "..."}
"""

class SentimentService(BaseAIService):
    def __init__(self):
        super().__init__("Sentiment Analyst")

    def analyze(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            market_data = self._get_market_data(symbol)
            analysis = self._call_llm(self._quick_llm, SENTIMENT_ANALYST_PROMPT, market_data)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "sentiment",
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Sentiment analysis error for {symbol}: {e}")
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
                "overall_sentiment": "NEUTRAL",
                "sentiment_score": 50,
                "confidence": 50,
                "narrative": text[:500],
            }

sentiment_service = SentimentService()