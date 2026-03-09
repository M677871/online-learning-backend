const request = require('supertest');
const {
    instructorAuthHeader,
    studentAuthHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/QuizQuestionService', () => ({
    getAllQuizQuestions: jest.fn(),
    getQuizQuestionById: jest.fn(),
    createQuizQuestion: jest.fn(),
    updateQuizQuestion: jest.fn(),
    deleteQuizQuestion: jest.fn(),
}));

const QuizQuestionService = require('../../src/services/QuizQuestionService');
const app = require('../../src/app');

const validQuestionPayload = {
    quizId: 2,
    questionText: 'What is a BST?',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Quiz Question routes – GET /api/questions', () => {
    it('should return questions', async () => {
        QuizQuestionService.getAllQuizQuestions.mockResolvedValue([
            { questionId: 1, ...validQuestionPayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/questions');

        expect(res.status).toBe(200);
        expect(res.body.data[0].questionId).toBe(1);
        expect(QuizQuestionService.getAllQuizQuestions).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        QuizQuestionService.getAllQuizQuestions.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/questions');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Quiz Question routes – GET /api/questions/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/questions/abc');
        expectValidationError(res);
        expect(QuizQuestionService.getQuizQuestionById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizQuestionService.getQuizQuestionById.mockRejectedValue(
            apiError(404, 'Quiz Question ID 30 not found')
        );

        const res = await request(app).get('/api/questions/30');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Question ID 30 not found');
        expect(QuizQuestionService.getQuizQuestionById).toHaveBeenCalledWith('30');
    });

    it('should return question', async () => {
        QuizQuestionService.getQuizQuestionById.mockResolvedValue({
            questionId: 2,
            ...validQuestionPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app).get('/api/questions/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            questionId: 2,
            ...validQuestionPayload,
            createdAt: '2025-01-01',
        });
        expect(QuizQuestionService.getQuizQuestionById).toHaveBeenCalledWith('2');
    });
});

describe('Quiz Question routes – POST /api/questions', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/questions').send(validQuestionPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/questions')
            .set(studentAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizQuestionService.createQuizQuestion).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/questions')
            .set(instructorAuthHeader())
            .send({ quizId: 'bad', questionText: '' });

        expectValidationError(res);
        expect(QuizQuestionService.createQuizQuestion).not.toHaveBeenCalled();
    });

    it('should create question', async () => {
        QuizQuestionService.createQuizQuestion.mockResolvedValue({
            questionId: 7,
            ...validQuestionPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/questions')
            .set(instructorAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Quiz question created successfully');
        expect(QuizQuestionService.createQuizQuestion).toHaveBeenCalledWith(validQuestionPayload);
    });

    it('should return 500 when creation fails unexpectedly', async () => {
        QuizQuestionService.createQuizQuestion.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .post('/api/questions')
            .set(instructorAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Quiz Question routes – PUT /api/questions/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/questions/1')
            .send(validQuestionPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/questions/1')
            .set(studentAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizQuestionService.updateQuizQuestion).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .put('/api/questions/not-int')
            .set(instructorAuthHeader())
            .send(validQuestionPayload);

        expectValidationError(res);
        expect(QuizQuestionService.updateQuizQuestion).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/questions/1')
            .set(instructorAuthHeader())
            .send({ quizId: 'bad', questionText: '' });

        expectValidationError(res);
        expect(QuizQuestionService.updateQuizQuestion).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizQuestionService.updateQuizQuestion.mockRejectedValue(
            apiError(404, 'Quiz Question ID 7 not found')
        );

        const res = await request(app)
            .put('/api/questions/7')
            .set(instructorAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Question ID 7 not found');
        expect(QuizQuestionService.updateQuizQuestion).toHaveBeenCalledWith('7', validQuestionPayload);
    });

    it('should update question', async () => {
        QuizQuestionService.updateQuizQuestion.mockResolvedValue({
            questionId: 1,
            ...validQuestionPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/questions/1')
            .set(instructorAuthHeader())
            .send(validQuestionPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz question updated successfully');
        expect(QuizQuestionService.updateQuizQuestion).toHaveBeenCalledWith('1', validQuestionPayload);
    });
});

describe('Quiz Question routes – DELETE /api/questions/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/questions/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/questions/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizQuestionService.deleteQuizQuestion).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/questions/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(QuizQuestionService.deleteQuizQuestion).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizQuestionService.deleteQuizQuestion.mockRejectedValue(
            apiError(404, 'Quiz Question ID 1 not found')
        );

        const res = await request(app)
            .delete('/api/questions/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz Question ID 1 not found');
        expect(QuizQuestionService.deleteQuizQuestion).toHaveBeenCalledWith('1');
    });

    it('should delete question', async () => {
        QuizQuestionService.deleteQuizQuestion.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/questions/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz question deleted successfully');
        expect(QuizQuestionService.deleteQuizQuestion).toHaveBeenCalledWith('1');
    });
});
