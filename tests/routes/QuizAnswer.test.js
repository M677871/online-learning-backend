const request = require('supertest');
const {
    authHeader,
    instructorAuthHeader,
    studentAuthHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/QuizAnswerService', () => ({
    getAllQuizAnswers: jest.fn(),
    getQuizAnswerById: jest.fn(),
    createQuizAnswer: jest.fn(),
    updateQuizAnswer: jest.fn(),
    deleteQuizAnswer: jest.fn(),
}));

const QuizAnswerService = require('../../src/services/QuizAnswerService');
const app = require('../../src/app');

const validAnswerPayload = {
    questionId: 2,
    answerText: 'Binary Search Tree',
    answerType: 'short answer',
    isCorrect: true,
};

describe('Quiz Answer routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/answers returns answers', async () => {
        QuizAnswerService.getAllQuizAnswers.mockResolvedValue([
            { answerId: 1, ...validAnswerPayload },
        ]);

        const res = await request(app).get('/api/answers');

        expect(res.status).toBe(200);
        expect(res.body.data[0].answerId).toBe(1);
        expect(QuizAnswerService.getAllQuizAnswers).toHaveBeenCalledTimes(1);
    });

    test('GET /api/answers/:id validates id', async () => {
        const res = await request(app).get('/api/answers/abc');
        expectValidationError(res);
        expect(QuizAnswerService.getQuizAnswerById).not.toHaveBeenCalled();
    });

    test('GET /api/answers/:id handles not found', async () => {
        QuizAnswerService.getQuizAnswerById.mockRejectedValue(apiError(404, 'Quiz Answer ID 5 not found'));

        const res = await request(app).get('/api/answers/5');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 5 not found');
        expect(QuizAnswerService.getQuizAnswerById).toHaveBeenCalledWith('5');
    });

    test('GET /api/answers/:id returns answer', async () => {
        QuizAnswerService.getQuizAnswerById.mockResolvedValue({
            answerId: 3,
            ...validAnswerPayload,
        });

        const res = await request(app).get('/api/answers/3');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            answerId: 3,
            ...validAnswerPayload,
        });
        expect(QuizAnswerService.getQuizAnswerById).toHaveBeenCalledWith('3');
    });

    test('POST /api/answers requires authentication', async () => {
        const res = await request(app).post('/api/answers').send(validAnswerPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('POST /api/answers validates payload', async () => {
        const res = await request(app)
            .post('/api/answers')
            .set(authHeader())
            .send({
                questionId: 'bad',
                answerText: '',
                answerType: 'essay',
                isCorrect: 'yes',
            });

        expectValidationError(res);
        expect(QuizAnswerService.createQuizAnswer).not.toHaveBeenCalled();
    });

    test('POST /api/answers handles not found service error', async () => {
        QuizAnswerService.createQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Question ID 99 not found'));

        const res = await request(app)
            .post('/api/answers')
            .set(authHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Question ID 99 not found');
        expect(QuizAnswerService.createQuizAnswer).toHaveBeenCalledWith(validAnswerPayload);
    });

    test('POST /api/answers creates answer', async () => {
        QuizAnswerService.createQuizAnswer.mockResolvedValue({
            answerId: 3,
            ...validAnswerPayload,
        });

        const res = await request(app)
            .post('/api/answers')
            .set(authHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Quiz answer created successfully');
        expect(QuizAnswerService.createQuizAnswer).toHaveBeenCalledWith(validAnswerPayload);
    });

    test('PUT /api/answers/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/answers/1')
            .send(validAnswerPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/answers/:id requires instructor role', async () => {
        const res = await request(app)
            .put('/api/answers/1')
            .set(studentAuthHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizAnswerService.updateQuizAnswer).not.toHaveBeenCalled();
    });

    test('PUT /api/answers/:id validates request', async () => {
        const res = await request(app)
            .put('/api/answers/not-int')
            .set(instructorAuthHeader())
            .send(validAnswerPayload);

        expectValidationError(res);
        expect(QuizAnswerService.updateQuizAnswer).not.toHaveBeenCalled();
    });

    test('PUT /api/answers/:id validates body', async () => {
        const res = await request(app)
            .put('/api/answers/1')
            .set(instructorAuthHeader())
            .send({
                questionId: 'bad',
                answerText: '',
                answerType: 'essay',
                isCorrect: 'yes',
            });

        expectValidationError(res);
        expect(QuizAnswerService.updateQuizAnswer).not.toHaveBeenCalled();
    });

    test('PUT /api/answers/:id handles not found', async () => {
        QuizAnswerService.updateQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Answer ID 1 not found'));

        const res = await request(app)
            .put('/api/answers/1')
            .set(instructorAuthHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 1 not found');
        expect(QuizAnswerService.updateQuizAnswer).toHaveBeenCalledWith('1', validAnswerPayload);
    });

    test('PUT /api/answers/:id updates answer', async () => {
        QuizAnswerService.updateQuizAnswer.mockResolvedValue({
            answerId: 1,
            ...validAnswerPayload,
        });

        const res = await request(app)
            .put('/api/answers/1')
            .set(instructorAuthHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz answer updated successfully');
        expect(QuizAnswerService.updateQuizAnswer).toHaveBeenCalledWith('1', validAnswerPayload);
    });

    test('DELETE /api/answers/:id requires authentication', async () => {
        const res = await request(app).delete('/api/answers/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/answers/:id requires instructor role', async () => {
        const res = await request(app)
            .delete('/api/answers/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizAnswerService.deleteQuizAnswer).not.toHaveBeenCalled();
    });

    test('DELETE /api/answers/:id validates id', async () => {
        const res = await request(app)
            .delete('/api/answers/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(QuizAnswerService.deleteQuizAnswer).not.toHaveBeenCalled();
    });

    test('DELETE /api/answers/:id handles not found', async () => {
        QuizAnswerService.deleteQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Answer ID 1 not found'));

        const res = await request(app)
            .delete('/api/answers/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 1 not found');
        expect(QuizAnswerService.deleteQuizAnswer).toHaveBeenCalledWith('1');
    });

    test('DELETE /api/answers/:id deletes answer', async () => {
        QuizAnswerService.deleteQuizAnswer.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/answers/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz answer deleted successfully');
        expect(QuizAnswerService.deleteQuizAnswer).toHaveBeenCalledWith('1');
    });
});
