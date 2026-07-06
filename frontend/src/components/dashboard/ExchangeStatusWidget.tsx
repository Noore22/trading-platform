'use client';

import React from 'react';
import { Server, Activity, Globe, Wifi } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function ExchangeStatusWidget() {
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const isBackendOffline = useStore((state) => state.isBackendOffline);
  const wsStatus = useStore((state) => state.wsStatus);
  const mt5Data = useStore((state) => state.mt5Data);

  const wsLive = wsStatus === 'connected';

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Globe className="w-4 h-4 text-primary" />
          <span>Connection Status</span>
        </h3>
        <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full ${isMt5Connected && !isBackendOffline ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isMt5Connected && !isBackendOffline ? 'bg-success animate-pulse' : 'bg-danger'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isMt5Connected && !isBackendOffline ? 'text-success' : 'text-danger'}`}>
            {isBackendOffline ? 'Offline' : isMt5Connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg p-2.5 border border-border">
          <div className="text-[10px] text-gray-500 mb-0.5 flex items-center space-x-1">
            <Server className="w-3 h-3" />
            <span>Backend</span>
          </div>
          <div className={`text-sm font-mono font-bold ${!isBackendOffline ? 'text-success' : 'text-danger'}`}>
            {isBackendOffline ? 'Offline' : 'Online'}
          </div>
        </div>
        <div className="bg-background rounded-lg p-2.5 border border-border">
          <div className="text-[10px] text-gray-500 mb-0.5 flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>WebSocket</span>
          </div>
          <div className={`text-sm font-mono font-bold ${wsLive ? 'text-success' : 'text-danger'}`}>{wsLive ? 'Live' : 'Off'}</div>
        </div>
        <div className="bg-background rounded-lg p-2.5 border border-border">
          <div className="text-[10px] text-gray-500 mb-0.5 flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>Broker</span>
          </div>
          <div className="text-xs font-mono font-bold text-gray-200">{mt5Data?.broker || 'MT5'}</div>
        </div>
        <div className="bg-background rounded-lg p-2.5 border border-border">
          <div className="text-[10px] text-gray-500 mb-0.5 flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>Stream</span>
          </div>
          <div className={`text-xs font-semibold ${wsLive ? 'text-success' : 'text-gray-500'}`}>{wsLive ? 'Real-time' : 'Offline'}</div>
        </div>
      </div>
    </div>
  );
}
