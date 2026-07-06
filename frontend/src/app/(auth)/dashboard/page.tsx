'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, Wallet, Activity, Percent, ShieldAlert, BarChart3,
  PieChart, ArrowUpRight, ArrowDownRight, DollarSign,
  CandlestickChart, Bell, RefreshCw, Signal,
  ArrowUp, ArrowDown, Server, Plug, Globe, Clock,
  AlertTriangle, Loader2, CheckCircle, Bot, Brain,
  Gauge, Target, Zap, Award, TrendingDown, History
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';
import { useTickStore } from '@/store/useTickStore';

const TradingViewChart = dynamic(
  () => import('@/components/TradingViewChart'),
  { ssr: false, loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-8 h-8 border-2 border-t-[#FFD400] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
  )}
);

const WATCHED_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD'];

function StatusBadge({ label, status, color }: { label: string; status: boolean; color?: string }) {
  const onlineColor = color || 'bg-[#00C853]';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${status ? `${onlineColor} shadow-[0_0_6px_rgba(0,200,83,0.6)]` : 'bg-[#FF1744] shadow-[0_0_6px_rgba(255,23,68,0.6)]'}`} />
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
    </div>
  );
}

function MetricCard({ title, value, subValue, trend, icon: Icon, color = 'primary', loading }: any) {
  const trendColor = trend > 0 ? 'text-[#00C853]' : trend < 0 ? 'text-[#FF1744]' : 'text-gray-500';
  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  const bgMap: Record<string, string> = {
    primary: 'bg-[#FFD400]/10 text-[#FFD400]',
    success: 'bg-[#00C853]/10 text-[#00C853]',
    danger: 'bg-[#FF1744]/10 text-[#FF1744]',
    warning: 'bg-[#FF9800]/10 text-[#FF9800]',
    info: 'bg-[#2196F3]/10 text-[#2196F3]',
  };
  return (
    <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4 flex flex-col justify-between animate-fadeIn hover:border-[#FFD400]/20 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg ${bgMap[color] || bgMap.primary}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-24 bg-[#181818] rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="text-xl font-bold font-mono text-white">{value}</div>
            {subValue && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                <span className={`text-[10px] font-semibold ${trendColor}`}>{Math.abs(trend || 0)}%</span>
                <span className="text-[10px] text-gray-600 ml-0.5">{subValue}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AISignalPanel() {
  const aiSignals = useStore((s) => s.aiSignals);
  const firstSymbol = Object.keys(aiSignals)[0];
  const signal = firstSymbol ? aiSignals[firstSymbol] : null;
  const sg = signal || {};

  if (!signal) {
    return (
      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#FFD400]" />
          <span className="text-sm font-semibold text-white">AI Decision</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-xs text-gray-600">Run AI analysis to see signals</p>
        </div>
      </div>
    );
  }

  const signalColor = sg.signal === 'BUY' ? 'text-[#00C853]' : sg.signal === 'SELL' ? 'text-[#FF1744]' : 'text-[#FF9800]';
  const signalBg = sg.signal === 'BUY' ? 'bg-[#00C853]/10' : sg.signal === 'SELL' ? 'bg-[#FF1744]/10' : 'bg-[#FF9800]/10';
  const conf = sg.confidence || 0;

  return (
    <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-[#FFD400]" />
        <span className="text-sm font-semibold text-white">AI Decision</span>
      </div>
      <div className={`text-center py-3 mb-3 rounded-xl ${signalBg}`}>
        <div className={`text-3xl font-bold font-outfit ${signalColor}`}>{sg.signal || 'HOLD'}</div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Gauge className="w-3 h-3" />
          <span className="text-xs text-gray-400">Confidence: {conf}%</span>
        </div>
      </div>
      <div className="w-full bg-[#0A0A0A] rounded-full h-2 mb-4">
        <div className={`h-2 rounded-full transition-all ${sg.signal === 'BUY' ? 'bg-[#00C853]' : sg.signal === 'SELL' ? 'bg-[#FF1744]' : 'bg-[#FF9800]'}`}
          style={{ width: `${conf}%` }} />
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Technical</span>
          <span className="font-mono text-white">{sg.technical_score || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Sentiment</span>
          <span className="font-mono text-white">{sg.sentiment_score || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Risk</span>
          <span className="font-mono text-white">{sg.risk_score || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Portfolio</span>
          <span className="font-mono text-white">{sg.portfolio_signal || '--'}</span>
        </div>
      </div>
      {sg.reason && (
        <div className="mt-3 pt-3 border-t border-[#2B2B2B]">
          <p className="text-[10px] text-gray-500 leading-relaxed">{sg.reason}</p>
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={async () => { try { await api.aiExecute(firstSymbol, true); } catch {} }}
          className="flex-1 py-1.5 rounded-lg bg-[#FFD400] text-black text-[10px] font-bold hover:bg-[#E6BF00] transition-colors"
        >
          Execute Signal
        </button>
        <Link href="/agents" className="flex-1 py-1.5 rounded-lg bg-[#0A0A0A] text-gray-400 text-[10px] font-bold text-center border border-[#2B2B2B] hover:text-white transition-colors">
          AI Control
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);

  const isBackendOffline = useStore((state) => state.isBackendOffline);
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const mt5Data = useStore((state) => state.mt5Data);
  const wsStatus = useStore((state) => state.wsStatus);
  const marketSession = useStore((state) => state.marketSession);
  const aiStatus = useStore((state) => state.aiStatus);
  const aiSignals = useStore((state) => state.aiSignals);
  const positions = useStore((state) => state.positions);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      useStore.getState().setIsBackendOffline(false);
      if (data.mt5) {
        useStore.getState().setIsMt5Connected(!!data.mt5.connected);
      }
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAIAnalysis = useCallback(async (symbol: string) => {
    try {
      await api.aiAnalyze(symbol);
    } catch {}
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (mounted && isMt5Connected) {
      runAIAnalysis('XAUUSD');
    }
  }, [isMt5Connected, mounted, runAIAnalysis]);

  if (!mounted) return null;

  const balance = mt5Data?.balance ?? 0;
  const equity = mt5Data?.equity ?? 0;
  const margin = mt5Data?.margin ?? 0;
  const freeMargin = mt5Data?.free_margin ?? 0;
  const floatingProfit = mt5Data?.floating_profit ?? 0;
  const dailyProfit = mt5Data?.daily_profit ?? 0;
  const drawdown = mt5Data?.drawdown ?? 0;
  const marginLevel = mt5Data?.margin_level ?? 0;
  const leverage = mt5Data?.leverage ?? 100;
  const aiInitialized = aiStatus?.initialized;
  const aiOnlineCount = aiStatus?.agents ? Object.values(aiStatus.agents).filter(Boolean).length : 0;

  const winRate = mt5Data?.win_rate ?? 0;

  const loadingSkeleton = isBackendOffline ? false : loading;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Dashboard</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">{currentTime} | {marketSession} Session</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-[#181818]/50 px-3 py-1.5 rounded-lg border border-[#2B2B2B]">
            <StatusBadge label="Backend" status={!isBackendOffline} />
            <div className="w-px h-4 bg-[#2B2B2B]" />
            <StatusBadge label="MT5" status={isMt5Connected} />
            <div className="w-px h-4 bg-[#2B2B2B]" />
            <StatusBadge label="WebSocket" status={wsStatus === 'connected'} />
            <div className="w-px h-4 bg-[#2B2B2B]" />
            <StatusBadge label="AI" status={!!aiInitialized} color="bg-[#FFD400]" />
          </div>
          <button onClick={fetchDashboardData} className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-[#FFD400]" />
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Live Prices</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {WATCHED_SYMBOLS.map((sym) => (
            <LivePriceCard key={sym} symbol={sym} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
        <MetricCard title="Balance" value={isBackendOffline ? '---' : `$${balance.toFixed(2)}`} subValue="" trend={0} icon={Wallet} color="primary" loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Equity" value={isBackendOffline ? '---' : `$${equity.toFixed(2)}`} subValue="" trend={0} icon={TrendingUp} color="success" loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Margin" value={isBackendOffline ? '---' : `$${margin.toFixed(2)}`} subValue={`Level ${marginLevel.toFixed(1)}%`} trend={margin > 0 ? -1 : 0} icon={Percent} color="warning" loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Free Margin" value={isBackendOffline ? '---' : `$${freeMargin.toFixed(2)}`} subValue="" trend={0} icon={DollarSign} color="success" loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Floating P&L" value={isBackendOffline ? '---' : `${floatingProfit >= 0 ? '+' : ''}$${floatingProfit.toFixed(2)}`} subValue="" trend={floatingProfit} icon={Activity} color={floatingProfit >= 0 ? 'success' : 'danger'} loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Daily P&L" value={isBackendOffline ? '---' : `${dailyProfit >= 0 ? '+' : ''}$${dailyProfit.toFixed(2)}`} subValue="" trend={dailyProfit} icon={BarChart3} color={dailyProfit >= 0 ? 'success' : 'danger'} loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Drawdown" value={isBackendOffline ? '---' : `${drawdown.toFixed(2)}%`} subValue="" trend={drawdown > 0 ? -1 : 0} icon={TrendingDown} color={drawdown > 5 ? 'danger' : 'warning'} loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="Win Rate" value={isBackendOffline ? '---' : `${(winRate || 0).toFixed(1)}%`} subValue="" trend={0} icon={Award} color="info" loading={loadingSkeleton && !isBackendOffline} />
        <MetricCard title="AI Status" value={aiInitialized ? `${aiOnlineCount}/7` : 'OFF'} subValue="" trend={0} icon={Bot} color={aiInitialized ? 'primary' : 'danger'} loading={false} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <CandlestickChart className="w-4 h-4 text-[#FFD400]" />
                <span className="text-sm font-semibold text-white">TradingView Chart</span>
              </div>
              <div className="flex items-center gap-1">
                {['1', '5', '15', '1H', '4H', '1D'].map((tf) => (
                  <button key={tf} className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${tf === '1H' ? 'bg-[#FFD400] text-black' : 'text-gray-500 hover:text-white hover:bg-[#0A0A0A]'}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden">
              <TradingViewChart symbol="XAUUSD" />
            </div>
          </div>

          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[#2B2B2B] bg-[#121212]/80">
              {[
                { key: 'positions' as const, label: 'Open Positions', icon: Target },
                { key: 'orders' as const, label: 'Pending Orders', icon: Signal },
                { key: 'history' as const, label: 'Trade History', icon: History },
                { key: 'logs' as const, label: 'Agent Logs', icon: Bot },
              ].map(tab => (
                <button key={tab.key}
                  className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 ${
                    true ? 'border-[#FFD400] text-[#FFD400] bg-[#0A0A0A]' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="overflow-auto max-h-48 hide-scrollbar">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-[#0A0A0A] text-gray-500 uppercase font-semibold text-[10px]">
                    <th className="p-2.5 border-b border-[#2B2B2B]">Symbol</th>
                    <th className="p-2.5 border-b border-[#2B2B2B]">Type</th>
                    <th className="p-2.5 border-b border-[#2B2B2B] text-right">Volume</th>
                    <th className="p-2.5 border-b border-[#2B2B2B] text-right">Price</th>
                    <th className="p-2.5 border-b border-[#2B2B2B] text-right">SL</th>
                    <th className="p-2.5 border-b border-[#2B2B2B] text-right">TP</th>
                    <th className="p-2.5 border-b border-[#2B2B2B] text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2B2B]/30">
                  {positions.length > 0 ? positions.map((pos: any, i: number) => (
                    <tr key={pos.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-2.5 font-bold text-white font-mono">{pos.symbol}</td>
                      <td className={`p-2.5 font-bold uppercase ${pos.type === 'BUY' ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>{pos.type}</td>
                      <td className="p-2.5 text-right font-mono text-gray-300">{pos.volume}</td>
                      <td className="p-2.5 text-right font-mono text-gray-300">{pos.open_price}</td>
                      <td className="p-2.5 text-right font-mono text-[#FF1744]">{pos.sl || '--'}</td>
                      <td className="p-2.5 text-right font-mono text-[#00C853]">{pos.tp || '--'}</td>
                      <td className={`p-2.5 text-right font-bold font-mono ${(pos.profit ?? 0) >= 0 ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                        ${(pos.profit ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="text-center p-6 text-gray-600 font-medium text-xs">No open positions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-4">
          <AISignalPanel />

          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-[#FFD400]" />
              <span className="text-sm font-semibold text-white">System Status</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Backend', status: !isBackendOffline, icon: Server },
                { label: 'MT5 Connection', status: isMt5Connected, icon: Plug },
                { label: 'WebSocket', status: wsStatus === 'connected', icon: Activity },
                { label: 'AI Engine', status: !!aiInitialized, icon: Bot },
                { label: 'Broker', status: isMt5Connected, icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-[#00C853] shadow-[0_0_6px_rgba(0,200,83,0.6)]' : 'bg-[#FF1744] shadow-[0_0_6px_rgba(255,23,68,0.6)]'}`} />
                      <span className={`text-[10px] font-semibold ${item.status ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                        {item.status ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-[#FF9800]" />
              <span className="text-sm font-semibold text-white">Risk Metrics</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Margin Usage', value: margin > 0 ? `${((margin / equity) * 100).toFixed(1)}%` : '0%', color: 'text-[#FF9800]', width: margin > 0 ? `${Math.min((margin / equity) * 100, 100)}%` : '0%', barColor: '#FF9800' },
                { label: 'Drawdown', value: `${drawdown.toFixed(1)}%`, color: drawdown > 5 ? 'text-[#FF1744]' : 'text-[#FF9800]', width: `${Math.min(drawdown, 100)}%`, barColor: drawdown > 5 ? '#FF1744' : '#FF9800' },
                { label: 'Leverage Used', value: `${leverage}:1`, color: leverage > 200 ? 'text-[#FF1744]' : 'text-[#00C853]', width: `${Math.min((leverage / 500) * 100, 100)}%`, barColor: leverage > 200 ? '#FF1744' : '#00C853' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`${item.color} font-mono font-bold`}>{item.value}</span>
                  </div>
                  <div className="w-full bg-[#0A0A0A] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: item.width, backgroundColor: item.barColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePriceCard({ symbol }: { symbol: string }) {
  const tick = useTickStore((state) => state.liveTicks[symbol]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (tick) setLoading(false); }, [tick]);
  const bid = tick?.bid ?? 0;
  const ask = tick?.ask ?? 0;
  const prevBid = tick?.prevBid ?? bid;
  const direction = bid >= prevBid ? 'up' : 'down';
  return (
    <div className="bg-[#0A0A0A] rounded-xl p-2.5 border border-[#2B2B2B] hover:border-[#FFD400]/30 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-gray-300">{symbol}</span>
        {loading ? (
          <div className="w-3 h-3 bg-[#181818] rounded-full" />
        ) : direction === 'up' ? (
          <ArrowUp className="w-3 h-3 text-[#00C853]" />
        ) : (
          <ArrowDown className="w-3 h-3 text-[#FF1744]" />
        )}
      </div>
      <div className="font-mono text-sm font-bold text-white">
        {loading ? '---' : bid.toFixed(symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 5)}
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <span className={`text-[10px] font-medium ${direction === 'up' ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
          {loading ? '--' : direction === 'up' ? '+' : ''}{(ask - bid).toFixed(5)}
        </span>
        <span className="text-[10px] text-gray-600">{loading ? '--' : `Vol ${tick?.volume ?? 0}`}</span>
      </div>
    </div>
  );
}