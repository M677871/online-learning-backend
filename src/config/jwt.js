const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_ISSUER = process.env.JWT_ISSUER || 'online-learning-api';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const signAccessToken = (payload) => {
    return jwt.sign(
        { id: payload.id, email: payload.email, userType: payload.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
};

module.exports = { signAccessToken, verifyAccessToken };
