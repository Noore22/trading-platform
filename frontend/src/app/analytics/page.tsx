'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  LineChart, 
  Line,
  CartesianGrid,
  PieChart,
  Pie
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Award, AlertTriangle, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const selectedAccount = useStore((state) => state.selectedAccount);
  const [historyTrades, setHistoryTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      // Retrieve direct deals history from MT5
      const deals = await api.getMT5History(30);
      setHistoryTrades(deals || []);
    } catch (err) {
      console.error('Failed to load chart data in analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (!selectedAccount) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle size={48} className="text-warning mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Accounts</h2>
          <p className="text-textSecondary text-sm text-center max-w-md">
            Please register a MetaTrader 5 account to view advanced analytics charts.
          </p>
        </div>
      </Navbar>
    );
  }

  // Calculate Cumulative Equity Curve
  const sortedDeals = [...historyTrades].sort((a, b) => new Date(a.close_time).getTime() - new Date(b.close_time).getTime());
  
  // Backtrack starting equity
  const totalProfitRealized = sortedDeals.reduce((sum, deal) => sum + deal.profit, 0);
  const initialEquity = Math.max(1000.0, selectedAccount.balance - totalProfitRealized);
  
  let currentEquity = initialEquity;
  const equityCurveData = sortedDeals.map((deal) => {
    currentEquity += deal.profit;
    return {
      time: new Date(deal.close_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      equity: Number(currentEquity.toFixed(2)),
      profit: deal.profit
    };
  });

  // If no trades, supply fallback baseline
  const tradesList = equityCurveData.length > 0 ? equityCurveData : [
    { time: 'Start', equity: selectedAccount.balance }
  ];

  // Calculate Drawdown Curve
  let peakEquity = initialEquity;
  const drawdownHistory = tradesList.map((point) => {
    if (point.equity > peakEquity) {
      peakEquity = point.equity;
    }
    const ddVal = peakEquity > 0 ? ((peakEquity - point.equity) / peakEquity) * 100 : 0;
    return {
      time: point.time,
      drawdown: Number(Math.max(0, ddVal).toFixed(2))
    };
  });

  // Peak Drawdown metric
  const peakDrawdown = drawdownHistory.length > 0 
    ? Math.max(...drawdownHistory.map(d => d.drawdown)) 
    : 0.0;

  // Calculate Win Rate
  const totalDeals = sortedDeals.length;
  const winDeals = sortedDeals.filter(d => d.profit > 0).length;
  const lossDeals = totalDeals - winDeals;
  const winRate = totalDeals > 0 ? (winDeals / totalDeals) * 100 : 0.0;

  const resolvedWinLoss = winRate > 0 
    ? [ { name: 'Win Trades', value: winDeals }, { name: 'Loss Trades', value: lossDeals } ]
    : [ { name: 'Win Trades', value: 1 }, { name: 'Loss Trades', value: 0 } ];

  // Group Profits by Day of Week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyProfitMap: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
  
  sortedDeals.forEach((deal) => {
    const dName = daysOfWeek[new Date(deal.close_time).getDay()];
    if (dailyProfitMap[dName] !== undefined) {
      dailyProfitMap[dName] += deal.profit;
    }
  });

  const dailyProfitData = Object.keys(dailyProfitMap).map(day => ({
    date: day,
    profit: Number(dailyProfitMap[day].toFixed(2))
  }));

  // Group Profits by Month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyProfitMap: { [key: string]: number } = {};
  
  sortedDeals.forEach((deal) => {
    const mName = months[new Date(deal.close_time).getMonth()];
    monthlyProfitMap[mName] = (monthlyProfitMap[mName] || 0) + deal.profit;
  });

  // Supply last 6 months list if empty
  const monthlyProfitData = Object.keys(monthlyProfitMap).length > 0 
    ? Object.keys(monthlyProfitMap).map(m => ({ name: m, profit: Number(monthlyProfitMap[m].toFixed(2)) }))
    : months.slice(0, 6).map(m => ({ name: m, profit: 0.0 }));

  // Weekly performance mapping
  const weeklyProfitMap: { [key: string]: number } = {};
  sortedDeals.forEach((deal) => {
    const d = new Date(deal.close_time);
    const firstDay = new Date(d.setDate(d.getDate() - d.getDay()));
    const wKey = `W/C ${firstDay.getMonth() + 1}/${firstDay.getDate()}`;
    weeklyProfitMap[wKey] = (weeklyProfitMap[wKey] || 0) + deal.profit;
  });

  const weeklyProfitData = Object.keys(weeklyProfitMap).length > 0
    ? Object.keys(weeklyProfitMap).slice(-4).map(w => ({ name: w, profit: Number(weeklyProfitMap[w].toFixed(2)) }))
    : [ { name: 'Week 1', profit: 0.0 }, { name: 'Week 2', profit: 0.0 } ];

  const PIE_COLORS = ['#10b981', '#f43f5e'];

  return (
    <Navbar>
      <div className="space-y-8">
        
        {/* Row 1: High level metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Net Profit Realized</p>
              <h3 className={`text-lg font-bold font-sans ${totalProfitRealized >= 0 ? 'text-success' : 'text-danger'}`}>
                ${totalProfitRealized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex items-center space-x-4">
            <div className="p-3 bg-success/10 text-success rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Win Rate</p>
              <h3 className="text-lg font-bold text-success font-sans">
                {winRate.toFixed(1)}%
              </h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex items-center space-x-4">
            <div className="p-3 bg-danger/10 text-danger rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Peak Drawdown</p>
              <h3 className="text-lg font-bold text-danger font-sans">
                {peakDrawdown.toFixed(1)}%
              </h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex items-center space-x-4">
            <div className="p-3 bg-gray-800 text-gray-400 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Deals Executed</p>
              <h3 className="text-lg font-bold text-white font-sans">
                {totalDeals} Trades
              </h3>
            </div>
          </div>
        </div>

        {/* Row 2: Equity Curve */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-900">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Cumulative Equity Curve</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tradesList} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Daily, Weekly & Monthly Profits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Daily Profit */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center space-x-2">
              <Calendar size={14} className="text-gray-400" />
              <span>Daily Profit Distribution</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProfitData}>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                  <Bar dataKey="profit">
                    {dailyProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Profit */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center space-x-2">
              <Calendar size={14} className="text-gray-400" />
              <span>Weekly Profit Summary</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProfitData}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                  <Bar dataKey="profit">
                    {weeklyProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Profit */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center space-x-2">
              <Calendar size={14} className="text-gray-400" />
              <span>Monthly Performance Overview</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfitData}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                  <Bar dataKey="profit">
                    {monthlyProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Row 4: Drawdown Curve */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-900">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Drawdown Curve</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawdownHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="drawdown" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Navbar>
  );
}
