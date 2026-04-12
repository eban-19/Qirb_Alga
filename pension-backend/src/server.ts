import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { testConnection } from './config/database';
import * as path from 'path';
import * as fs from 'fs';

// Route imports (same as working .js version)
import authRoutes from './routes/auth';
import pensionRoutes from './routes/pensions';
import propertyRoutes from './routes/properties';
import packageRoutes from './routes/packages';
import bookingRoutes from './routes/bookings';
import roomRoutes from './routes/rooms';
import reviewRoutes from './routes/reviews';
import packageManagementRoutes from './routes/package-management';
import publicRoutes from './routes/public';
import staffRoutes from './routes/staff';
import uploadRoutes from './routes/uploads';
import expenseRoutes from './routes/expenses';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import { getSystemStatusController } from './routes/system';
import errorLogger from './middleware/errorLogger';
import wsServer from './websocket';

dotenv.config();

// ... rest of the code remains the same ...
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
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:4173', 'http://127.0.0.1:8081'],
  credentials: true
}));

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));

// Static files with proper CORS and path resolution
const uploadsPath = path.join(__dirname, '../uploads');
console.log('🔍 Uploads directory path:', uploadsPath);
console.log('🔍 Uploads directory exists:', fs.existsSync(uploadsPath));

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  console.log('🔍 Upload request:', {
    method: req.method,
    url: req.url,
    fullPath: path.join(uploadsPath, req.url),
    exists: fs.existsSync(path.join(uploadsPath, req.url))
  });
  
  // Use express.static to serve the file
  express.static(uploadsPath, {
    setHeaders: (res, path, stat) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
  })(req, res, next);
});

// API Routes (same as working .js version)
app.use('/api/auth', authRoutes);
app.use('/api/pensions', pensionRoutes);
app.use('/api/properties', propertyRoutes);
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
app.use('/api/admin-approvals', adminRoutes); // Add route for frontend compatibility
app.use('/api/notifications', notificationRoutes);

// System status endpoint
app.get('/api/system/status', getSystemStatusController);

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

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { testConnection } = await import('./config/database');
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: 'Database connection test',
      connected: dbConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',

    timestamp: new Date().toISOString(),

    uptime: process.uptime()

  });

});



// API Routes (will be added later)

app.get('/api', (req, res) => {

  res.json({

    message: 'Pension Management System API',

    version: '1.0.0',

    endpoints: {

      health: '/health',

      auth: '/api/auth',

      pensions: '/api/pensions',

      packages: '/api/packages',

      rooms: '/api/rooms',

      bookings: '/api/bookings'

    }

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

    console.log(' Server closed');

    process.exit(0);

  });

});



startServer();



export { app, io };