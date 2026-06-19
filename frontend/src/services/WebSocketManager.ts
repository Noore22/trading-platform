import { useStore } from '../store/useStore';

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseDelay = 1000;
  private maxDelay = 30000;
  private isConnecting = false;
  private checkInterval: NodeJS.Timeout | null = null;
  
  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect() {
    if ((this.socket && this.socket.readyState === WebSocket.OPEN) || this.isConnecting) return;
    
    this.isConnecting = true;
    useStore.getState().setWsStatus('connecting');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    // Convert http(s):// to ws(s)://
    const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws';
    
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to FastAPI backend');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        useStore.getState().setWsStatus('connected');
        useStore.getState().setSocket(this.socket as any);
      };

      this.socket.onclose = (event) => {
        console.warn(`[WebSocket] Disconnected: ${event.reason}`);
        this.isConnecting = false;
        useStore.getState().setWsStatus('disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (err) => {
        // Native websocket errors don't provide much detail in the browser
        this.isConnecting = false;
        useStore.getState().setWsStatus('disconnected');
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'mt5_update') {
             // Handle basic updates if needed globally, though useMT5WebSocket handles the specific page needs.
          }
        } catch (e) {
          console.error("Error parsing websocket payload", e);
        }
      };

      // Fallback watcher
      if (!this.checkInterval) {
        this.checkInterval = setInterval(() => {
          if ((!this.socket || this.socket.readyState !== WebSocket.OPEN) && !this.isConnecting) {
            this.handleReconnect();
          }
        }, 5000);
      }
    } catch (e) {
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      useStore.getState().setWsStatus('disconnected');
      return;
    }

    this.reconnectAttempts++;
    useStore.getState().setWsStatus('connecting');
    
    const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxDelay);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public subscribe(symbols: string[]) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'subscribe', symbols }));
    }
  }

  public unsubscribe(symbols: string[] | 'all') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'unsubscribe', symbols }));
    }
  }

  public disconnect() {
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
