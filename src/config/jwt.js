const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_ISSUER = process.env.JWT_ISSUER || 'online-learning-api';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Generates a signed JWT access token for a given user payload.
 * @param {Object} payload - The user identity data.
 * @param {number|string} payload.id - The user's ID.
 * @param {string} payload.email - The user's email address.
 * @param {string} payload.userType - The user's role/type.
 * @returns {string} The signed JSON Web Token.
 */
const signAccessToken = (payload) => {
    return jwt.sign(
        { id: payload.id, email: payload.email, userType: payload.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER }
    );
};

/**
 * Verifies a JWT access token and decodes its payload.
 * @param {string} token - The JWT string to verify.
 * @returns {Object} The decoded payload if the token is valid.
 * @throws {jwt.TokenExpiredError|jwt.JsonWebTokenError} If the token is expired or invalid.
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
};

module.exports = {
    signAccessToken,
    verifyAccessToken
};
