import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

export interface Mt5AccountData {
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  floating_profit: number;
  daily_profit: number;
  weekly_profit: number;
  monthly_profit: number;
  drawdown: number;
  margin_level: number;
  leverage: number;
  currency: string;
  server: string;
  account_number: number;
  broker: string;
  open_positions: number;
  trade_allowed: boolean;
  win_rate?: number;
  daily_pnl?: number;
  risk_score?: number;
}

interface AppState {
  token: string | null;
  user: User | null;
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  isBackendOffline: boolean;
  isMt5Connected: boolean;
  socket: WebSocket | null;
  pendingOrders: any[];
  positions: any[];
  mt5Data: Mt5AccountData | null;
  mt5Error: string;
  scannerData: any[];
  candleData: Record<string, any[]>;
  marketSession: string;
  aiSignals: Record<string, any>;
  aiStatus: any;
  tradeHistory: any[];

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setWsStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setIsBackendOffline: (offline: boolean) => void;
  setIsMt5Connected: (connected: boolean) => void;
  setSocket: (socket: WebSocket | null) => void;
  setPendingOrders: (orders: any[]) => void;
  setPositions: (positions: any[]) => void;
  setMt5Data: (data: Mt5AccountData) => void;
  setMt5Error: (error: string) => void;
  setScannerData: (data: any[]) => void;
  setCandleData: (data: Record<string, any[]>) => void;
  setMarketSession: (session: string) => void;
  setAiSignals: (signals: Record<string, any>) => void;
  setAiStatus: (status: any) => void;
  setTradeHistory: (history: any[]) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch { return null; }
  })() : null,
  wsStatus: 'disconnected',
  isBackendOffline: false,
  isMt5Connected: false,
  socket: null,
  pendingOrders: [],
  positions: [],
  mt5Data: null,
  mt5Error: '',
  scannerData: [],
  candleData: {},
  marketSession: '--',
  aiSignals: {},
  aiStatus: null,
  tradeHistory: [],

  setToken: (token) => set(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    return { token };
  }),

  setUser: (user) => set(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    return { user };
  }),

  setWsStatus: (wsStatus) => set(() => ({ wsStatus })),
  setIsBackendOffline: (isBackendOffline) => set(() => ({ isBackendOffline })),
  setIsMt5Connected: (isMt5Connected) => set(() => ({ isMt5Connected })),
  setSocket: (socket) => set(() => ({ socket })),
  setPendingOrders: (pendingOrders) => set(() => ({ pendingOrders })),
  setPositions: (positions) => set(() => ({ positions })),
  setMt5Data: (mt5Data) => set(() => ({ mt5Data })),
  setMt5Error: (mt5Error) => set(() => ({ mt5Error })),
  setScannerData: (scannerData) => set(() => ({ scannerData })),
  setCandleData: (candleData) => set(() => ({ candleData })),
  setMarketSession: (marketSession) => set(() => ({ marketSession })),
  setAiSignals: (aiSignals) => set(() => ({ aiSignals })),
  setAiStatus: (aiStatus) => set(() => ({ aiStatus })),
  setTradeHistory: (tradeHistory) => set(() => ({ tradeHistory })),

  logout: () => set(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      token: null, user: null, wsStatus: 'disconnected',
      isBackendOffline: false, isMt5Connected: false,
      socket: null, pendingOrders: [], positions: [], mt5Data: null,
      mt5Error: '', scannerData: [], candleData: {}, marketSession: '--',
      aiSignals: {}, aiStatus: null, tradeHistory: [],
    };
  }),
}));
