/**
 * Centralized configuration management
 * All environment variables and constants in one place
 */

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Authentication
  auth: {
    required: process.env.AUTH_REQUIRED === 'true',
    apiKey: process.env.ADMIN_API_KEY || 'admin-secret-key-change-in-production',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    uploadMaxRequests: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10) || 10,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['text/csv'],
  },

  // CSV Processing
  csv: {
    maxRetries: parseInt(process.env.CSV_MAX_RETRIES, 10) || 3,
    retryBaseDelay: parseInt(process.env.CSV_RETRY_BASE_DELAY, 10) || 100,
    retryMaxDelay: parseInt(process.env.CSV_RETRY_MAX_DELAY, 10) || 1000,
    processingDelay: parseInt(process.env.CSV_PROCESSING_DELAY, 10) || 50,
  },

  // Database
  db: {
    path: process.env.DB_PATH || './data/ngo_tracker.db',
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  if (config.isProduction) {
    if (config.auth.apiKey === 'admin-secret-key-change-in-production') {
      errors.push('ADMIN_API_KEY must be set in production');
    }
    if (config.cors.origin === '*') {
      console.warn('Warning: CORS origin is set to * in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

module.exports = { config, validateConfig };

