'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import { useStore, Trade } from '../../store/useStore';
import api from '../../services/api';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import LiveTicker from '../../components/LiveTicker';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Percent, 
  DollarSign, 
  Play, 
  Square, 
  RefreshCw, 
  AlertTriangle,
  XCircle,
  FileText,
  Plus,
  Compass,
  Activity,
  Server,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Fallback Mock Account when no accounts exist
const fallbackAccount = {
  id: -1,
  name: "Binance Demo Spot Account (Mock Mode)",
  login: 999999,
  broker: "MetaQuotes Software Corp.",
  server: "MetaQuotes-Demo",
  api_token: "tok_mock_sandbox_credentials",
  balance: 10000.0,
  equity: 10050.0,
  margin: 1000.0,
  free_margin: 9000.0,
  margin_level: 1000.0,
  floating_profit: 50.0,
  daily_profit: 120.0,
  weekly_profit: 240.0,
  monthly_profit: 350.0,
  win_rate: 60.0,
  is_active: true,
  last_sync_at: new Date().toISOString(),
};

// Fallback Daily Profits for charts
const fallbackDailyProfits = [
  { date: 'Mon', profit: 45.0, trades: 1 },
  { date: 'Tue', profit: -20.0, trades: 1 },
  { date: 'Wed', profit: 75.0, trades: 2 },
  { date: 'Thu', profit: 60.0, trades: 1 },
  { date: 'Fri', profit: -40.0, trades: 1 },
  { date: 'Sat', profit: 0.0, trades: 0 },
  { date: 'Sun', profit: 0.0, trades: 0 }
];

