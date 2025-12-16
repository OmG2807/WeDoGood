/**
 * Simple authentication middleware
 * In production, use proper JWT or session-based auth
 */
const { sendError } = require('../utils/response');

// Simple API key authentication (for demo purposes)
// In production, use proper authentication (JWT, OAuth, etc.)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key-change-in-production';

/**
 * Basic API key authentication middleware
 */
function authenticateAdmin(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  // Skip auth in development if no key provided and AUTH_REQUIRED is not set
  if (process.env.NODE_ENV !== 'production' && !process.env.AUTH_REQUIRED) {
    return next();
  }

  if (!apiKey) {
    return sendError(res, 'API key required. Provide X-API-Key header.', 401);
  }

  if (apiKey !== ADMIN_API_KEY) {
    return sendError(res, 'Invalid API key', 403);
  }

  next();
}

/**
 * Optional authentication - logs access but doesn't block
 */
function optionalAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  req.isAuthenticated = apiKey === ADMIN_API_KEY;
  next();
}

module.exports = { authenticateAdmin, optionalAuth, ADMIN_API_KEY };

