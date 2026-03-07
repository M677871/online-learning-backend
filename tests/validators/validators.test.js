const express = require('express');
const request = require('supertest');

const {
    validateUser,
    validateUserId,
    validateUserLogin,
} = require('../../src/validators/userValidators');
const { validateCourse } = require('../../src/validators/courseValidators');
const { validateEnrollment } = require('../../src/validators/enrollmentValidators');
const { validateMaterial } = require('../../src/validators/materialValidators');
const { validateAnswer } = require('../../src/validators/answerValidators');
const { validateResult } = require('../../src/validators/resultValidators');

const buildApp = (method, path, middlewares) => {
    const app = express();
    app.use(express.json());
    app[method](path, ...middlewares, (req, res) => {
        res.status(200).json({ success: true });
    });
    return app;
};

describe('Validators', () => {
    test('validateUser rejects invalid registration payload', async () => {
        const app = buildApp('post', '/users', validateUser);
        const res = await request(app)
            .post('/users')
            .send({
                email: 'bad-email',
                password: '123',
                userType: 'admin',
            });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('validateUser accepts valid registration payload', async () => {
        const app = buildApp('post', '/users', validateUser);
        const res = await request(app)
            .post('/users')
            .send({
                email: 'valid@example.com',
                password: 'StrongPass@1234',
                userType: 'student',
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('validateUserLogin rejects missing credentials', async () => {
        const app = buildApp('post', '/users/login', validateUserLogin);
        const res = await request(app).post('/users/login').send({ email: '' });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateUserId rejects non-integer id param', async () => {
        const app = buildApp('get', '/users/:id', validateUserId);
        const res = await request(app).get('/users/abc');

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateCourse rejects invalid course payload', async () => {
        const app = buildApp('post', '/courses', validateCourse);
        const res = await request(app)
            .post('/courses')
            .send({
                instructorId: 'x',
                categorieId: 'y',
                courseName: '',
                description: '',
            });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateEnrollment rejects unsupported status', async () => {
        const app = buildApp('post', '/enrollments', validateEnrollment);
        const res = await request(app)
            .post('/enrollments')
            .send({
                studentId: 1,
                courseId: 2,
                status: 'cancelled',
            });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateMaterial rejects unsupported material type', async () => {
        const app = buildApp('post', '/materials', validateMaterial);
        const res = await request(app)
            .post('/materials')
            .send({
                courseId: 1,
                title: 'Intro',
                materialType: 'ppt',
                filePath: 'https://example.com/file.pdf',
            });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateAnswer rejects unsupported answer type', async () => {
        const app = buildApp('post', '/answers', validateAnswer);
        const res = await request(app)
            .post('/answers')
            .send({
                questionId: 1,
                answerText: 'Sample',
                answerType: 'essay',
                isCorrect: true,
            });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('validateResult accepts a valid quiz result payload', async () => {
        const app = buildApp('post', '/results', validateResult);
        const res = await request(app)
            .post('/results')
            .send({
                quizId: 1,
                studentId: 2,
                score: 95,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
