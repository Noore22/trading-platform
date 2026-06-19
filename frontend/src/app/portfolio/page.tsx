'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

const mockPerformance = [
  { name: 'Mon', equity: 10000 },
  { name: 'Tue', equity: 10200 },
  { name: 'Wed', equity: 10150 },
  { name: 'Thu', equity: 10400 },
  { name: 'Fri', equity: 10800 },
  { name: 'Sat', equity: 10750 },
  { name: 'Sun', equity: 11200 },
];

const mockAllocation = [
  { name: 'BTCUSDT', value: 45 },
  { name: 'ETHUSDT', value: 30 },
  { name: 'SOLUSDT', value: 15 },
  { name: 'USDT', value: 10 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#64748b'];

export default function PortfolioPage() {
  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-sans text-white">Portfolio Analytics</h2>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between h-28">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Wallet size={14} className="text-primary" />
              <span>Total Equity</span>
            </span>
            <span className="text-2xl font-mono font-bold text-white">$11,200.50</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between h-28">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp size={14} className="text-success" />
              <span>7D Profit</span>
            </span>
            <span className="text-2xl font-mono font-bold text-success">+$1,200.50</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between h-28">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Win Rate</span>
            <span className="text-2xl font-mono font-bold text-white">68.5%</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-900 flex flex-col justify-between h-28">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Max Drawdown</span>
            <span className="text-2xl font-mono font-bold text-danger">3.2%</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Equity Curve</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPerformance}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-gray-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center space-x-2">
              <PieChartIcon size={16} className="text-primary" />
              <span>Asset Allocation</span>
            </h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-lg">Diversified</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Navbar>
  );
}
