'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bot, Brain, Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle,
  Clock, Zap, BarChart3, Target, Shield, TrendingUp, BookOpen,
  Radio, Gauge, Cpu, Database, Wifi, Loader2
} from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

const AGENT_DEFS = [
  { key: 'technical', label: 'Technical Analyst', icon: BarChart3, color: 'from-blue-500 to-cyan-500', desc: 'Technical indicators, price action, chart patterns' },
  { key: 'news', label: 'News Analyst', icon: BookOpen, color: 'from-purple-500 to-pink-500', desc: 'Market news, economic events, headlines' },
  { key: 'sentiment', label: 'Sentiment Analyst', icon: Activity, color: 'from-green-500 to-teal-500', desc: 'Market sentiment, positioning, mood' },
  { key: 'fundamental', label: 'Fundamental Analyst', icon: TrendingUp, color: 'from-orange-500 to-red-500', desc: 'Central bank policy, economic indicators' },
  { key: 'macro', label: 'Macro Analyst', icon: Globe, color: 'from-indigo-500 to-purple-500', desc: 'Market sessions, liquidity, risk environment' },
  { key: 'risk', label: 'Risk Manager', icon: Shield, color: 'from-red-500 to-orange-500', desc: 'Position sizing, stop-loss, account risk' },
  { key: 'portfolio', label: 'Portfolio Manager', icon: Target, color: 'from-yellow-500 to-amber-500', desc: 'Allocation, diversification, exposure' },
];

function AgentCard({ agent, status, analysis }: { agent: typeof AGENT_DEFS[0]; status: boolean; analysis?: any }) {
  const Icon = agent.icon;
  return (
    <div className={`bg-[#181818] border rounded-2xl p-4 transition-all hover:border-[#FFD400]/30 ${status ? 'border-[#2B2B2B]' : 'border-[#2B2B2B]/50 opacity-70'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status ? 'bg-[#00C853] shadow-[0_0_6px_rgba(0,200,83,0.6)]' : 'bg-[#FF1744] shadow-[0_0_6px_rgba(255,23,68,0.6)]'}`} />
          <span className={`text-[10px] font-bold ${status ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
            {status ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-bold text-white mb-1">{agent.label}</h3>
      <p className="text-[10px] text-gray-500 mb-3">{agent.desc}</p>
      {analysis && (
        <div className="space-y-1 text-[10px]">
          {analysis.confidence && (
            <div className="flex justify-between">
              <span className="text-gray-500">Confidence</span>
              <span className="font-mono text-[#FFD400]">{analysis.confidence}%</span>
            </div>
          )}
          {analysis.score !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Score</span>
              <span className="font-mono text-white">{analysis.score}</span>
            </div>
          )}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-[#2B2B2B] flex items-center justify-between text-[10px] text-gray-600">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 0ms</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 0 tokens</span>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [mounted, setMounted] = useState(false);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const isBackendOffline = useStore((s) => s.isBackendOffline);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await api.aiAgents();
      setAgentStatus(status);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    try {
      const result = await api.aiAnalyze(selectedSymbol);
      setAnalysisResult(result);
    } catch {}
    setAnalyzing(false);
  }, [selectedSymbol]);

  if (!mounted) return null;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">AI Control Center</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${agentStatus?.agents ? Object.keys(agentStatus.agents).length + ' agents' : '--'} monitored`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-[#FF1744]/10 text-[#FF1744] px-2.5 py-1.5 rounded-lg text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={fetchStatus} className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD400]/50"
            >
              {['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'US30', 'SPX500'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing || isBackendOffline}
            className="px-6 py-2.5 bg-[#FFD400] text-black rounded-lg text-xs font-bold hover:bg-[#E6BF00] transition-colors disabled:opacity-50 flex items-center gap-2 mt-5"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {analyzing ? 'Analyzing...' : 'Run Full AI Analysis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENT_DEFS.map((agent) => (
              <AgentCard
                key={agent.key}
                agent={agent}
                status={agentStatus?.agents?.[agent.key] ?? false}
                analysis={analysisResult?.[agent.key]}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#FFD400]" />
              <span className="text-sm font-semibold text-white">Engine Status</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Initialized', value: agentStatus?.initialized ? 'YES' : 'NO', color: agentStatus?.initialized ? 'text-[#00C853]' : 'text-[#FF1744]' },
                { label: 'MT5 Connected', value: agentStatus?.mt5_connected ? 'YES' : 'NO', color: agentStatus?.mt5_connected ? 'text-[#00C853]' : 'text-[#FF1744]' },
                { label: 'Active Symbols', value: (agentStatus?.last_analysis_symbols?.length || 0) + '', color: 'text-[#FFD400]' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className={`text-xs font-bold font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-[#FFD400]" />
              <span className="text-sm font-semibold text-white">Latest Signal</span>
            </div>
            {analysisResult?.signal ? (
              <div>
                <div className={`text-center py-3 rounded-xl mb-2 ${analysisResult.signal.signal === 'BUY' ? 'bg-[#00C853]/10' : analysisResult.signal.signal === 'SELL' ? 'bg-[#FF1744]/10' : 'bg-[#FF9800]/10'}`}>
                  <div className={`text-2xl font-bold font-outfit ${analysisResult.signal.signal === 'BUY' ? 'text-[#00C853]' : analysisResult.signal.signal === 'SELL' ? 'text-[#FF1744]' : 'text-[#FF9800]'}`}>
                    {analysisResult.signal.signal}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Confidence: {analysisResult.signal.confidence}%</div>
                </div>
                <p className="text-[10px] text-gray-500">{analysisResult.signal.reason}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-600 text-center py-6">Run analysis to see signal</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return <Activity className={className} />;
}