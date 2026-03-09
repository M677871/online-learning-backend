const ApiError = require('../../src/middlewares/ApiError');

describe('ApiError helpers', () => {
    it('should create bad request errors', () => {
        const err = ApiError.badRequest('Invalid payload');

        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Invalid payload');
    });

    it('should create unauthorized errors with default message', () => {
        const err = ApiError.unauthorized();

        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Unauthorized');
    });

    it('should create forbidden errors with default message', () => {
        const err = ApiError.forbidden();

        expect(err.statusCode).toBe(403);
        expect(err.message).toBe('Forbidden');
    });

    it('should create not found errors with default message', () => {
        const err = ApiError.notFound();

        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Resource not found');
    });

    it('should create conflict errors', () => {
        const err = ApiError.conflict('Already exists');

        expect(err.statusCode).toBe(409);
        expect(err.message).toBe('Already exists');
    });

    it('should create internal server errors with default message', () => {
        const err = ApiError.internal();

        expect(err).toBeInstanceOf(ApiError);
        expect(err.statusCode).toBe(500);
        expect(err.message).toBe('Internal server error');
    });

    it('should create internal server errors with a custom message', () => {
        const err = ApiError.internal('Database crashed');

        expect(err.statusCode).toBe(500);
        expect(err.message).toBe('Database crashed');
    });
});
