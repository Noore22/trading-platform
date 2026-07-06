'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function EquityChart() {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [data, setData] = useState<any[]>([]);
  const mt5Data = useStore(state => state.mt5Data);
  const isMt5Connected = useStore(state => state.isMt5Connected);

  const fetchHistory = useCallback(async () => {
    if (!isMt5Connected) {
      setData([]);
      return;
    }
    try {
      const history = await api.getMT5History(30);
      const dailyProfitMap: Record<string, { profit: number; balance: number; count: number }> = {};
      
      if (Array.isArray(history)) {
        history.forEach((trade: any) => {
          if (trade.close_time) {
            const date = new Date(trade.close_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (!dailyProfitMap[date]) {
              dailyProfitMap[date] = { profit: 0, balance: 0, count: 0 };
            }
            dailyProfitMap[date].profit += (trade.profit || 0) + (trade.swap || 0) + (trade.commission || 0);
            dailyProfitMap[date].count += 1;
          }
        });
      }

      const currentBalance = mt5Data?.balance || 0;
      const currentEquity = mt5Data?.equity || currentBalance;
      
      const dates = Object.keys(dailyProfitMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      if (dates.length === 0) {
        setData([{ date: 'Today', balance: currentBalance, equity: currentEquity, profit: 0 }]);
        return;
      }

      const chartData = [];
      let runningBalance = currentBalance;
      
      for (let i = dates.length - 1; i >= 0; i--) {
        const profitThatDay = dailyProfitMap[dates[i]].profit;
        runningBalance -= profitThatDay;
        chartData.unshift({
          date: dates[i],
          balance: runningBalance,
          equity: runningBalance,
          profit: profitThatDay,
        });
      }
      
      if (chartData.length > 0) {
        chartData[chartData.length - 1].equity = currentEquity;
      }

      setData(chartData);
    } catch (err) {
      console.error("Failed to load equity history", err);
      setData([]);
    }
  }, [isMt5Connected, mt5Data?.balance, mt5Data?.equity]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
        {isMt5Connected ? 'Loading chart data...' : 'MT5 Disconnected - No Data Available'}
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button onClick={() => setChartType('area')} className={`text-[10px] px-2 py-1 rounded ${chartType === 'area' ? 'bg-primary text-black' : 'bg-background text-gray-500'}`}>Curve</button>
        <button onClick={() => setChartType('bar')} className={`text-[10px] px-2 py-1 rounded ${chartType === 'bar' ? 'bg-primary text-black' : 'bg-background text-gray-500'}`}>P&L</button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD400" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFD400" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toLocaleString()}`} width={60} />
            <Tooltip
              contentStyle={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#999' }}
              formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
            />
            <Area type="monotone" dataKey="balance" stroke="#FFFFFF" strokeWidth={1.5} fill="url(#balanceGradient)" name="Balance" />
            <Area type="monotone" dataKey="equity" stroke="#FFD400" strokeWidth={2} fill="url(#equityGradient)" name="Equity" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} width={60} />
            <Tooltip
              contentStyle={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#999' }}
              formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
            />
            <Bar dataKey="profit" radius={[3, 3, 0, 0]} name="Daily P&L">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#00C853' : '#FF1744'} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
