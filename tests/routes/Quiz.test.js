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

jest.mock('../../src/services/QuizService', () => ({
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    createQuiz: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
}));

const QuizService = require('../../src/services/QuizService');
const app = require('../../src/app');

const validQuizPayload = {
    courseId: 3,
    quizName: 'Week 1 Quiz',
    quizDescription: 'Covers first module',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Quiz routes – GET /api/quizzes', () => {
    it('should return quizzes', async () => {
        QuizService.getAllQuizzes.mockResolvedValue([
            { quizId: 1, ...validQuizPayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/quizzes');

        expect(res.status).toBe(200);
        expect(res.body.data[0].quizId).toBe(1);
        expect(QuizService.getAllQuizzes).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        QuizService.getAllQuizzes.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/quizzes');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Quiz routes – GET /api/quizzes/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/quizzes/not-int');
        expectValidationError(res);
        expect(QuizService.getQuizById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizService.getQuizById.mockRejectedValue(apiError(404, 'Quiz ID 21 not found'));

        const res = await request(app).get('/api/quizzes/21');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz ID 21 not found');
        expect(QuizService.getQuizById).toHaveBeenCalledWith('21');
    });

    it('should return quiz', async () => {
        QuizService.getQuizById.mockResolvedValue({
            quizId: 2,
            ...validQuizPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app).get('/api/quizzes/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            quizId: 2,
            ...validQuizPayload,
            createdAt: '2025-01-01',
        });
        expect(QuizService.getQuizById).toHaveBeenCalledWith('2');
    });
});

describe('Quiz routes – POST /api/quizzes', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/quizzes').send(validQuizPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/quizzes')
            .set(studentAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizService.createQuiz).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/quizzes')
            .set(instructorAuthHeader())
            .send({
                courseId: 'bad',
                quizName: '',
                quizDescription: '',
            });

        expectValidationError(res);
        expect(QuizService.createQuiz).not.toHaveBeenCalled();
    });

    it('should create quiz', async () => {
        QuizService.createQuiz.mockResolvedValue({
            quizId: 10,
            ...validQuizPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/quizzes')
            .set(instructorAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Quiz created successfully');
        expect(QuizService.createQuiz).toHaveBeenCalledWith(validQuizPayload);
    });

    it('should return 500 when creation fails unexpectedly', async () => {
        QuizService.createQuiz.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .post('/api/quizzes')
            .set(instructorAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Quiz routes – PUT /api/quizzes/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/quizzes/1')
            .send(validQuizPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/quizzes/1')
            .set(studentAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizService.updateQuiz).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .put('/api/quizzes/not-int')
            .set(instructorAuthHeader())
            .send(validQuizPayload);

        expectValidationError(res);
        expect(QuizService.updateQuiz).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/quizzes/1')
            .set(instructorAuthHeader())
            .send({
                courseId: 'bad',
                quizName: '',
                quizDescription: '',
            });

        expectValidationError(res);
        expect(QuizService.updateQuiz).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizService.updateQuiz.mockRejectedValue(apiError(404, 'Quiz ID 99 not found'));

        const res = await request(app)
            .put('/api/quizzes/99')
            .set(instructorAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz ID 99 not found');
        expect(QuizService.updateQuiz).toHaveBeenCalledWith('99', validQuizPayload);
    });

    it('should update quiz', async () => {
        QuizService.updateQuiz.mockResolvedValue({
            quizId: 1,
            ...validQuizPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/quizzes/1')
            .set(instructorAuthHeader())
            .send(validQuizPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz updated successfully');
        expect(QuizService.updateQuiz).toHaveBeenCalledWith('1', validQuizPayload);
    });
});

describe('Quiz routes – DELETE /api/quizzes/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/quizzes/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/quizzes/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(QuizService.deleteQuiz).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/quizzes/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(QuizService.deleteQuiz).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        QuizService.deleteQuiz.mockRejectedValue(apiError(404, 'Quiz ID 1 not found'));

        const res = await request(app)
            .delete('/api/quizzes/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Quiz ID 1 not found');
        expect(QuizService.deleteQuiz).toHaveBeenCalledWith('1');
    });

    it('should delete quiz', async () => {
        QuizService.deleteQuiz.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/quizzes/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Quiz deleted successfully');
        expect(QuizService.deleteQuiz).toHaveBeenCalledWith('1');
    });
});
