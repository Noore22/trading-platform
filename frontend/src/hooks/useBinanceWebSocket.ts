import { useEffect, useState, useRef } from 'react';

export interface BinanceTicker {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  high: number;
  low: number;
}

export function useBinanceWebSocket(symbols: string[]) {
  const [tickers, setTickers] = useState<Record<string, BinanceTicker>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    // Convert symbols to binance format (lowercase) and attach @ticker
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/ws/${streams}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') {
          setTickers((prev) => ({
            ...prev,
            [data.s]: {
              symbol: data.s,
              price: parseFloat(data.c),
              priceChangePercent: parseFloat(data.P),
              volume: parseFloat(data.v),
              high: parseFloat(data.h),
              low: parseFloat(data.l),
            },
          }));
        }
      } catch (err) {
        console.error('Binance WS parse error', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [symbols.join(',')]);

  return tickers;
}
