'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import { useStore, Trade } from '../../store/useStore';
import api from '../../services/api';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import dynamic from 'next/dynamic';
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
  Zap,
  Star,
  Search,
  BookOpen,
  History,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { Wallet, Server as ServerIcon, PlayCircle, StopCircle } from 'lucide-react';
import { useMT5WebSocket } from '../../hooks/useMT5WebSocket';
import Watchlist from '../../components/dashboard/Watchlist';
import { useTickStore } from '../../store/useTickStore';

// Dynamically import TradingView chart to prevent SSR errors
const TradingViewChart = dynamic(
  () => import('../../components/TradingViewChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] flex items-center justify-center bg-card border border-gray-900 rounded-2xl">
        <span className="text-xs text-textSecondary uppercase tracking-widest font-semibold animate-pulse">Loading Advanced Chart...</span>
      </div>
    )
  }
);

// Helper component for live prices so DashboardContent doesn't re-render on every tick
const LivePrice = ({ symbol, type, decimalPlaces }: { symbol: string, type: 'last' | 'bid' | 'ask', decimalPlaces: number }) => {
  const tick = useTickStore(state => state.liveTicks[symbol]);
  
  if (!tick) {
    // Fallback numbers for UI rendering if disconnected
    const fallbacks: Record<string, any> = {
      BTCUSDT: { bid: 67100.0, ask: 67102.0, last: 67101.0 },
      ETHUSDT: { bid: 3500.0, ask: 3500.2, last: 3500.1 },
      BNBUSDT: { bid: 580.0, ask: 580.1, last: 580.05 },
      SOLUSDT: { bid: 150.0, ask: 150.02, last: 150.01 },
      EURUSD: { bid: 1.08510, ask: 1.08525, last: 1.08517 },
      GBPUSD: { bid: 1.27210, ask: 1.27225, last: 1.27217 },
      USDJPY: { bid: 156.48, ask: 156.50, last: 156.49 },
      XAUUSD: { bid: 2330.10, ask: 2330.30, last: 2330.20 },
      US30: { bid: 39800.0, ask: 39802.0, last: 39801.0 }
    };
    const defaultVal = fallbacks[symbol]?.[type] || 1.0;
    return <>{defaultVal.toFixed(decimalPlaces)}</>;
  }

  return <>{(tick[type] ?? 0).toFixed(decimalPlaces)}</>;
};

// Fallback objects if account data is missing
const fallbackAccount = {
  id: -1,
  name: "Binance Demo Spot Account",
  login: 888888,
  broker: "Binance Inc.",
  server: "Binance-Spot-Prod",
  balance: 10000.0,
  equity: 10000.0,
  margin: 0.0,
  free_margin: 10000.0,
  margin_level: 0.0,
  floating_profit: 0.0,
  daily_profit: 0.0,
  weekly_profit: 0.0,
  monthly_profit: 0.0,
  win_rate: 0.0,
  is_active: true,
  last_sync_at: new Date().toISOString(),
};

