const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_ISSUER = process.env.JWT_ISSUER || 'online-learning-api';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Sign an access token.
 * @param {{ id: number, email: string, userType: string }} payload
 * @returns {string} signed JWT
 */
function signAccessToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email, userType: payload.userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER }
  );
}

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
}

module.exports = { signAccessToken, verifyAccessToken };
