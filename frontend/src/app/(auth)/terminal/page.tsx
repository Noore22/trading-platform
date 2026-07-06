'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Target, History, Settings, Minimize2, Maximize2, GripHorizontal, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

const TradingViewChart = dynamic(
  () => import('@/components/TradingViewChart'),
  { ssr: false, loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0B0B0B] border border-border rounded-xl">
      <div className="w-8 h-8 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  )}
);

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'US30', 'GER40', 'SPX500'];

export default function TerminalPage() {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('15');
  const [positions, setPositions] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [splitPercent, setSplitPercent] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isBackendOffline = useStore((state) => state.isBackendOffline);
  const wsPositions = useStore((state) => state.positions);
  const wsOrders = useStore((state) => state.pendingOrders);

  const fetchData = useCallback(async () => {
    try {
      const [posData, ordData, hisData] = await Promise.allSettled([
        api.getMT5Positions().catch(() => []),
        api.getMT5Orders().catch(() => []),
        api.getMT5History(7).catch(() => []),
      ]);
      if (posData.status === 'fulfilled') setPositions(Array.isArray(posData.value) ? posData.value : []);
      if (ordData.status === 'fulfilled') setPendingOrders(Array.isArray(ordData.value) ? ordData.value : []);
      if (hisData.status === 'fulfilled') setHistory(Array.isArray(hisData.value) ? hisData.value : []);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (wsPositions && wsPositions.length > 0) setPositions(wsPositions);
  }, [wsPositions]);

  useEffect(() => {
    if (wsOrders && wsOrders.length > 0) setPendingOrders(wsOrders);
  }, [wsOrders]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height;
      const mouseY = e.clientY - rect.top;
      const percent = Math.max(50, Math.min(85, (mouseY / totalHeight) * 100));
      setSplitPercent(percent);
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'} overflow-hidden`}>
      <div className="flex items-center justify-between px-3 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold font-outfit text-white">Trading Terminal</h1>
          {isBackendOffline && (
            <span className="flex items-center gap-1 text-[10px] text-danger font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </span>
          )}
        </div>
        <div className="flex space-x-1.5">
          <button onClick={fetchData} className="btn-secondary text-[10px] px-2.5 py-1"><RefreshCw className="w-3 h-3" /></button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn-secondary p-1">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-3 overflow-hidden" style={{ flex: `1 1 ${splitPercent}%`, minHeight: '200px' }}>
        <div className="w-[180px] hidden xl:block flex-shrink-0 overflow-y-auto hide-scrollbar">
          <div className="panel p-2 space-y-0.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 pb-1">Symbols</div>
            {SYMBOLS.map(sym => (
              <button key={sym} onClick={() => setSymbol(sym)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  symbol === sym ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-background'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 panel border border-border rounded-xl overflow-hidden relative flex flex-col">
            <div className="h-9 flex-shrink-0 flex items-center px-3 justify-between border-b border-border bg-[#111]/80">
              <div className="flex items-center space-x-2">
                <span className="font-outfit font-bold text-sm text-white">{symbol}</span>
              </div>
              <div className="flex space-x-0.5">
                {['1', '5', '15', '30', '1H', '4H', '1D', '1W'].map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)}
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      timeframe === tf ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white hover:bg-[#1F2937]'
                    }`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TradingViewChart symbol={symbol} />
            </div>
          </div>
        </div>
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={`flex-shrink-0 h-[4px] cursor-row-resize flex items-center justify-center hover:bg-primary/30 transition-colors mx-3 rounded-full my-0.5 ${isDragging ? 'bg-primary/40' : 'bg-transparent'}`}
      >
        <GripHorizontal className="w-3 h-3 text-gray-600" />
      </div>

      <div className="mx-3 mb-2 flex flex-col overflow-hidden" style={{ flex: `0 0 calc(${100 - splitPercent}% - 40px)`, minHeight: '150px' }}>
        <div className="panel border border-border rounded-xl flex flex-col overflow-hidden flex-1">
          <div className="flex border-b border-border bg-[#111]/80 flex-shrink-0">
            {[
              { key: 'positions' as const, label: 'Open Positions', icon: Target, count: positions.length },
              { key: 'orders' as const, label: 'Pending Orders', icon: Settings, count: pendingOrders.length },
              { key: 'history' as const, label: 'Trade History', icon: History, count: history.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setBottomTab(tab.key)}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  bottomTab === tab.key ? 'bg-background text-primary border-t-[1.5px] border-primary' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label} ({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto hide-scrollbar">
            <table className="w-full text-left text-[11px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-background text-gray-500 uppercase font-semibold text-[10px]">
                  <th className="p-2 border-b border-border">Ticket</th>
                  <th className="p-2 border-b border-border">Symbol</th>
                  <th className="p-2 border-b border-border">Type</th>
                  <th className="p-2 border-b border-border text-right">Volume</th>
                  <th className="p-2 border-b border-border text-right">Price</th>
                  <th className="p-2 border-b border-border text-right">SL</th>
                  <th className="p-2 border-b border-border text-right">TP</th>
                  <th className="p-2 border-b border-border text-right">P&L</th>
                  {bottomTab === 'positions' && <th className="p-2 border-b border-border text-center">Action</th>}
                  {bottomTab === 'orders' && <th className="p-2 border-b border-border text-center">Action</th>}
                  {bottomTab === 'history' && <th className="p-2 border-b border-border text-right">Time</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {bottomTab === 'positions' && (positions.length > 0 ? positions.map((pos: any, i: number) => (
                  <tr key={pos.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-2 font-mono text-gray-400">{pos.ticket || '--'}</td>
                    <td className="p-2 font-bold text-white font-mono">{pos.symbol}</td>
                    <td className={`p-2 font-bold uppercase ${pos.type === 'BUY' ? 'text-success' : 'text-danger'}`}>
                      {pos.type || '--'}
                    </td>
                    <td className="p-2 text-right font-mono text-gray-300">{pos.volume || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{pos.open_price || '--'}</td>
                    <td className="p-2 text-right font-mono text-danger">{pos.sl || '--'}</td>
                    <td className="p-2 text-right font-mono text-success">{pos.tp || '--'}</td>
                    <td className={`p-2 text-right font-bold font-mono ${(pos.profit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${(pos.profit ?? 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button className="px-2 py-0.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded font-bold uppercase text-[9px] transition-colors">Close</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="text-center p-6 text-gray-500 font-semibold text-[11px]">No open positions</td></tr>
                ))}
                {bottomTab === 'orders' && (pendingOrders.length > 0 ? pendingOrders.map((ord: any, i: number) => (
                  <tr key={ord.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-2 font-mono text-gray-400">{ord.ticket || '--'}</td>
                    <td className="p-2 font-bold text-white font-mono">{ord.symbol || '--'}</td>
                    <td className={`p-2 font-bold uppercase ${ord.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{ord.type || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{ord.volume || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{ord.price || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{ord.sl || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{ord.tp || '--'}</td>
                    <td className="p-2 text-right font-mono text-warning">PENDING</td>
                    <td className="p-2 text-center">
                      <button className="px-2 py-0.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded font-bold uppercase text-[9px] transition-colors">Cancel</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="text-center p-6 text-gray-500 font-semibold text-[11px]">No pending orders</td></tr>
                ))}
                {bottomTab === 'history' && (history.length > 0 ? history.map((h: any, i: number) => (
                  <tr key={h.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-2 font-mono text-gray-400">{h.ticket || '--'}</td>
                    <td className="p-2 font-bold text-white font-mono">{h.symbol}</td>
                    <td className={`p-2 font-bold uppercase ${h.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{h.type || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{h.volume || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-300">{h.price || '--'}</td>
                    <td className="p-2 text-right font-mono text-gray-400">{h.entry || '--'}</td>
                    <td className={`p-2 text-right font-bold font-mono ${(h.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${(h.profit || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-gray-500">{h.close_time ? new Date(h.close_time).toLocaleDateString() : '--'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="text-center p-6 text-gray-500 font-semibold text-[11px]">No trade history</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
