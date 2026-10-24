import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './utils/apiResponse.js';
import { ApiError } from './utils/apiError.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting credentials from Storefront & Admin
// Only the explicitly configured storefront and admin origins may make
// credentialed browser requests. Local defaults are set in config/env.js.
const allowedOrigins = new Set([config.frontendUrl, config.adminUrl].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Idempotency-Key'],
  })
);

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '10mb', verify: (req, res, buffer) => {
  if (req.originalUrl.startsWith('/api/v1/webhooks/')) req.rawBody = Buffer.from(buffer);
} }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// General API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const healthData = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'healthy',
    database: dbStateMap[dbState] || 'unknown',
    environment: config.env,
    memoryUsage: process.memoryUsage(),
  };

  return res.status(200).json(new ApiResponse(200, healthData, 'Ergocraft API is healthy and operational'));
});

// Mount modular API routes under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/settings', settingRoutes);

// Root friendly check
app.get('/', (req, res) => {
  res.json({
    name: 'Ergocraft Seating Pvt. Ltd. API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// Centralized error handling middleware
app.use(errorHandler);

export { app };
