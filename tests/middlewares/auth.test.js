jest.mock('../../src/config/jwt', () => ({
    verifyAccessToken: jest.fn(),
}));

const { verifyAccessToken } = require('../../src/config/jwt');
const authenticate = require('../../src/middlewares/auth/authenticate');
const authorize = require('../../src/middlewares/auth/authorize');

describe('authenticate middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should require a valid bearer authorization header', () => {
        const req = { headers: {} };

        expect(() => authenticate(req, {}, jest.fn())).toThrow('Missing or invalid Authorization header');
    });

    it('should attach decoded user and call next', () => {
        const req = { headers: { authorization: 'Bearer token-123' } };
        const next = jest.fn();

        verifyAccessToken.mockReturnValue({
            id: 5,
            email: 'student@example.com',
            userType: 'student',
        });

        authenticate(req, {}, next);

        expect(req.user).toEqual({
            id: 5,
            email: 'student@example.com',
            userType: 'student',
        });
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return token expired unauthorized error', () => {
        const req = { headers: { authorization: 'Bearer expired-token' } };
        const err = new Error('jwt expired');
        err.name = 'TokenExpiredError';

        verifyAccessToken.mockImplementation(() => {
            throw err;
        });

        expect(() => authenticate(req, {}, jest.fn())).toThrow('Token has expired');
    });

    it('should return invalid token unauthorized error', () => {
        const req = { headers: { authorization: 'Bearer invalid-token' } };

        verifyAccessToken.mockImplementation(() => {
            throw new Error('invalid token');
        });

        expect(() => authenticate(req, {}, jest.fn())).toThrow('Invalid token');
    });
});

describe('authorize middleware', () => {
    it('should require authentication when req.user is missing', () => {
        const middleware = authorize(['instructor']);

        expect(() => middleware({}, {}, jest.fn())).toThrow('Authentication required');
    });

    it('should require allowed roles when provided', () => {
        const middleware = authorize(['instructor']);
        const req = { user: { userType: 'student' } };

        expect(() => middleware(req, {}, jest.fn())).toThrow('Access denied. Required role(s): instructor');
    });

    it('should allow request for matching role', () => {
        const middleware = authorize(['instructor']);
        const req = { user: { userType: 'instructor' } };
        const next = jest.fn();

        middleware(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should allow request when no role restrictions are defined', () => {
        const middleware = authorize();
        const req = { user: { userType: 'student' } };
        const next = jest.fn();

        middleware(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
