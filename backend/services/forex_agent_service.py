import json
import logging
from datetime import datetime
from typing import Optional

from tradingagents.llm_clients import create_llm_client
from tradingagents.default_config import DEFAULT_CONFIG
from config.settings import settings

from services.mt5_service import mt5_service
from tradingagents.dataflows.mt5_provider import (
    get_mt5_rates,
    get_mt5_stock_data,
    get_mt5_indicators,
    get_mt5_market_snapshot,
)
from websocket.manager import SYMBOLS, compute_scanner_data, calculate_rsi

logger = logging.getLogger(__name__)

MARKET_ANALYST_PROMPT = """You are an expert FOREX Technical Analyst. Analyze the given forex pair data and provide:
1. TREND ANALYSIS: Identify the current trend (bullish, bearish, or ranging)
2. KEY LEVELS: Identify support and resistance levels
3. TECHNICAL INDICATORS: Interpret RSI, MACD, EMA values
4. PRICE ACTION: Analyze recent price movements and patterns
5. TRADING BIAS: Give a clear directional bias (BUY, SELL, or NEUTRAL) with confidence level (0-100)

Focus specifically on forex market dynamics. Consider:
- Instrument type (forex pairs, metals, indices, crypto)
- Typical pip movements and volatility
- Session-based behavior (London, New York, Tokyo)
"""

SENTIMENT_ANALYST_PROMPT = """You are an expert FOREX Sentiment Analyst. Analyze market sentiment for the given forex pair:
1. MARKET SENTIMENT: Determine if the market is bullish, bearish, or neutral
2. SENTIMENT STRENGTH: Rate the strength of the sentiment (1-100)
3. KEY DRIVERS: Identify what's driving the sentiment (economic data, geopolitics, central bank policy)
4. RISK EVENTS: Note any upcoming economic events that could affect the pair
5. SENTIMENT SHIFT: Identify if sentiment is shifting

Consider: EUR/USD correlations, risk-on/risk-off sentiment, commodity prices for commodity pairs,
and safe-haven flows for USD/CHF, XAU/USD, and USD/JPY.
"""

TRADER_PROMPT = """You are an expert FOREX Trader. Based on the technical analysis and sentiment analysis provided:
1. DECISION: Make a clear trading decision (BUY, SELL, or HOLD)
2. CONFIDENCE: Rate your confidence (0-100)
3. RATIONALE: Explain your reasoning
4. TARGETS: Suggest take-profit levels (as pip ranges from current price)
5. STOP LOSS: Suggest stop-loss placement
6. RISK-REWARD: Calculate the risk-reward ratio
7. POSITION SIZING: Recommend position size relative to account (as percentage of balance)

Be conservative with forex trading. Consider spread costs, swap rates, and typical volatility.
"""

RISK_MANAGER_PROMPT = """You are an expert FOREX Risk Manager. Review the proposed trade:
1. RISK ASSESSMENT: Evaluate the risk level (LOW, MEDIUM, HIGH, CRITICAL)
2. MAX RISK: Verify the risk stays within (1-2% of account)
3. STOP LOSS CHECK: Ensure stop-loss placement is appropriate for the pair's volatility
4. CORRELATION CHECK: Flag if correlated pairs might be affected
5. MARKET CONDITIONS: Assess if current market conditions are suitable for trading
6. FINAL VERDICT: Approve or reject the trade with explanation
"""


