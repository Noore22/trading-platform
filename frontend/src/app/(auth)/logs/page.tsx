'use client';
import React, { useEffect, useState } from 'react';
import { ScrollText, AlertCircle, Info, AlertTriangle, RefreshCw, Trash2, Terminal } from 'lucide-react';
import { api } from '@/services/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getStatus();
        setLogs([{ level: 'info', message: 'System status: ' + data.status, time: data.timestamp }]);
      } catch {
        setLogs([{ level: 'error', message: 'Cannot reach backend', time: new Date().toISOString() }]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    const iv = setInterval(fetchLogs, 5000);
    return () => clearInterval(iv);
  }, []);

  const iconMap: Record<string, any> = { info: Info, warning: AlertTriangle, error: AlertCircle, success: Info };
  const colorMap: Record<string, string> = { info: 'text-[#2196F3]', warning: 'text-[#FF9800]', error: 'text-[#FF1744]', success: 'text-[#00C853]' };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Event Logs</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">System events and trading activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-[#2B2B2B] rounded-2xl overflow-hidden font-mono text-xs">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2B2B2B] bg-[#151515]">
          <Terminal className="w-3.5 h-3.5 text-[#FFD400]" />
          <span className="text-gray-400">system.log</span>
          <span className="text-gray-600">|</span>
          <span className="text-[10px] text-gray-600">{loading ? 'Loading...' : `${logs.length} entries`}</span>
        </div>
        <div className="h-[500px] overflow-y-auto p-3 space-y-1">
          {logs.map((log, i) => {
            const Icon = iconMap[log.level] || Info;
            const color = colorMap[log.level] || 'text-gray-400';
            return (
              <div key={i} className="flex items-start gap-2 py-1 hover:bg-white/[0.02] rounded px-2">
                <Icon className={`w-3 h-3 mt-0.5 ${color}`} />
                <span className="text-gray-500 shrink-0">{log.time ? new Date(log.time).toLocaleTimeString() : '--'}</span>
                <span className={`${color} font-semibold uppercase text-[10px] shrink-0`}>{log.level}</span>
                <span className="text-gray-400 break-all">{typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
