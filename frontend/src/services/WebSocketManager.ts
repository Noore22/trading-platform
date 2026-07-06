import { useStore } from '../store/useStore';
import { useTickStore } from '../store/useTickStore';

type WsMessageHandler = (data: any) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 50;
  private baseDelay = 1000;
  private maxDelay = 30000;
  private isConnecting = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private handlers: Map<string, WsMessageHandler[]> = new Map();
  private url: string = '';

  private constructor() {
    this.registerHandler('dashboard_update', this.handleDashboardUpdate);
    this.registerHandler('heartbeat', this.handleHeartbeat);
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public registerHandler(type: string, handler: WsMessageHandler) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  public connect() {
    if ((this.socket && this.socket.readyState === WebSocket.OPEN) || this.isConnecting) return;
    this.isConnecting = true;
    useStore.getState().setWsStatus('connecting');

    const envWsUrl = process.env.NEXT_PUBLIC_WS_URL;
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8007';
    this.url = envWsUrl || envApiUrl.replace(/^http/, 'ws') + '/ws';

    try {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        useStore.getState().setWsStatus('connected');
        useStore.getState().setSocket(this.socket as any);
        useStore.getState().setIsBackendOffline(false);
        this.startHeartbeat();
      };
      this.socket.onclose = () => {
        this.isConnecting = false;
        useStore.getState().setWsStatus('disconnected');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
      this.socket.onerror = () => {
        this.isConnecting = false;
        useStore.getState().setWsStatus('disconnected');
      };
      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.type;
          const handlers = this.handlers.get(type);
          if (handlers) {
            handlers.forEach(h => h(payload.data || payload));
          }
        } catch (e) { /* ignore */ }
      };
      if (!this.checkInterval) {
        this.checkInterval = setInterval(() => {
          if ((!this.socket || this.socket.readyState !== WebSocket.OPEN) && !this.isConnecting) {
            this.scheduleReconnect();
          }
        }, 5000);
      }
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    useStore.getState().setWsStatus('connecting');
    const delay = Math.min(this.baseDelay * Math.pow(1.5, this.reconnectAttempts - 1), this.maxDelay);
    setTimeout(() => this.connect(), delay);
  }

  private handleDashboardUpdate = (data: any) => {
    if (data.ai_signals) {
      useStore.getState().setAiSignals(data.ai_signals);
    }
    if (data.ai_status) {
      useStore.getState().setAiStatus(data.ai_status);
    }
    if (data.mt5) {
      const mt5 = data.mt5;
      useStore.getState().setIsMt5Connected(!!mt5.connected);
      if (mt5.balance !== undefined) {
        useStore.getState().setMt5Data({
          balance: mt5.balance,
          equity: mt5.equity,
          margin: mt5.margin,
          free_margin: mt5.free_margin,
          floating_profit: mt5.profit || 0,
          daily_profit: mt5.daily_profit || 0,
          weekly_profit: mt5.weekly_profit || 0,
          monthly_profit: mt5.monthly_profit || 0,
          drawdown: mt5.drawdown || 0,
          margin_level: mt5.margin_level || 0,
          leverage: mt5.leverage || 0,
          currency: mt5.currency || 'USD',
          server: mt5.server || '',
          account_number: mt5.account_number || 0,
          broker: mt5.broker || '',
          open_positions: mt5.open_positions || 0,
          trade_allowed: mt5.trade_allowed || false,
        });
      }
    }
    if (data.market_ticks) {
      useTickStore.getState().setLiveTicks(data.market_ticks);
    }
    if (data.candles) {
      useStore.getState().setCandleData(data.candles);
    }
    if (data.positions) {
      useStore.getState().setPositions(data.positions);
    }
    if (data.orders) {
      useStore.getState().setPendingOrders(data.orders);
    }
    if (data.scanner) {
      useStore.getState().setScannerData(data.scanner);
    }
    if (data.market_session) {
      useStore.getState().setMarketSession(data.market_session);
    }
  };

  private handleHeartbeat = (_data: any) => {};

  public disconnect() {
    this.stopHeartbeat();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    useStore.getState().setWsStatus('disconnected');
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}

export const wsManager = WebSocketManager.getInstance();
