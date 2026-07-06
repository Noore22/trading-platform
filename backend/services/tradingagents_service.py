import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional

from config.settings import settings
from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.graph.trading_graph import TradingAgentsGraph

logger = logging.getLogger(__name__)

class TradingAgentsService:
    def __init__(self):
        self._initialized = False
        self._graph = None
        self._results = {}
        self._running_tasks = {}

    def initialize(self):
        if self._initialized:
            return True
            
        try:
            # We must map our backend LLM settings to the TradingAgents config
            provider = settings.AGENT_LLM_PROVIDER or "openai"
            deep_model = settings.AGENT_DEEP_MODEL or "gpt-4o"
            quick_model = settings.AGENT_QUICK_MODEL or "gpt-4o-mini"
            
            config = DEFAULT_CONFIG.copy()
            config["llm_provider"] = provider
            config["deep_think_llm"] = deep_model
            config["quick_think_llm"] = quick_model
            config["temperature"] = settings.AGENT_TEMPERATURE or 0.2
            
            # Create results/data dirs inside backend/data
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "tradingagents"))
            os.makedirs(base_dir, exist_ok=True)
            config["results_dir"] = os.path.join(base_dir, "results")
            config["data_cache_dir"] = os.path.join(base_dir, "cache")
            
            self._graph = TradingAgentsGraph(
                selected_analysts=("market", "social", "news", "fundamentals"),
                config=config,
                debug=False
            )
            self._initialized = True
            logger.info("TradingAgentsService initialized successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize TradingAgentsService: {e}")
            return False

    def run_deep_analysis_sync(self, symbol: str) -> dict:
        if not self._initialized:
            if not self.initialize():
                return {"status": "error", "message": "Failed to initialize"}
                
        try:
            logger.info(f"Starting deep analysis for {symbol}")
            trade_date = datetime.now().strftime("%Y-%m-%d")
            
            # Asset type can be detected, we use 'stock' by default which uses yfinance.
            asset_type = "stock"
            
            # Run the massive LangGraph debate
            final_state, signal = self._graph.propagate(symbol, trade_date, asset_type=asset_type)
            
            # Save the markdown reports
            report_path = self._graph.save_reports(final_state, symbol)
            
            # We want to extract the markdown text from the saved reports to return to frontend.
            # Report path is a directory containing md files.
            reports = {}
            if report_path.exists() and report_path.is_dir():
                for md_file in report_path.glob("*.md"):
                    with open(md_file, "r", encoding="utf-8") as f:
                        reports[md_file.stem] = f.read()

            result = {
                "symbol": symbol,
                "date": trade_date,
                "signal": signal,
                "reports": reports,
                "final_state_summary": {
                    "final_trade_decision": final_state.get("final_trade_decision", ""),
                    "trader_investment_plan": final_state.get("trader_investment_plan", ""),
                    "investment_plan": final_state.get("investment_plan", "")
                },
                "status": "success",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self._results[symbol] = result
            return result
            
        except Exception as e:
            logger.error(f"Error running deep analysis for {symbol}: {e}")
            return {"status": "error", "message": str(e), "symbol": symbol}

    async def analyze_symbol_async(self, symbol: str) -> dict:
        """Run the analysis in a threadpool so we don't block the async event loop"""
        loop = asyncio.get_event_loop()
        self._running_tasks[symbol] = True
        try:
            result = await loop.run_in_executor(None, self.run_deep_analysis_sync, symbol)
            return result
        finally:
            self._running_tasks[symbol] = False
            
    def get_latest_result(self, symbol: str) -> Optional[dict]:
        return self._results.get(symbol)
        
    def is_running(self, symbol: str) -> bool:
        return self._running_tasks.get(symbol, False)

tradingagents_service = TradingAgentsService()
