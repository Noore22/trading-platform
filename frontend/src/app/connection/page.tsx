'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { Server, ShieldCheck, RefreshCw, TerminalSquare } from 'lucide-react';

export default function ConnectionPage() {
  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-sans text-white">Platform Connection & MT5 Binding</h2>
          <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition text-xs uppercase tracking-wide">
            <RefreshCw size={14} />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MT5 Terminal Connection */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-900 border-l-4 border-l-success">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center space-x-2">
                <Server size={18} className="text-success" />
                <span>MetaTrader 5 Terminal Status</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded border border-gray-800">
                  <span className="text-xs font-bold text-gray-400">Connection Status</span>
                  <span className="flex items-center space-x-2 text-success text-xs font-bold uppercase tracking-wide bg-success/10 px-3 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span>Connected</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded border border-gray-800">
                  <span className="text-xs font-bold text-gray-400">Broker</span>
                  <span className="text-xs font-bold text-white">MetaQuotes-Demo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded border border-gray-800">
                  <span className="text-xs font-bold text-gray-400">Ping Latency</span>
                  <span className="text-xs font-bold text-white font-mono">24 ms</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded border border-gray-800">
                  <span className="text-xs font-bold text-gray-400">Last Keepalive</span>
                  <span className="text-xs font-bold text-white font-mono">2 seconds ago</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center space-x-2">
                <ShieldCheck size={18} className="text-primary" />
                <span>API Binding Credentials</span>
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    MT5 Account Login (Number)
                  </label>
                  <input type="text" autoComplete="off" defaultValue="50123456" className="w-full bg-[#111827] border border-gray-800 rounded-lg py-2.5 px-3 text-white font-mono focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Master Password
                  </label>
                  <input type="password" autoComplete="new-password" defaultValue="********" className="w-full bg-[#111827] border border-gray-800 rounded-lg py-2.5 px-3 text-white font-mono focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Server / Broker String
                  </label>
                  <input type="text" autoComplete="off" defaultValue="MetaQuotes-Demo" className="w-full bg-[#111827] border border-gray-800 rounded-lg py-2.5 px-3 text-white font-mono focus:outline-none focus:border-primary/50" />
                </div>
                
                <button type="button" className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wide rounded-lg transition mt-2">
                  Update Credentials
                </button>
              </form>
            </div>
          </div>

          {/* Raw System Logs */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 h-[600px] flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <TerminalSquare size={18} className="text-gray-400" />
              <span>Raw System Engine Logs</span>
            </h3>
            
            <div className="flex-1 bg-[#0b0e11] rounded-lg border border-gray-800 p-4 font-mono text-[10px] text-gray-400 overflow-y-auto space-y-1 custom-scrollbar">
              <div className="text-gray-500">[2026-06-19 00:00:01] INFO  System engine initialized</div>
              <div className="text-gray-500">[2026-06-19 00:00:05] INFO  Connecting to MT5 terminal socket on port 5555...</div>
              <div className="text-success">[2026-06-19 00:00:06] SUCCESS MT5 Connection established. Logged in as 50123456</div>
              <div className="text-gray-500">[2026-06-19 00:00:10] INFO  Starting tick listener for BTCUSDT, ETHUSDT...</div>
              <div className="text-primary">[2026-06-19 00:00:45] EVENT Order placed: BUY 0.1 BTCUSDT @ 64200.00</div>
              <div className="text-gray-500">[2026-06-19 00:05:00] INFO  Keepalive ping sent (12ms)</div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
