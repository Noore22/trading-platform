import json
import logging
from datetime import datetime, timedelta
from typing import Optional

from config.settings import settings

logger = logging.getLogger(__name__)

class SignalService:
    def __init__(self):
        self._signal_history = {}

    def generate_signal(self, symbol: str, technical: dict, sentiment: dict,
                        fundamental: dict, risk: dict, portfolio: dict) -> dict:
        try:
            tech_signal = technical.get("signal", "HOLD")
            tech_conf = technical.get("confidence", 50)
            sent_signal = sentiment.get("overall_sentiment", "NEUTRAL")
            sent_score = sentiment.get("sentiment_score", 50)
            sent_conf = sentiment.get("confidence", 50)
            fund_signal = fundamental.get("signal", "HOLD")
            fund_conf = fundamental.get("confidence", 50)
            risk_score = risk.get("risk_score", 50)
            risk_approval = risk.get("approval", "CONDITIONAL")
            port_signal = portfolio.get("signal", "MODERATE")

            buy_score = 0.0
            sell_score = 0.0

            buy_score += tech_conf * 0.30 if tech_signal == "BUY" else 0
            sell_score += tech_conf * 0.30 if tech_signal == "SELL" else 0

            buy_score += sent_score * 0.20
            sell_score += (100 - sent_score) * 0.20

            buy_score += fund_conf * 0.15 if fund_signal == "BUY" else 0
            sell_score += fund_conf * 0.15 if fund_signal == "SELL" else 0

            risk_factor = 1.0 - (risk_score / 100.0)
            if port_signal == "AGGRESSIVE":
                port_factor = 1.0
            elif port_signal == "MODERATE":
                port_factor = 0.6
            elif port_signal == "CONSERVATIVE":
                port_factor = 0.3
            else:
                port_factor = 0.0

            buy_score *= risk_factor * port_factor
            sell_score *= risk_factor * port_factor

            total = buy_score + sell_score
            if total > 0:
                buy_pct = buy_score / total * 100
                sell_pct = sell_score / total * 100
            else:
                buy_pct = 0
                sell_pct = 0

            if buy_pct > 60 and buy_pct > sell_pct:
                final_signal = "BUY"
                confidence = buy_pct
            elif sell_pct > 60 and sell_pct >= buy_pct:
                final_signal = "SELL"
                confidence = sell_pct
            else:
                final_signal = "HOLD"
                confidence = max(buy_pct, sell_pct)

            if risk_approval == "REJECTED":
                final_signal = "HOLD"
                confidence = min(confidence, 30)

            reason_parts = []
            if tech_signal != "HOLD":
                reason_parts.append(f"Technical: {tech_signal} ({tech_conf}%)")
            if sent_score != 50:
                reason_parts.append(f"Sentiment: {sent_score:.0f}/100")
            if fund_signal != "HOLD":
                reason_parts.append(f"Fundamental: {fund_signal} ({fund_conf}%)")
            reason_parts.append(f"Risk: {risk_score:.0f}/100")
            if port_signal:
                reason_parts.append(f"Portfolio: {port_signal}")

            result = {
                "symbol": symbol,
                "signal": final_signal,
                "confidence": round(confidence, 1),
                "technical_score": round(buy_score if tech_signal == "BUY" else sell_score if tech_signal == "SELL" else 50, 1),
                "sentiment_score": round(sent_score, 1),
                "fundamental_score": round(fund_conf if fund_signal != "HOLD" else 50, 1),
                "risk_score": round(risk_score, 1),
                "portfolio_signal": port_signal,
                "reason": "; ".join(reason_parts),
                "timestamp": datetime.utcnow().isoformat(),
            }
            self._signal_history[symbol] = result
            return result
        except Exception as e:
            logger.error(f"Signal generation error: {e}")
            return {"symbol": symbol, "signal": "HOLD", "confidence": 0, "reason": str(e)}

    def get_latest_signal(self, symbol: str) -> Optional[dict]:
        return self._signal_history.get(symbol)

    def get_all_signals(self) -> dict:
        return self._signal_history

signal_service = SignalService()