class ForexAgentService:
    def __init__(self):
        self.deep_llm = None
        self.quick_llm = None
        self._initialized = False
        self._agent_results: dict[str, dict] = {}

    def initialize(self):
        if self._initialized:
            return True

        provider = settings.AGENT_LLM_PROVIDER or DEFAULT_CONFIG.get("llm_provider", "openai")
        deep_model = settings.AGENT_DEEP_MODEL or DEFAULT_CONFIG.get("deep_think_llm", "gpt-4o")
        quick_model = settings.AGENT_QUICK_MODEL or DEFAULT_CONFIG.get("quick_think_llm", "gpt-4o-mini")

        try:
            llm_kwargs = {}
            if provider.lower() == "openai":
                llm_kwargs["reasoning_effort"] = settings.AGENT_REASONING_EFFORT or "medium"
            if settings.AGENT_TEMPERATURE:
                llm_kwargs["temperature"] = float(settings.AGENT_TEMPERATURE)

            deep_client = create_llm_client(
                provider=provider,
                model=deep_model,
                **llm_kwargs,
            )
            quick_client = create_llm_client(
                provider=provider,
                model=quick_model,
                **llm_kwargs,
            )
            self.deep_llm = deep_client.get_llm()
            self.quick_llm = quick_client.get_llm()
            self._initialized = True
            logger.info(f"ForexAgentService initialized: provider={provider}, deep={deep_model}, quick={quick_model}")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize ForexAgentService: {e}")
            return False

    def _get_data_context(self, symbol: str) -> str:
        tick = mt5_service.get_tick(symbol)
        if not tick:
            return f"# {symbol}\nNo current tick data available.\n"

        lines = [f"# Market Data for {symbol}", f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"]
        lines.append(f"Bid: {tick['bid']}")
        lines.append(f"Ask: {tick['ask']}")
        lines.append(f"Spread: {abs(tick['ask'] - tick['bid']):.5f}")

        rates_d1 = mt5_service.get_rates(symbol, "D1", 5)
        if rates_d1 and len(rates_d1) >= 2:
            prev_close = rates_d1[-2]["close"]
            curr_close = rates_d1[-1]["close"]
            change_pct = ((curr_close - prev_close) / prev_close) * 100 if prev_close else 0
            lines.append(f"Daily Change: {change_pct:+.3f}%")
            lines.append(f"Daily Open: {rates_d1[-1]['open']}")
            lines.append(f"Daily High: {rates_d1[-1]['high']}")
            lines.append(f"Daily Low: {rates_d1[-1]['low']}")
            lines.append(f"Previous Close: {prev_close}")

        rates_h1 = mt5_service.get_rates(symbol, "H1", 48)
        if rates_h1:
            close_prices = [r["close"] for r in rates_h1]
            high_prices = [r["high"] for r in rates_h1]
            low_prices = [r["low"] for r in rates_h1]

            rsi_val = calculate_rsi(close_prices, 14)
            lines.append(f"\nRSI(14): {rsi_val:.1f}")
            lines.append(f"RSI Signal: {'OVERBOUGHT' if rsi_val > 70 else 'OVERSOLD' if rsi_val < 30 else 'NEUTRAL'}")

            high_20 = max(high_prices[-20:]) if len(high_prices) >= 20 else max(high_prices)
            low_20 = min(low_prices[-20:]) if len(low_prices) >= 20 else min(low_prices)
            lines.append(f"20-period High: {high_20:.5f}")
            lines.append(f"20-period Low: {low_20:.5f}")
            lines.append(f"20-period Range: {(high_20 - low_20):.5f}")

        positions = mt5_service.get_open_positions()
        symbol_positions = [p for p in positions if p["symbol"] == symbol]
        if symbol_positions:
            lines.append(f"\nOpen positions for {symbol}: {len(symbol_positions)}")
            for p in symbol_positions:
                lines.append(f"  {p['type']} {p['volume']} lots @ {p['open_price']} PnL: {p['profit']:.2f}")

        return "\n".join(lines)

    def _call_llm(self, llm, prompt: str, data: str, max_retries: int = 2) -> str:
        for attempt in range(max_retries + 1):
            try:
                messages = [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": data},
                ]
                result = llm.invoke(messages)
                content = result.content if hasattr(result, "content") else str(result)
                return content
            except Exception as e:
                logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
                if attempt == max_retries:
                    raise
        return "ERROR: Failed to get LLM response"

    def analyze_symbol(self, symbol: str) -> dict:
        if not self._initialized:
            success = self.initialize()
            if not success:
                return {"symbol": symbol, "error": "Agent service not initialized", "status": "error"}

        try:
            data_context = self._get_data_context(symbol)

            technical_analysis = self._call_llm(self.quick_llm, MARKET_ANALYST_PROMPT, data_context)

            sentiment_context = f"{data_context}\n\nScanner signals for context:\n"
            scanner = compute_scanner_data()
            for s in scanner:
                if s.get("symbol") == symbol:
                    sentiment_context += json.dumps(s, indent=2)
                    break
            sentiment_analysis = self._call_llm(self.quick_llm, SENTIMENT_ANALYST_PROMPT, sentiment_context)

            trader_context = f"Technical Analysis:\n{technical_analysis}\n\nSentiment Analysis:\n{sentiment_analysis}"
            trader_decision = self._call_llm(self.deep_llm, TRADER_PROMPT, trader_context)

            risk_context = f"Proposed Trade Decision:\n{trader_decision}\n\nAccount Context:\n"
            account = mt5_service.get_account_summary()
            risk_context += json.dumps(account, indent=2, default=str)
            risk_assessment = self._call_llm(self.quick_llm, RISK_MANAGER_PROMPT, risk_context)

            result = {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "technical_analysis": technical_analysis,
                "sentiment_analysis": sentiment_analysis,
                "trader_decision": trader_decision,
                "risk_assessment": risk_assessment,
                "status": "success",
            }

            self._agent_results[symbol] = result
            return result

        except Exception as e:
            logger.error(f"Agent analysis failed for {symbol}: {e}")
            return {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "status": "error",
            }

    def analyze_all_symbols(self) -> dict:
        results = {}
        for symbol in SYMBOLS:
            results[symbol] = self.analyze_symbol(symbol)
        return results

    def get_latest_result(self, symbol: str) -> Optional[dict]:
        return self._agent_results.get(symbol)

    def extract_signal_from_analysis(self, analysis: dict) -> dict:
        decision_text = (analysis.get("trader_decision", "") + " " +
                         analysis.get("risk_assessment", "")).lower()

        if "buy" in decision_text and "sell" not in decision_text:
            signal = "BUY"
        elif "sell" in decision_text and "buy" not in decision_text:
            signal = "SELL"
        elif "hold" in decision_text or "neutral" in decision_text:
            signal = "NEUTRAL"
        else:
            signal = "NEUTRAL"

        import re
        confidence = 50
        conf_match = re.search(r'confidence[:\s]*(\d+)', decision_text)
        if conf_match:
            confidence = min(int(conf_match.group(1)), 100)

        return {
            "symbol": analysis.get("symbol", ""),
            "signal": signal,
            "confidence": confidence,
            "timestamp": analysis.get("timestamp", ""),
        }


forex_agent_service = ForexAgentService()
