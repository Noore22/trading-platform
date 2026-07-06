'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, LineChart, Activity, Bot, Radio, ListOrdered,
  Target, History, Briefcase, PieChart, ShieldAlert, Newspaper,
  ScrollText, Bell, Settings, User, BotMessageSquare, Menu,
  ChevronLeft, ChevronRight, Search, Star, LogOut, Signal,
  BarChart3, Bookmark, Plug, Gauge, CandlestickChart, TrendingUp,
  Timer, BarChart4, BookOpen, FileBarChart, PanelBottomClose,
  TimerReset
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { group: 'Overview', items: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Terminal', icon: LineChart, href: '/terminal' },
    { label: 'Market Scanner', icon: Activity, href: '/scanner' },
  ]},
  { group: 'AI Trading', items: [
    { label: 'AI Control Center', icon: Bot, href: '/agents' },
    { label: 'AI Signals', icon: Radio, href: '/ai-signals' },
    { label: 'AI Performance', icon: TrendingUp, href: '/analytics' },
  ]},
  { group: 'Trading', items: [
    { label: 'Orders', icon: Signal, href: '/orders' },
    { label: 'Positions', icon: BarChart3, href: '/positions' },
    { label: 'Trade History', icon: History, href: '/trade-history' },
  ]},
  { group: 'Analytics', items: [
    { label: 'Portfolio', icon: PieChart, href: '/portfolio' },
    { label: 'Risk Manager', icon: ShieldAlert, href: '/risk' },
    { label: 'Performance', icon: FileBarChart, href: '/bots' },
    { label: 'Strategies', icon: Bookmark, href: '/strategies' },
  ]},
  { group: 'Research', items: [
    { label: 'News', icon: Newspaper, href: '/news' },
    { label: 'Economic Calendar', icon: Timer, href: '/connection' },
  ]},
  { group: 'System', items: [
    { label: 'Logs', icon: ScrollText, href: '/logs' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]},
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const mt5Data = useStore((state) => state.mt5Data);

  const allItems = useMemo(() => navItems.flatMap(g => g.items), []);

  const filteredItems = searchQuery
    ? allItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const displayName = user?.username || mt5Data?.broker || 'Trader';
  const displayRole = user?.role || 'user';

  return (
    <div 
      className={`flex flex-col h-screen bg-[#121212] border-r border-[#2B2B2B] transition-all duration-300 overflow-hidden flex-shrink-0 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#2B2B2B] flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFD400] to-[#FFA500] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FFD400]/20">
              <BotMessageSquare className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-sm text-white leading-tight">AntiGravity</span>
              <span className="text-[9px] text-[#FFD400] font-semibold uppercase tracking-[0.15em]">AI Trading</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFD400] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD400]/20">
              <BotMessageSquare className="w-4 h-4 text-black" />
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => { setSearchOpen(false); setSearchQuery(''); }, 200)}
              className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded-lg pl-8 pr-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#FFD400]/50 placeholder:text-gray-600"
            />
          </div>
          {searchOpen && filteredItems && filteredItems.length > 0 && (
            <div className="absolute left-3 right-3 mt-1 bg-[#181818] border border-[#2B2B2B] rounded-lg shadow-lg z-50 py-1">
              {filteredItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#0A0A0A] transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar py-2 px-2">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-3">
            {!collapsed && (
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.15em]">
                  {group.group}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 relative group ${
                      isActive
                        ? 'bg-[#FFD400]/10 text-[#FFD400]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#0A0A0A]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFD400]' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="text-xs font-medium">{item.label}</span>
                        {isActive && (
                          <div className="w-1 h-5 rounded-full bg-[#FFD400] absolute left-0 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(255,212,0,0.5)]" />
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2B2B2B] p-2 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#0A0A0A] transition-colors cursor-pointer mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#FFD400]/20 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-[#FFD400]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{displayName}</div>
              <div className="text-[10px] text-gray-500">{displayRole}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD400]/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-[#FFD400]" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-[#0A0A0A] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <><ChevronLeft className="w-3.5 h-3.5" /><span className="text-[11px]">Collapse</span></>}
        </button>
      </div>
    </div>
  );
}