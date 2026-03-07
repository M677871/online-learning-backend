const jwt = require('jsonwebtoken');

const createAccessToken = (overrides = {}) => {
    const payload = {
        id: 1,
        email: 'instructor@example.com',
        userType: 'instructor',
        ...overrides,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER,
        expiresIn: '1h',
    });
};

module.exports = {
    createAccessToken,
};
