const { verifyAccessToken } = require('../../config/jwt');
const ApiError = require('../ApiError');

/**
 * Express middleware to authenticate a user using a JWT access token.
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded user payload to the request object.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware callback.
 * @throws {ApiError} If the Authorization header is missing, invalid, or the token is expired/invalid.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType,
        };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Token has expired');
        }
        throw ApiError.unauthorized('Invalid token');
    }
};

module.exports = authenticate;
