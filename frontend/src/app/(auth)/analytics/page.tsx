'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Award, Target, Shield } from 'lucide-react';

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{title}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-xl font-bold font-mono text-white">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {change >= 0 ? <ArrowUpRight className="w-3 h-3 text-[#00C853]" /> : <ArrowDownRight className="w-3 h-3 text-[#FF1744]" />}
          <span className={`text-[10px] font-semibold ${change >= 0 ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>{Math.abs(change)}%</span>
          <span className="text-[10px] text-gray-600">vs last period</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('1W');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">AI Performance</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Performance metrics and analytics</p>
        </div>
        <div className="flex items-center gap-1 bg-[#181818] border border-[#2B2B2B] rounded-lg p-0.5">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${period === p ? 'bg-[#FFD400] text-black' : 'text-gray-500 hover:text-white'}`}
            >{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Win Rate" value="68.5%" change={5.2} icon={Award} color="bg-[#00C853]/10 text-[#00C853]" />
        <StatCard title="Sharpe Ratio" value="1.85" change={0.15} icon={Activity} color="bg-[#2196F3]/10 text-[#2196F3]" />
        <StatCard title="Profit Factor" value="2.45" change={0.3} icon={BarChart3} color="bg-[#FFD400]/10 text-[#FFD400]" />
        <StatCard title="Max Drawdown" value="-8.2%" change={-1.5} icon={TrendingDown} color="bg-[#FF1744]/10 text-[#FF1744]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Sortino Ratio" value="2.12" icon={Target} color="bg-[#FF9800]/10 text-[#FF9800]" />
        <StatCard title="Total Trades" value="147" icon={Activity} color="bg-[#9C27B0]/10 text-[#9C27B0]" />
        <StatCard title="Avg Win" value="+$45.20" icon={TrendingUp} color="bg-[#00C853]/10 text-[#00C853]" />
        <StatCard title="Avg Loss" value="-$18.50" icon={TrendingDown} color="bg-[#FF1744]/10 text-[#FF1744]" />
      </div>

      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#FFD400]" />
          <span className="text-sm font-semibold text-white">Daily PnL Distribution</span>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-600 text-xs">
          Chart data will populate with trade history
        </div>
      </div>
    </div>
  );
}