'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ShieldAlert, Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const isBackendOffline = useStore((state) => state.isBackendOffline);
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const wsStatus = useStore((state) => state.wsStatus);
  const healthRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token && !user) {
      api.getMe()
        .then((profile) => {
          if (profile) setUser(profile);
        })
        .catch(() => {
          useStore.getState().setIsBackendOffline(true);
        });
    }
  }, [token, user, setUser]);

  useEffect(() => {
    if (!token) return;

    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        useStore.getState().setIsBackendOffline(false);
        useStore.getState().setIsMt5Connected(!!h.mt5_connected);
      } catch {
        useStore.getState().setIsBackendOffline(true);
      }
    };

    checkHealth();
    healthRef.current = setInterval(checkHealth, 10000);
    return () => {
      if (healthRef.current) clearInterval(healthRef.current);
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  useWebSocket();

  if (!mounted || !token || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-gray-400">
        <div className="w-10 h-10 border-[3px] border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading...</p>
      </div>
    );
  }

  const wsConnected = wsStatus === 'connected';
  const allOk = !isBackendOffline && isMt5Connected && wsConnected;

  return (
    <>
      {!allOk && (
        <div className={`px-8 py-2.5 text-[11px] font-bold tracking-wide flex items-center space-x-2.5 shrink-0 select-none border-b ${
          isBackendOffline
            ? 'bg-danger/20 border-danger/30 text-danger'
            : !wsConnected
            ? 'bg-warning/10 border-warning/20 text-warning'
            : !isMt5Connected
            ? 'bg-warning/10 border-warning/20 text-warning'
            : ''
        }`}>
          {isBackendOffline ? (
            <><ShieldAlert size={14} className="animate-pulse" /><span>BACKEND OFFLINE - The trading system cannot reach the backend server</span></>
          ) : !wsConnected ? (
            <><Loader2 size={14} className="animate-spin" /><span>WebSocket reconnecting - live updates paused</span></>
          ) : !isMt5Connected ? (
            <><WifiOff size={14} /><span>MT5 Disconnected - MetaTrader 5 terminal not connected</span></>
          ) : null}
        </div>
      )}
      {allOk && (
        <div className="bg-success/10 border-b border-success/20 text-success text-[11px] font-bold px-8 py-2.5 tracking-wide flex items-center space-x-2 shrink-0 select-none">
          <Wifi size={14} />
          <span>All Systems Operational</span>
        </div>
      )}
      {children}
    </>
  );
}
