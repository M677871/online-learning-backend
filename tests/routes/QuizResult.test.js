const request = require('supertest');
const {
    authHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/QuizResultService', () => ({
    getAllQuizResults: jest.fn(),
    getQuizResultById: jest.fn(),
    createQuizResult: jest.fn(),
    updateQuizResult: jest.fn(),
    deleteQuizResult: jest.fn(),
}));

const QuizResultService = require('../../src/services/QuizResultService');
const app = require('../../src/app');

const validResultPayload = {
    quizId: 2,
    studentId: 5,
    score: 90,
};

describe('Quiz Result routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/results requires authentication', async () => {
        const res = await request(app).get('/api/results');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/results returns results', async () => {
        QuizResultService.getAllQuizResults.mockResolvedValue([
            { resultId: 1, ...validResultPayload, completedAt: '2025-01-01' },
        ]);

        const res = await request(app)
            .get('/api/results')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data[0].resultId).toBe(1);
        expect(QuizResultService.getAllQuizResults).toHaveBeenCalledTimes(1);
    });

    test('GET /api/results/:id requires authentication', async () => {
        const res = await request(app).get('/api/results/20');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/results/:id validates id', async () => {
        const res = await request(app)
            .get('/api/results/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(QuizResultService.getQuizResultById).not.toHaveBeenCalled();
    });

    test('GET /api/results/:id handles not found', async () => {
        QuizResultService.getQuizResultById.mockRejectedValue(apiError(404, 'Quiz Result ID 20 not found'));

        const res = await request(app)
            .get('/api/results/20')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Result ID 20 not found');
        expect(QuizResultService.getQuizResultById).toHaveBeenCalledWith('20');
    });

    test('GET /api/results/:id returns result', async () => {
        QuizResultService.getQuizResultById.mockResolvedValue({
            resultId: 2,
            ...validResultPayload,
            completedAt: '2025-01-01',
        });

        const res = await request(app)
            .get('/api/results/2')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            resultId: 2,
            ...validResultPayload,
            completedAt: '2025-01-01',
        });
        expect(QuizResultService.getQuizResultById).toHaveBeenCalledWith('2');
    });

    test('POST /api/results requires authentication', async () => {
        const res = await request(app)
            .post('/api/results')
            .send(validResultPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('POST /api/results validates payload', async () => {
        const res = await request(app)
            .post('/api/results')
            .set(authHeader())
            .send({
                quizId: 'bad',
                studentId: 'bad',
                score: 'bad',
            });

        expectValidationError(res);
        expect(QuizResultService.createQuizResult).not.toHaveBeenCalled();
    });

    test('POST /api/results handles conflict', async () => {
        QuizResultService.createQuizResult.mockRejectedValue(
            apiError(409, 'Result already exists for this student and quiz')
        );

        const res = await request(app)
            .post('/api/results')
            .set(authHeader())
            .send(validResultPayload);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Result already exists for this student and quiz');
        expect(QuizResultService.createQuizResult).toHaveBeenCalledWith(validResultPayload);
    });

    test('POST /api/results creates result', async () => {
        QuizResultService.createQuizResult.mockResolvedValue({
            resultId: 5,
            ...validResultPayload,
            completedAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/results')
            .set(authHeader())
            .send(validResultPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Quiz result created successfully');
        expect(QuizResultService.createQuizResult).toHaveBeenCalledWith(validResultPayload);
    });

    test('PUT /api/results/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/results/2')
            .send(validResultPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/results/:id validates id', async () => {
        const res = await request(app)
            .put('/api/results/not-int')
            .set(authHeader())
            .send(validResultPayload);

        expectValidationError(res);
        expect(QuizResultService.updateQuizResult).not.toHaveBeenCalled();
    });

    test('PUT /api/results/:id validates payload', async () => {
        const res = await request(app)
            .put('/api/results/2')
            .set(authHeader())
            .send({
                quizId: 'bad',
                studentId: 'bad',
                score: 'bad',
            });

        expectValidationError(res);
        expect(QuizResultService.updateQuizResult).not.toHaveBeenCalled();
    });

    test('PUT /api/results/:id handles not found', async () => {
        QuizResultService.updateQuizResult.mockRejectedValue(apiError(404, 'Quiz Result ID 50 not found'));

        const res = await request(app)
            .put('/api/results/50')
            .set(authHeader())
            .send(validResultPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Result ID 50 not found');
        expect(QuizResultService.updateQuizResult).toHaveBeenCalledWith('50', validResultPayload);
    });

    test('PUT /api/results/:id updates result', async () => {
        QuizResultService.updateQuizResult.mockResolvedValue({
            resultId: 2,
            ...validResultPayload,
            completedAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/results/2')
            .set(authHeader())
            .send(validResultPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz result updated successfully');
        expect(QuizResultService.updateQuizResult).toHaveBeenCalledWith('2', validResultPayload);
    });

    test('DELETE /api/results/:id requires authentication', async () => {
        const res = await request(app).delete('/api/results/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/results/:id validates id', async () => {
        const res = await request(app)
            .delete('/api/results/abc')
            .set(authHeader());

        expectValidationError(res);
        expect(QuizResultService.deleteQuizResult).not.toHaveBeenCalled();
    });

    test('DELETE /api/results/:id handles not found', async () => {
        QuizResultService.deleteQuizResult.mockRejectedValue(apiError(404, 'Quiz Result ID 1 not found'));

        const res = await request(app)
            .delete('/api/results/1')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Result ID 1 not found');
        expect(QuizResultService.deleteQuizResult).toHaveBeenCalledWith('1');
    });

    test('DELETE /api/results/:id deletes result', async () => {
        QuizResultService.deleteQuizResult.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/results/1')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz result deleted successfully');
        expect(QuizResultService.deleteQuizResult).toHaveBeenCalledWith('1');
    });
});
