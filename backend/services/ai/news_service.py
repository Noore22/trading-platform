import json
import logging
from datetime import datetime
from typing import Optional

from services.ai.base_service import BaseAIService

logger = logging.getLogger(__name__)

NEWS_ANALYST_PROMPT = """You are an expert News Analyst for institutional forex trading. Analyze market news and economic developments.

Your analysis must include:
1. HEADLINES: Summarize key news affecting the instrument
2. IMPACT: Rate the market impact (HIGH, MEDIUM, LOW)
3. SENTIMENT: Overall news sentiment (BULLISH, BEARISH, NEUTRAL)
4. KEY EVENTS: Highlight upcoming economic events
5. TRADING IMPLICATION: How news should affect trading decisions
6. RECOMMENDATION: Trading recommendation based on news

Return as JSON:
{"headlines": "...", "impact": "HIGH/MEDIUM/LOW", "sentiment": "BULLISH/BEARISH/NEUTRAL", "sentiment_score": 0-100, "key_events": ["..."], "trading_implication": "...", "recommendation": "BUY/SELL/HOLD", "confidence": 0-100}
"""

class NewsService(BaseAIService):
    def __init__(self):
        super().__init__("News Analyst")

    def analyze(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            market_data = self._get_market_data(symbol)
            analysis = self._call_llm(self._quick_llm, NEWS_ANALYST_PROMPT, market_data)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "news",
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"News analysis error for {symbol}: {e}")
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
                "impact": "MEDIUM",
                "sentiment": "NEUTRAL",
                "sentiment_score": 50,
                "recommendation": "HOLD",
                "confidence": 50,
                "headlines": text[:500],
            }

news_service = NewsService()