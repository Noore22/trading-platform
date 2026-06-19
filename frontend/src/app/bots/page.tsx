'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { Settings, Play, Square, Settings2, Activity } from 'lucide-react';

export default function BotsPage() {
  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-sans text-white">Bot Management & Advanced Strategies</h2>
          <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition text-xs uppercase tracking-wide">
            Deploy New Strategy
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Bots List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-2xl border border-gray-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1e2329] border-b border-gray-800">
                  <tr className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Strategy Name</th>
                    <th className="p-4">Symbol</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Net Profit</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="hover:bg-gray-800/30 transition">
                    <td className="p-4 font-bold text-gray-200">AI Strategy (Trend+RSI)</td>
                    <td className="p-4 font-mono font-semibold">EURUSD</td>
                    <td className="p-4">
                      <span className="bg-success/20 text-success text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>
                    </td>
                    <td className="p-4 text-success font-mono font-bold">+$450.20</td>
                    <td className="p-4 flex justify-end space-x-2">
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition">
                        <Settings size={14} />
                      </button>
                      <button className="p-2 bg-danger/20 hover:bg-danger/40 rounded text-danger transition">
                        <Square size={14} fill="currentColor" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-800/30 transition">
                    <td className="p-4 font-bold text-gray-200">EMA Breakout (15m)</td>
                    <td className="p-4 font-mono font-semibold">GBPUSD</td>
                    <td className="p-4">
                      <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Stopped</span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono font-bold">--</td>
                    <td className="p-4 flex justify-end space-x-2">
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition">
                        <Settings size={14} />
                      </button>
                      <button className="p-2 bg-success/20 hover:bg-success/40 rounded text-success transition">
                        <Play size={14} fill="currentColor" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Config / Details */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-2">
                <Settings2 size={16} className="text-primary" />
                <span>Global Risk Manager limits</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400 font-semibold">Risk Per Trade</span>
                  <span className="font-mono text-sm font-bold text-white">1.0%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400 font-semibold">Max Daily Loss</span>
                  <span className="font-mono text-sm font-bold text-danger">3.0%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400 font-semibold">Max Daily Profit Limit</span>
                  <span className="font-mono text-sm font-bold text-success">5.0%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-xs text-gray-400 font-semibold">Max Trades Per Day</span>
                  <span className="font-mono text-sm font-bold text-white">20</span>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-gray-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-2">
                <Activity size={16} className="text-primary" />
                <span>Execution Latency</span>
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-semibold">Avg Ping to MT5</span>
                <span className="font-mono text-sm font-bold text-success">12 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
