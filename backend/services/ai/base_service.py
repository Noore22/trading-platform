import os
import json
import logging
import time
from datetime import datetime
from typing import Optional

from config.settings import settings
from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.llm_clients import create_llm_client
from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

class BaseAIService:
    def __init__(self, name: str):
        self.name = name
        self._initialized = False
        self._deep_llm = None
        self._quick_llm = None
        self._last_result = None

    def initialize(self):
        if self._initialized:
            return True
        try:
            provider = settings.AGENT_LLM_PROVIDER or "openai"
            deep_model = settings.AGENT_DEEP_MODEL or "gpt-4o"
            quick_model = settings.AGENT_QUICK_MODEL or "gpt-4o-mini"
            llm_kwargs = {}
            if provider.lower() == "openai":
                llm_kwargs["reasoning_effort"] = settings.AGENT_REASONING_EFFORT or "medium"
            if settings.AGENT_TEMPERATURE:
                llm_kwargs["temperature"] = float(settings.AGENT_TEMPERATURE)
            deep_client = create_llm_client(provider=provider, model=deep_model, **llm_kwargs)
            quick_client = create_llm_client(provider=provider, model=quick_model, **llm_kwargs)
            self._deep_llm = deep_client.get_llm()
            self._quick_llm = quick_client.get_llm()
            self._initialized = True
            logger.info(f"{self.name} initialized: provider={provider}, deep={deep_model}, quick={quick_model}")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize {self.name}: {e}")
            return False

    def _call_llm(self, llm, prompt: str, data: str, max_retries: int = 2) -> str:
        for attempt in range(max_retries + 1):
            try:
                messages = [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": data},
                ]
                start = time.time()
                result = llm.invoke(messages)
                latency = time.time() - start
                content = result.content if hasattr(result, "content") else str(result)
                self._log_agent_run(llm=llm, success=True, latency=latency)
                return content
            except Exception as e:
                logger.warning(f"{self.name} LLM call attempt {attempt + 1} failed: {e}")
                self._log_agent_run(llm=llm, success=False, error=str(e))
                if attempt == max_retries:
                    raise
        return "ERROR: Failed to get LLM response"

    def _log_agent_run(self, llm=None, success: bool = True, latency: float = 0.0, error: str = None):
        try:
            from database.session import SessionLocal
            from database.models import AgentLog
            db = SessionLocal()
            log = AgentLog(
                agent_name=self.name,
                status="success" if success else "error",
                latency_ms=round(latency * 1000, 2),
                error=error,
            )
            db.add(log)
            db.commit()
            db.close()
        except Exception as e:
            logger.debug(f"Failed to log agent run: {e}")

    def _get_market_data(self, symbol: str, include_indicators: bool = True) -> str:
        tick = mt5_service.get_tick(symbol)
        if not tick:
            return f"No data available for {symbol}"
        lines = [f"Market Data for {symbol}", f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"]
        lines.append(f"Bid: {tick['bid']}  Ask: {tick['ask']}  Spread: {abs(tick['ask'] - tick['bid']):.5f}")
        rates_d1 = mt5_service.get_rates(symbol, "D1", 5)
        if rates_d1 and len(rates_d1) >= 2:
            prev_close = rates_d1[-2]["close"]
            curr_close = rates_d1[-1]["close"]
            change_pct = ((curr_close - prev_close) / prev_close) * 100 if prev_close else 0
            lines.append(f"Daily Change: {change_pct:+.3f}%")
            lines.append(f"O: {rates_d1[-1]['open']}  H: {rates_d1[-1]['high']}  L: {rates_d1[-1]['low']}  C: {rates_d1[-1]['close']}")
        if include_indicators:
            rates_h1 = mt5_service.get_rates(symbol, "H1", 48)
            if rates_h1:
                from websocket.manager import calculate_rsi, calculate_macd, calculate_ema, calculate_atr
                close_prices = [r["close"] for r in rates_h1]
                high_prices = [r["high"] for r in rates_h1]
                low_prices = [r["low"] for r in rates_h1]
                rsi_val = calculate_rsi(close_prices, 14)
                lines.append(f"RSI(14): {rsi_val:.1f}")
                macd = calculate_macd(close_prices)
                lines.append(f"MACD: {macd['macd']:.5f}  Signal: {macd['signal']:.5f}  Hist: {macd['histogram']:.5f}")
                ema_9 = calculate_ema(close_prices, 9)
                ema_20 = calculate_ema(close_prices, 20)
                lines.append(f"EMA(9): {ema_9:.5f}  EMA(20): {ema_20:.5f}")
                atr_val = calculate_atr(rates_h1, 14)
                lines.append(f"ATR(14): {atr_val:.5f}")
                high_20 = max(high_prices[-20:]) if len(high_prices) >= 20 else max(high_prices)
                low_20 = min(low_prices[-20:]) if len(low_prices) >= 20 else min(low_prices)
                lines.append(f"20-period Range: {low_20:.5f} - {high_20:.5f}")
        return "\n".join(lines)

    def get_last_result(self) -> Optional[dict]:
        return self._last_result