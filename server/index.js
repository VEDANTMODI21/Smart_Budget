import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import settlementRoutes from './routes/settlements.js';
import reminderRoutes from './routes/reminders.js';
import authMiddleware from './middleware/auth.js';

import { JWT_SECRET } from './config.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for network access
// In development, allow all origins for network access
// In production, use specific origins from environment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for network access
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : [];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart-budget';

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,
};

let mongoConnected = false;

const connectMongoDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📡 URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`); // Hide password
    
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    mongoConnected = true;
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Verify connection by listing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
    
  } catch (error) {
    mongoConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 MongoDB server not reachable. Options:');
      console.error('   1. Start local MongoDB: mongod (or start MongoDB service)');
      console.error('   2. Use MongoDB Atlas: Set MONGODB_URI in .env file');
      console.error('   3. Check connection string format');
    } else {
      console.error('💡 Check your MONGODB_URI in .env file');
    }
    
    // Don't exit - allow server to start but log warnings
    console.warn('⚠️  Server will continue but database operations will fail');
  }
};

// Initial connection
connectMongoDB();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  mongoConnected = true;
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('disconnected', () => {
  mongoConnected = false;
  console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
  // Auto-reconnect after 5 seconds
  setTimeout(() => {
    if (!mongoConnected) {
      connectMongoDB();
    }
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  mongoConnected = false;
  console.error('❌ MongoDB error:', err.message);
});

// Health check with MongoDB status (register BEFORE MongoDB check middleware)
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: mongoStatus === 1 ? 'ok' : 'degraded',
    message: 'Server is running',
    server: 'online',
    mongodb: {
      status: mongoStates[mongoStatus] || 'unknown',
      connected: mongoStatus === 1,
      database: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'not connected',
      readyState: mongoStatus
    }
  });
});

// Middleware to check MongoDB connection before database operations
// Health check is already registered above, so it won't be blocked
app.use('/api', (req, res, next) => {
  // For routes that need database, check MongoDB connection
  if (!mongoConnected && mongoose.connection.readyState !== 1) {
    console.warn(`⚠️  Database not connected - blocking ${req.method} ${req.path}`);
    return res.status(503).json({ 
      message: 'Database not connected',
      error: 'MongoDB connection is not available. Please check your connection settings.',
      hint: 'Check MONGODB_URI in .env file or start MongoDB service',
      status: mongoose.connection.readyState
    });
  }
  next();
});

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/settlements', authMiddleware, settlementRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    hint: 'Make sure the route starts with /api'
  });
});

// Get network IP address
function getNetworkIP() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const networkIP = getNetworkIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Server is running!');
  console.log('='.repeat(50));
  console.log(`📍 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Network:   http://${networkIP}:${PORT}`);
  console.log(`📊 Health:   http://${networkIP}:${PORT}/api/health`);
  console.log(`🔒 CORS:     ${process.env.NODE_ENV !== 'production' ? 'Enabled for all origins (dev mode)' : 'Restricted'}`);
  console.log('='.repeat(50) + '\n');
});

export default app;

