import notificationService from './notificationService';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
  notificationId?: number;
  unreadCount?: number;
  count?: number; // Add this for compatibility
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private token: string | null = null;

  // Event callbacks
  private onNotificationCallback?: (notification: any) => void;
  private onUnreadCountCallback?: (count: number) => void;
  private onConnectionCallback?: (connected: boolean) => void;
  private onErrorCallback?: (error: string) => void;

  /**
   * Initialize WebSocket connection
   */
  connect(token: string) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.token = token;
    this.isConnecting = true;

    try {
      const wsUrl = `ws://localhost:3006/ws?token=${encodeURIComponent(token)}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onConnectionCallback?.(true);
        
        // Start ping interval to keep connection alive
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.onConnectionCallback?.(false);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.onErrorCallback?.('WebSocket connection error');
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.onErrorCallback?.('Failed to create WebSocket connection');
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage) {
    console.log('📨 WebSocket message received:', message);

    switch (message.type) {
      case 'connection':
        console.log('✅ WebSocket connection confirmed:', message.message);
        break;

      case 'notification':
        console.log('🔔 Real-time notification received:', message.data);
        this.onNotificationCallback?.(message.data);
        break;

      case 'unread_count':
        console.log('📊 Unread count updated:', message.count);
        this.onUnreadCountCallback?.(message.count || 0);
        break;

      case 'notification_read':
        console.log('✅ Notification marked as read:', message.notificationId);
        if (message.unreadCount !== undefined) {
          this.onUnreadCountCallback?.(message.unreadCount);
        }
        break;

      case 'pong':
        // Ping response received, connection is alive
        break;

      default:
        console.log('❓ Unknown message type:', message.type);
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  /**
   * Mark notification as read via WebSocket
   */
  markNotificationAsRead(notificationId: number) {
    this.send({
      type: 'mark_read',
      notificationId
    });
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Set event callbacks
   */
  onNotification(callback: (notification: any) => void) {
    this.onNotificationCallback = callback;
  }

  onUnreadCount(callback: (count: number) => void) {
    this.onUnreadCountCallback = callback;
  }

  onConnection(callback: (connected: boolean) => void) {
    this.onConnectionCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      isConnecting: this.isConnecting
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
