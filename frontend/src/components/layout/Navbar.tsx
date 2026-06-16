'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  UserSquare2,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Server,
  User,
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
  }, []);

  // Custom WebSocket Hook activation
  useWebSocket();

  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);
  const setUser = useStore((state) => state.setUser);

  const accounts = useStore((state) => state.accounts);
  const selectedAccount = useStore((state) => state.selectedAccount);
  const setAccounts = useStore((state) => state.setAccounts);
  const setSelectedAccount = useStore((state) => state.setSelectedAccount);
  const wsStatus = useStore((state) => state.wsStatus);
  const isBackendOffline = useStore((state) => state.isBackendOffline);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !token) {
      router.replace('/login');
    }
  }, [token, router, mounted]);

  // Consolidated user profile loading
  useEffect(() => {
    if (mounted && token && !user) {
      console.log("[Navbar] Fetching user profile from API...");
      api.getMe()
        .then((profile) => {
          console.log("[Navbar] User profile loaded successfully:", profile);
          if (profile) {
            setUser(profile);
          }
        })
        .catch((err) => {
          console.error("[Navbar] User profile fetch failed:", err);
          // Set fallback demo user rather than logging out or redirecting
          console.warn("[Navbar] Using fallback demo user profile.");
          setUser({
            id: 1,
            username: "Demo User",
            role: "admin",
            email: "demo@tradingplatform.local"
          });
        });
    }
  }, [token, user, setUser, mounted]);

  // Load account list
  useEffect(() => {
    if (mounted && token) {
      console.log("[Navbar] Fetching MT5 accounts from API...");
      api.getAccounts()
        .then((data) => {
          console.log("[Navbar] MT5 accounts loaded:", data);
          setAccounts(data || []);
        })
        .catch((err) => {
          console.error("[Navbar] Error fetching MT5 accounts:", err);
          setAccounts([]); // Safe empty fallback
        });
    }
  }, [token, setAccounts, mounted]);

  console.log("Navbar check:", { mounted, token: !!token, user: !!user });

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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trade Control', path: '/trades', icon: TrendingUp },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Binance Accounts', path: '/accounts', icon: UserSquare2 },
    { name: 'Bot Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-gray-100">

      {/* Sidebar navigation */}
      <aside className="w-64 bg-card border-r border-gray-900 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-gray-900 flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 text-primary flex items-center justify-center rounded-lg border border-primary/30">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide font-sans text-white uppercase">Binance Platform</h2>
              <p className="text-[10px] text-textSecondary uppercase tracking-widest font-semibold">Automation Engine</p>
            </div>
          </div>

          {/* Account context selector */}
          <div className="p-4 border-b border-gray-900 bg-background/50">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">
              Active Binance Account
            </label>
            <div className="relative">
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const acc = accounts.find(a => a.id === Number(e.target.value));
                  if (acc) setSelectedAccount(acc);
                }}
                className="w-full bg-card border border-gray-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-primary/50 text-white font-medium cursor-pointer appearance-none transition"
              >
                {accounts.length === 0 ? (
                  <option value="">No Accounts Registered</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.login} ({acc.name})
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <Server size={12} />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
                    }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info (User profile, connection status, logout) */}
        <div className="p-4 border-t border-gray-900 space-y-3 bg-background/20">

          {/* User profile */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shrink-0 border border-gray-700">
                <User size={14} className="text-gray-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.username}</p>
                <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide bg-primary/20 text-primary border border-primary/20 mt-0.5">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Socket health status */}
            <div title={`WebSocket: ${wsStatus}`}>
              {wsStatus === 'connected' ? (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
              ) : wsStatus === 'connecting' ? (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                </span>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              )}
            </div>
          </div>

          {/* Logout Action button */}
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 border border-gray-800/80 hover:border-danger/30 hover:bg-danger/5 text-gray-400 hover:text-danger rounded-xl text-xs font-semibold transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {isBackendOffline && (
          <div className="bg-danger/20 border-b border-danger/30 text-danger text-[11px] font-bold px-8 py-3 tracking-wide flex items-center space-x-2 shrink-0 select-none">
            <ShieldAlert size={14} className="animate-pulse" />
            <span>BACKEND OFFLINE: The trading automation system is unable to connect to the backend server. Live data updates are paused.</span>
          </div>
        )}
        
        <header className="h-16 border-b border-gray-900 flex items-center justify-between px-8 bg-card shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold font-sans tracking-wide text-white">
              {navItems.find(item => item.path === pathname)?.name || 'Dashboard'}
            </h1>
            {selectedAccount && (
              <span className="text-xs text-textSecondary font-medium">
                (Login: {selectedAccount.login} &bull; {selectedAccount.broker})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Health parameters indicators */}
            <div className="hidden sm:flex items-center space-x-3 border border-gray-800 rounded-xl px-3 py-1.5 bg-background/50">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">WebSocket:</span>
              <div className="flex items-center space-x-1.5">
                {wsStatus === 'connected' ? (
                  <>
                    <Wifi size={14} className="text-success" />
                    <span className="text-[10px] font-bold text-success uppercase">CONNECTED</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-danger" />
                    <span className="text-[10px] font-bold text-danger uppercase">DISCONNECTED</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
