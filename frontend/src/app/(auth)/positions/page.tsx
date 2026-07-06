'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isBackendOffline = useStore((s) => s.isBackendOffline);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await api.getMT5Positions();
      setPositions(Array.isArray(data) ? data : []);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = async (ticket: number) => {
    try {
      await api.closePosition(ticket);
      fetchPositions();
    } catch (e) {
      console.error('Close failed:', e);
    }
  };

  const totalProfit = positions.reduce((sum, p) => sum + (p.profit || 0), 0);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-outfit text-white">Open Positions</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${positions.length} positions | Total P&L: ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-2.5 py-1.5 rounded-md text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={fetchPositions} className="btn-secondary flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
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
              <th className="p-3 border-b border-border text-right">Open Price</th>
              <th className="p-3 border-b border-border text-right">Current</th>
              <th className="p-3 border-b border-border text-right">SL</th>
              <th className="p-3 border-b border-border text-right">TP</th>
              <th className="p-3 border-b border-border text-right">Profit</th>
              <th className="p-3 border-b border-border text-right">Swap</th>
              <th className="p-3 border-b border-border text-right">Commission</th>
              <th className="p-3 border-b border-border text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {positions.length > 0 ? positions.map((pos: any, i: number) => (
              <tr key={pos.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3 font-mono text-gray-400">{pos.ticket || '--'}</td>
                <td className="p-3 font-bold text-white font-mono">{pos.symbol}</td>
                <td className={`p-3 font-bold uppercase ${pos.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{pos.type || '--'}</td>
                <td className="p-3 text-right font-mono text-gray-300">{pos.volume}</td>
                <td className="p-3 text-right font-mono text-gray-300">{pos.open_price}</td>
                <td className="p-3 text-right font-mono text-gray-300">{pos.current_price || '--'}</td>
                <td className="p-3 text-right font-mono text-danger">{pos.sl || '--'}</td>
                <td className="p-3 text-right font-mono text-success">{pos.tp || '--'}</td>
                <td className={`p-3 text-right font-bold font-mono ${(pos.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${(pos.profit || 0).toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono text-gray-400">{pos.swap || '0.00'}</td>
                <td className="p-3 text-right font-mono text-gray-400">{pos.commission || '0.00'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleClose(pos.ticket)}
                    className="flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded font-bold uppercase text-[9px] transition-colors mx-auto"
                  >
                    <XCircle className="w-3 h-3" /> Close
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={12} className="text-center p-10 text-gray-500 font-semibold text-[11px]">
                {isBackendOffline ? 'Backend offline - positions unavailable' : 'No open positions'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
