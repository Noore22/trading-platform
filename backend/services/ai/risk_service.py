import json
import logging
from datetime import datetime
from typing import Optional

from services.ai.base_service import BaseAIService
from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

RISK_MANAGER_PROMPT = """You are an expert Risk Manager for institutional forex trading. Review the proposed trade and account status.

Your analysis must include:
1. RISK LEVEL: LOW, MEDIUM, HIGH, or CRITICAL
2. RISK SCORE: 0 (no risk) to 100 (maximum risk)
3. POSITION SIZE CHECK: Verify the position size is appropriate
4. STOP LOSS CHECK: Verify stop-loss placement
5. ACCOUNT RISK: Calculate total account risk
6. CORRELATION CHECK: Flag correlated risk
7. MAX DRAWDOWN CHECK: Verify within limits
8. APPROVAL: APPROVED, CONDITIONAL, or REJECTED

Return as JSON:
{"risk_level": "LOW/MEDIUM/HIGH/CRITICAL", "risk_score": 0-100, "position_size_ok": true/false, "stop_loss_ok": true/false, "account_risk_percent": 0.0, "correlation_risk": "LOW/MEDIUM/HIGH", "max_drawdown_ok": true/false, "approval": "APPROVED/CONDITIONAL/REJECTED", "reasoning": "...", "conditions": ["..."]}
"""

class RiskService(BaseAIService):
    def __init__(self):
        super().__init__("Risk Manager")

    def analyze(self, symbol: str, proposed_signal: Optional[str] = None, proposed_volume: Optional[float] = None) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"symbol": symbol, "status": "error", "error": "Service not initialized"}
        try:
            account = mt5_service.get_account_summary()
            positions = mt5_service.get_open_positions()
            symbol_positions = [p for p in positions if p["symbol"] == symbol]
            context = f"Symbol: {symbol}\n"
            context += f"Proposed Signal: {proposed_signal or 'N/A'}\n"
            context += f"Proposed Volume: {proposed_volume or 'N/A'}\n\n"
            context += f"Account Balance: ${account.get('balance', 0):.2f}\n"
            context += f"Account Equity: ${account.get('equity', 0):.2f}\n"
            context += f"Account Margin: ${account.get('margin', 0):.2f}\n"
            context += f"Free Margin: ${account.get('free_margin', 0):.2f}\n"
            context += f"Drawdown: {account.get('drawdown', 0):.2f}%\n"
            context += f"Open Positions: {len(positions)}\n"
            if symbol_positions:
                context += f"Existing {symbol} positions: {len(symbol_positions)}\n"
                for p in symbol_positions:
                    context += f"  {p['type']} {p['volume']} lots @ {p['open_price']} PnL: {p['profit']:.2f}\n"
            analysis = self._call_llm(self._quick_llm, RISK_MANAGER_PROMPT, context)
            parsed = self._parse_json(analysis)
            result = {
                "symbol": symbol,
                "analysis_type": "risk",
                "timestamp": datetime.utcnow().isoformat(),
                **parsed,
                "status": "success",
            }
            self._last_result = result
            return result
        except Exception as e:
            logger.error(f"Risk analysis error for {symbol}: {e}")
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
                "risk_level": "MEDIUM",
                "risk_score": 50,
                "approval": "CONDITIONAL",
                "reasoning": text[:500],
            }

risk_service = RiskService()