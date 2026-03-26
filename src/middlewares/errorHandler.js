const ApiError = require('./ApiError');

/**
 * Global Express error handling middleware.
 * Catches all thrown errors, handles `ApiError` specifically, and logs unhandled exceptions.
 * 
 * @param {Error|ApiError} err - The error intercepted by Express.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} _next - The Express next function.
 * @returns {import('express').Response} A JSON response with standard error structure.
 */
const errorHandler = (err, req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
    }

    console.error('[ERROR]', err);
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error',
    });
};

module.exports = errorHandler;
