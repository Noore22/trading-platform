import { create } from 'zustand';

export interface TickData {
  bid: number;
  ask: number;
  last: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  time: number;
  prevBid?: number;
  prevAsk?: number;
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
