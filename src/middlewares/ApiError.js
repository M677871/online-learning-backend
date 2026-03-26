/**
 * Custom Error class representing API-specific errors.
 * Extends the native Error class with HTTP status codes and optional details.
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - The HTTP status code.
     * @param {string} message - The error message.
     * @param {any} [details=undefined] - Additional context/details about the error (e.g., validation errors).
     */
    constructor(statusCode, message, details = undefined) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Generates a 400 Bad Request error.
     * @param {string} msg - The error message.
     * @param {any} [details] - Detailed validation or context reasons.
     * @returns {ApiError}
     */
    static badRequest(msg, details) {
        return new ApiError(400, msg, details);
    }

    /**
     * Generates a 401 Unauthorized error.
     * @param {string} [msg='Unauthorized'] - The error message.
     * @returns {ApiError}
     */
    static unauthorized(msg = 'Unauthorized') {
        return new ApiError(401, msg);
    }

    /**
     * Generates a 403 Forbidden error.
     * @param {string} [msg='Forbidden'] - The error message.
     * @returns {ApiError}
     */
    static forbidden(msg = 'Forbidden') {
        return new ApiError(403, msg);
    }

    /**
     * Generates a 404 Not Found error.
     * @param {string} [msg='Resource not found'] - The error message.
     * @returns {ApiError}
     */
    static notFound(msg = 'Resource not found') {
        return new ApiError(404, msg);
    }

    /**
     * Generates a 409 Conflict error.
     * @param {string} msg - The error message.
     * @returns {ApiError}
     */
    static conflict(msg) {
        return new ApiError(409, msg);
    }

    /**
     * Generates a 500 Internal Server error.
     * @param {string} [msg='Internal server error'] - The error message.
     * @returns {ApiError}
     */
    static internal(msg = 'Internal server error') {
        return new ApiError(500, msg);
    }
}

module.exports = ApiError;
