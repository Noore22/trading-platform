'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function ScannerPage() {
  const [scannerData, setScannerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isBackendOffline = useStore((s) => s.isBackendOffline);
  const wsScannerData = useStore((s) => s.scannerData);

  const fetchScanner = async () => {
    try {
      setLoading(true);
      const data = await api.getScanner();
      setScannerData(Array.isArray(data) ? data : []);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanner();
    const interval = setInterval(fetchScanner, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (wsScannerData && wsScannerData.length > 0) {
      setScannerData(wsScannerData);
      setLoading(false);
    }
  }, [wsScannerData]);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <ArrowUp className="w-3.5 h-3.5 text-success" />;
      case 'SELL': return <ArrowDown className="w-3.5 h-3.5 text-danger" />;
      default: return <Minus className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getSignalClass = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'badge-green';
      case 'SELL': return 'badge-red';
      default: return 'badge';
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-outfit text-white">Market Scanner</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? 'Scanning...' : `${scannerData.length} symbols monitored`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-2.5 py-1.5 rounded-md text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={fetchScanner} className="btn-secondary flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {scannerData.map((item: any, i: number) => (
          <div key={item.symbol || i} className="panel p-3 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-sm text-white">{item.symbol}</span>
                <span className={`${getSignalClass(item.signal)} text-[9px]`}>
                  {getSignalIcon(item.signal)}
                  <span className="ml-1">{item.signal}</span>
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${item.trend === 'BULLISH' ? 'text-success' : 'text-danger'}`}>
                {item.trend}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div>
                <span className="text-[9px] text-gray-500">Bid</span>
                <div className="font-mono text-xs text-white">{item.bid?.toFixed(5) || '--'}</div>
              </div>
              <div>
                <span className="text-[9px] text-gray-500">Ask</span>
                <div className="font-mono text-xs text-white">{item.ask?.toFixed(5) || '--'}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              <div>
                <span className="text-[8px] text-gray-500">Spread</span>
                <div className="font-mono text-[10px] text-gray-300">{item.spread || '--'}</div>
              </div>
              <div>
                <span className="text-[8px] text-gray-500">RSI</span>
                <div className="font-mono text-[10px] text-white">{item.rsi || '--'}</div>
              </div>
              <div>
                <span className="text-[8px] text-gray-500">ATR</span>
                <div className="font-mono text-[10px] text-white">{item.atr || '--'}</div>
              </div>
              <div>
                <span className="text-[8px] text-gray-500">MACD</span>
                <div className="font-mono text-[10px] text-white">{item.macd || '--'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">Conf: <span className="font-bold text-primary">{item.confidence || 0}%</span></span>
              <span className="text-gray-500">EMA: <span className="font-bold text-white">{item.ema || '--'}</span></span>
            </div>
            <div className="mt-2 w-full bg-background rounded-full h-1">
              <div className={`h-1 rounded-full transition-all ${
                item.signal === 'BUY' ? 'bg-success' : item.signal === 'SELL' ? 'bg-danger' : 'bg-gray-600'
              }`} style={{ width: `${item.confidence || 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
