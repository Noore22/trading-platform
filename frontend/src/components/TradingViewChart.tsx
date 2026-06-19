'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
}

export default function TradingViewChart({ symbol = 'BINANCE:BTCUSDT', height = 380 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetId = useRef(`tv-widget-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setMounted(true);
    console.log("TradingView container mounted");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    // Strict container element lookup by ID to prevent querySelector null crashes
    const container = document.getElementById(widgetId.current);
    if (!container) {
      console.warn("TradingView container ID target element not found in DOM");
      return;
    }
    
    console.log("TradingView container found:", widgetId.current);

    try {
      container.innerHTML = '';
      
      // Map symbols correctly depending on market category
      let cleanSymbol = symbol.toUpperCase().trim();
      if (!cleanSymbol.includes(':')) {
        const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'XRPUSDT'];
        const forexSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
        const metalsSymbols = ['XAUUSD', 'XAGUSD'];
        const indexSymbols = ['US30', 'NAS100', 'SPX500'];

        if (cryptoSymbols.includes(cleanSymbol)) {
          cleanSymbol = `BINANCE:${cleanSymbol}`;
        } else if (forexSymbols.includes(cleanSymbol)) {
          cleanSymbol = `FX_IDC:${cleanSymbol}`;
        } else if (metalsSymbols.includes(cleanSymbol)) {
          cleanSymbol = `OANDA:${cleanSymbol}`;
        } else if (indexSymbols.includes(cleanSymbol)) {
          if (cleanSymbol === 'US30') cleanSymbol = `FOREXCOM:DJI`;
          else if (cleanSymbol === 'NAS100') cleanSymbol = `FOREXCOM:NAS100`;
          else if (cleanSymbol === 'SPX500') cleanSymbol = `FOREXCOM:SPX500`;
          else cleanSymbol = `FOREXCOM:${cleanSymbol}`;
        } else {
          cleanSymbol = `BINANCE:${cleanSymbol}`;
        }
      }

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: cleanSymbol,
        interval: '1',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        enable_publishing: false,
        hide_side_toolbar: true,
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com'
      });

      script.onload = () => {
        console.log("TradingView loaded successfully");
      };

      script.onerror = (e) => {
        console.error("TradingView script load error:", e);
        setError("Failed to load TradingView script");
      };

      container.appendChild(script);
    } catch (err: any) {
      console.error("TradingView initialization error exception:", err);
      setError(err.message || "Failed to initialize chart");
    }
  }, [mounted, symbol]);

  if (!mounted) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-card border border-gray-900 rounded-2xl">
        <span className="text-xs text-textSecondary uppercase tracking-widest font-semibold">Loading Live Chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center bg-card border border-gray-900 rounded-2xl p-4 text-center">
        <AlertTriangle size={24} className="text-warning mb-2" />
        <span className="text-xs text-warning font-semibold uppercase tracking-wide">Live Chart Offline</span>
        <p className="text-[10px] text-textSecondary mt-1">TradingView widget unavailable. Interactive dashboard remains active.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-1 rounded-2xl border border-gray-900 overflow-hidden w-full" style={{ height }}>
      <div id={widgetId.current} className="tradingview-widget-container h-full w-full" ref={containerRef} />
    </div>
  );
}

function AlertTriangle({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
