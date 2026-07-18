'use client';
import React, { useEffect, useState } from 'react';
import { Bot, TrendingUp, Activity, BarChart3, Play, Pause, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function BotsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mt5Data = useStore((s) => s.mt5Data);

  const stats = [
    { label: 'Win Rate', value: '--', icon: TrendingUp, color: 'success' },
    { label: 'Profit Factor', value: '--', icon: Activity, color: 'primary' },
    { label: 'Total Trades', value: mt5Data?.open_positions || 0, icon: BarChart3, color: 'info' },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Performance</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">AI trading bot performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#00C853]/20 transition-all">
            <Play className="w-3 h-3" /> Start
          </button>
          <button className="flex items-center gap-1.5 bg-[#FF1744]/10 border border-[#FF1744]/20 text-[#FF1744] px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#FF1744]/20 transition-all">
            <Square className="w-3 h-3" /> Stop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 text-${s.color === 'primary' ? '[#FFD400]' : s.color === 'success' ? '[#00C853]' : '[#2196F3]'}`} />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-8 flex flex-col items-center justify-center text-gray-600">
        <Bot className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">Performance analytics will appear here</p>
        <p className="text-xs mt-1">Data populates as trades are executed</p>
      </div>
    </div>
  );
}
