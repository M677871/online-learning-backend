const request = require('supertest');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../../src/app');

describe('System endpoints', () => {
    test('GET /api/health returns API status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('API is running');
        expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
    });

    test('GET unknown route returns 404 via notFound middleware', async () => {
        const res = await request(app).get('/api/unknown-route');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            success: false,
            message: 'Route not found: GET /api/unknown-route',
        });
    });

    test('invalid JSON body returns parser error', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"email":');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            message: 'Invalid JSON in request body',
        });
    });
});
