'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface TradingViewChartProps {
  symbol?: string;
  height?: number | string;
}

export default function TradingViewChart({ symbol = 'BINANCE:BTCUSDT', height = '100%' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetId = useRef(`tv-widget-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    setError(null);

    const container = document.getElementById(widgetId.current);
    if (!container) return;
    
    try {
      container.innerHTML = '';
      
      let cleanSymbol = symbol.toUpperCase().trim();
      if (!cleanSymbol.includes(':')) {
        const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'XRPUSDT', 'BTCUSD', 'ETHUSD'];
        const forexSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURJPY', 'GBPJPY'];
        const metalsSymbols = ['XAUUSD', 'XAGUSD'];
        const indexSymbols = ['US30', 'NAS100', 'SPX500', 'GER40'];

        if (cryptoSymbols.includes(cleanSymbol)) {
          if (cleanSymbol.endsWith('USD') && !cleanSymbol.endsWith('USDT')) {
            cleanSymbol = `COINBASE:${cleanSymbol}`;
          } else {
            cleanSymbol = `BINANCE:${cleanSymbol}`;
          }
        } else if (forexSymbols.includes(cleanSymbol) || metalsSymbols.includes(cleanSymbol)) {
          cleanSymbol = `OANDA:${cleanSymbol}`;
        } else if (indexSymbols.includes(cleanSymbol)) {
          if (cleanSymbol === 'US30') cleanSymbol = `FOREXCOM:DJI`;
          else if (cleanSymbol === 'NAS100') cleanSymbol = `FOREXCOM:NAS100`;
          else if (cleanSymbol === 'SPX500') cleanSymbol = `FOREXCOM:SPX500`;
          else if (cleanSymbol === 'GER40') cleanSymbol = `CAPITALCOM:GER40`;
          else cleanSymbol = `FOREXCOM:${cleanSymbol}`;
        } else {
          cleanSymbol = `OANDA:${cleanSymbol}`;
        }
      }

      const studies = [
        "Volume@tv-basicstudies",
        "MACD@tv-basicstudies"
      ];
      const encodedStudies = encodeURIComponent(JSON.stringify(studies));
      // Using #0B1220 (0B1220) for toolbar background
      const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=${widgetId.current}&symbol=${encodeURIComponent(cleanSymbol)}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0B1220&studies=${encodedStudies}&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${encodeURIComponent(cleanSymbol)}`;
      
      const iframe = document.createElement('iframe');
      iframe.src = iframeSrc;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      container.appendChild(iframe);

    } catch (err: any) {
      setError(err.message || "Failed to initialize chart");
    }
  }, [mounted, symbol]);

  return (
    <div className="flex-1 w-full relative min-h-full h-full" style={{ height }}>
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B1220] border border-border rounded-xl p-4 text-center">
          <AlertTriangle size={24} className="text-warning mb-2" />
          <span className="text-xs text-warning font-semibold uppercase tracking-wide">Live Chart Offline</span>
          <p className="text-[10px] text-gray-500 mt-1">TradingView widget unavailable.</p>
        </div>
      )}
      <div id={widgetId.current} className="tradingview-widget-container h-full w-full rounded-b-xl overflow-hidden" ref={containerRef} />
    </div>
  );
}
