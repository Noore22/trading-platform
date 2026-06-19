'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { History, TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';

export default function TradeHistoryPage() {
  const [history, setHistory] = useState<any>({ summary: {}, trades: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/trades/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Activity className="animate-spin mb-4" size={32} />
          <p>Loading trade history...</p>
        </div>
      </Navbar>
    );
  }

  const { summary, trades } = history;

  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <History className="text-primary" size={24} />
          <h2 className="text-xl font-bold font-sans text-white">Advanced Trade History</h2>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <span className="text-xs font-bold uppercase text-gray-500">Net Profit</span>
            <div className={`text-2xl font-bold font-mono mt-2 ${summary?.net_profit >= 0 ? 'text-success' : 'text-danger'}`}>
              ${summary?.net_profit?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <span className="text-xs font-bold uppercase text-gray-500">Win Rate</span>
            <div className="text-2xl font-bold font-mono mt-2 text-white">
              {summary?.win_rate?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-xs text-gray-500 mt-1">{summary?.winning_trades}W / {summary?.losing_trades}L</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <span className="text-xs font-bold uppercase text-gray-500">Gross Profit</span>
            <div className="text-2xl font-bold font-mono mt-2 text-success">
              +${summary?.gross_profit?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <span className="text-xs font-bold uppercase text-gray-500">Gross Loss</span>
            <div className="text-2xl font-bold font-mono mt-2 text-danger">
              -${summary?.gross_loss?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-gray-900/50">
                <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Time</th>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Strategy</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Lot Size</th>
                  <th className="p-4">Entry Price</th>
                  <th className="p-4 text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {trades?.map((trade: any) => (
                  <tr key={trade.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 text-gray-500 font-mono">{new Date(trade.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-mono text-gray-400">#{trade.ticket}</td>
                    <td className="p-4 font-bold text-white">{trade.symbol}</td>
                    <td className="p-4 text-gray-300">{trade.strategy_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase ${trade.signal_type === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {trade.signal_type}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{trade.lot_size.toFixed(2)}</td>
                    <td className="p-4 font-mono">{trade.entry_price.toFixed(5)}</td>
                    <td className={`p-4 font-mono font-bold text-right ${trade.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {!trades || trades.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500 uppercase tracking-wider font-bold">
                      No trade history found in Database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
