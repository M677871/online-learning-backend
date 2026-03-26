/**
 * Express middleware to handle unmapped or non-existent routes.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} _next - The Express next function.
 * @returns {import('express').Response} A 404 JSON response.
 */
const notFound = (req, res, _next) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

module.exports = notFound;
