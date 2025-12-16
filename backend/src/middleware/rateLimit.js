/**
 * Simple in-memory rate limiting middleware
 * For production, use Redis-based rate limiting
 */
const { RateLimitError } = require('../utils/errors');

// Store request counts per IP
const requestCounts = new Map();

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);

/**
 * Rate limiting middleware factory
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 1 minute)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 */
function rateLimit({ windowMs = 60000, maxRequests = 100 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create request data for this IP
    let data = requestCounts.get(ip);
    
    if (!data || now - data.windowStart > windowMs) {
      // New window
      data = { count: 1, windowStart: now };
      requestCounts.set(ip, data);
    } else {
      // Increment count
      data.count++;
    }

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - data.count),
      'X-RateLimit-Reset': new Date(data.windowStart + windowMs).toISOString(),
    });

    // Check if limit exceeded
    if (data.count > maxRequests) {
      throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((data.windowStart + windowMs - now) / 1000)} seconds.`);
    }

    next();
  };
}

/**
 * Stricter rate limit for file uploads
 */
const uploadRateLimit = rateLimit({ windowMs: 60000, maxRequests: 10 });

/**
 * Standard API rate limit
 */
const apiRateLimit = rateLimit({ windowMs: 60000, maxRequests: 100 });

module.exports = { rateLimit, uploadRateLimit, apiRateLimit };

