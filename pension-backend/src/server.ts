import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import prisma from './lib/prisma';
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
import adminPaymentRoutes from './routes/admin-payments';
import notificationRoutes from './routes/notifications';
import translationRoutes from './routes/translations';
import otpRoutes from './routes/otp';
import paymentRoutes from './routes/payments';
import subscriptionRoutes from './routes/subscriptions';
import systemRoutes, { getSystemStatusController } from './routes/system';
import availabilityRoutes from './routes/availability';
import customerRoutes from './routes/customer';
import promotionsRoutes from './routes/promotions';
import errorLogger from './middleware/errorLogger';
import wsServer from './websocket';
import scheduledCheckoutWorker from './services/scheduledCheckoutWorker';
import subscriptionWorker from './services/subscriptionWorker';

dotenv.config();

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
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:4173', 'http://127.0.0.1:8081'],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files with proper CORS and path resolution
const uploadsPath = path.join(__dirname, '../uploads');

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  express.static(uploadsPath, {
    setHeaders: (res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
  })(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin-payments', adminPaymentRoutes);

// API Routes
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
app.use('/api/admin-approvals', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/promotions', promotionsRoutes);

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
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Database connection test successful',
      connected: true,
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
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
  }
  
  try {
    // Test database connection with Prisma
    await prisma.$connect();
    console.log('✅ Database connection established via Prisma');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      
      wsServer.initialize(server);
      scheduledCheckoutWorker.start();
      subscriptionWorker.start();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


// Handle graceful shutdown

process.on('SIGTERM', () => {

  console.log('🛑 SIGTERM received, shutting down gracefully');

  // Stop scheduled workers
  scheduledCheckoutWorker.stop();
  subscriptionWorker.stop();

  server.close(() => {

    console.log('🔌 Server closed');

    process.exit(0);

  });

});



process.on('SIGINT', () => {

  console.log('🛑 SIGINT received, shutting down gracefully');

  // Stop scheduled workers
  scheduledCheckoutWorker.stop();
  subscriptionWorker.stop();

  server.close(() => {

    console.log(' Server closed');

    process.exit(0);

  });

});







export { app, io };
// Triggering restart with fixed nodemon config...