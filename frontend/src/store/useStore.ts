import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

export interface Setting {
  id: number;
  account_id: number;
  default_lot_size: number;
  risk_percentage: number;
  max_trades: number;
  trading_hours_start: string;
  trading_hours_end: string;
  allowed_symbols: string;
  news_filter_enabled: boolean;
  bot_status: string;
  auto_trading_enabled: boolean;
  take_profit: number;
  stop_loss: number;
  trailing_stop: number;
  max_daily_loss: number;
  max_daily_profit: number;
}

export interface Target {
  id: number;
  account_id: number;
  daily_profit_target: number;
  monthly_profit_target: number;
  daily_loss_limit: number;
  weekly_loss_limit: number;
  auto_close_on_target: boolean;
  auto_disable_on_target: boolean;
}

export interface Account {
  id: number;
  name: string;
  login: number;
  broker: string;
  server: string;
  investor_password?: string;
  master_password?: string;
  api_token: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  floating_profit: number;
  daily_profit: number;
  weekly_profit: number;
  monthly_profit: number;
  win_rate: number;
  is_active: boolean;
  last_sync_at: string | null;
  setting?: Setting;
  target?: Target;
}

export interface Trade {
  id: number;
  account_id: number;
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  open_price: number;
  close_price: number;
  current_price?: number;
  sl: number;
  tp: number;
  profit: number;
  open_time: string;
  close_time: string | null;
  status: string;
  comment: string | null;
}

export interface PerformanceStats {
  total_balance: number;
  total_equity: number;
  total_free_margin: number;
  total_profit: number;
  daily_profit: number;
  weekly_profit: number;
  monthly_profit: number;
  open_trades_count: number;
  closed_trades_count: number;
  win_rate: number;
  max_drawdown: number;
  risk_score: number;
}

export interface Log {
  id: number;
  account_id: number;
  level: string;
  message: string;
  created_at: string;
}



interface AppState {
  token: string | null;
  user: User | null;
  accounts: Account[];
  selectedAccount: Account | null;
  trades: Trade[];
  openTrades: Trade[];
  stats: PerformanceStats | null;
  logs: Log[];
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  isBackendOffline: boolean;
  isMt5Connected: boolean;
  socket: WebSocket | null;
  pendingOrders: any[];
  activeBots: Record<string, string[]>;
  selectedSymbol: string;
  
  // Actions
  setToken: (token: string | null) => void;
  setPendingOrders: (orders: any[]) => void;
  setActiveBots: (activeBots: Record<string, string[]>) => void;
  setSelectedSymbol: (symbol: string) => void;
  setUser: (user: User | null) => void;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  setTrades: (trades: Trade[]) => void;
  setOpenTrades: (trades: Trade[]) => void;
  setStats: (stats: PerformanceStats | null) => void;
  setLogs: (logs: Log[]) => void;
  setWsStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setIsBackendOffline: (offline: boolean) => void;
  setIsMt5Connected: (connected: boolean) => void;
  setSocket: (socket: WebSocket | null) => void;
  logout: () => void;
  
  // Real-time updates handler
  updateAccountMetrics: (accountId: number, metrics: Partial<Account>) => void;
  addLog: (log: Log) => void;
  updateTradeInStore: (trade: Trade) => void;
}

export const useStore = create<AppState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  })() : null,
  accounts: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('cached_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })() : [],
  selectedAccount: null,
  trades: [],
  openTrades: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('cached_open_trades');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })() : [],
  stats: null,
  logs: [],
  wsStatus: 'disconnected',
  isBackendOffline: false,
  isMt5Connected: false,
  socket: null,
  pendingOrders: [],
  activeBots: {},
  selectedSymbol: 'BTCUSDT',
 
  setToken: (token) => set(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    return { token };
  }),

  setPendingOrders: (pendingOrders) => set(() => ({ pendingOrders })),

  setActiveBots: (activeBots) => set(() => ({ activeBots })),

  setSelectedSymbol: (selectedSymbol) => set(() => ({ selectedSymbol })),
 
  setUser: (user) => set(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    return { user };
  }),
 
  setAccounts: (accounts) => set((state) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_accounts', JSON.stringify(accounts));
    }
    // Retain selected account reference if it exists in the updated list
    const currentSelected = state.selectedAccount;
    const newSelected = currentSelected
      ? accounts.find((a) => a.id === currentSelected.id) || accounts[0] || null
      : accounts[0] || null;
    return { accounts, selectedAccount: newSelected };
  }),
 
  setSelectedAccount: (selectedAccount) => set(() => ({ selectedAccount })),
 
  setTrades: (trades) => set(() => ({ trades })),
 
  setOpenTrades: (openTrades) => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_open_trades', JSON.stringify(openTrades));
    }
    return { openTrades };
  }),
 
  setStats: (stats) => set(() => ({ stats })),
 
  setLogs: (logs) => set(() => ({ logs })),
 
  setWsStatus: (wsStatus) => set(() => ({ wsStatus })),
 
  setIsBackendOffline: (isBackendOffline) => set(() => ({ isBackendOffline })),
 
  setIsMt5Connected: (isMt5Connected) => set(() => ({ isMt5Connected })),

  setSocket: (socket) => set(() => ({ socket })),
 
  logout: () => set(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      token: null,
      user: null,
      accounts: [],
      selectedAccount: null,
      trades: [],
      openTrades: [],
      stats: null,
      logs: [],
      isMt5Connected: false,
      socket: null,
      pendingOrders: [],
      activeBots: {},
      selectedSymbol: 'BTCUSDT'
    };
  }),

  updateAccountMetrics: (accountId, metrics) => set((state) => {
    const list = state.accounts || [];
    const updatedAccounts = list.map((acc) => {
      if (acc && acc.id === accountId) {
        const updatedAcc = { ...acc, ...metrics };
        // Sync selectedAccount if it is the one updated
        if (state.selectedAccount?.id === accountId) {
          setTimeout(() => set({ selectedAccount: updatedAcc }), 0);
        }
        return updatedAcc;
      }
      return acc;
    });
    return { accounts: updatedAccounts };
  }),

  addLog: (log) => set((state) => ({ logs: [log, ...(state.logs || [])].slice(0, 100) })),

  updateTradeInStore: (trade) => set((state) => {
    const tradesList = state.trades || [];
    const tradeExists = tradesList.some((t) => t && t.ticket === trade.ticket);
    const updatedTrades = tradeExists
      ? tradesList.map((t) => (t && t.ticket === trade.ticket ? trade : t))
      : [trade, ...tradesList];
    return { trades: updatedTrades };
  })
}));
