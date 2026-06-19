'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { ShieldAlert, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export default function LogsPage() {
  const selectedAccount = useStore((state) => state.selectedAccount);
  const user = useStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const logs = useStore((state) => state.logs) ?? [];
  const setLogs = useStore((state) => state.setLogs);

  const fetchLogs = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const data = await api.getLogs(selectedAccount.id, 200);
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, setLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!selectedAccount) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle size={48} className="text-warning mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Accounts</h2>
          <p className="text-textSecondary text-sm text-center max-w-md">
            Please register a Binance account to view system logs.
          </p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <ShieldAlert size={16} className="text-primary" />
            <span>System Event Logs</span>
            </h2>
            <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center space-x-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50"
            >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
            </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-900 min-h-[60vh]">
            <div className="bg-background/95 border border-gray-900 rounded-xl p-4 font-mono text-xs text-gray-400 h-[60vh] overflow-y-auto space-y-2.5 select-text">
            {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <FileText size={32} className="mb-3 opacity-20" />
                    <p className="font-sans font-semibold uppercase tracking-wider">No logs available for this account.</p>
                </div>
            ) : (
                logs.map((log: any) => (
                <div key={log.id || Math.random()} className="flex items-start space-x-2.5 border-b border-gray-900 pb-2.5 last:border-b-0">
                    <span className="text-gray-650 shrink-0 font-bold">
                    [{new Date(log.created_at).toLocaleString()}]
                    </span>
                    <span className={
                    log.level === 'error' || log.level === 'warning' ? 'text-danger font-semibold' :
                    log.level === 'success' ? 'text-success font-semibold' :
                    'text-gray-300'
                    }>
                    {log.message}
                    </span>
                </div>
                ))
            )}
            </div>
        </div>
      </div>
    </Navbar>
  );
}
