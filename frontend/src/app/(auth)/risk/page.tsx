'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Gauge, Percent, DollarSign, BarChart3 } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function RiskPage() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiRisk, setAiRisk] = useState<any>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const isBackendOffline = useStore((s) => s.isBackendOffline);
  const mt5Data = useStore((s) => s.mt5Data);

  const fetchData = async () => {
    try {
      setLoading(true);
      const acc = await api.getMT5Account();
      setAccount(acc);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const runAiRisk = async () => {
    try {
      const result = await api.aiRisk(selectedSymbol);
      setAiRisk(result);
    } catch (e) {
      console.error('AI risk analysis failed:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const d = mt5Data || account || {};
  const balance = d.balance || 0;
  const equity = d.equity || 0;
  const margin = d.margin || 0;
  const freeMargin = d.free_margin || d.freeMargin || 0;
  const marginLevel = d.margin_level || d.marginLevel || 0;
  const drawdown = d.drawdown || 0;
  const riskPercent = balance > 0 ? ((1 - equity / balance) * 100) : 0;
  const marginPercent = balance > 0 ? ((margin / balance) * 100) : 0;

  const getRiskLevel = (ml: number) => {
    if (ml >= 500) return { label: 'Very Safe', color: 'text-success', bg: 'bg-success/10' };
    if (ml >= 200) return { label: 'Safe', color: 'text-primary', bg: 'bg-primary/10' };
    if (ml >= 100) return { label: 'Warning', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Critical', color: 'text-danger', bg: 'bg-danger/10' };
  };

  const riskInfo = getRiskLevel(marginLevel);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-outfit text-white">Risk Manager</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `Balance: $${balance.toFixed(2)} | Equity: $${equity.toFixed(2)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-2.5 py-1.5 rounded-md text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={fetchData} className="btn-secondary flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">${balance.toFixed(2)}</div>
        </div>
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Equity</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">${equity.toFixed(2)}</div>
        </div>
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Free Margin</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">${freeMargin.toFixed(2)}</div>
        </div>
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Margin Level</span>
          </div>
          <div className={`text-lg font-bold font-mono ${riskInfo.color}`}>{marginLevel.toFixed(1)}%</div>
          <div className={`text-[10px] ${riskInfo.color} font-semibold mt-0.5`}>{riskInfo.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Drawdown</span>
          </div>
          <div className={`text-lg font-bold font-mono ${drawdown > 0 ? 'text-danger' : 'text-success'}`}>
            {drawdown.toFixed(2)}%
          </div>
          <div className="w-full bg-background rounded-full h-1.5 mt-2">
            <div className="bg-danger rounded-full h-1.5 transition-all" style={{ width: `${Math.min(drawdown, 100)}%` }} />
          </div>
        </div>
        <div className="panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-warning" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Account Risk</span>
          </div>
          <div className={`text-lg font-bold font-mono ${riskPercent > 20 ? 'text-danger' : riskPercent > 10 ? 'text-warning' : 'text-success'}`}>
            {riskPercent.toFixed(1)}%
          </div>
          <div className="w-full bg-background rounded-full h-1.5 mt-2">
            <div className={`rounded-full h-1.5 transition-all ${riskPercent > 20 ? 'bg-danger' : riskPercent > 10 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${Math.min(riskPercent * 2, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Used Margin</div>
          <div className="text-base font-bold font-mono text-white">${margin.toFixed(2)}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{marginPercent.toFixed(1)}% of balance</div>
        </div>
        <div className="panel p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Margin Status</div>
          <div className={`text-base font-bold ${marginLevel > 100 ? 'text-success' : 'text-danger'}`}>
            {marginLevel > 100 ? 'ADEQUATE' : 'CRITICAL'}
          </div>
          {marginLevel < 200 && (
            <div className="text-[10px] text-danger mt-0.5">Approaching margin call</div>
          )}
        </div>
        <div className="panel p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risk Score</div>
          <div className={`text-base font-bold ${(d.risk_score || riskPercent) > 20 ? 'text-danger' : (d.risk_score || riskPercent) > 10 ? 'text-warning' : 'text-success'}`}>
            {(d.risk_score || riskPercent).toFixed(0)}/100
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold font-outfit text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            AI Risk Analysis
          </h2>
          <div className="flex items-center gap-2">
            <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1.5 text-[11px] text-gray-300 focus:outline-none focus:border-primary/50"
            >
              <option value="XAUUSD">XAUUSD</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="BTCUSD">BTCUSD</option>
            </select>
            <button onClick={runAiRisk} className="btn-primary flex items-center gap-1.5 text-[11px]">
              <BarChart3 className="w-3 h-3" /> Analyze Risk
            </button>
          </div>
        </div>
        {aiRisk ? (
          <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {typeof aiRisk === 'string' ? aiRisk : JSON.stringify(aiRisk, null, 2)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-[11px]">
            Select a symbol and click "Analyze Risk" to run AI-powered risk assessment
          </div>
        )}
      </div>
    </div>
  );
}
