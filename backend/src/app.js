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
// Parses origins from FRONTEND_URL, ADMIN_URL, and ALLOWED_ORIGINS environment variables.
// Supports comma-separated strings and strips trailing slashes cleanly.
const parseOrigins = (...sources) => {
  const origins = new Set();
  for (const source of sources) {
    if (!source) continue;
    const parts = String(source).split(',');
    for (const part of parts) {
      const trimmed = part.trim().replace(/\/+$/, '');
      if (trimmed) origins.add(trimmed);
    }
  }
  return origins;
};

const allowedOrigins = parseOrigins(
  config.frontendUrl,
  config.adminUrl,
  process.env.ALLOWED_ORIGINS
);

// Always ensure development localhost origins are permitted in non-production
if (config.env !== 'production') {
  allowedOrigins.add('http://localhost:3000');
  allowedOrigins.add('http://localhost:3001');
  allowedOrigins.add('http://127.0.0.1:3000');
  allowedOrigins.add('http://127.0.0.1:3001');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }
      // Allow preview deployments if ALLOW_VERCEL_PREVIEWS is enabled or *.vercel.app is listed
      if (
        (process.env.ALLOW_VERCEL_PREVIEWS === 'true' || allowedOrigins.has('*.vercel.app')) &&
        /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Idempotency-Key'],
    maxAge: 86400,
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

// Health check handler (served on both /health and /api/v1/health)
const handleHealthCheck = (req, res) => {
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
};

app.get('/health', handleHealthCheck);
app.get('/api/v1/health', handleHealthCheck);

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
