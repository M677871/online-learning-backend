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


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Quiz Answer routes – GET /api/answers', () => {
    it('should return answers', async () => {
        QuizAnswerService.getAllQuizAnswers.mockResolvedValue([
            { answerId: 1, ...validAnswerPayload },
        ]);

        const res = await request(app).get('/api/answers');

        expect(res.status).toBe(200);
        expect(res.body.data[0].answerId).toBe(1);
        expect(QuizAnswerService.getAllQuizAnswers).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        QuizAnswerService.getAllQuizAnswers.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/answers');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Quiz Answer routes – GET /api/answers/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/answers/abc');
        expectValidationError(res);
        expect(QuizAnswerService.getQuizAnswerById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizAnswerService.getQuizAnswerById.mockRejectedValue(apiError(404, 'Quiz Answer ID 5 not found'));

        const res = await request(app).get('/api/answers/5');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 5 not found');
        expect(QuizAnswerService.getQuizAnswerById).toHaveBeenCalledWith('5');
    });

    it('should return answer', async () => {
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
});

describe('Quiz Answer routes – POST /api/answers', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/answers').send(validAnswerPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate payload', async () => {
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

    it('should handle not found service error', async () => {
        QuizAnswerService.createQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Question ID 99 not found'));

        const res = await request(app)
            .post('/api/answers')
            .set(authHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Question ID 99 not found');
        expect(QuizAnswerService.createQuizAnswer).toHaveBeenCalledWith(validAnswerPayload);
    });

    it('should create answer', async () => {
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
});

describe('Quiz Answer routes – PUT /api/answers/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/answers/1')
            .send(validAnswerPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/answers/1')
            .set(studentAuthHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizAnswerService.updateQuizAnswer).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/answers/not-int')
            .set(instructorAuthHeader())
            .send(validAnswerPayload);

        expectValidationError(res);
        expect(QuizAnswerService.updateQuizAnswer).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
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

    it('should return 404 when resource is not found', async () => {
        QuizAnswerService.updateQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Answer ID 1 not found'));

        const res = await request(app)
            .put('/api/answers/1')
            .set(instructorAuthHeader())
            .send(validAnswerPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 1 not found');
        expect(QuizAnswerService.updateQuizAnswer).toHaveBeenCalledWith('1', validAnswerPayload);
    });

    it('should update answer', async () => {
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
});

describe('Quiz Answer routes – DELETE /api/answers/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/answers/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/answers/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizAnswerService.deleteQuizAnswer).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/answers/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(QuizAnswerService.deleteQuizAnswer).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizAnswerService.deleteQuizAnswer.mockRejectedValue(apiError(404, 'Quiz Answer ID 1 not found'));

        const res = await request(app)
            .delete('/api/answers/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Answer ID 1 not found');
        expect(QuizAnswerService.deleteQuizAnswer).toHaveBeenCalledWith('1');
    });

    it('should delete answer', async () => {
        QuizAnswerService.deleteQuizAnswer.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/answers/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz answer deleted successfully');
        expect(QuizAnswerService.deleteQuizAnswer).toHaveBeenCalledWith('1');
    });
});
