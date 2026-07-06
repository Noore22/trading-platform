import { create } from 'zustand';

export interface TickData {
  bid: number;
  ask: number;
  last: number;
  volume: number;
  time: number;
  prevBid?: number;
  prevAsk?: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  tick_volume: number;
  spread: number;
  real_volume: number;
}

interface TickStore {
  liveTicks: Record<string, TickData>;
  setLiveTicks: (ticks: Record<string, TickData>) => void;
}

export const useTickStore = create<TickStore>((set) => ({
  liveTicks: {},
  setLiveTicks: (ticks) => set((state) => {
    const updated = { ...state.liveTicks };
    Object.entries(ticks).forEach(([symbol, newTick]) => {
      const prev = updated[symbol];
      updated[symbol] = {
        ...newTick,
        prevBid: prev ? prev.bid : undefined,
        prevAsk: prev ? prev.ask : undefined,
      };
    });
    return { liveTicks: updated };
  })
}));
