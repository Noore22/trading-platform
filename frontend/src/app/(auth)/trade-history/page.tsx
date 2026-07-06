'use client';

import React, { useState, useEffect } from 'react';
import { History, RefreshCw, AlertTriangle, Download, Search } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function TradeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(7);
  const [search, setSearch] = useState('');
  const isBackendOffline = useStore((s) => s.isBackendOffline);

  const fetchHistory = async (days: number = daysBack) => {
    try {
      setLoading(true);
      const data = await api.getMT5History(days);
      setHistory(Array.isArray(data) ? data : []);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [daysBack]);

  const totalProfit = history.reduce((sum, h) => sum + (h.profit || 0), 0);
  const wins = history.filter(h => (h.profit || 0) > 0).length;
  const losses = history.filter(h => (h.profit || 0) < 0).length;
  const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(1) : '0.0';

  const filtered = search
    ? history.filter(h => h.symbol?.toLowerCase().includes(search.toLowerCase()) || h.ticket?.toString().includes(search))
    : history;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-outfit text-white">Trade History</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${history.length} trades | Profit: ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)} | Win Rate: ${winRate}%`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))}
            className="bg-background border border-border rounded-md px-2 py-1.5 text-[11px] text-gray-300 focus:outline-none focus:border-primary/50"
          >
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
          </select>
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-2.5 py-1.5 rounded-md text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={() => fetchHistory()} className="btn-secondary flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Trades</div>
          <div className="text-lg font-bold font-mono text-white">{history.length}</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Wins</div>
          <div className="text-lg font-bold font-mono text-success">{wins}</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Losses</div>
          <div className="text-lg font-bold font-mono text-danger">{losses}</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Win Rate</div>
          <div className="text-lg font-bold font-mono text-primary">{winRate}%</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search by symbol or ticket..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary/50 placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="bg-background text-gray-500 uppercase font-semibold text-[10px]">
              <th className="p-3 border-b border-border">Ticket</th>
              <th className="p-3 border-b border-border">Symbol</th>
              <th className="p-3 border-b border-border">Type</th>
              <th className="p-3 border-b border-border text-right">Volume</th>
              <th className="p-3 border-b border-border text-right">Price</th>
              <th className="p-3 border-b border-border text-right">Profit</th>
              <th className="p-3 border-b border-border text-right">Commission</th>
              <th className="p-3 border-b border-border text-right">Swap</th>
              <th className="p-3 border-b border-border text-right">Entry</th>
              <th className="p-3 border-b border-border text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filtered.length > 0 ? filtered.map((h: any, i: number) => (
              <tr key={h.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3 font-mono text-gray-400">{h.ticket || '--'}</td>
                <td className="p-3 font-bold text-white font-mono">{h.symbol}</td>
                <td className={`p-3 font-bold uppercase ${h.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{h.type || '--'}</td>
                <td className="p-3 text-right font-mono text-gray-300">{h.volume}</td>
                <td className="p-3 text-right font-mono text-gray-300">{h.price}</td>
                <td className={`p-3 text-right font-bold font-mono ${(h.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${(h.profit || 0).toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono text-gray-400">{h.commission || '0.00'}</td>
                <td className="p-3 text-right font-mono text-gray-400">{h.swap || '0.00'}</td>
                <td className="p-3 text-right font-mono text-gray-400">{h.entry || '--'}</td>
                <td className="p-3 text-right text-gray-500">{h.close_time ? new Date(h.close_time).toLocaleString() : '--'}</td>
              </tr>
            )) : (
              <tr><td colSpan={10} className="text-center p-10 text-gray-500 font-semibold text-[11px]">
                {isBackendOffline ? 'Backend offline - history unavailable' : 'No trade history found'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
