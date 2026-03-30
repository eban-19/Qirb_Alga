// JavaScript server entry point - imports from TypeScript modules
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const pensionRoutes = require('./routes/pensions');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const reviewRoutes = require('./routes/reviews');
const packageManagementRoutes = require('./routes/package-management');
const publicRoutes = require('./routes/public');
const staffRoutes = require('./routes/staff');
const uploadRoutes = require('./routes/uploads');
const expenseRoutes = require('./routes/expenses');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const emailTestRoutes = require('./routes/email-test'); // Add email test routes
const errorLogger = require('./middleware/errorLogger');
const wsServer = require('./websocket'); // Add WebSocket server
const path = require('path');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3005;

// CORS middleware for uploads (must come before helmet)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:4173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pensions', pensionRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/package-management', packageManagementRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email-test', emailTestRoutes); // Add email test routes

// Error logging
app.use(errorLogger);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      
      // Initialize WebSocket server
      wsServer.initialize(server);
      console.log(`🔌 WebSocket server ready for real-time notifications`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = { app, io };
