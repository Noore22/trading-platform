import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { wsManager } from '../services/WebSocketManager';

export const useWebSocket = () => {
  const token = useStore((state) => state.token);
  const socket = useStore((state) => state.socket);

  useEffect(() => {
    if (token) {
      wsManager.connect();
    }

    return () => {
      // We don't necessarily want to disconnect on component unmount
      // if the hook is mounted in multiple places, but usually it's in a top-level provider.
      // For now, we leave it connected as long as token exists.
      // If we want strict lifecycle, we can expose a disconnect method.
    };
  }, [token]);

  return {
    socket,
    reconnect: () => wsManager.connect()
  };
};
