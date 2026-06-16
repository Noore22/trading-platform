'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertTriangle,
  History,
  Layers,
  Settings2,
  Activity
} from 'lucide-react';

const TradingViewChart = dynamic(
  () => import('../../components/TradingViewChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] flex items-center justify-center bg-card border border-gray-900 rounded-2xl">
        <span className="text-xs text-textSecondary uppercase tracking-widest font-semibold">Loading Live Chart...</span>
      </div>
    )
  }
);

export default function TradesPage() {
  const selectedAccount = useStore((state) => state.selectedAccount);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  // Lists
  const openTrades = useStore((state) => state.openTrades) ?? [];
  const [historyTrades, setHistoryTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tradeActionLoading, setTradeActionLoading] = useState<number | null>(null);

  // Manual Ticket Form
  const [ticketSymbol, setTicketSymbol] = useState('BTCUSDT');
  const [ticketVolume, setTicketVolume] = useState('0.10'); // Lot Size
  const [ticketSL, setTicketSL] = useState('0.0');
  const [ticketTP, setTicketTP] = useState('0.0');

  // SL/TP Modify Form Context
  const [modifyingTicket, setModifyingTicket] = useState<number | null>(null);
  const [modifySL, setModifySL] = useState('');
  const [modifyTP, setModifyTP] = useState('');

  // Partial Close Form Context
  const [partialTicket, setPartialTicket] = useState<number | null>(null);
  const [partialVolume, setPartialVolume] = useState('');

  // Query Filter
  const [filterSymbol, setFilterSymbol] = useState('');

  const currentAccount = selectedAccount;
  const wsStatus = useStore((state) => state.wsStatus);
  const isMt5Connected = useStore((state) => state.isMt5Connected);

  // ONLINE if MT5 is connected
  const isOnline = !!isMt5Connected;

  const loadTrades = useCallback(async () => {
    if (!currentAccount) return;
    setLoading(true);
    try {
      // Fetch MT5 connection status
      const mt5Status = await api.getMT5Status().catch(() => null);
      if (mt5Status) {
        useStore.getState().setIsMt5Connected(!!mt5Status.connected);
      }

      if (activeTab === 'active') {
        const positions = await api.getMT5Positions();
        useStore.getState().setOpenTrades(positions || []);
      } else {
        const deals = await api.getMT5History(30);
        const filtered = filterSymbol 
          ? deals.filter((d: any) => d.symbol.toUpperCase().includes(filterSymbol.toUpperCase()))
          : deals;
        setHistoryTrades(filtered || []);
      }
    } catch (err) {
      console.error('Failed to load trades list from Binance service:', err);
    } finally {
      setLoading(false);
    }
  }, [currentAccount, activeTab, filterSymbol]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  // Execute direct market trades (Buy/Sell)
  const handleExecuteTrade = async (direction: 'buy' | 'sell') => {
    if (!currentAccount) return;
    if (!isOnline) {
      alert("Binance service is offline. Cannot open position.");
      return;
    }
    
    const confirmTrade = confirm(`Confirm placement: ${direction.toUpperCase()} ${ticketVolume} lot of ${ticketSymbol.toUpperCase()}?`);
    if (!confirmTrade) return;

    setLoading(true);
    try {
      const payload = {
        symbol: ticketSymbol.toUpperCase(),
        lot_size: Number(ticketVolume),
        stop_loss: Number(ticketSL),
        take_profit: Number(ticketTP)
      };

      if (direction === 'buy') {
        await api.placeMT5Buy(payload);
      } else {
        await api.placeMT5Sell(payload);
      }
      
      alert(`Market ${direction.toUpperCase()} order executed successfully on Binance.`);
      setTicketSL('0.0');
      setTicketTP('0.0');
      loadTrades();
    } catch (err: any) {
      alert(`Direct order execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Close All direct trigger
  const handleCloseAllGroup = async () => {
    if (!currentAccount) return;
    const confirmAction = confirm("Are you sure you want to CLOSE ALL open positions immediately?");
    if (!confirmAction) return;

    setLoading(true);
    try {
      const res = await api.closeAllMT5Positions();
      alert(`Emergency Close All processed. Closed ${res.closed_count} positions.`);
      loadTrades();
    } catch (err: any) {
      alert(`Emergency close all failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modify Stop Loss / Take Profit
  const startModify = (trade: any) => {
    setModifyingTicket(trade.ticket);
    setModifySL(String(trade.sl));
    setModifyTP(String(trade.tp));
    setPartialTicket(null);
  };

  const handleModifySubmit = async (ticket: number) => {
    if (!currentAccount) return;
    setTradeActionLoading(ticket);
    try {
      await api.modifyMT5SLTP({
        ticket,
        sl: Number(modifySL),
        tp: Number(modifyTP)
      });
      alert(`SL/TP modified for Ticket ${ticket}`);
      setModifyingTicket(null);
      loadTrades();
    } catch (err: any) {
      alert(`Modify SL/TP failed: ${err.message}`);
    } finally {
      setTradeActionLoading(null);
    }
  };

  // Partial Positions Close
  const startPartial = (trade: any) => {
    setPartialTicket(trade.ticket);
    setPartialVolume(String(trade.volume / 2));
    setModifyingTicket(null);
  };

  const handlePartialSubmit = async (ticket: number) => {
    if (!currentAccount) return;
    if (Number(partialVolume) <= 0) {
      alert('Volume must be greater than zero.');
      return;
    }
    
    setTradeActionLoading(ticket);
    try {
      await api.partialCloseMT5Position({
        ticket,
        volume: Number(partialVolume)
      });
      alert(`Partial Close of ${partialVolume} lots complete for Ticket ${ticket}`);
      setPartialTicket(null);
      loadTrades();
    } catch (err: any) {
      alert(`Partial Close failed: ${err.message}`);
    } finally {
      setTradeActionLoading(null);
    }
  };

  // Direct Close individual position
  const handleCloseIndividual = async (ticket: number) => {
    if (!currentAccount) return;
    const confirmClose = confirm(`Confirm Close for position ticket ${ticket}?`);
    if (!confirmClose) return;

    setTradeActionLoading(ticket);
    try {
      await api.closeMT5Position(ticket);
      alert(`Position closed.`);
      loadTrades();
    } catch (err: any) {
      alert(`Close position failed: ${err.message}`);
    } finally {
      setTradeActionLoading(null);
    }
  };

  if (!currentAccount) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle size={48} className="text-warning mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Accounts</h2>
          <p className="text-textSecondary text-sm text-center max-w-md">
            Please register a Binance account to view trades or perform direct operations.
          </p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Trade Ticket & Live Chart */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 glow-blue">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                <Settings2 size={16} className="text-primary" />
                <span>Trade Placement Panel</span>
              </h2>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                isOnline ? 'bg-success/20 text-success border-success/30' : 'bg-danger/20 text-danger border-danger/30'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">
                  Asset Symbol
                </label>
                <input
                  type="text"
                  value={ticketSymbol}
                  onChange={(e) => setTicketSymbol(e.target.value)}
                  className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-bold uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">
                  Lot Size (Volume)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ticketVolume}
                  onChange={(e) => setTicketVolume(e.target.value)}
                  className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">
                    Stop Loss (SL)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={ticketSL}
                    onChange={(e) => setTicketSL(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">
                    Take Profit (TP)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={ticketTP}
                    onChange={(e) => setTicketTP(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <button
                  onClick={() => handleExecuteTrade('buy')}
                  disabled={loading || !isOnline}
                  className="w-full bg-success hover:bg-success/90 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40"
                >
                  BUY
                </button>
                <button
                  onClick={() => handleExecuteTrade('sell')}
                  disabled={loading || !isOnline}
                  className="w-full bg-danger hover:bg-danger/90 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40"
                >
                  SELL
                </button>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={handleCloseAllGroup}
                  disabled={loading || openTrades.length === 0}
                  className="w-full bg-danger/10 border border-danger/40 hover:bg-danger text-danger hover:text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-40"
                >
                  CLOSE ALL
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Live Graph Panel */}
          <ErrorBoundary>
            <TradingViewChart symbol={ticketSymbol} height={380} />
          </ErrorBoundary>
        </div>

        {/* Right Column: Positions & History Lists */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl border border-gray-900 overflow-hidden">
            
            {/* Header Tabs */}
            <div className="flex border-b border-gray-900 bg-card">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center space-x-2 py-4 px-6 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'active'
                    ? 'border-b-2 border-primary text-primary bg-background/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Layers size={14} />
                <span>Active Positions ({openTrades.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 py-4 px-6 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'history'
                    ? 'border-b-2 border-primary text-primary bg-background/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <History size={14} />
                <span>Deals History</span>
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'active' ? (
                // Active Trades Table
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                        <th className="py-3">Ticket</th>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>Volume</th>
                        <th>SL / TP</th>
                        <th>Open Price</th>
                        <th>Profit</th>
                        <th className="text-right">Action Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {openTrades.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-24 text-gray-500 font-semibold">
                            No active simulated positions.
                          </td>
                        </tr>
                      ) : (
                        openTrades.map((trade) => {
                          const isModifying = modifyingTicket === trade.ticket;
                          const isPartialing = partialTicket === trade.ticket;
                          const isRowLoading = tradeActionLoading === trade.ticket;

                          return (
                            <tr key={trade.ticket} className="hover:bg-gray-900/10">
                              <td className="py-4 font-bold font-mono text-gray-400">{trade.ticket}</td>
                              <td className="font-bold text-white">{trade.symbol}</td>
                              <td className="uppercase font-bold">
                                <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                                  {trade.type}
                                </span>
                              </td>
                              <td>{trade.volume} Lot</td>
                              <td>
                                {isModifying ? (
                                  <div className="flex flex-col space-y-1.5 py-1">
                                    <input
                                      type="number"
                                      step="0.00001"
                                      placeholder="SL"
                                      value={modifySL}
                                      onChange={(e) => setModifySL(e.target.value)}
                                      className="bg-background border border-gray-800 rounded px-1.5 py-0.5 text-[10px] w-24 text-white font-mono"
                                    />
                                    <input
                                      type="number"
                                      step="0.00001"
                                      placeholder="TP"
                                      value={modifyTP}
                                      onChange={(e) => setModifyTP(e.target.value)}
                                      className="bg-background border border-gray-800 rounded px-1.5 py-0.5 text-[10px] w-24 text-white font-mono"
                                    />
                                  </div>
                                ) : (
                                  <div className="font-mono text-textSecondary text-[11px]">
                                    <div>SL: {trade.sl ? trade.sl.toFixed(5) : '0.00000'}</div>
                                    <div>TP: {trade.tp ? trade.tp.toFixed(5) : '0.00000'}</div>
                                  </div>
                                )}
                              </td>
                              <td className="font-mono">{trade.open_price.toFixed(5)}</td>
                              <td className={`font-bold font-mono ${trade.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${trade.profit.toFixed(2)}
                              </td>
                              <td className="py-4 text-right">
                                {isRowLoading ? (
                                  <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : isModifying ? (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleModifySubmit(trade.ticket)}
                                      className="p-1 bg-success/10 border border-success/30 hover:bg-success hover:text-white text-success rounded transition"
                                      title="Save Parameters"
                                    >
                                      <Save size={14} />
                                    </button>
                                    <button
                                      onClick={() => setModifyingTicket(null)}
                                      className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : isPartialing ? (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={partialVolume}
                                      onChange={(e) => setPartialVolume(e.target.value)}
                                      className="bg-background border border-gray-800 rounded px-1.5 py-0.5 text-[10px] w-14 text-white font-mono"
                                    />
                                    <button
                                      onClick={() => handlePartialSubmit(trade.ticket)}
                                      className="px-2.5 py-0.5 bg-success hover:bg-success/90 text-white rounded text-[10px] font-bold"
                                    >
                                      Execute
                                    </button>
                                    <button
                                      onClick={() => setPartialTicket(null)}
                                      className="p-0.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => startModify(trade)}
                                      className="p-1.5 hover:bg-gray-805 text-gray-450 hover:text-white rounded-lg transition"
                                      title="Modify SL/TP Limits"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => startPartial(trade)}
                                      className="px-2 py-1 bg-gray-900 border border-gray-850 hover:border-primary/50 text-gray-300 hover:text-white rounded-lg transition text-[10px] font-bold"
                                    >
                                      Partial Close
                                    </button>
                                    <button
                                      onClick={() => handleCloseIndividual(trade.ticket)}
                                      className="p-1.5 hover:bg-danger/10 text-gray-450 hover:text-danger rounded-lg transition"
                                      title="Close Position"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Closed Trades History
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="text"
                      placeholder="Filter by Symbol (e.g. BTCUSDT)"
                      value={filterSymbol}
                      onChange={(e) => setFilterSymbol(e.target.value)}
                      className="bg-background border border-gray-800 rounded-xl py-2 px-3 text-xs w-64 text-white focus:outline-none focus:border-primary/50 uppercase"
                    />
                    <button
                      onClick={loadTrades}
                      className="px-4 py-2 bg-gray-905 hover:bg-gray-800 border border-gray-800 rounded-xl text-xs font-bold text-gray-300 transition"
                    >
                      Filter Symbol
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                          <th className="py-3">Ticket</th>
                          <th>Symbol</th>
                          <th>Buy/Sell</th>
                          <th>Volume</th>
                          <th>Execution Price</th>
                          <th>Profit</th>
                          <th>Close Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {historyTrades.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-24 text-gray-500 font-semibold">
                              No deals history records found matching conditions.
                            </td>
                          </tr>
                        ) : (
                          historyTrades.map((trade) => (
                            <tr key={trade.ticket} className="hover:bg-gray-900/10">
                              <td className="py-3 font-bold font-mono text-gray-500">{trade.ticket}</td>
                              <td className="font-bold text-white">{trade.symbol}</td>
                              <td className="uppercase font-bold">
                                <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                                  {trade.type}
                                </span>
                              </td>
                              <td>{trade.volume} Lot</td>
                              <td className="font-mono text-textSecondary">
                                {trade.close_price.toFixed(5)}
                              </td>
                              <td className={`font-bold font-mono ${trade.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${trade.profit.toFixed(2)}
                              </td>
                              <td className="text-textSecondary">
                                {trade.close_time ? new Date(trade.close_time).toLocaleString() : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </Navbar>
  );
}
