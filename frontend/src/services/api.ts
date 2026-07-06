const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8007";
const API_BASE_URL = `${API_URL}/api/v1`;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const maxAttempts = endpoint.startsWith('/') ? 2 : 1;
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    const timeoutMs = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const requestUrl = endpoint.startsWith('/api/') ? `${API_URL}${endpoint}` : `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(requestUrl, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        const errText = await response.text();
        throw new Error(errText || `HTTP error! Status: ${response.status}`);
      }
      if (response.status === 204) return null as T;
      return await response.json() as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }
  throw lastError;
}

export const api = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  getMe: async () => request<any>('/auth/me'),

  getHealth: async () => request<any>('/api/health'),
  getStatus: async () => request<any>('/api/v1/status'),
  getDashboard: async () => request<any>('/api/v1/dashboard'),

  getMT5Account: async () => request<any>('/mt5/account'),
  getMT5Positions: async () => request<any[]>('/mt5/positions'),
  getMT5Orders: async () => request<any[]>('/mt5/orders'),
  getMT5History: async (daysBack: number = 7) => request<any[]>(`/mt5/history?days_back=${daysBack}`),
  getMT5Status: async () => request<any>('/mt5/status'),
  getMT5Symbols: async () => request<any[]>('/mt5/symbols'),
  getMT5Tick: async (symbol: string = 'EURUSD') => request<any>(`/mt5/tick?symbol=${symbol}`),
  getMT5Candles: async (symbol: string = 'EURUSD', timeframe: string = 'M1', count: number = 100) =>
    request<any[]>(`/mt5/candles?symbol=${symbol}&timeframe=${timeframe}&count=${count}`),

  placeBuy: async (data: { symbol: string; volume: number; sl?: number; tp?: number }) =>
    request<any>('/mt5/buy', { method: 'POST', body: JSON.stringify(data) }),
  placeSell: async (data: { symbol: string; volume: number; sl?: number; tp?: number }) =>
    request<any>('/mt5/sell', { method: 'POST', body: JSON.stringify(data) }),
  closePosition: async (ticket: number) =>
    request<any>('/mt5/close', { method: 'POST', body: JSON.stringify({ ticket }) }),
  closeAllPositions: async () => request<any>('/mt5/close-all', { method: 'POST' }),
  modifyPosition: async (data: { ticket: number; sl?: number; tp?: number }) =>
    request<any>('/mt5/modify', { method: 'POST', body: JSON.stringify(data) }),
  partialClose: async (data: { ticket: number; volume: number }) =>
    request<any>('/mt5/partial-close', { method: 'POST', body: JSON.stringify(data) }),

  placePendingOrder: async (data: { symbol: string; type: string; volume: number; price: number; sl?: number; tp?: number }) =>
    request<any>('/mt5/order', { method: 'POST', body: JSON.stringify(data) }),
  cancelOrder: async (ticket: number) =>
    request<any>(`/mt5/order/${ticket}`, { method: 'DELETE' }),
  modifyOrder: async (ticket: number, data: { price: number; sl?: number; tp?: number }) =>
    request<any>(`/mt5/order/${ticket}`, { method: 'PUT', body: JSON.stringify(data) }),

  connectMT5: async () => request<any>('/mt5/connect', { method: 'POST' }),

  getScanner: async () => request<any[]>('/api/v1/scanner'),

  aiAnalyze: async (symbol: string) => request<any>(`/ai/analyze/${symbol}`, { method: 'POST' }),
  aiSignal: async (symbol: string) => request<any>(`/ai/signal/${symbol}`),
  aiSignals: async () => request<any>('/ai/signals'),
  aiTechnical: async (symbol: string) => request<any>(`/ai/technical/${symbol}`, { method: 'POST' }),
  aiNews: async (symbol: string) => request<any>(`/ai/news/${symbol}`, { method: 'POST' }),
  aiSentiment: async (symbol: string) => request<any>(`/ai/sentiment/${symbol}`, { method: 'POST' }),
  aiRisk: async (symbol: string) => request<any>(`/ai/risk/${symbol}`, { method: 'POST' }),
  aiPortfolio: async () => request<any>('/ai/portfolio', { method: 'POST' }),
  aiHistory: async (symbol?: string) => request<any>(`/ai/history${symbol ? `?symbol=${symbol}` : ''}`),
  aiAgents: async () => request<any>('/ai/agents'),
  aiInitialize: async () => request<any>('/ai/initialize', { method: 'POST' }),
  aiExecute: async (symbol: string, autoConfirm: boolean = false) =>
    request<any>(`/ai/execute/${symbol}${autoConfirm ? '?auto_confirm=true' : ''}`, { method: 'POST' }),
  aiExecutions: async (symbol?: string) => request<any>(`/ai/executions${symbol ? `?symbol=${symbol}` : ''}`),
};

export default api;
