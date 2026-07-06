'use client';

import React, { useState } from 'react';
import { PieChart, Target, Shield, TrendingUp, TrendingDown, RefreshCw, BarChart3, Activity, Layers } from 'lucide-react';

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(true);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Portfolio</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Portfolio allocation, exposure, and risk analysis</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-[#FFD400]" />
            <span className="text-xs font-semibold text-white">Total Balance</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">$12,450.00</div>
          <span className="text-[10px] text-[#00C853]">+2.3% today</span>
        </div>
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#00C853]" />
            <span className="text-xs font-semibold text-white">Total Exposure</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">35.2%</div>
          <span className="text-[10px] text-[#FF9800]">Moderate</span>
        </div>
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#2196F3]" />
            <span className="text-xs font-semibold text-white">Diversification</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">78%</div>
          <span className="text-[10px] text-[#00C853]">Good</span>
        </div>
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#FF9800]" />
            <span className="text-xs font-semibold text-white">Correlation</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.32</div>
          <span className="text-[10px] text-[#00C853]">Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#FFD400]" />
            <span className="text-sm font-semibold text-white">Asset Allocation</span>
          </div>
          <div className="space-y-3">
            {[
              { asset: 'Major FX Pairs', alloc: 40, color: '#FFD400' },
              { asset: 'Gold (XAUUSD)', alloc: 25, color: '#FF9800' },
              { asset: 'Indices', alloc: 20, color: '#2196F3' },
              { asset: 'Crypto', alloc: 10, color: '#9C27B0' },
              { asset: 'Other', alloc: 5, color: '#00C853' },
            ].map((item) => (
              <div key={item.asset}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{item.asset}</span>
                  <span className="text-white font-mono font-bold">{item.alloc}%</span>
                </div>
                <div className="w-full bg-[#0A0A0A] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${item.alloc}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#FFD400]" />
            <span className="text-sm font-semibold text-white">Risk Breakdown</span>
          </div>
          <div className="space-y-3">
            {[
              { metric: 'Value at Risk (VaR)', value: '$185.00', pct: '1.5%', color: '#00C853' },
              { metric: 'Expected Shortfall', value: '$320.00', pct: '2.6%', color: '#FF9800' },
              { metric: 'Beta (Portfolio)', value: '0.85', pct: '', color: '#2196F3' },
              { metric: 'Volatility (Annual)', value: '12.5%', pct: '', color: '#FFD400' },
            ].map((item) => (
              <div key={item.metric} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500">{item.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">{item.value}</span>
                  {item.pct && <span className="text-[10px] text-gray-600">{item.pct}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}