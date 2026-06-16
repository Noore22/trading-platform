import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useStore((state) => state.token);
  const setWsStatus = useStore((state) => state.setWsStatus);
  const updateAccountMetrics = useStore((state) => state.updateAccountMetrics);
  const addLog = useStore((state) => state.addLog);

  const connect = useCallback(() => {
    // Determine target socket URL based on protocol (default to standard HTTP port 8000)
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

    // Normalize URL: strip trailing /ws suffix to ensure Socket.IO uses the root namespace correctly
    if (wsUrl.endsWith('/ws')) {
      wsUrl = wsUrl.substring(0, wsUrl.length - 3);
    }

    console.log(`Connecting to Socket.IO: ${wsUrl}`);
    setWsStatus('connecting');

    try {
      socketRef.current = io(wsUrl, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected successfully.');
        setWsStatus('connected');
        useStore.getState().setSocket(socketRef.current as any);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO disconnected.');
        setWsStatus('disconnected');
        useStore.getState().setSocket(null);
      });

      socketRef.current.on('connect_error', (err) => {
        console.warn('Socket.IO connection error:', err);
        setWsStatus('disconnected');
      });

      socketRef.current.on('terminal_sync', (data) => {
        console.log('Socket.IO sync update received:', data);
        if (data.connected !== undefined) {
          useStore.getState().setIsMt5Connected(data.connected);
        }
        if (data.open_trades !== undefined) {
          useStore.getState().setOpenTrades(data.open_trades);
        }
        if (data.account_id) {
          updateAccountMetrics(data.account_id, {
            balance: data.balance,
            equity: data.equity,
            margin: data.margin,
            free_margin: data.free_margin,
            margin_level: data.margin_level,
            floating_profit: data.floating_profit,
            daily_profit: data.daily_profit,
            weekly_profit: data.weekly_profit,
            monthly_profit: data.monthly_profit,
            win_rate: data.win_rate,
            last_sync_at: data.timestamp
          });
        }
      });

      socketRef.current.on('bot_control', (data) => {
        if (data.account_id && data.bot_status !== undefined) {
          const currentSelected = useStore.getState().selectedAccount;
          updateAccountMetrics(data.account_id, {
            setting: {
              ...(currentSelected?.setting || {} as any),
              bot_status: data.bot_status,
              auto_trading_enabled: data.auto_trading_enabled
            }
          });
        }
        addLog({
          id: Date.now(),
          account_id: data.account_id,
          level: 'info',
          message: data.message || `Bot control action processed: ${data.action}`,
          created_at: new Date().toISOString()
        });
      });

      socketRef.current.on('risk_alert', (data) => {
        addLog({
          id: Date.now(),
          account_id: data.account_id,
          level: data.trigger === 'loss_limit_breached' ? 'warning' : 'info',
          message: data.message,
          created_at: data.timestamp || new Date().toISOString()
        });
      });

      socketRef.current.on('log', (data) => {
        addLog(data);
      });

      socketRef.current.on('tick_data', (data) => {
        const ticks = {
          [data.symbol]: {
            bid: data.bid,
            ask: data.ask,
            last: data.last,
            volume: data.volume,
            time: data.time
          }
        };
        useStore.getState().setLiveTicks(ticks);
      });

    } catch (connectionErr) {
      console.error('Failed to initialize Socket.IO client:', connectionErr);
      setWsStatus('disconnected');
    }
  }, [setWsStatus, updateAccountMetrics, addLog, token]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        useStore.getState().setSocket(null);
      }
    };
  }, [token, connect]);

  return {
    socket: socketRef.current,
    reconnect: connect
  };
};
