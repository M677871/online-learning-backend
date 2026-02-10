const ApiError = require('../utils/ApiError');

/**
 * Global error handler — returns consistent JSON responses.
 */
const errorHandler = (err, req, res, _next) => {
  // If it's a known ApiError, use its status code
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // express-validator / JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  // Fallback: unexpected error
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
