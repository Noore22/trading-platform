'use client';
import React, { useEffect, useState } from 'react';
import { Signal, Brain, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function AISignalsPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.aiHistory();
        setSignals(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">AI Signals</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Real-time AI trading signals and analysis</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-t-[#FFD400] rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-[#FF1744]/10 border border-[#FF1744]/20 text-[#FF1744] rounded-xl p-3 text-xs">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {!loading && !error && signals.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-600">
          <Brain className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No AI signals generated yet</p>
          <p className="text-xs mt-1">Run AI analysis from the dashboard or Agents page</p>
        </div>
      )}
      {!loading && signals.length > 0 && (
        <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0A0A0A] text-gray-500 uppercase font-semibold text-[10px]">
                <th className="p-3 border-b border-[#2B2B2B]">Time</th>
                <th className="p-3 border-b border-[#2B2B2B]">Symbol</th>
                <th className="p-3 border-b border-[#2B2B2B]">Signal</th>
                <th className="p-3 border-b border-[#2B2B2B]">Confidence</th>
                <th className="p-3 border-b border-[#2B2B2B]">Technical</th>
                <th className="p-3 border-b border-[#2B2B2B]">Sentiment</th>
                <th className="p-3 border-b border-[#2B2B2B]">Fundamental</th>
                <th className="p-3 border-b border-[#2B2B2B]">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2B2B]/30">
              {signals.map((s: any, i: number) => (
                <tr key={s.id || i} className="hover:bg-white/[0.02]">
                  <td className="p-3 text-gray-400 font-mono">{s.created_at ? new Date(s.created_at).toLocaleString() : '--'}</td>
                  <td className="p-3 font-bold text-white">{s.symbol}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.signal === 'BUY' ? 'bg-[#00C853]/10 text-[#00C853]' :
                      s.signal === 'SELL' ? 'bg-[#FF1744]/10 text-[#FF1744]' :
                      'bg-[#FF9800]/10 text-[#FF9800]'
                    }`}>
                      {s.signal === 'BUY' ? <TrendingUp className="w-3 h-3" /> :
                       s.signal === 'SELL' ? <TrendingDown className="w-3 h-3" /> :
                       <Minus className="w-3 h-3" />}
                      {s.signal || 'HOLD'}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{s.confidence?.toFixed(1)}%</td>
                  <td className="p-3 font-mono">{s.technical_score?.toFixed(1) || '--'}</td>
                  <td className="p-3 font-mono">{s.sentiment_score?.toFixed(1) || '--'}</td>
                  <td className="p-3 font-mono">{s.fundamental_score?.toFixed(1) || '--'}</td>
                  <td className="p-3 text-gray-400 max-w-[200px] truncate">{s.reason || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
