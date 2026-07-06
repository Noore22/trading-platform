'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Bell, Search, Wifi, Server, Clock, AlertTriangle, Play, Pause,
  Square, User, Globe, Activity, Download, Wallet, TrendingUp,
  ChevronDown, Settings, LogOut, RefreshCw, Signal, Zap, Bot,
  Plug, Gauge, Loader2, Brain
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

export function TopNav() {
  const [time, setTime] = useState('');
  const [latency, setLatency] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isBackendOffline = useStore((state) => state.isBackendOffline);
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const mt5Data = useStore((state) => state.mt5Data);
  const user = useStore((state) => state.user);
  const wsStatus = useStore((state) => state.wsStatus);
  const marketSession = useStore((state) => state.marketSession);
  const aiStatus = useStore((state) => state.aiStatus);
  const aiInitialized = aiStatus?.initialized;

  const balance = mt5Data?.balance || 0;
  const equity = mt5Data?.equity || 0;
  const profit = mt5Data?.floating_profit || 0;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const start = Date.now();
      const status = await api.getHealth();
      setLatency(Date.now() - start);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const exchangeStatus = isMt5Connected ? 'Connected' : 'Disconnected';
  const exchangeColor = isMt5Connected ? 'success' : 'danger';
  const displayName = user?.username || mt5Data?.broker || 'Trader';
  const displayRole = user?.role || 'user';

  return (
    <div className="h-14 border-b border-border bg-navbar flex items-center justify-between px-4 sticky top-0 z-50 flex-shrink-0 gap-6">
      {/* Left Section */}
      <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
        <div className="relative group hidden lg:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-background border border-border text-[11px] text-gray-300 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:border-primary/50 w-32 xl:w-48 transition-all placeholder:text-gray-600"
          />
        </div>

        <div className="hidden lg:flex items-center gap-2 xl:gap-3 text-[10px] xl:text-[11px] text-gray-500 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-primary" />
            <span className="hidden xl:inline">Server: </span><span>{mt5Data?.server || '--'}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="font-mono text-gray-400">{time}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-info" />
            <span className="font-mono text-gray-400 hidden xl:inline">{marketSession || '--'}</span>
          </div>
        </div>
      </div>

      {/* Center: Live Status Bar */}
      <div className="hidden xl:flex items-center gap-2 xl:gap-4 flex-shrink-0">
        <StatusItem label="MT5" value={exchangeStatus === 'Connected' ? 'On' : 'Off'} color={exchangeColor} icon={<Wifi className="w-3 h-3" />} />
        <div className="w-px h-4 bg-border" />
        <StatusItem label="API" value={`${latency}ms`} color={latency < 50 ? 'success' : 'warning'} icon={<Server className="w-3 h-3" />} />
        <div className="w-px h-4 bg-border" />
        <StatusItem label="WSS" value={wsStatus === 'connected' ? 'Live' : 'Off'} color={wsStatus === 'connected' ? 'success' : 'danger'} icon={<Signal className="w-3 h-3" />} />
        <div className="w-px h-4 bg-border" />
        <StatusItem label="AI" value={aiInitialized ? 'Ready' : 'Off'} color={aiInitialized ? 'primary' : 'danger'} icon={<Brain className="w-3 h-3" />} />
        <div className="w-px h-4 bg-border" />
        
        {/* Account Balance Mini */}
        <div className="flex items-center gap-2 bg-background rounded-md px-2 py-1 border border-border flex-shrink-0 whitespace-nowrap">
          <Wallet className="w-3 h-3 text-primary" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-gray-500">Balance</span>
            <span className={`text-[11px] font-bold font-mono ${!isBackendOffline ? 'text-white' : 'text-gray-600'}`}>
              {isBackendOffline ? '---' : `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="w-px h-4 bg-border mx-1" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-gray-500">Equity</span>
            <span className={`text-[11px] font-bold font-mono ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
              {isBackendOffline ? '---' : `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
        {/* Bot Controls */}
        <div className="flex items-center bg-background rounded-md border border-border overflow-hidden">
          <button className="p-1 xl:p-1.5 hover:bg-success/15 hover:text-success text-gray-500 transition-colors tooltip" data-tip="Start Bot">
            <Play className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
          </button>
          <button className="p-1 xl:p-1.5 hover:bg-warning/15 hover:text-warning text-gray-500 border-x border-border transition-colors tooltip" data-tip="Pause Bot">
            <Pause className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
          </button>
          <button disabled={isBackendOffline} className="p-1 xl:p-1.5 hover:bg-danger/15 hover:text-danger text-gray-500 transition-colors tooltip" data-tip="Stop Bot">
            <Square className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
          </button>
        </div>

        {/* Close All */}
        <button className="hidden md:flex items-center gap-1 bg-danger/10 border border-danger/20 text-danger px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-md text-[10px] xl:text-[11px] font-bold transition-colors hover:bg-danger hover:text-white tooltip" data-tip="Emergency Close All">
          <AlertTriangle className="w-3 h-3" />
          <span className="hidden xl:inline">CLOSE ALL</span>
          <span className="xl:hidden">CLOSE</span>
        </button>

        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Notifications */}
        <button className="relative p-1 text-gray-500 hover:text-primary transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 bg-background hover:bg-card border border-border p-1 pr-2 rounded-md transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 hidden sm:block">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-20 py-1 animate-scaleIn">
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-xs font-medium text-white">{displayName}</div>
                  <div className="text-[10px] text-gray-500">{displayRole}</div>
                </div>
                <Link href="/settings" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-background transition-colors">
                  <Settings className="w-3.5 h-3.5" /> Profile Settings
                </Link>
                <button onClick={fetchStatus} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-background transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Status
                </button>
                <div className="border-t border-border mt-1 pt-1">
                  <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    success: 'text-success',
    primary: 'text-primary',
    warning: 'text-warning',
    danger: 'text-danger',
  };
  return (
    <div className="flex items-center gap-2 cursor-default flex-shrink-0 whitespace-nowrap">
      {icon}
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] text-gray-600 uppercase tracking-wider font-semibold">{label}</span>
        <span className={`text-[11px] font-semibold ${colorMap[color] || 'text-gray-300'}`}>{value}</span>
      </div>
    </div>
  );
}
