'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { Search, TrendingUp, AlertTriangle, Cpu } from 'lucide-react';
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket';
import { useMT5WebSocket } from '../../hooks/useMT5WebSocket';

export default function ScannerPage() {
  const tickers = useBinanceWebSocket(['EURUSDT', 'GBPUSDT', 'USDJPY', 'AUDUSDT', 'USDCAD', 'USDCHF', 'NZDUSDT', 'XAUUSDT']);
  const activeTickers = Object.values(tickers).sort((a, b) => b.priceChangePercent - a.priceChangePercent);
  
  const { signals } = useMT5WebSocket();

  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-sans text-white">Market Scanner & AI Analyst</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search pairs..." 
              className="bg-[#111827] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-2xl border border-gray-900 overflow-hidden">
              <div className="bg-[#1e2329] p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Top Movers (24h)</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-800 text-[10px] font-bold rounded text-white hover:bg-gray-700">Gainers</button>
                  <button className="px-3 py-1 bg-transparent text-[10px] font-bold rounded text-gray-500 hover:text-white">Losers</button>
                  <button className="px-3 py-1 bg-transparent text-[10px] font-bold rounded text-gray-500 hover:text-white">Volume</button>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-[#161a1e] border-b border-gray-800">
                  <tr className="text-gray-500 font-semibold text-[10px] uppercase tracking-widest">
                    <th className="p-4">Symbol</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">24h Change</th>
                    <th className="p-4">24h Volume</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {activeTickers.map((t) => (
                    <tr key={t.symbol} className="hover:bg-gray-800/30 transition">
                      <td className="p-4 font-bold text-gray-200">{t.symbol}</td>
                      <td className="p-4 font-mono">${t.price.toFixed(4)}</td>
                      <td className={`p-4 font-mono font-bold ${t.priceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        {t.priceChangePercent >= 0 ? '+' : ''}{t.priceChangePercent.toFixed(2)}%
                      </td>
                      <td className="p-4 font-mono text-gray-400">{Math.floor(t.volume).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button className="px-4 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-bold rounded uppercase tracking-wide transition">
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTickers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-xs">Waiting for real-time market data...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Analyst */}
          <div className="space-y-6 flex flex-col">
            <div className="glass-panel p-6 rounded-2xl border border-gray-900 border-t-2 border-t-primary flex-1 flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                <Cpu size={16} className="text-primary" />
                <span>AI Analyst Insights</span>
              </h3>
              <div className="space-y-4">
                {Object.values(signals).map(signal => (
                  <div key={signal.symbol} className="p-3 bg-gray-800/40 rounded border border-gray-800">
                    <h4 className="text-xs font-bold text-white mb-1">{signal.symbol} Analysis</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      AI Engine detected a {signal.direction} condition at {signal.price}.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${signal.direction === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {signal.direction}
                      </span>
                      <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold uppercase">Confidence: {signal.confidence}%</span>
                      {signal.reasons.map(r => (
                        <span key={r} className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold uppercase">{r}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(signals).length === 0 && (
                  <div className="text-[10px] text-gray-500 text-center py-4">Waiting for AI Signals...</div>
                )}
              </div>
              <div className="mt-auto pt-4">
                <button className="w-full py-2 border border-primary/50 text-primary hover:bg-primary/10 rounded text-xs font-bold transition">
                  Generate Deep Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
