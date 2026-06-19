'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTickStore } from '../store/useTickStore';
import { TrendingUp, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

const getSpread = (bid: number, ask: number) => {
  const diff = ask - bid;
  return diff > 0 ? diff.toFixed(2) : '0.00';
};

const formatPrice = (price: number, symbol: string) => {
  const sym = symbol.toUpperCase();
  if (sym.includes('BTC') || sym.includes('ETH')) {
    return price.toFixed(2);
  }
  if (sym.includes('SOL') || sym.includes('BNB')) {
    return price.toFixed(3);
  }
  return price.toFixed(5);
};

// Sub-component that subscribes only to its specific tick!
const TickerBox = ({ symbol, onUnsubscribe }: { symbol: string, onUnsubscribe: (s: string) => void }) => {
  // Subscribe ONLY to this specific symbol's tick
  const tick = useTickStore((state) => state.liveTicks[symbol]);

  // Calculate dynamic color transitions based on prev ticks
  const bidDirection = tick && tick.prevBid !== undefined
    ? tick.bid > tick.prevBid ? 'up' : tick.bid < tick.prevBid ? 'down' : 'flat'
    : 'flat';
    
  const askDirection = tick && tick.prevAsk !== undefined
    ? tick.ask > tick.prevAsk ? 'up' : tick.ask < tick.prevAsk ? 'down' : 'flat'
    : 'flat';

  const bidColorClass = bidDirection === 'up' 
    ? 'text-success' 
    : bidDirection === 'down' 
    ? 'text-danger' 
    : 'text-white';

  const askColorClass = askDirection === 'up' 
    ? 'text-success' 
    : askDirection === 'down' 
    ? 'text-danger' 
    : 'text-white';

  return (
    <div 
      className="relative bg-background/45 border border-gray-900 hover:border-gray-800/80 rounded-xl p-4 transition group flex flex-col justify-between"
    >
      <button
        onClick={() => onUnsubscribe(symbol)}
        className="absolute top-2.5 right-2.5 text-gray-650 hover:text-white opacity-0 group-hover:opacity-100 transition"
        aria-label={`Remove ${symbol}`}
      >
        <X size={12} />
      </button>

      <div className="mb-2">
        <span className="text-xs font-extrabold text-white tracking-wide font-mono">
          {symbol}
        </span>
        {tick && (
          <span className="ml-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
            Spread: ${getSpread(tick.bid, tick.ask)}
          </span>
        )}
      </div>

      {tick ? (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Bid</span>
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-bold font-mono transition-colors duration-250 ${bidColorClass}`}>
                {formatPrice(tick.bid, symbol)}
              </span>
              {bidDirection === 'up' && <ArrowUp size={10} className="text-success shrink-0" />}
              {bidDirection === 'down' && <ArrowDown size={10} className="text-danger shrink-0" />}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ask</span>
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-bold font-mono transition-colors duration-250 ${askColorClass}`}>
                {formatPrice(tick.ask, symbol)}
              </span>
              {askDirection === 'up' && <ArrowUp size={10} className="text-success shrink-0" />}
              {askDirection === 'down' && <ArrowDown size={10} className="text-danger shrink-0" />}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-10 flex items-center justify-center">
          <span className="text-[10px] text-gray-600 font-bold animate-pulse uppercase tracking-wider">
            Waiting for tick...
          </span>
        </div>
      )}
    </div>
  );
};

export default function LiveTicker() {
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  
  const [trackedSymbols, setTrackedSymbols] = useState<string[]>([
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT',
    'BNBUSDT'
  ]);
  const [newSymbol, setNewSymbol] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = newSymbol.trim().toUpperCase();
    if (!cleanSym) return;

    if (!trackedSymbols.includes(cleanSym)) {
      setTrackedSymbols([...trackedSymbols, cleanSym]);
    }
    setNewSymbol('');
  };

  const handleUnsubscribe = (symbol: string) => {
    setTrackedSymbols(trackedSymbols.filter((s) => s !== symbol));
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-900 glow-blue">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <TrendingUp size={16} className="text-success animate-pulse" />
            <span>Binance Live Ticker</span>
          </h2>
          <p className="text-[10px] text-textSecondary uppercase tracking-widest font-semibold mt-1">
            Real-time feed directly from Binance WebSocket API
          </p>
        </div>

        {/* Subscribe Form */}
        <form onSubmit={handleSubscribe} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="WATCH SYMBOL (e.g. XRPUSDT)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="bg-background border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-bold uppercase font-mono max-w-[160px]"
            id="add-ticker-symbol-input"
          />
          <button
            type="submit"
            className="p-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition active:scale-95"
            aria-label="Watch Symbol"
          >
            <Plus size={16} />
          </button>
        </form>
      </div>

      {!isMt5Connected ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Binance Service Offline
          </p>
          <p className="text-[10px] text-textSecondary mt-1">
            Connecting to live Binance WebSocket stream...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trackedSymbols.map((symbol) => (
            <TickerBox key={symbol} symbol={symbol} onUnsubscribe={handleUnsubscribe} />
          ))}
        </div>
      )}
    </div>
  );
}
