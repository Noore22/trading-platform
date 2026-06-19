from fastapi import WebSocket
import asyncio
import json
from typing import List
import MetaTrader5 as mt5

from services.mt5_engine import mt5_engine
from services.strategy_engine import strategy_engine

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

    async def run_broadcast_loop(self):
        while True:
            # Continuously ensure MT5 is connected
            is_connected = mt5_engine.check_connection()
            terminal_info = mt5_engine.get_terminal_info() if is_connected else None
            
            payload = {
                "type": "mt5_update",
                "data": {
                    "connection": {
                        "mt5_connected": mt5_engine.connected,
                        "bot_running": getattr(strategy_engine, "is_running", False),
                        "auto_trading_enabled": terminal_info.trade_allowed if terminal_info else False,
                        "broker": terminal_info.company if terminal_info else "Disconnected"
                    },
                    "account": mt5_engine.get_account_summary() if mt5_engine.connected else None,
                    "signals": strategy_engine.ai_signals if mt5_engine.connected else {},
                    "open_positions": mt5_engine.get_open_positions() if mt5_engine.connected else []
                }
            }
            await self.broadcast(json.dumps(payload))
            await asyncio.sleep(1) # Broadcast every 1 second

ws_manager = ConnectionManager()