export default function DashboardPage() {
  const { account, positions, connection } = useMT5WebSocket();

  // Compute live aggregates
  const dailyProfit = positions.reduce((acc, p) => acc + p.profit, 0);
  const openTradesCount = positions.length;
  
  // Example hardcoded historical metrics (ideally fetched via REST from SQLite)
  const winRate = 72.5;
  const totalTrades = 45;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

const AdminPanel = () => {
  return (
    <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 flex flex-col space-y-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldAlert size={64} />
      </div>
      <h3 className="text-primary font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
        <ShieldAlert size={16} />
        <span>Trading Control Center (Admin Override)</span>
      </h3>
      <p className="text-gray-400 text-xs max-w-xl">Full system control access granted. You are viewing the global dashboard with administrative privileges. You can override trader actions, access all user positions, and manage global settings from this terminal.</p>
    </div>
  );
};

function DashboardContent() {
  const user = useStore((state) => state.user);
  const accounts = useStore((state) => state.accounts) ?? [];
  const selectedAccount = useStore((state) => state.selectedAccount);
  const logs = useStore((state) => state.logs) ?? [];
  const setLogs = useStore((state) => state.setLogs);
  const openTrades = useStore((state) => state.openTrades) ?? [];
  const pendingOrders = useStore((state) => state.pendingOrders) ?? [];
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const wsStatus = useStore((state) => state.wsStatus);
  const selectedSymbol = useStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useStore((state) => state.setSelectedSymbol);
  const activeBots = useStore((state) => state.activeBots) ?? {};
  const setActiveBots = useStore((state) => state.setActiveBots);

  // Subscribe ONLY to the currently selected symbol to minimize re-renders!
  const currentTick = useTickStore((state) => state.liveTicks[selectedSymbol]) || {
    bid: 1.0,
    ask: 1.01,
    last: 1.0,
    volume: 0
  };

  const currentAccount = selectedAccount || accounts[0] || fallbackAccount;
  const isOnline = !!isMt5Connected;

  // UI state variables
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'positions' | 'orders' | 'history' | 'logs'>('positions');
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'crypto' | 'forex' | 'metals' | 'indices' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Order entry variables
  const [orderAction, setOrderAction] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [lotSize, setLotSize] = useState('0.10');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  // Local state for watchlist favorites and history
  const [favorites, setFavorites] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'EURUSD', 'XAUUSD']);
  const [historyTrades, setHistoryTrades] = useState<any[]>([]);

  // News state with simulated headlines
  const [newsHeadlines, setNewsHeadlines] = useState<string[]>([
    "Binance Spot Volumes Surge as Institutional Investors Accumulate BTC.",
    "Federal Reserve Keeps Rates Steady; Dollar Stabilizes Against Euro.",
    "Gold Prices Test New Resistance Limits as Safe-Haven Hedging Extends.",
    "Dow Jones Gains 300 Points; Nasdaq Outperforms on Tech Sector Strength."
  ]);

  // Market Symbol definitions
  const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'XRPUSDT'];
  const forexSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
  const metalsSymbols = ['XAUUSD', 'XAGUSD'];
  const indexSymbols = ['US30', 'NAS100', 'SPX500'];
  const allSymbols = [...cryptoSymbols, ...forexSymbols, ...metalsSymbols, ...indexSymbols];

  // Helper to fetch dashboard updates
  const fetchDashboardData = useCallback(async () => {
    if (!currentAccount || currentAccount.id === -1) return;
    try {
      // Sync MT5/Binance status
      const statusData = await api.getMT5Status().catch(() => null);
      if (statusData) {
        useStore.getState().setIsMt5Connected(!!statusData.connected);
      }

      // Sync active positions
      const positions = await api.getMT5Positions().catch(() => []);
      useStore.getState().setOpenTrades(positions || []);

      // Sync pending orders
      const orders = await api.getPendingOrders().catch(() => []);
      useStore.getState().setPendingOrders(orders || []);

      // Sync history deals
      const history = await api.getMT5History(7).catch(() => []);
      setHistoryTrades(history || []);

      // Sync bot strategy settings
      const bots = await api.getBotStatus().catch(() => ({}));
      setActiveBots(bots || {});
    } catch (err) {
      console.warn("Error synchronizing dashboard database metrics:", err);
    }
  }, [currentAccount, setActiveBots]);

  // Handle connection trigger
  const handleConnect = async () => {
    setActionLoading(true);
    try {
      await api.connectMT5(currentAccount.id);
      await fetchDashboardData();
    } catch (err) {
      console.error("Connection attempt failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Sync details on mount and every 4 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);



  // Spread and calculation helpers
  const getSpread = (bid: number, ask: number, symbol: string) => {
    const diff = ask - bid;
    if (diff <= 0) return '0.00';
    if (symbol.toUpperCase().includes('JPY')) return diff.toFixed(2);
    if (forexSymbols.includes(symbol.toUpperCase())) return (diff * 10000).toFixed(1) + " Pips";
    return diff.toFixed(2);
  };

  // Dollar Size / Risk / Reward calculation based on lot multipliers
  const getLotMultiplier = (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (forexSymbols.includes(sym)) return 100000;
    if (metalsSymbols.includes(sym)) return 100;
    if (indexSymbols.includes(sym)) return 10;
    return 1; // Crypto spot unit is 1
  };

  const multiplier = getLotMultiplier(selectedSymbol);
  const sizeUSD = parseFloat(lotSize) * multiplier * currentTick.last;

  let riskUSD = '0.00';
  let rewardUSD = '0.00';

  if (stopLoss && parseFloat(stopLoss) > 0) {
    const entry = orderType === 'market' ? currentTick.last : parseFloat(limitPrice || '0');
    const diff = Math.abs(entry - parseFloat(stopLoss));
    riskUSD = (parseFloat(lotSize) * multiplier * diff).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  if (takeProfit && parseFloat(takeProfit) > 0) {
    const entry = orderType === 'market' ? currentTick.last : parseFloat(limitPrice || '0');
    const diff = Math.abs(entry - parseFloat(takeProfit));
    rewardUSD = (parseFloat(lotSize) * multiplier * diff).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  // Toggle favorites
  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(symbol)) {
      setFavorites(favorites.filter(s => s !== symbol));
    } else {
      setFavorites([...favorites, symbol]);
    }
  };

  // Execute manual trades (Market or Pending Limit/Stop)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      alert("Trading feed is offline. Cannot execute transactions.");
      return;
    }

    setActionLoading(true);
    try {
      if (orderType === 'market') {
        const payload = {
          symbol: selectedSymbol,
          lot_size: Number(lotSize),
          stop_loss: stopLoss ? Number(stopLoss) : 0,
          take_profit: takeProfit ? Number(takeProfit) : 0
        };

        if (orderAction === 'buy') {
          await api.placeMT5Buy(payload);
        } else {
          await api.placeMT5Sell(payload);
        }
        alert(`Market ${orderAction.toUpperCase()} order executed successfully!`);
      } else {
        // Pending Limit or Stop Order
        if (!limitPrice || parseFloat(limitPrice) <= 0) {
          alert("Please enter a valid target price for the pending order.");
          return;
        }

        const typeStr = `${orderAction}_${orderType}`; // buy_limit, buy_stop, etc.
        const payload = {
          symbol: selectedSymbol,
          type: typeStr,
          lot_size: Number(lotSize),
          price: Number(limitPrice),
          stop_loss: stopLoss ? Number(stopLoss) : 0,
          take_profit: takeProfit ? Number(takeProfit) : 0
        };

        await api.placePendingOrder(payload);
        alert(`Pending ${typeStr.toUpperCase()} order placed successfully.`);
      }

      // Reset fields & refresh
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      fetchDashboardData();
    } catch (err: any) {
      alert(`Order placement failure: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel pending order
  const handleCancelPendingOrder = async (ticket: number) => {
    if (confirm(`Cancel pending order ticket ${ticket}?`)) {
      setActionLoading(true);
      try {
        await api.cancelPendingOrder(ticket);
        fetchDashboardData();
      } catch (err: any) {
        alert(`Cancel order failed: ${err.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Close active position
  const handleClosePosition = async (ticket: number) => {
    if (confirm(`Close active position ticket ${ticket}?`)) {
      setActionLoading(true);
      try {
        await api.closeMT5Position(ticket);
        fetchDashboardData();
      } catch (err: any) {
        alert(`Close position failed: ${err.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Emergency Close All
  const handleCloseAll = async () => {
    if (confirm("🚨 Confirm Emergency Action: CLOSE ALL positions immediately?")) {
      setActionLoading(true);
      try {
        const result = await api.closeAllMT5Positions();
        alert(`Emergency Close complete. Closed ${result.closed_count} positions.`);
        fetchDashboardData();
      } catch (err: any) {
        alert(`Emergency close failed: ${err.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Toggle strategy bot for active symbol
  const handleToggleBot = async (strategy: string) => {
    const symbolBots = activeBots[selectedSymbol] || [];
    const isRunning = symbolBots.includes(strategy);
    try {
      await api.toggleBotStrategy({
        symbol: selectedSymbol,
        strategy,
        active: !isRunning
      });
      fetchDashboardData();
    } catch (err: any) {
      console.warn("Failed to toggle strategy bot:", err.message);
    }
  };

  // Filter watchlist symbols
  const filteredSymbols = allSymbols.filter(sym => {
    const matchesSearch = sym.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (watchlistFilter === 'favorites') return favorites.includes(sym);
    if (watchlistFilter === 'crypto') return cryptoSymbols.includes(sym);
    if (watchlistFilter === 'forex') return forexSymbols.includes(sym);
    if (watchlistFilter === 'metals') return metalsSymbols.includes(sym);
    if (watchlistFilter === 'indices') return indexSymbols.includes(sym);
    return true; // 'all'
  });

  // Recharts profit configuration
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

  const profitStats = historyTrades.length > 0 
    ? historyTrades.slice(-7).map((t: any, i: number) => ({ date: `Trade ${i+1}`, profit: t.profit }))
    : fallbackDailyProfits;

  const resolvedWinLoss = historyTrades.length > 0 
    ? [ { name: 'Win Trades', value: currentAccount.win_rate || 0 }, { name: 'Loss Trades', value: 100 - (currentAccount.win_rate || 0) } ]
    : fallbackWinLoss;

  const PIE_COLORS = ['#10b981', '#f43f5e'];

  return (
    <Navbar>
      <div className="space-y-6">
        
        {user?.role === 'admin' && (
          <AdminPanel />
        )}

        {/* TOP PANEL: Account Stats Header */}
        <div className="bg-background/95 border border-gray-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2 rounded-xl border ${
              isOnline ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'
            }`}>
              <Activity size={18} className={isOnline ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">{currentAccount.name}</span>
                <span className="text-[10px] font-mono text-gray-500">#{currentAccount.login}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
                Broker Feed: <span className="text-gray-400 font-bold">{currentAccount.broker} ({currentAccount.server})</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold">
            <div className="border-r border-gray-850 pr-4">
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Balance</span>
              <span className="text-white font-mono font-bold">${currentAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-r border-gray-850 pr-4">
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Equity</span>
              <span className="text-indigo-400 font-mono font-bold">${currentAccount.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-r border-gray-850 pr-4">
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Floating P/L</span>
              <span className={`font-mono font-bold ${(currentAccount.floating_profit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                ${(currentAccount.floating_profit ?? 0) >= 0 ? '+' : ''}{(currentAccount.floating_profit ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="border-r border-gray-850 pr-4">
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Margin Level</span>
              <span className="text-white font-mono">{currentAccount.margin_level ? currentAccount.margin_level.toFixed(1) + '%' : '0.0%'}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Win Rate</span>
              <span className="text-success font-mono">{currentAccount.win_rate ? currentAccount.win_rate.toFixed(1) + '%' : '0.0%'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleConnect}
              disabled={actionLoading || isOnline}
              className={`py-2 px-4 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition ${
                isOnline 
                  ? 'bg-success/15 border border-success/35 text-success cursor-default' 
                  : 'bg-primary hover:bg-primary/95 text-white active:scale-95'
              }`}
            >
              {actionLoading ? "Connecting..." : isOnline ? "Connected Feed" : "Connect Broker"}
            </button>
            <button 
              onClick={handleCloseAll}
              disabled={openTrades.length === 0}
              className="py-2 px-4 bg-danger hover:bg-danger/90 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-40"
            >
              Emergency Close
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT & CENTER PANEL: Chart & Trading Tables */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Chart Panel */}
            <div className="glass-panel rounded-2xl border border-gray-900 overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between px-5 py-4 bg-card border-b border-gray-900">
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm font-bold text-white font-mono">{selectedSymbol}</span>
                  <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {cryptoSymbols.includes(selectedSymbol) ? 'Crypto' : forexSymbols.includes(selectedSymbol) ? 'Forex' : metalsSymbols.includes(selectedSymbol) ? 'Metal' : 'Index'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold mr-1">Bid</span>
                    <span className="font-mono text-white">
                      <LivePrice symbol={selectedSymbol} type="bid" decimalPlaces={selectedSymbol.includes('JPY') || indexSymbols.includes(selectedSymbol) || metalsSymbols.includes(selectedSymbol) ? 2 : 5} />
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold mr-1">Ask</span>
                    <span className="font-mono text-white">
                      <LivePrice symbol={selectedSymbol} type="ask" decimalPlaces={selectedSymbol.includes('JPY') || indexSymbols.includes(selectedSymbol) || metalsSymbols.includes(selectedSymbol) ? 2 : 5} />
                    </span>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono text-[10px]">
                    Spread: {getSpread(currentTick.bid, currentTick.ask, selectedSymbol)}
                  </div>
                </div>
              </div>
              <div className="p-1">
                <TradingViewChart key={selectedSymbol} symbol={selectedSymbol} height={420} />
              </div>
            </div>

            {/* Bottom Tabs Panel (Positions, Orders, History, Logs) */}
            <div className="glass-panel rounded-2xl border border-gray-900 overflow-hidden">
              <div className="flex border-b border-gray-900 bg-card select-none">
                <button
                  onClick={() => setDashboardTab('positions')}
                  className={`flex items-center space-x-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider transition ${
                    dashboardTab === 'positions'
                      ? 'border-b-2 border-primary text-primary bg-background/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Layers size={13} />
                  <span>Positions ({openTrades.length})</span>
                </button>
                
                <button
                  onClick={() => setDashboardTab('orders')}
                  className={`flex items-center space-x-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider transition ${
                    dashboardTab === 'orders'
                      ? 'border-b-2 border-primary text-primary bg-background/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Zap size={13} />
                  <span>Pending ({pendingOrders.length})</span>
                </button>

                <button
                  onClick={() => setDashboardTab('history')}
                  className={`flex items-center space-x-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider transition ${
                    dashboardTab === 'history'
                      ? 'border-b-2 border-primary text-primary bg-background/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <History size={13} />
                  <span>Closed Deals ({historyTrades.length})</span>
                </button>

                <button
                  onClick={() => setDashboardTab('logs')}
                  className={`flex items-center space-x-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider transition ${
                    dashboardTab === 'logs'
                      ? 'border-b-2 border-primary text-primary bg-background/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <FileText size={13} />
                  <span>Terminal Logs</span>
                </button>
              </div>

              <div className="p-5 min-h-[200px]">
                
                {/* Positions list */}
                {dashboardTab === 'positions' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-850 text-gray-500 uppercase tracking-wider pb-2">
                          <th className="py-2.5">Ticket</th>
                          <th>Symbol</th>
                          <th>Type</th>
                          <th>Volume</th>
                          <th>Entry Price</th>
                          <th>Current Price</th>
                          <th>SL / TP</th>
                          <th>Floating P/L</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850/50">
                        {openTrades.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-12 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                              No active simulated positions.
                            </td>
                          </tr>
                        ) : (
                          openTrades.map((trade) => (
                            <tr key={trade.ticket} className="hover:bg-gray-900/10">
                              <td className="py-3 font-bold font-mono text-gray-400">{trade.ticket}</td>
                              <td className="font-bold text-white font-mono">{trade.symbol}</td>
                              <td>
                                <span className={`font-bold uppercase ${trade.type === 'buy' ? 'text-success' : 'text-danger'}`}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="font-mono">{trade.volume} Lot</td>
                              <td className="font-mono">{(trade.open_price ?? 0).toFixed(trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5)}</td>
                              <td className="font-mono">
                                <LivePrice symbol={trade.symbol} type="last" decimalPlaces={trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5} />
                              </td>
                              <td className="font-mono text-gray-500 text-[10px]">
                                <div>SL: {trade.sl ? trade.sl.toFixed(trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5) : '0.00'}</div>
                                <div>TP: {trade.tp ? trade.tp.toFixed(trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5) : '0.00'}</div>
                              </td>
                              <td className={`font-bold font-mono ${(trade.profit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${(trade.profit ?? 0).toFixed(2)}
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleClosePosition(trade.ticket)}
                                  className="py-1 px-2.5 bg-danger/10 border border-danger/35 hover:bg-danger text-danger hover:text-white rounded-lg font-bold transition text-[10px] uppercase"
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
                )}

                {/* Pending limit/stop orders */}
                {dashboardTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-850 text-gray-500 uppercase tracking-wider pb-2">
                          <th className="py-2.5">Ticket</th>
                          <th>Symbol</th>
                          <th>Order Type</th>
                          <th>Volume</th>
                          <th>Target Price</th>
                          <th>Current Price</th>
                          <th>SL / TP</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850/50">
                        {pendingOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                              No pending limit or stop orders.
                            </td>
                          </tr>
                        ) : (
                          pendingOrders.map((order) => (
                            <tr key={order.ticket} className="hover:bg-gray-900/10">
                              <td className="py-3 font-bold font-mono text-gray-400">{order.ticket}</td>
                              <td className="font-bold text-white font-mono">{order.symbol}</td>
                              <td>
                                <span className="font-bold uppercase text-indigo-400">
                                  {order.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="font-mono">{order.volume} Lot</td>
                              <td className="font-mono text-white font-bold">{(order.price ?? 0).toFixed(order.symbol.includes('JPY') || metalsSymbols.includes(order.symbol) ? 2 : 5)}</td>
                              <td className="font-mono text-gray-550">
                                <LivePrice symbol={order.symbol} type="last" decimalPlaces={order.symbol.includes('JPY') || metalsSymbols.includes(order.symbol) ? 2 : 5} />
                              </td>
                              <td className="font-mono text-gray-500 text-[10px]">
                                <div>SL: {order.sl ? order.sl.toFixed(order.symbol.includes('JPY') || metalsSymbols.includes(order.symbol) ? 2 : 5) : '0.00'}</div>
                                <div>TP: {order.tp ? order.tp.toFixed(order.symbol.includes('JPY') || metalsSymbols.includes(order.symbol) ? 2 : 5) : '0.00'}</div>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleCancelPendingOrder(order.ticket)}
                                  className="py-1 px-2.5 bg-gray-850 border border-gray-800 hover:border-danger/30 text-gray-400 hover:text-danger rounded-lg font-bold transition text-[10px]"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* History list */}
                {dashboardTab === 'history' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-850 text-gray-500 uppercase tracking-wider pb-2">
                          <th className="py-2.5">Ticket</th>
                          <th>Symbol</th>
                          <th>Type</th>
                          <th>Volume</th>
                          <th>Open Price</th>
                          <th>Close Price</th>
                          <th>Profit</th>
                          <th>Execution Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850/50">
                        {historyTrades.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                              No closed trade history logs found.
                            </td>
                          </tr>
                        ) : (
                          historyTrades.map((trade) => (
                            <tr key={trade.ticket} className="hover:bg-gray-900/10">
                              <td className="py-3 font-bold font-mono text-gray-500">{trade.ticket}</td>
                              <td className="font-bold text-white font-mono">{trade.symbol}</td>
                              <td className="uppercase font-bold">
                                <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="font-mono">{trade.volume} Lot</td>
                              <td className="font-mono">{(trade.open_price ?? 0).toFixed(trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5)}</td>
                              <td className="font-mono">{(trade.close_price ?? 0).toFixed(trade.symbol.includes('JPY') || metalsSymbols.includes(trade.symbol) ? 2 : 5)}</td>
                              <td className={`font-bold font-mono ${(trade.profit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${(trade.profit ?? 0).toFixed(2)}
                              </td>
                              <td className="text-gray-500 font-mono text-[10px]">
                                {trade.close_time ? new Date(trade.close_time).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Log terminal */}
                {dashboardTab === 'logs' && (
                  <div className="bg-background/95 border border-gray-900 rounded-xl p-3.5 font-mono text-[10px] text-gray-400 max-h-64 overflow-y-auto space-y-2 select-text">
                    {logs.length === 0 ? (
                      <p className="text-center text-gray-600 py-12">Console log cache is empty.</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-1.5 border-b border-gray-900 pb-1.5 last:border-b-0">
                          <span className="text-gray-650 shrink-0 font-bold">
                            [{new Date(log.created_at).toLocaleTimeString()}]
                          </span>
                          <span className={
                            log.level === 'error' || log.level === 'warning' ? 'text-danger font-semibold' :
                            log.level === 'success' ? 'text-success font-semibold' :
                            'text-gray-300'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Daily Profit Distribution charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-gray-900">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-1.5">
                  <TrendingUp size={12} className="text-primary" />
                  <span>Real-Time Performance (Recent Trades)</span>
                </h2>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitStats}>
                      <XAxis dataKey="date" stroke="#4b5563" fontSize={9} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Profit']}
                      />
                      <Bar dataKey="profit">
                        {profitStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={(entry?.profit ?? 0) >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
                  <Percent size={12} className="text-success" />
                  <span>Ratio Analytics</span>
                </h2>
                <div className="h-28 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resolvedWinLoss}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={46}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {resolvedWinLoss.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[14px] font-extrabold text-success font-sans">{currentAccount.win_rate ? currentAccount.win_rate.toFixed(0) + '%' : '0%'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-center text-[10px] font-bold border-t border-gray-850 pt-2.5">
                  <div className="border-r border-gray-855 text-success">
                    {currentAccount.win_rate ? currentAccount.win_rate.toFixed(0) + '%' : '0%'} Wins
                  </div>
                  <div className="text-danger">
                    {currentAccount.win_rate ? (100 - currentAccount.win_rate).toFixed(0) + '%' : '0%'} Loss
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Watchlist, Search, Order Entry & Strategy Bots */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Watchlist & Universal Search */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Search size={14} className="text-primary" />
                  <span>Market Watchlist</span>
                </h2>
                <span className="text-[9px] text-gray-500 uppercase font-mono font-bold">{filteredSymbols.length} available</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH INSTRUMENT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-gray-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary/50 uppercase font-mono font-bold"
                  id="symbol-universal-search-input"
                />
                <Search size={12} className="absolute left-3.5 top-3 text-gray-500" />
              </div>

              {/* Watchlist Filter tabs */}
              <div className="flex flex-wrap gap-1 border-b border-gray-850 pb-2 text-[9px] font-bold uppercase select-none">
                {['all', 'crypto', 'forex', 'metals', 'indices', 'favorites'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setWatchlistFilter(tab as any)}
                    className={`px-2 py-1.5 rounded-lg border transition ${
                      watchlistFilter === tab
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-transparent border-transparent text-gray-550 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <Watchlist 
                filteredSymbols={filteredSymbols}
                favorites={favorites}
                selectedSymbol={selectedSymbol}
                setSelectedSymbol={setSelectedSymbol}
                toggleFavorite={toggleFavorite}
                indexSymbols={indexSymbols}
                metalsSymbols={metalsSymbols}
              />
            </div>

            {/* Order Entry Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Zap size={14} className="text-warning" />
                  <span>Execution Order Entry</span>
                </h2>
                <div className="flex space-x-1 p-0.5 bg-gray-900 border border-gray-850 rounded-lg text-[9px] font-bold uppercase select-none">
                  {['market', 'limit', 'stop'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type as any)}
                      className={`px-2 py-1 rounded-md transition ${
                        orderType === type
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buy / Sell Toggle Action */}
              <div className="grid grid-cols-2 gap-2 select-none">
                <button
                  type="button"
                  onClick={() => setOrderAction('buy')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    orderAction === 'buy'
                      ? 'bg-success text-white border border-success'
                      : 'bg-transparent border border-gray-850 text-gray-550 hover:text-white'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setOrderAction('sell')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    orderAction === 'sell'
                      ? 'bg-danger text-white border border-danger'
                      : 'bg-transparent border border-gray-850 text-gray-550 hover:text-white'
                  }`}
                >
                  Sell / Short
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs font-semibold text-gray-400">
                {/* Active Symbol Display */}
                <div className="flex items-center justify-between border-b border-gray-850 pb-2.5">
                  <span>Selected Asset:</span>
                  <span className="text-white font-mono font-bold uppercase text-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0"></span>
                    <span>{selectedSymbol}</span>
                  </span>
                </div>

                {/* Volume Input (Lot size) */}
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Lot size (Volume)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    className="w-full bg-background border border-gray-850 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono font-bold"
                    required
                  />
                </div>

                {/* Price input (Limit / Stop only) */}
                {orderType !== 'market' && (
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Target Price ({orderType.toUpperCase()})
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder={(currentTick.last ?? 0).toFixed(selectedSymbol.includes('JPY') || metalsSymbols.includes(selectedSymbol) ? 2 : 5)}
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full bg-background border border-gray-855 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono font-bold"
                      required
                    />
                  </div>
                )}

                {/* SL / TP inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Stop Loss (SL)</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="Optional"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-background border border-gray-850 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Take Profit (TP)</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="Optional"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full bg-background border border-gray-850 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                {/* Order Calculations details */}
                <div className="bg-[#090d16]/70 border border-gray-900 rounded-xl p-3 space-y-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Position Value:</span>
                    <span className="text-white font-mono">${sizeUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Spread Cost:</span>
                    <span className="text-white font-mono">{getSpread(currentTick.bid, currentTick.ask, selectedSymbol)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Risk (SL):</span>
                    <span className={stopLoss ? 'text-danger font-mono font-bold' : 'text-gray-600 font-mono'}>
                      {stopLoss ? `$${riskUSD}` : 'Not Defined'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Reward (TP):</span>
                    <span className={takeProfit ? 'text-success font-mono font-bold' : 'text-gray-600 font-mono'}>
                      {takeProfit ? `$${rewardUSD}` : 'Not Defined'}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={actionLoading || !isOnline}
                  className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider transition ${
                    actionLoading 
                      ? 'bg-gray-800 text-gray-500 cursor-wait'
                      : orderAction === 'buy'
                      ? 'bg-success hover:bg-success/90 text-white active:scale-[0.98]'
                      : 'bg-danger hover:bg-danger/90 text-white active:scale-[0.98]'
                  } disabled:opacity-40`}
                >
                  {actionLoading ? 'Processing Order...' : `${orderAction} ${orderType}`}
                </button>
              </form>
            </div>

            {/* Strategy Bots Controls Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Play size={13} className="text-primary" />
                  <span>Strategy Bot Configurations</span>
                </h2>
                <span className={`h-2.5 w-2.5 rounded-full border ${
                  isOnline ? 'bg-success border-success/30 animate-pulse' : 'bg-danger border-danger/30'
                }`}></span>
              </div>

              <div className="space-y-3.5">
                {/* List of active symbol bots */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-850 pb-2">
                  <span>Selected Asset Bots:</span>
                  <span className="text-white font-mono">{selectedSymbol}</span>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'ema', name: 'EMA Crossover Bot', desc: 'EMA 9 crosses over EMA 21 golden cross indicator' },
                    { key: 'rsi', name: 'RSI Oversold Scalper', desc: 'Buys under 30 (oversold) and sells over 70' },
                    { key: 'breakout', name: 'High/Low Breakout Bot', desc: 'Executes trades on breaks of 20-candle channel' },
                    { key: 'gold', name: 'XAUUSD Specialized Scalp', desc: 'Custom strategy optimized exclusively for Gold', disabled: selectedSymbol !== 'XAUUSD' },
                    { key: 'custom', name: 'Custom EMA Trend Filter', desc: 'Trend tracking filter using a 50-period EMA' }
                  ].map(bot => {
                    const symbolBots = activeBots[selectedSymbol] || [];
                    const isRunning = symbolBots.includes(bot.key);
                    const isDisabled = bot.disabled;

                    return (
                      <div 
                        key={bot.key}
                        className={`flex items-start justify-between p-3.5 rounded-xl border transition ${
                          isDisabled ? 'opacity-40 cursor-not-allowed border-gray-900 bg-black/10' :
                          isRunning ? 'bg-primary/5 border-primary/20' : 'bg-background/25 border-gray-900/60'
                        }`}
                      >
                        <div className="space-y-1 max-w-[70%] select-none">
                          <p className="text-xs font-bold text-white leading-none">{bot.name}</p>
                          <span className="block text-[9px] leading-tight text-gray-500 font-semibold">{bot.desc}</span>
                        </div>

                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggleBot(bot.key)}
                          className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition ${
                            isDisabled ? 'bg-gray-800 text-gray-600' :
                            isRunning 
                              ? 'bg-success/20 border border-success/35 text-success hover:bg-success hover:text-white' 
                              : 'bg-gray-850 border border-gray-800 text-gray-400 hover:border-primary/40 hover:text-white'
                          }`}
                        >
                          {isRunning ? 'Running' : 'Activate'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* News Feed (Mock list) */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-900 space-y-4 relative h-[250px]">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center space-x-1.5 border-b border-gray-850 pb-3 absolute top-5 left-5 right-5 bg-card/80 backdrop-blur-sm z-10">
                <BookOpen size={13} className="text-primary" />
                <span>Real-Time News Feed</span>
              </h2>
              
              <div className="absolute top-[60px] left-5 right-5 bottom-5 overflow-y-auto pr-2">
                <div className="space-y-4 select-text flex flex-col pt-2 pb-4">
                  {newsHeadlines.map((headline, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 pb-2.5 border-b border-gray-850/45">
                      <span className="text-primary font-bold shrink-0 text-[10px] mt-0.5">•</span>
                      <p className="text-[10px] leading-relaxed text-gray-400 font-medium hover:text-white transition cursor-text">
                        <span className="text-gray-500 font-bold mr-1">{new Date(Date.now() - idx * 1800000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {headline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Navbar>
  );
}
