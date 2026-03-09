const ApiError = require('../../src/middlewares/ApiError');
const errorHandler = require('../../src/middlewares/errorHandler');
const notFound = require('../../src/middlewares/notFound');

const createResponseMock = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('notFound middleware', () => {
    test('returns 404 with route information', () => {
        const req = {
            method: 'GET',
            originalUrl: '/api/missing',
        };
        const res = createResponseMock();

        notFound(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Route not found: GET /api/missing',
        });
    });
});

describe('errorHandler middleware', () => {
    test('returns custom ApiError payload', () => {
        const req = {};
        const res = createResponseMock();
        const err = ApiError.badRequest('Invalid payload', [{ field: 'email' }]);

        errorHandler(err, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid payload',
            details: [{ field: 'email' }],
        });
    });

    test('returns 400 for malformed JSON parser errors', () => {
        const req = {};
        const res = createResponseMock();
        const err = { type: 'entity.parse.failed' };

        errorHandler(err, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid JSON in request body',
        });
    });

    test('returns original error message in non-production mode', () => {
        const req = {};
        const res = createResponseMock();
        const err = new Error('Unexpected failure');

        process.env.NODE_ENV = 'test';
        errorHandler(err, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unexpected failure',
        });
    });

    test('hides error details in production mode', () => {
        const req = {};
        const res = createResponseMock();
        const err = new Error('Sensitive stack details');
        const originalNodeEnv = process.env.NODE_ENV;

        process.env.NODE_ENV = 'production';
        errorHandler(err, req, res);
        process.env.NODE_ENV = originalNodeEnv;

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Internal server error',
        });
    });

    test('returns generic internal message when non-production error has no message', () => {
        const req = {};
        const res = createResponseMock();
        const err = new Error('');
        const originalNodeEnv = process.env.NODE_ENV;

        process.env.NODE_ENV = 'test';
        errorHandler(err, req, res);
        process.env.NODE_ENV = originalNodeEnv;

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Internal server error',
        });
    });
});
