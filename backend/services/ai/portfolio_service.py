import json
import logging
from datetime import datetime
from typing import Optional

from services.ai.base_service import BaseAIService
from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

PORTFOLIO_MANAGER_PROMPT = """You are an expert Portfolio Manager. Review the overall portfolio and provide allocation recommendations.

Your analysis must include:
1. PORTFOLIO RISK: Overall portfolio risk assessment
2. DIVERSIFICATION: How well diversified the portfolio is
3. EXPOSURE: Sector and instrument exposure analysis
4. CONCENTRATION RISK: Any over-concentration issues
5. POSITION SIZING: Recommended position sizing for new trades
6. ALLOCATION ADJUSTMENT: Any rebalancing needed
7. PORTFOLIO SIGNAL: Overall portfolio trading signal

Return as JSON:
{"portfolio_risk": "LOW/MEDIUM/HIGH", "portfolio_risk_score": 0-100, "diversification": "GOOD/MODERATE/POOR", "diversification_score": 0-100, "total_exposure_percent": 0.0, "concentration_risk": "LOW/MEDIUM/HIGH", "recommended_position_size": "SMALL/MEDIUM/LARGE", "max_position_size_lots": 0.0, "rebalance_needed": true/false, "signal": "AGGRESSIVE/MODERATE/CONSERVATIVE/HOLD", "reasoning": "..."}
"""

class PortfolioService(BaseAIService):
    def __init__(self):
        super().__init__("Portfolio Manager")

    def analyze(self, symbol: Optional[str] = None) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"status": "error", "error": "Service not initialized"}
        try:
            account = mt5_service.get_account_summary()
            positions = mt5_service.get_open_positions()
            balance = account.get("balance", 0)
            equity = account.get("equity", 0)
            margin = account.get("margin", 0)
            total_exposure = (margin / equity * 100) if equity > 0 else 0
            position_summary = []
            for p in positions:
                position_summary.append(f"{p['symbol']} {p['type']} {p['volume']} lots PnL: {p['profit']:.2f}")
            context = f"Portfolio Overview\n"
            context += f"Balance: ${balance:.2f}\n"
            context += f"Equity: ${equity:.2f}\n"
            context += f"Margin: ${margin:.2f}\n"
            context += f"Free Margin: ${account.get('free_margin', 0):.2f}\n"
            context += f"Total Exposure: {total_exposure:.1f}%\n"
            context += f"Open Positions: {len(positions)}\n"
            if position_summary:
                context += "Positions:\n" + "\n".join(position_summary)
            if symbol:
                context += f"\n\nPending analysis for: {symbol}"
            analysis = self._call_llm(self._deep_llm, PORTFOLIO_MANAGER_PROMPT, context)
            parsed = self._parse_json(analysis)
            from database.session import SessionLocal
            from database.models import PortfolioScore
            try:
                db = SessionLocal()
                score = PortfolioScore(
                    total_balance=balance,
                    total_equity=equity,
                    total_exposure=total_exposure,
                    total_risk=parsed.get("portfolio_risk_score", 50),
                    diversification_score=parsed.get("diversification_score", 50),
                    metadata_json=json.dumps(parsed),
                )
                db.add(score)
                db.commit()
                db.close()
            except Exception:
                pass
            result = {
                "analysis_type": "portfolio",
                "timestamp": datetime.utcnow().isoformat(),
                "total_balance": balance,
                "total_equity": equity,
                "total_exposure_percent": round(total_exposure, 2),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Portfolio analysis error: {e}")
            return {"status": "error", "error": str(e)}

    def _parse_json(self, text: str) -> dict:
        try:
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(text[json_start:json_end])
            return {}
        except json.JSONDecodeError:
            return {
                "portfolio_risk": "MEDIUM",
                "diversification": "MODERATE",
                "signal": "HOLD",
                "reasoning": text[:500],
            }

portfolio_service = PortfolioService()