const fallbackWinLoss = [
  { name: 'Win Trades', value: 3 },
  { name: 'Loss Trades', value: 2 }
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const accounts = useStore((state) => state.accounts) ?? [];
  const selectedAccount = useStore((state) => state.selectedAccount);
  const logs = useStore((state) => state.logs) ?? [];
  const setLogs = useStore((state) => state.setLogs);
  const isBackendOffline = useStore((state) => state.isBackendOffline);
  
  const openTrades = useStore((state) => state.openTrades) ?? [];
  const [dailyProfits, setDailyProfits] = useState<any[]>(fallbackDailyProfits);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Trade panel states
  const [quickSymbol, setQuickSymbol] = useState("BTCUSDT");
  const [quickLotSize, setQuickLotSize] = useState("0.10");

  const currentAccount = selectedAccount || accounts[0] || fallbackAccount;
  const wsStatus = useStore((state) => state.wsStatus);
  const isMt5Connected = useStore((state) => state.isMt5Connected);

  // ONLINE if MT5 is connected
  const isOnline = !!isMt5Connected;

  const fetchDashboardData = useCallback(async () => {
    if (!currentAccount || currentAccount.id === -1) return;
    setLoading(true);
    try {
      // Fetch MT5 connection status
      const mt5Status = await api.getMT5Status().catch(() => null);
      const connected = !!mt5Status?.connected;
      useStore.getState().setIsMt5Connected(connected);

      if (connected) {
        // Fetch open positions directly from MT5
        const positions = await api.getMT5Positions().catch(() => []);
        useStore.getState().setOpenTrades(positions as unknown as Trade[] || []);

        // Fetch deals history from MT5
        const deals = await api.getMT5History(7).catch(() => []);
        
        // Calculate daily profits from execution deals
        const dayMap: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        deals.forEach((deal: any) => {
          const date = new Date(deal.close_time);
          const dayName = days[date.getDay()];
          if (dayMap[dayName] !== undefined) {
            dayMap[dayName] += deal.profit;
          }
        });
        
        const chartData = Object.keys(dayMap).map(day => ({
          date: day,
          profit: Number(dayMap[day].toFixed(2))
        }));
        setDailyProfits(chartData);
      } else {
        // Clear open trades and use fallback daily profits when offline
        useStore.getState().setOpenTrades([]);
        setDailyProfits(fallbackDailyProfits);
      }

      // Fetch system logs
      const logsData = await api.getLogs(currentAccount.id, 10).catch(() => []);
      setLogs(logsData);
    } catch (err) {
      console.warn("Error fetching dashboard MT5 direct data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentAccount, setLogs]);

  // Periodic polling fallback if WebSocket is offline
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle Quick Trade Actions
  const handleQuickTrade = async (direction: 'buy' | 'sell') => {
    if (!isOnline) {
      alert("Binance Feed is offline. Cannot execute trades.");
      return;
    }
    const confirmTrade = confirm(`Execute direct ${direction.toUpperCase()} ${quickLotSize} lot of ${quickSymbol.toUpperCase()}?`);
    if (!confirmTrade) return;

    setActionLoading(true);
    try {
      const payload = {
        symbol: quickSymbol.toUpperCase(),
        lot_size: Number(quickLotSize),
        stop_loss: 0.0,
        take_profit: 0.0
      };
      
      if (direction === 'buy') {
        await api.placeMT5Buy(payload);
      } else {
        await api.placeMT5Sell(payload);
      }
      
      alert(`Direct market ${direction.toUpperCase()} order executed successfully!`);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Trade Placement Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Close direct position
  const handleClosePosition = async (ticket: number) => {
    const confirmClose = confirm(`Close position ticket ${ticket}?`);
    if (!confirmClose) return;

    setActionLoading(true);
    try {
      await api.closeMT5Position(ticket);
      alert(`Position closed.`);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Close Position Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Connect to MT5 manually
  const handleConnectMT5 = async () => {
    if (!currentAccount || currentAccount.id === -1) return;
    setActionLoading(true);
    try {
      await api.connectMT5(currentAccount.id);
      alert("Successfully connected to Binance Feed.");
      fetchDashboardData();
    } catch (err: any) {
      alert(`Connection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Emergency Close All direct positions
  const handleCloseAll = async () => {
    const confirmCloseAll = confirm("CRITICAL: Close all open Binance positions immediately?");
    if (!confirmCloseAll) return;

    setActionLoading(true);
    try {
      const res = await api.closeAllMT5Positions();
      alert(`Emergency Close All processed. Closed ${res.closed_count} positions.`);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Emergency Close All Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card border border-gray-900 rounded-3xl glow-blue">
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl border border-primary/20 mb-6 animate-pulse">
            <Plus size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3 tracking-wide">Connect Binance Account</h2>
          <p className="text-textSecondary text-sm max-w-md mb-8 leading-relaxed">
            Welcome to the Binance Spot Trading Platform! Please configure and link a Binance account to view live terminal data and place direct market deals.
          </p>
          <Link href="/accounts">
            <button className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98]">
              Connect Binance Account
            </button>
          </Link>
        </div>
      </Navbar>
    );
  }

  // Value formatting
  const balanceVal = currentAccount?.balance ?? 0.0;
  const equityVal = currentAccount?.equity ?? 0.0;
  const marginVal = currentAccount?.margin ?? 0.0;
  const freeMarginVal = currentAccount?.free_margin ?? 0.0;
  const levelVal = currentAccount?.margin_level ?? 0.0;
  const floatingProfitVal = currentAccount?.floating_profit ?? 0.0;
  const dailyProfitVal = currentAccount?.daily_profit ?? 0.0;
  const monthlyProfitVal = currentAccount?.monthly_profit ?? 0.0;
  const winRateVal = currentAccount?.win_rate ?? 0.0;

  const resolvedWinLoss = winRateVal > 0 
    ? [ { name: 'Win Trades', value: winRateVal }, { name: 'Loss Trades', value: 100 - winRateVal } ]
    : fallbackWinLoss;
  const PIE_COLORS = ['#10b981', '#f43f5e'];

  const statCards = [
    { name: 'Balance', value: `$${balanceVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-primary' },
    { name: 'Equity', value: `$${equityVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-indigo-400' },
    { name: 'Floating P/L', value: `$${floatingProfitVal.toFixed(2)}`, color: floatingProfitVal >= 0 ? 'text-success' : 'text-danger' },
    { name: 'Today\'s Profit', value: `$${dailyProfitVal.toFixed(2)}`, color: dailyProfitVal >= 0 ? 'text-success' : 'text-danger' },
    { name: 'Monthly Profit', value: `$${monthlyProfitVal.toFixed(2)}`, color: monthlyProfitVal >= 0 ? 'text-success' : 'text-danger' },
    { name: 'Margin', value: `$${marginVal.toLocaleString('en-US')}`, color: 'text-textSecondary' },
    { name: 'Free Margin', value: `$${freeMarginVal.toLocaleString('en-US')}`, color: 'text-textSecondary' },
    { name: 'Margin Level', value: `${levelVal ? levelVal.toFixed(1) : '0.0'}%`, color: 'text-textSecondary' },
  ];

  return (
    <Navbar>
      <div className="space-y-8">
        
        {/* Row 1: Header / Connection / Quick Trading Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MT5 Connection Monitor */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-gray-900 glow-blue flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Server size={16} className="text-primary" />
                  <span>Binance Connection Status</span>
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1.5 ${
                  isOnline 
                    ? 'bg-success/20 text-success border-success/30 animate-pulse' 
                    : 'bg-danger/20 text-danger border-danger/30'
                }`}>
                  <Activity size={10} className={isOnline ? "animate-spin" : ""} />
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </span>
              </div>
              
              <div className="space-y-3.5 text-xs font-semibold text-gray-400">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span>Account Number:</span>
                  <span className="text-white font-mono font-bold">{currentAccount.login}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span>Broker:</span>
                  <span className="text-white truncate max-w-[200px]">{currentAccount.broker}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span>Exchange:</span>
                  <span className="text-white truncate max-w-[200px]">{currentAccount.server}</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>Last Checked:</span>
                  <span className="text-white font-mono">
                    {currentAccount.last_sync_at ? new Date(currentAccount.last_sync_at).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800 flex flex-col space-y-2">
              <button
                onClick={handleConnectMT5}
                disabled={actionLoading || isOnline}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition disabled:opacity-50"
              >
                {actionLoading ? "Connecting..." : isOnline ? "Connected" : "Connect Binance"}
              </button>
              <Link href="/accounts" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wide block text-center pt-1">
                Configure Credentials Settings
              </Link>
            </div>
          </div>

          {/* Quick Trade & Emergency Panel */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                <Zap size={16} className="text-warning" />
                <span>Quick Market Execution</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Asset Symbol</label>
                  <input
                    type="text"
                    value={quickSymbol}
                    onChange={(e) => setQuickSymbol(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-bold uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Lot size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickLotSize}
                    onChange={(e) => setQuickLotSize(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleQuickTrade('buy')}
                  disabled={actionLoading || !isOnline}
                  className="bg-success hover:bg-success/90 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40"
                >
                  Quick BUY
                </button>
                <button
                  onClick={() => handleQuickTrade('sell')}
                  disabled={actionLoading || !isOnline}
                  className="bg-danger hover:bg-danger/90 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40"
                >
                  Quick SELL
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={handleCloseAll}
                disabled={actionLoading || openTrades.length === 0}
                className="w-full bg-danger/10 border border-danger/45 hover:bg-danger text-danger hover:text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
              >
                EMERGENCY CLOSE ALL POSITIONS
              </button>
            </div>
          </div>
          
        </div>

        {/* Live Broker Ticker */}
        <LiveTicker />

        {/* Row 2: Real-time Account Metrics Grid */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-1">Live Account Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between hover:border-gray-800 transition">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{card.name}</span>
                <p className={`text-lg font-bold font-sans tracking-tight ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Live Recharts & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Daily Profits (7 Days) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Daily profits distribution (Weekly)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProfits}>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="profit">
                    {dailyProfits.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry?.profit ?? 0) >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Win Rate Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Real-Time Win Ratio</h2>
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolvedWinLoss}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {resolvedWinLoss.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</span>
                <span className="text-lg font-bold text-success">{winRateVal.toFixed(1)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 text-center text-xs font-semibold mt-4 border-t border-gray-800 pt-4">
              <div className="border-r border-gray-800">
                <p className="text-success text-base font-bold">{winRateVal.toFixed(0)}%</p>
                <p className="text-gray-500 uppercase tracking-widest text-[9px] mt-0.5">Winning Ratios</p>
              </div>
              <div>
                <p className="text-danger text-base font-bold">{(100 - winRateVal).toFixed(0)}%</p>
                <p className="text-gray-500 uppercase tracking-widest text-[9px] mt-0.5">Loss Ratios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Open Positions & Live Activity Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Live Open Positions */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center justify-between">
              <span>Open Position List</span>
              <span className="bg-primary/20 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {openTrades.length} Positions Active
              </span>
            </h2>
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3">Ticket</th>
                    <th>Symbol</th>
                    <th>Direction</th>
                    <th>Volume</th>
                    <th>Open Price</th>
                    <th>Profit</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {openTrades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-500 font-semibold">
                        No active positions reported by MetaTrader.
                      </td>
                    </tr>
                  ) : (
                    openTrades.map((trade) => (
                      <tr key={trade.ticket} className="hover:bg-gray-900/10">
                        <td className="py-3 font-bold font-mono text-gray-300">{trade.ticket}</td>
                        <td className="font-bold text-white">{trade.symbol}</td>
                        <td className="uppercase font-bold">
                          <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                            {trade.type}
                          </span>
                        </td>
                        <td>{trade.volume} Lot</td>
                        <td className="font-mono">{trade.open_price.toFixed(5)}</td>
                        <td className={`font-bold font-mono ${trade.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${trade.profit.toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleClosePosition(trade.ticket)}
                            disabled={actionLoading}
                            className="py-1 px-2.5 text-[10px] bg-danger/10 border border-danger/35 hover:bg-danger text-danger hover:text-white rounded-lg font-bold transition"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Console Monitor */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                <FileText size={16} className="text-gray-400" />
                <span>Console Log Monitor</span>
              </h2>
              <div className="bg-background/95 border border-gray-900 rounded-xl p-3 font-mono text-[10px] text-gray-400 h-48 overflow-y-auto space-y-2 select-text">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-600 pt-16">Console logs are empty.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-1 border-b border-gray-900 pb-1.5 last:border-b-0">
                      <span className="text-gray-650 shrink-0">
                        [{new Date(log.created_at).toLocaleTimeString()}]
                      </span>
                      <span className={
                        log.level === 'error' ? 'text-danger' : 
                        log.level === 'warning' ? 'text-warning' : 
                        'text-gray-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </Navbar>
  );
}
