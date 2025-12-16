const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const { config, validateConfig } = require('./config');
const { initDatabase } = require('./db/init');
const { logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiRateLimit, uploadRateLimit } = require('./middleware/rateLimit');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const jobRoutes = require('./routes/jobs');

// Validate configuration
validateConfig();

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(logger.requestLogger);

// Global rate limiting
app.use(apiRateLimit);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: config.upload.maxFileSize,
  }
});

// Make upload middleware available with rate limiting
app.set('upload', upload);
app.set('uploadRateLimit', uploadRateLimit);

// Health check (no rate limit)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// API Documentation
app.get('/api-docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'NGO Impact Tracker API',
      version: '1.0.0',
      description: 'API for tracking NGO impact reports',
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: 'Local server' }
    ],
    paths: {
      '/report': {
        post: { summary: 'Submit a single report', tags: ['Reports'] }
      },
      '/reports/upload': {
        post: { summary: 'Upload CSV file for bulk processing', tags: ['Reports'] }
      },
      '/job-status/{job_id}': {
        get: { summary: 'Get job processing status', tags: ['Jobs'] }
      },
      '/dashboard': {
        get: { summary: 'Get aggregated dashboard data', tags: ['Dashboard'] }
      },
      '/dashboard/reports': {
        get: { summary: 'Get paginated reports with filtering', tags: ['Dashboard'] }
      }
    }
  });
});

// Routes
app.use('/report', reportRoutes);
app.use('/reports', reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/job-status', jobRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(config.port, () => {
      logger.info('Server started', { 
        port: config.port, 
        environment: config.nodeEnv,
        authRequired: config.auth.required,
      });
      console.log(`🚀 NGO Impact Tracker API running on http://localhost:${config.port}`);
      console.log(`📊 Dashboard: GET /dashboard?month=YYYY-MM`);
      console.log(`📝 Submit Report: POST /report`);
      console.log(`📁 Bulk Upload: POST /reports/upload`);
      console.log(`📖 API Docs: GET /api-docs`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
    });
  })
  .catch(err => {
    logger.error('Failed to initialize database', { error: err.message });
    process.exit(1);
  });
