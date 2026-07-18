'use client';
import React, { useEffect, useState } from 'react';
import { Timer, Globe, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ConnectionPage() {
  const marketSession = useStore((s) => s.marketSession);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleString());
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const sessions = [
    { name: 'Tokyo', open: '00:00', close: '09:00', active: marketSession === 'Tokyo' },
    { name: 'London', open: '08:00', close: '17:00', active: marketSession === 'London' },
    { name: 'New York', open: '13:00', close: '22:00', active: marketSession === 'New York' },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Economic Calendar</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Market sessions and economic events</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2B2B2B] px-2.5 py-1.5 rounded-lg">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">{time}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sessions.map((s) => (
          <div key={s.name} className={`bg-[#181818] border rounded-2xl p-4 transition-all ${s.active ? 'border-[#FFD400]/50' : 'border-[#2B2B2B]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Globe className={`w-4 h-4 ${s.active ? 'text-[#FFD400]' : 'text-gray-500'}`} />
              <span className="text-sm font-semibold text-white">{s.name}</span>
              {s.active && <span className="text-[10px] bg-[#FFD400]/10 text-[#FFD400] px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Open: {s.open} UTC</span>
              <span>Close: {s.close} UTC</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-8 flex flex-col items-center justify-center text-gray-600">
        <Calendar className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">Economic events calendar</p>
        <p className="text-xs mt-1">Connect to a news/economic data provider to see events</p>
      </div>
    </div>
  );
}
