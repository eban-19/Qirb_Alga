import * as WebSocket from 'ws';
import * as jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface NotificationData {
  user_id: number;
  title: string;
  message: string;
  type: string;
}

class WebSocketServer {
  private wss: WebSocket.Server | null = null;
  private clients: Map<number, WebSocket> = new Map(); // userId -> WebSocket connection

  initialize(server: any) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    console.log('🔌 WebSocket server initialized on /ws');

    this.wss.on('connection', (ws: WebSocket, req: any) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error: any) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  async handleConnection(ws: WebSocket, req: any) {
    try {
      // Extract token from query params or headers
      const url = new URL(req.url, 'http://localhost:3005');
      const token = url.searchParams.get('token') || 
                    req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('❌ WebSocket connection rejected: No token provided');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const userId = decoded.userId || decoded.user_id;

      if (!userId) {
        console.log('❌ WebSocket connection rejected: Invalid token structure');
        ws.close(1008, 'Invalid token');
        return;
      }

      // Store client connection
      this.clients.set(userId, ws);
      (ws as any).userId = userId;

      console.log(`🔌 Client connected: User ${userId}`);
      console.log(`📊 Active connections: ${this.clients.size}`);

      // Send welcome message
      this.sendToClient(userId, {
        type: 'connection',
        message: 'Connected to real-time notifications',
        timestamp: new Date().toISOString()
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(userId);
        console.log(`🔌 Client disconnected: User ${userId}`);
        console.log(`📊 Active connections: ${this.clients.size}`);
      });

      // Handle errors
      ws.on('error', (error: any) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        this.clients.delete(userId);
      });

      // Handle incoming messages
      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(userId, message);
        } catch (error: any) {
          console.error(`❌ Invalid message from user ${userId}:`, error);
        }
      });

    } catch (error: any) {
      console.error('❌ WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  handleMessage(userId: number, message: any) {
    console.log(`📨 Message from user ${userId}:`, message);

    switch (message.type) {
      case 'ping':
        this.sendToClient(userId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      case 'mark_read':
        // Handle marking notifications as read in real-time
        this.markNotificationRead(userId, message.notificationId);
        break;
      default:
        console.log(`❓ Unknown message type: ${message.type}`);
    }
  }

  async markNotificationRead(userId: number, notificationId: number) {
    try {
      await prisma.notification.updateMany({
        where: {
          notification_id: notificationId,
          user_id: userId
        },
        data: { is_read: true }
      });
      
      // Send updated unread count
      const unreadCount = await prisma.notification.count({
        where: { user_id: userId, is_read: false }
      });

      this.sendToClient(userId, {
        type: 'notification_read',
        notificationId,
        unreadCount,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  sendToClient(userId: number, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error: any) {
        console.error(`❌ Error sending to user ${userId}:`, error);
        this.clients.delete(userId);
      }
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId: number, notification: NotificationData) {
    console.log(`🔔 Sending real-time notification to user ${userId}:`, notification);
    
    this.sendToClient(userId, {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    });

    // Also send updated unread count
    this.updateUnreadCount(userId);
  }

  // Update unread count for user
  async updateUnreadCount(userId: number) {
    try {
      const count = await prisma.notification.count({
        where: { user_id: userId, is_read: false }
      });

      this.sendToClient(userId, {
        type: 'unread_count',
        count,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error updating unread count:', error);
    }
  }

  // Broadcast to all connected clients (for system notifications)
  broadcast(data: any) {
    console.log(`📡 Broadcasting to ${this.clients.size} clients`);
    
    this.clients.forEach((client, userId) => {
      this.sendToClient(userId, data);
    });
  }

  // Get connection stats
  getStats() {
    return {
      activeConnections: this.clients.size,
      connectedUsers: Array.from(this.clients.keys())
    };
  }

  // Check if user is connected
  isUserConnected(userId: number): boolean {
    return this.clients.has(userId);
  }
}

// Create singleton instance
const wsServer = new WebSocketServer();

export default wsServer;
