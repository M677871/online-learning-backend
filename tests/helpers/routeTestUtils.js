const { createAccessToken } = require('./authToken');

const authHeader = (overrides = {}) => ({
    Authorization: `Bearer ${createAccessToken(overrides)}`,
});

const instructorAuthHeader = () => authHeader({ userType: 'instructor' });
const studentAuthHeader = () => authHeader({ userType: 'student' });

const apiError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const expectValidationError = (res) => {
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
};

module.exports = {
    authHeader,
    instructorAuthHeader,
    studentAuthHeader,
    apiError,
    expectValidationError,
};
