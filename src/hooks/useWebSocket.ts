import { useEffect, useState, useCallback, useRef } from 'react';
import wsService from '@/services/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdate: string | null;
  error: string | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, reconnectOnMount = true } = options;
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    error: null
  });

  const callbacksRef = useRef<{
    onOwnerUpdate?: (data: any) => void;
    onPropertyUpdate?: (data: any) => void;
    onBookingUpdate?: (data: any) => void;
    onAlertUpdate?: (data: any) => void;
    onMetricsUpdate?: (data: any) => void;
  }>({});

  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (wsService.isConnected()) {
      updateState({ isConnected: true, connectionStatus: 'connected' });
      return;
    }

    updateState({ connectionStatus: 'connecting', error: null });

    wsService.connect({
      onConnect: () => {
        updateState({ 
          isConnected: true, 
          connectionStatus: 'connected', 
          error: null,
          lastUpdate: new Date().toISOString()
        });
      },
      onDisconnect: () => {
        updateState({ 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        });
      },
      onError: (error) => {
        updateState({ 
          isConnected: false, 
          connectionStatus: 'error', 
          error: error.message 
        });
      },
      onOwnerUpdate: (data) => {
        updateState({ lastUpdate: new Date().toISOString() });
        callbacksRef.current.onOwnerUpdate?.(data);
      },
      onPropertyUpdate: (data) => {
        updateState({ lastUpdate: new Date().toISOString() });
        callbacksRef.current.onPropertyUpdate?.(data);
      },
      onBookingUpdate: (data) => {
        updateState({ lastUpdate: new Date().toISOString() });
        callbacksRef.current.onBookingUpdate?.(data);
      },
      onAlertUpdate: (data) => {
        updateState({ lastUpdate: new Date().toISOString() });
        callbacksRef.current.onAlertUpdate?.(data);
      },
      onMetricsUpdate: (data) => {
        updateState({ lastUpdate: new Date().toISOString() });
        callbacksRef.current.onMetricsUpdate?.(data);
      }
    });
  }, [updateState]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    updateState({ 
      isConnected: false, 
      connectionStatus: 'disconnected',
      error: null
    });
  }, [updateState]);

  const send = useCallback((message: any) => {
    wsService.send(message);
  }, []);

  const subscribeToOwnerUpdates = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.onOwnerUpdate = callback;
  }, []);

  const subscribeToPropertyUpdates = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.onPropertyUpdate = callback;
  }, []);

  const subscribeToBookingUpdates = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.onBookingUpdate = callback;
  }, []);

  const subscribeToAlertUpdates = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.onAlertUpdate = callback;
  }, []);

  const subscribeToMetricsUpdates = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.onMetricsUpdate = callback;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect || reconnectOnMount) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, reconnectOnMount, connect, disconnect]);

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = wsService.getConnectionStatus();
      const isConnected = wsService.isConnected();
      
      setState(prev => {
        if (prev.connectionStatus !== currentStatus || prev.isConnected !== isConnected) {
          return {
            ...prev,
            connectionStatus: currentStatus,
            isConnected
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    ...state,
    
    // Methods
    connect,
    disconnect,
    send,
    
    // Subscription methods
    subscribeToOwnerUpdates,
    subscribeToPropertyUpdates,
    subscribeToBookingUpdates,
    subscribeToAlertUpdates,
    subscribeToMetricsUpdates,
    
    // Utilities
    getConnectionStatus: () => wsService.getConnectionStatus(),
    isWebSocketConnected: () => wsService.isConnected()
  };
}
