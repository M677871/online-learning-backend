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

jest.mock('../../src/services/EnrollmentService', () => ({
    getAllEnrollments: jest.fn(),
    getEnrollmentById: jest.fn(),
    createEnrollment: jest.fn(),
    updateEnrollment: jest.fn(),
    deleteEnrollment: jest.fn(),
}));

const EnrollmentService = require('../../src/services/EnrollmentService');
const app = require('../../src/app');

const validEnrollmentPayload = {
    studentId: 5,
    courseId: 3,
    status: 'enrolled',
};

describe('Enrollment routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/enrollments requires authentication', async () => {
        const res = await request(app).get('/api/enrollments');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/enrollments returns enrollments', async () => {
        EnrollmentService.getAllEnrollments.mockResolvedValue([
            { enrollmentId: 1, ...validEnrollmentPayload, enrolledAt: '2025-01-01' },
        ]);

        const res = await request(app)
            .get('/api/enrollments')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data[0].enrollmentId).toBe(1);
        expect(EnrollmentService.getAllEnrollments).toHaveBeenCalledTimes(1);
    });

    test('GET /api/enrollments/:id requires authentication', async () => {
        const res = await request(app).get('/api/enrollments/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/enrollments/:id validates id', async () => {
        const res = await request(app)
            .get('/api/enrollments/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(EnrollmentService.getEnrollmentById).not.toHaveBeenCalled();
    });

    test('GET /api/enrollments/:id returns not found', async () => {
        EnrollmentService.getEnrollmentById.mockRejectedValue(apiError(404, 'Enrollment ID 20 not found'));

        const res = await request(app)
            .get('/api/enrollments/20')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Enrollment ID 20 not found');
        expect(EnrollmentService.getEnrollmentById).toHaveBeenCalledWith('20');
    });

    test('GET /api/enrollments/:id returns enrollment', async () => {
        EnrollmentService.getEnrollmentById.mockResolvedValue({
            enrollmentId: 2,
            ...validEnrollmentPayload,
            enrolledAt: '2025-01-01',
        });

        const res = await request(app)
            .get('/api/enrollments/2')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            enrollmentId: 2,
            ...validEnrollmentPayload,
            enrolledAt: '2025-01-01',
        });
        expect(EnrollmentService.getEnrollmentById).toHaveBeenCalledWith('2');
    });

    test('POST /api/enrollments requires authentication', async () => {
        const res = await request(app)
            .post('/api/enrollments')
            .send(validEnrollmentPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('POST /api/enrollments validates body', async () => {
        const res = await request(app)
            .post('/api/enrollments')
            .set(authHeader())
            .send({
                studentId: 'bad',
                courseId: 'bad',
                status: 'unknown',
            });

        expectValidationError(res);
        expect(EnrollmentService.createEnrollment).not.toHaveBeenCalled();
    });

    test('POST /api/enrollments handles conflict', async () => {
        EnrollmentService.createEnrollment.mockRejectedValue(
            apiError(409, 'Student is already enrolled in this course')
        );

        const res = await request(app)
            .post('/api/enrollments')
            .set(authHeader())
            .send(validEnrollmentPayload);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Student is already enrolled in this course');
        expect(EnrollmentService.createEnrollment).toHaveBeenCalledWith(validEnrollmentPayload);
    });

    test('POST /api/enrollments creates enrollment', async () => {
        EnrollmentService.createEnrollment.mockResolvedValue({
            enrollmentId: 9,
            ...validEnrollmentPayload,
            enrolledAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/enrollments')
            .set(authHeader())
            .send(validEnrollmentPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Enrollment created successfully');
        expect(EnrollmentService.createEnrollment).toHaveBeenCalledWith(validEnrollmentPayload);
    });

    test('PUT /api/enrollments/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/enrollments/1')
            .send(validEnrollmentPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/enrollments/:id validates request', async () => {
        const res = await request(app)
            .put('/api/enrollments/not-int')
            .set(authHeader())
            .send(validEnrollmentPayload);

        expectValidationError(res);
        expect(EnrollmentService.updateEnrollment).not.toHaveBeenCalled();
    });

    test('PUT /api/enrollments/:id validates body', async () => {
        const res = await request(app)
            .put('/api/enrollments/1')
            .set(authHeader())
            .send({
                studentId: 'bad',
                courseId: 'bad',
                status: 'unknown',
            });

        expectValidationError(res);
        expect(EnrollmentService.updateEnrollment).not.toHaveBeenCalled();
    });

    test('PUT /api/enrollments/:id returns not found', async () => {
        EnrollmentService.updateEnrollment.mockRejectedValue(apiError(404, 'Enrollment ID 33 not found'));

        const res = await request(app)
            .put('/api/enrollments/33')
            .set(authHeader())
            .send(validEnrollmentPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Enrollment ID 33 not found');
        expect(EnrollmentService.updateEnrollment).toHaveBeenCalledWith('33', validEnrollmentPayload);
    });

    test('PUT /api/enrollments/:id updates enrollment', async () => {
        EnrollmentService.updateEnrollment.mockResolvedValue({
            enrollmentId: 1,
            ...validEnrollmentPayload,
            enrolledAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/enrollments/1')
            .set(authHeader())
            .send(validEnrollmentPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Enrollment updated successfully');
        expect(EnrollmentService.updateEnrollment).toHaveBeenCalledWith('1', validEnrollmentPayload);
    });

    test('DELETE /api/enrollments/:id requires authentication', async () => {
        const res = await request(app).delete('/api/enrollments/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/enrollments/:id validates id', async () => {
        const res = await request(app)
            .delete('/api/enrollments/abc')
            .set(authHeader());

        expectValidationError(res);
        expect(EnrollmentService.deleteEnrollment).not.toHaveBeenCalled();
    });

    test('DELETE /api/enrollments/:id returns not found', async () => {
        EnrollmentService.deleteEnrollment.mockRejectedValue(apiError(404, 'Enrollment ID 1 not found'));

        const res = await request(app)
            .delete('/api/enrollments/1')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Enrollment ID 1 not found');
        expect(EnrollmentService.deleteEnrollment).toHaveBeenCalledWith('1');
    });

    test('DELETE /api/enrollments/:id deletes enrollment', async () => {
        EnrollmentService.deleteEnrollment.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/enrollments/1')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Enrollment deleted successfully');
        expect(EnrollmentService.deleteEnrollment).toHaveBeenCalledWith('1');
    });
});
