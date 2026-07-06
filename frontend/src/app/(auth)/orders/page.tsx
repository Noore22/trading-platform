'use client';

import React, { useState, useEffect } from 'react';
import { Signal, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isBackendOffline = useStore((s) => s.isBackendOffline);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMT5Orders();
      setOrders(Array.isArray(data) ? data : []);
      useStore.getState().setIsBackendOffline(false);
    } catch {
      useStore.getState().setIsBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (ticket: number) => {
    try {
      await api.cancelOrder(ticket);
      fetchOrders();
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-outfit text-white">Pending Orders</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">{loading ? 'Loading...' : `${orders.length} pending orders`}</p>
        </div>
        <div className="flex items-center gap-2">
          {isBackendOffline && (
            <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-2.5 py-1.5 rounded-md text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> OFFLINE
            </div>
          )}
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-1.5 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="bg-background text-gray-500 uppercase font-semibold text-[10px]">
              <th className="p-3 border-b border-border">Ticket</th>
              <th className="p-3 border-b border-border">Symbol</th>
              <th className="p-3 border-b border-border">Type</th>
              <th className="p-3 border-b border-border">Order Type</th>
              <th className="p-3 border-b border-border text-right">Volume</th>
              <th className="p-3 border-b border-border text-right">Price</th>
              <th className="p-3 border-b border-border text-right">SL</th>
              <th className="p-3 border-b border-border text-right">TP</th>
              <th className="p-3 border-b border-border text-center">Status</th>
              <th className="p-3 border-b border-border text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {orders.length > 0 ? orders.map((ord: any, i: number) => (
              <tr key={ord.ticket || i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3 font-mono text-gray-400">{ord.ticket || '--'}</td>
                <td className="p-3 font-bold text-white font-mono">{ord.symbol}</td>
                <td className={`p-3 font-bold uppercase ${ord.type === 'BUY' ? 'text-success' : 'text-danger'}`}>{ord.type || '--'}</td>
                <td className="p-3 font-mono text-gray-400">{ord.type_name || '--'}</td>
                <td className="p-3 text-right font-mono text-gray-300">{ord.volume}</td>
                <td className="p-3 text-right font-mono text-gray-300">{ord.price}</td>
                <td className="p-3 text-right font-mono text-danger">{ord.sl || '--'}</td>
                <td className="p-3 text-right font-mono text-success">{ord.tp || '--'}</td>
                <td className="p-3 text-center">
                  <span className="badge badge-yellow">PENDING</span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleCancel(ord.ticket)}
                    className="flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded font-bold uppercase text-[9px] transition-colors mx-auto"
                  >
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={10} className="text-center p-10 text-gray-500 font-semibold text-[11px]">
                {isBackendOffline ? 'Backend offline - orders unavailable' : 'No pending orders'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
