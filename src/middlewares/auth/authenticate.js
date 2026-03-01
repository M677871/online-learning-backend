const { verifyAccessToken } = require('../../config/jwt');
const ApiError = require('../ApiError');

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
