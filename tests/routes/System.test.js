const request = require('supertest');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../../src/app');

describe('System routes – GET /api/health', () => {
    it('should return API status', async () => {
        const res = await request(app)
            .get('/api/health')
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('API is running');
        expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
    });
});

describe('System routes – GET /api/unknown-route', () => {
    it('should return 404 for unknown route', async () => {
        const res = await request(app)
            .get('/api/unknown-route')
            .expect(404);

        expect(res.body).toEqual({
            success: false,
            message: 'Route not found: GET /api/unknown-route',
        });
    });
});

describe('System routes – POST /api/users', () => {
    it('should return 400 for invalid JSON body', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"email":')
            .expect(400);

        expect(res.body).toEqual({
            success: false,
            message: 'Invalid JSON in request body',
        });
    });
});
