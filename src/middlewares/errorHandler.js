const ApiError = require('./ApiError');

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
