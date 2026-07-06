'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  children: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchHealth = () => {
      api.getHealth().then((metrics) => {
        useStore.getState().setIsMt5Connected(!!metrics.mt5_connected);
      }).catch(() => {});
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  useWebSocket();

  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const setUser = useStore((state) => state.setUser);

  const isBackendOffline = useStore((state) => state.isBackendOffline);

  useEffect(() => {
    if (mounted && !token) {
      router.replace('/login');
    }
  }, [token, router, mounted]);

  useEffect(() => {
    if (mounted && token && !user) {
      api.getMe()
        .then((profile) => {
          if (profile) {
            setUser(profile);
          }
        })
        .catch(() => {
          useStore.getState().setIsBackendOffline(true);
        });
    }
  }, [token, user, setUser, mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Application...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Authenticating Session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading User Profile...</p>
      </div>
    );
  }

  return (
    <>
      {isBackendOffline && (
        <div className="bg-danger/20 border-b border-danger/30 text-danger text-[11px] font-bold px-8 py-3 tracking-wide flex items-center space-x-2 shrink-0 select-none">
          <ShieldAlert size={14} className="animate-pulse" />
          <span>BACKEND OFFLINE: The trading automation system is unable to connect to the backend server. Live data updates are paused.</span>
        </div>
      )}
      {children}
    </>
  );
}
