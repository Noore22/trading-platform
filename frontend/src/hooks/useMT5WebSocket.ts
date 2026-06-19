import { useEffect, useState, useRef } from 'react';

export interface MT5AccountSummary {
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  leverage: number;
  currency: string;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  open_price: number;
  sl: number;
  tp: number;
  profit: number;
}

export interface AISignal {
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  reasons: string[];
  timestamp: number;
  price: number;
}

export interface MT5Connection {
  mt5_connected: boolean;
  bot_running: boolean;
  auto_trading_enabled: boolean;
  broker: string;
}

export function useMT5WebSocket() {
  const [account, setAccount] = useState<MT5AccountSummary | null>(null);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [signals, setSignals] = useState<Record<string, AISignal>>({});
  const [connection, setConnection] = useState<MT5Connection>({
    mt5_connected: false,
    bot_running: false,
    auto_trading_enabled: false,
    broker: "Disconnected"
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `ws://localhost:8000/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'mt5_update') {
          const { data } = payload;
          if (data.connection) setConnection(data.connection);
          if (data.account) setAccount(data.account);
          if (data.signals) setSignals(data.signals);
          if (data.open_positions) setPositions(data.open_positions);
        }
      } catch (err) {
        console.error('MT5 WS parse error', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { account, positions, signals, connection, isConnected };
}
