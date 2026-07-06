'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ui/Toast';

export default function MT5StatusCard({ currentAccount }: { currentAccount: any }) {
  const [status, setStatus] = useState({ connected: false, trade_allowed: false });
  const toast = useToast();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getMT5Status();
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          
          if (!data.connected) {
            toast.error("MT5 is disconnected! Retrying...");
          }
        }
      } catch (err) {
        setStatus({ connected: false, trade_allowed: false });
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background/95 border border-gray-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3.5">
        <div className={`p-2 rounded-xl border ${
          status.connected ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'
        }`}>
          <Activity size={18} className={status.connected ? "animate-pulse" : ""} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              {currentAccount?.name || 'Loading Account...'}
            </span>
            <span className="text-[10px] font-mono text-gray-500">#{currentAccount?.login}</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
            Broker: <span className="text-gray-400 font-bold">{currentAccount?.broker || '---'}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-xs font-semibold">
        <div className="border-r border-gray-850 pr-4">
          <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Balance</span>
          <span className="text-white font-mono font-bold">${currentAccount?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
        </div>
        <div className="border-r border-gray-850 pr-4">
          <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Equity</span>
          <span className="text-indigo-400 font-mono font-bold">${currentAccount?.equity?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
        </div>
        <div className="border-r border-gray-850 pr-4">
          <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Floating P/L</span>
          <span className={`font-mono font-bold ${(currentAccount?.floating_profit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
            ${(currentAccount?.floating_profit ?? 0) >= 0 ? '+' : ''}{(currentAccount?.floating_profit ?? 0).toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
            {status.trade_allowed ? (
              <div className="flex items-center space-x-1.5 text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">AutoTrading ON</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-warning bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">AutoTrading OFF</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
