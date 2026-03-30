const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    console.log('🔌 WebSocket server initialized on /ws');

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  async handleConnection(ws, req) {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const userId = decoded.userId || decoded.user_id;

      if (!userId) {
        console.log('❌ WebSocket connection rejected: Invalid token structure');
        ws.close(1008, 'Invalid token');
        return;
      }

      // Store client connection
      this.clients.set(userId, ws);
      ws.userId = userId;

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
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        this.clients.delete(userId);
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(userId, message);
        } catch (error) {
          console.error(`❌ Invalid message from user ${userId}:`, error);
        }
      });

    } catch (error) {
      console.error('❌ WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  handleMessage(userId, message) {
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

  async markNotificationRead(userId, notificationId) {
    try {
      await executeQuery(
        'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
        [notificationId, userId]
      );
      
      // Send updated unread count
      const unreadCount = await executeQuery(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );

      this.sendToClient(userId, {
        type: 'notification_read',
        notificationId,
        unreadCount: unreadCount[0].count,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  sendToClient(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error(`❌ Error sending to user ${userId}:`, error);
        this.clients.delete(userId);
      }
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
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
  async updateUnreadCount(userId) {
    try {
      const result = await executeQuery(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );

      this.sendToClient(userId, {
        type: 'unread_count',
        count: result[0].count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error updating unread count:', error);
    }
  }

  // Broadcast to all connected clients (for system notifications)
  broadcast(data) {
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
}

// Create singleton instance
const wsServer = new WebSocketServer();

module.exports = wsServer;
