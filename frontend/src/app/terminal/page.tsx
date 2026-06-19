'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import { useMT5WebSocket } from '../../hooks/useMT5WebSocket';
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket';
import { AlertTriangle, Activity, Settings2, BarChart2 } from 'lucide-react';

const TradingViewChart = dynamic(
  () => import('../../components/TradingViewChart'),
  { ssr: false, loading: () => <div className="animate-pulse bg-[#111827] rounded-xl w-full h-full"></div> }
);

export default function TerminalPage() {
  const selectedAccount = useStore((state) => state.selectedAccount);
  const user = useStore((state) => state.user);
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  
  // Use MT5 backend hook for live account details & AI signals
  const { account, positions, signals, connection, isConnected } = useMT5WebSocket();

  // Connect to live Binance WebSockets for chart data (as a fallback or chart feed for now)
  // In a full production we'd stream MT5 ticks to the chart, but we use Binance for forex proxies or just keep the hook
  const tickers = useBinanceWebSocket(['EURUSDT', 'GBPUSDT', 'USDJPY', 'AUDUSDT', 'USDCAD', 'USDCHF', 'NZDUSDT']);
  const activeTicker = tickers[selectedSymbol] || { price: 0, priceChangePercent: 0 };

  return (
    <Navbar>
      <div className="h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden bg-[#0b0e11] text-gray-100 font-sans">
        
        {/* Dynamic Warning Banners */}
        {(!connection?.mt5_connected || !connection?.auto_trading_enabled) && (
          <div className="h-8 flex items-center px-4 bg-warning/20 border-b border-warning/30 text-warning text-[10px] font-bold uppercase tracking-wider space-x-4">
            <AlertTriangle size={14} />
            <span>
              {!connection?.mt5_connected ? 'MT5 Terminal Disconnected.' : 'Auto Trading Disabled in MT5 Terminal.'}
            </span>
          </div>
        )}

        {/* KPI Top Bar */}
        <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-[#161a1e]">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Live Price</span>
              <span className={`text-xs font-bold ${activeTicker?.priceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {activeTicker ? activeTicker.price.toFixed(2) : 'Loading...'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">24h Change</span>
              <span className={`text-xs font-bold ${activeTicker?.priceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {activeTicker ? `${activeTicker.priceChangePercent.toFixed(2)}%` : '--'}
              </span>
            </div>
            <div className="flex flex-col border-l border-gray-800 pl-6">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Daily P/L</span>
              <span className={`text-xs font-bold ${positions.reduce((a, p) => a + p.profit, 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                ${positions.reduce((a, p) => a + p.profit, 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connection?.mt5_connected ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
              <span className={`text-[10px] font-semibold uppercase ${connection?.mt5_connected ? 'text-success' : 'text-danger'}`}>
                {connection?.mt5_connected ? 'MT5 Connected' : 'MT5 Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connection?.bot_running ? 'bg-success animate-pulse' : 'bg-warning'}`}></div>
              <span className={`text-[10px] font-semibold uppercase ${connection?.bot_running ? 'text-success' : 'text-warning'}`}>
                {connection?.bot_running ? 'Bot Running' : 'Bot Stopped'}
              </span>
            </div>
          </div>
        </div>

        {/* Dense Flex Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-1 p-1 overflow-hidden">
          
          {/* Left Panel: Market Watch */}
          <div className="w-full lg:w-2/12 flex flex-col gap-1 overflow-hidden shrink-0">
            <div className="flex-1 bg-[#161a1e] border border-gray-800 rounded-sm flex flex-col overflow-hidden">
              <div className="h-8 border-b border-gray-800 flex items-center px-3 bg-[#1e2329]">
                <Activity size={12} className="text-primary mr-2" />
                <span className="text-[10px] font-bold uppercase text-gray-300">Market Watch</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
                {Object.values(tickers).map((t) => (
                  <div 
                    key={t.symbol}
                    onClick={() => setSelectedSymbol(t.symbol)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-gray-800 transition ${selectedSymbol === t.symbol ? 'bg-gray-800 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <span className="text-[10px] font-bold">{t.symbol}</span>
                    <span className={`text-[10px] font-mono ${t.priceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                      {t.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                {Object.keys(tickers).length === 0 && (
                  <div className="p-4 text-center text-[10px] text-gray-500">Connecting to streams...</div>
                )}
              </div>
            </div>
            
            <div className="flex-1 bg-[#161a1e] border border-gray-800 rounded-sm flex flex-col overflow-hidden">
              <div className="h-8 border-b border-gray-800 flex items-center px-3 bg-[#1e2329]">
                <Activity size={12} className="text-primary mr-2" />
                <span className="text-[10px] font-bold uppercase text-gray-300">Live Trade Feed</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* Mock Live Trade Feed, wait for DB integration */}
                <div className="p-1 space-y-1">
                  <div className="text-[9px] font-mono p-1 border-b border-gray-800 text-gray-400">Waiting for live executions...</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Chart & Trade History */}
          <div className="w-full lg:w-7/12 flex flex-col gap-1 overflow-hidden shrink-0">
            {/* Chart */}
            <div className="flex-[2] bg-[#161a1e] border border-gray-800 rounded-sm relative">
              <TradingViewChart key={selectedSymbol} symbol={selectedSymbol} height={undefined} />
            </div>
            
            {/* Trade History Bottom */}
            <div className="flex-1 bg-[#161a1e] border border-gray-800 rounded-sm flex flex-col overflow-hidden">
              <div className="h-8 border-b border-gray-800 flex items-center px-3 bg-[#1e2329]">
                <BarChart2 size={12} className="text-primary mr-2" />
                <span className="text-[10px] font-bold uppercase text-gray-300">Open Positions & Orders</span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="pb-1 font-semibold">Symbol</th>
                      <th className="pb-1 font-semibold">Type</th>
                      <th className="pb-1 font-semibold">Size</th>
                      <th className="pb-1 font-semibold">Open Price</th>
                      <th className="pb-1 font-semibold">SL/TP</th>
                      <th className="pb-1 font-semibold text-right">Floating PnL</th>
                      <th className="pb-1 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p) => (
                      <tr key={p.ticket} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 font-bold text-gray-300">{p.symbol}</td>
                        <td className={`py-2 font-semibold ${p.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{p.type}</td>
                        <td className="py-2">{p.volume.toFixed(2)}</td>
                        <td className="py-2 font-mono">{p.open_price.toFixed(5)}</td>
                        <td className="py-2 font-mono text-[9px] text-gray-500">
                          {p.sl > 0 ? p.sl.toFixed(5) : '--'} / {p.tp > 0 ? p.tp.toFixed(5) : '--'}
                        </td>
                        <td className={`py-2 text-right font-mono font-bold ${p.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {p.profit >= 0 ? '+' : ''}${p.profit.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          <button className="px-2 py-0.5 bg-danger/20 text-danger rounded hover:bg-danger/40 transition">Close</button>
                        </td>
                      </tr>
                    ))}
                    {positions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">No open positions.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel: Order Entry & Bots */}
          <div className="w-full lg:w-3/12 flex flex-col gap-1 overflow-hidden shrink-0">
            {/* Order Entry */}
            <div className="flex-1 bg-[#161a1e] border border-gray-800 rounded-sm flex flex-col overflow-hidden">
              <div className="h-8 border-b border-gray-800 flex items-center px-3 bg-[#1e2329]">
                <Settings2 size={12} className="text-primary mr-2" />
                <span className="text-[10px] font-bold uppercase text-gray-300">Order Execution</span>
              </div>
              <div className="flex-1 p-3 space-y-4">
                <div className="flex rounded bg-gray-900 p-0.5">
                  <button className="flex-1 py-1 bg-gray-800 rounded text-[10px] font-bold text-white shadow-sm">Market</button>
                  <button className="flex-1 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition">Limit</button>
                  <button className="flex-1 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition">Stop</button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-semibold mb-1">Lot Size</label>
                    <input type="number" defaultValue="0.01" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex flex-col flex-1">
                      <label className="text-[10px] text-gray-500 font-semibold mb-1">Take Profit</label>
                      <input type="number" placeholder="0.0" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-[10px] text-gray-500 font-semibold mb-1">Stop Loss</label>
                      <input type="number" placeholder="0.0" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-white focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button className="bg-success hover:bg-success/90 text-white font-bold py-2 rounded text-xs transition active:scale-95 shadow-lg shadow-success/20">
                    Buy / Long
                  </button>
                  <button className="bg-danger hover:bg-danger/90 text-white font-bold py-2 rounded text-xs transition active:scale-95 shadow-lg shadow-danger/20">
                    Sell / Short
                  </button>
                </div>
              </div>
            </div>

            {/* Bot Control Panel */}
            <div className="flex-1 bg-[#161a1e] border border-gray-800 rounded-sm flex flex-col overflow-hidden">
              <div className="h-8 border-b border-gray-800 flex items-center px-3 bg-[#1e2329]">
                <Activity size={12} className="text-primary mr-2" />
                <span className="text-[10px] font-bold uppercase text-gray-300">Bot Control Panel</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                <div className="bg-gray-900 rounded border border-gray-800 p-2 text-[10px]">
                  <div className="flex justify-between items-center mb-1 border-b border-gray-800 pb-1">
                    <span className="text-gray-500 font-bold">Bot Status</span>
                    <span className={`font-bold uppercase ${connection?.bot_running ? 'text-success' : 'text-danger'}`}>{connection?.bot_running ? 'RUNNING' : 'STOPPED'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 border-b border-gray-800 pb-1">
                    <span className="text-gray-500 font-bold">Risk Per Trade</span>
                    <span className="text-white font-mono font-bold">1.0%</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 border-b border-gray-800 pb-1">
                    <span className="text-gray-500 font-bold">Max Daily Loss</span>
                    <span className="text-danger font-mono font-bold">3.0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">Open Positions</span>
                    <span className="text-white font-mono font-bold">{positions.length}</span>
                  </div>
                </div>

                {/* AI Signals inside Control Panel */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">Live AI Signals</span>
                  {Object.values(signals).map(signal => (
                    <div key={signal.symbol} className="bg-gray-800/50 border border-gray-700 rounded p-2 flex flex-col justify-between mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[10px] font-bold text-gray-200">{signal.symbol} Analyst</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${signal.direction === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                          {signal.direction} ({signal.confidence}%)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {signal.reasons.map(r => (
                          <span key={r} className="text-[8px] text-gray-400 bg-gray-900 px-1 py-0.5 rounded">{r}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(signals).length === 0 && (
                    <div className="text-[10px] text-gray-500 text-center py-4">Waiting for AI Signals...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Navbar>
  );
}
