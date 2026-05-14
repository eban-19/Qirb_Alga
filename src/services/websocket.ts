// WebSocket service for real-time admin dashboard updates
interface WebSocketMessage {
  type: 'owner_update' | 'property_update' | 'booking_update' | 'alert_update' | 'metrics_update';
  data: any;
  timestamp: string;
}

interface WebSocketCallbacks {
  onOwnerUpdate?: (data: any) => void;
  onPropertyUpdate?: (data: any) => void;
  onBookingUpdate?: (data: any) => void;
  onAlertUpdate?: (data: any) => void;
  onMetricsUpdate?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(private url: string = 'ws://localhost:3006/ws') {}

  connect(callbacks: WebSocketCallbacks) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.callbacks = callbacks;
    this.isConnecting = true;

    try {
      const token = localStorage.getItem('token');
      const wsUrl = token ? `ws://localhost:3006/ws?token=${encodeURIComponent(token)}` : 'ws://localhost:3006/ws';
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
        
        // Send initial connection message
        this.send({
          type: 'admin_connect',
          data: { role: 'admin', timestamp: new Date().toISOString() }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message);
          
          switch (message.type) {
            case 'owner_update':
              this.callbacks.onOwnerUpdate?.(message.data);
              break;
            case 'property_update':
              this.callbacks.onPropertyUpdate?.(message.data);
              break;
            case 'booking_update':
              this.callbacks.onBookingUpdate?.(message.data);
              break;
            case 'alert_update':
              this.callbacks.onAlertUpdate?.(message.data);
              break;
            case 'metrics_update':
              this.callbacks.onMetricsUpdate?.(message.data);
              break;
            case 'pong':
            case 'admin_ready':
            case 'connection':
              // System messages, no action needed but acknowledged
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onDisconnect?.();
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks.onError?.(new Error('WebSocket connection error'));
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.callbacks.onError?.(error as Error);
    }
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect(this.callbacks);
    }, delay);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent WebSocket message:', message);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Admin disconnected');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'disconnected';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'error';
    }
  }
}

// Mock WebSocket for development (when real WebSocket server is not available)
class MockWebSocketService extends WebSocketService {
  private mockInterval: NodeJS.Timeout | null = null;
  private mockData = {
    owners: [
      { id: 'MOCK001', businessName: 'Mock Pension Home', status: 'pending' },
      { id: 'MOCK002', businessName: 'Test Guest House', status: 'verified' }
    ],
    properties: [
      { id: 'MOCKPROP1', name: 'Mock Property 1', availableRooms: 5 },
      { id: 'MOCKPROP2', name: 'Mock Property 2', availableRooms: 3 }
    ],
    bookings: [
      { id: 'MOCKBK1', propertyName: 'Mock Property 1', status: 'pending' },
      { id: 'MOCKBK2', propertyName: 'Mock Property 2', status: 'confirmed' }
    ],
    alerts: [
      { id: 'MOCKALT1', type: 'verification', title: 'Mock Verification Alert', severity: 'medium' }
    ],
    metrics: {
      totalOwners: 25,
      totalProperties: 160,
      totalBookings: 50,
      occupancyRate: 82
    }
  };

  connect(callbacks: WebSocketCallbacks) {
    console.log('🔌 Using Mock WebSocket Service');
    
    // Simulate connection delay
    setTimeout(() => {
      console.log('✅ Mock WebSocket connected');
      callbacks.onConnect?.();
      
      // Start sending mock updates every 10 seconds
      this.mockInterval = setInterval(() => {
        this.sendMockUpdate(callbacks);
      }, 10000);
      
      // Send initial data
      this.sendMockUpdate(callbacks);
    }, 1000);
  }

  private sendMockUpdate(callbacks: WebSocketCallbacks) {
    const updateTypes = ['owner_update', 'property_update', 'booking_update', 'alert_update', 'metrics_update'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    const message: WebSocketMessage = {
      type: randomType as any,
      data: this.getMockDataForType(randomType),
      timestamp: new Date().toISOString()
    };
    
    console.log('📨 Mock WebSocket message:', message);
    
    switch (message.type) {
      case 'owner_update':
        callbacks.onOwnerUpdate?.(message.data);
        break;
      case 'property_update':
        callbacks.onPropertyUpdate?.(message.data);
        break;
      case 'booking_update':
        callbacks.onBookingUpdate?.(message.data);
        break;
      case 'alert_update':
        callbacks.onAlertUpdate?.(message.data);
        break;
      case 'metrics_update':
        callbacks.onMetricsUpdate?.(message.data);
        break;
    }
  }

  private getMockDataForType(type: string) {
    switch (type) {
      case 'owner_update':
        return this.mockData.owners[Math.floor(Math.random() * this.mockData.owners.length)];
      case 'property_update':
        return this.mockData.properties[Math.floor(Math.random() * this.mockData.properties.length)];
      case 'booking_update':
        return this.mockData.bookings[Math.floor(Math.random() * this.mockData.bookings.length)];
      case 'alert_update':
        return this.mockData.alerts[Math.floor(Math.random() * this.mockData.alerts.length)];
      case 'metrics_update':
        return {
          ...this.mockData.metrics,
          totalOwners: this.mockData.metrics.totalOwners + Math.floor(Math.random() * 3) - 1,
          totalProperties: this.mockData.metrics.totalProperties + Math.floor(Math.random() * 2) - 1,
          totalBookings: this.mockData.metrics.totalBookings + Math.floor(Math.random() * 5) - 2,
          occupancyRate: Math.max(0, Math.min(100, this.mockData.metrics.occupancyRate + Math.floor(Math.random() * 10) - 5))
        };
      default:
        return null;
    }
  }

  disconnect() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    console.log('🔌 Mock WebSocket disconnected');
  }

  isConnected(): boolean {
    return this.mockInterval !== null;
  }
}

// Create singleton instance - completely disable mock WebSocket
const useMockWebSocket = false;
export const wsService = new WebSocketService();

export default wsService;
