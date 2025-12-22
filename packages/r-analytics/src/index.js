// packages/r-analytics/src/index.js
// Express.js API Service for R Analytics Integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import route handlers
const eclRoutes = require('./routes/ecl-routes');
const healthRoutes = require('./routes/health-routes');
const modelRoutes = require('./routes/model-routes');
const dataRoutes = require('./routes/data-routes');

// Import middleware
const errorHandler = require('./middleware/error-handler');
const rateLimiter = require('./middleware/rate-limiter');
const requestLogger = require('./middleware/request-logger');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.R_ANALYTICS_PORT || 8001;
const HOST = process.env.R_ANALYTICS_HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID']
}));

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/ecl', eclRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/data', dataRoutes);

// Direct health endpoint for backend compatibility
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'IFRS 9 R Analytics API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      ecl_calculations: '/api/v1/ecl',
      models: '/api/v1/models',
      data: '/api/v1/data'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requested_path: req.originalUrl,
    available_endpoints: [
      '/api/v1/health',
      '/api/v1/ecl',
      '/api/v1/models',
      '/api/v1/data'
    ]
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 IFRS 9 R Analytics API Server started successfully!`);
  console.log(`📍 Server running on: http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/api/v1/health`);
  console.log(`📊 ECL calculations: http://${HOST}:${PORT}/api/v1/ecl`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

module.exports = app;
