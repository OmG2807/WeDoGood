/**
 * Standardized API response utilities
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccess(res, data = null, message = null, statusCode = 200) {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array} details - Optional error details
 */
function sendError(res, error, statusCode = 500, details = null) {
  const response = { success: false, error };
  if (details) response.details = details;
  res.status(statusCode).json(response);
}

/**
 * Async route handler wrapper - catches errors automatically
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { sendSuccess, sendError, asyncHandler };

