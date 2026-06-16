import { useStore } from '../store/useStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = `${API_URL}/api/v1`;

// API diagnostics logging
console.log("API URL:", API_BASE_URL);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGetAccountsOrMe = (endpoint.startsWith('/accounts') || endpoint.startsWith('/auth/me')) && 
                             (!options.method || options.method.toUpperCase() === 'GET');
  const maxAttempts = isGetAccountsOrMe ? 4 : 1; // 1 initial + 3 retries = 4 attempts

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const timeoutMs = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const requestUrl = `${API_BASE_URL}${endpoint}`;

    try {
      if (attempt > 1) {
        console.warn(`[API Retry] Attempt ${attempt - 1} of 3 for: ${endpoint}`);
      } else {
        console.log(`[API Request] ${options.method || 'GET'} ${requestUrl}`);
      }

      const response = await fetch(requestUrl, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[API Response] ${response.status} from ${endpoint}`);

      // Backend succeeded - set isBackendOffline to false
      if (typeof window !== 'undefined') {
        useStore.getState().setIsBackendOffline(false);
      }

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            useStore.getState().logout();
            window.location.href = '/login';
          }
        }
        const errText = await response.text();
        let errJson;
        try {
          errJson = JSON.parse(errText);
        } catch {
          // Not JSON
        }
        const errorMessage = errJson?.detail || errText || `HTTP error! Status: ${response.status}`;
        console.error(`[API Error Response] ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Check if it is a connection/network/timeout issue
      const isConnectionIssue = error.name === 'AbortError' || 
                                 error.message?.includes('Failed to fetch') || 
                                 error.message?.includes('NetworkError') ||
                                 error.message?.includes('Failed to connect') ||
                                 error.message?.includes('Could not connect');

      if (isConnectionIssue) {
        if (typeof window !== 'undefined') {
          useStore.getState().setIsBackendOffline(true);
        }
      }

      if (error.name === 'AbortError') {
        console.warn(`[API Timeout] ${options.method || 'GET'} ${requestUrl} timed out after ${timeoutMs}ms`);
        lastError = new Error(`Request timed out after ${timeoutMs}ms. (Attempt ${attempt}/${maxAttempts})`);
      } else {
        console.warn(`[API Connection Failure] ${options.method || 'GET'} ${requestUrl}: ${error.message || error}`);
        lastError = error;
      }

      if (attempt < maxAttempts) {
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  throw lastError;
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  getMe: async () => request<any>('/auth/me'),
  
  // Accounts
  getAccounts: async () => request<any[]>('/accounts/'),
  createAccount: async (data: any) => request<any>('/accounts/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAccount: async (id: number, data: any) => request<any>(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAccount: async (id: number) => request<void>(`/accounts/${id}`, {
    method: 'DELETE',
  }),

  // Trades
  getTrades: async (params?: { account_id?: number; status?: string; symbol?: string }) => {
    const query = new URLSearchParams();
    if (params?.account_id) query.append('account_id', String(params.account_id));
    if (params?.status) query.append('status', params.status);
    if (params?.symbol) query.append('symbol', params.symbol);
    return request<any[]>(`/trades/?${query.toString()}`);
  },
  
  dispatchManualTrade: async (accountId: number, data: { symbol: string; type: string; volume: number; sl?: number; tp?: number }) => {
    return request<any>(`/trades/manual-trade?account_id=${accountId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  modifySLTP: async (accountId: number, data: { ticket: number; sl: number; tp: number }) => {
    return request<any>(`/trades/modify-sl-tp?account_id=${accountId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  partialClose: async (accountId: number, data: { ticket: number; volume: number }) => {
    return request<any>(`/trades/partial-close?account_id=${accountId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  closeGroup: async (accountId: number, action: 'close_all' | 'close_buys' | 'close_sells') => {
    return request<any>(`/trades/close-group?account_id=${accountId}&action=${action}`, {
      method: 'POST',
    });
  },

  // Targets
  getTargets: async (accountId: number) => request<any>(`/targets/${accountId}`),
  updateTargets: async (accountId: number, data: any) => request<any>(`/targets/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Settings
  getSettings: async (accountId: number) => request<any>(`/settings/${accountId}`),
  updateSettings: async (accountId: number, data: any) => request<any>(`/settings/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  controlBotState: async (accountId: number, action: string) => {
    return request<any>(`/settings/${accountId}/control?action=${action}`, {
      method: 'POST',
    });
  },

  // Logs
  getLogs: async (accountId: number, limit: number = 50) => {
    return request<any[]>(`/logs/${accountId}?limit=${limit}`);
  },

  // Analytics
  getStats: async (accountId: number) => request<any>(`/analytics/${accountId}/stats`),
  getCharts: async (accountId: number) => request<any>(`/analytics/${accountId}/charts`),

  // MT5 Direct Integration
  getMT5Account: async () => request<any>('/mt5/account'),
  getMT5Positions: async () => request<any[]>('/mt5/positions'),
  getMT5History: async (daysBack: number = 30) => request<any[]>(`/mt5/history?days_back=${daysBack}`),
  placeMT5Buy: async (data: { symbol: string; lot_size: number; stop_loss?: number; take_profit?: number }) => {
    return request<any>('/mt5/buy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  placeMT5Sell: async (data: { symbol: string; lot_size: number; stop_loss?: number; take_profit?: number }) => {
    return request<any>('/mt5/sell', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  closeMT5Position: async (ticket: number) => {
    return request<any>('/mt5/close', {
      method: 'POST',
      body: JSON.stringify({ ticket }),
    });
  },
  closeAllMT5Positions: async () => {
    return request<any>('/mt5/close-all', {
      method: 'POST',
    });
  },
  modifyMT5SLTP: async (data: { ticket: number; sl: number; tp: number }) => {
    return request<any>('/mt5/modify-sl-tp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  partialCloseMT5Position: async (data: { ticket: number; volume: number }) => {
    return request<any>('/mt5/partial-close', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  connectMT5: async (accountId?: number) => {
    return request<any>('/mt5/connect', {
      method: 'POST',
      body: JSON.stringify(accountId ? { account_id: accountId } : {}),
    });
  },
  getMT5Status: async () => request<any>('/mt5/status'),
};

export default api;
