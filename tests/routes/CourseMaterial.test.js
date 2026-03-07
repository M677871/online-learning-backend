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

jest.mock('../../src/services/CourseMaterialService', () => ({
    getAllCourseMaterials: jest.fn(),
    getCourseMaterialById: jest.fn(),
    createCourseMaterial: jest.fn(),
    updateCourseMaterial: jest.fn(),
    deleteCourseMaterial: jest.fn(),
}));

const CourseMaterialService = require('../../src/services/CourseMaterialService');
const app = require('../../src/app');

const validMaterialPayload = {
    courseId: 3,
    title: 'Week 1 Slides',
    materialType: 'pdf',
    filePath: 'https://example.com/week1.pdf',
};

describe('Course Material routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/materials returns materials', async () => {
        CourseMaterialService.getAllCourseMaterials.mockResolvedValue([
            { materialId: 1, ...validMaterialPayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/materials');

        expect(res.status).toBe(200);
        expect(res.body.data[0].materialId).toBe(1);
        expect(CourseMaterialService.getAllCourseMaterials).toHaveBeenCalledTimes(1);
    });

    test('GET /api/materials/:id validates id', async () => {
        const res = await request(app).get('/api/materials/not-int');
        expectValidationError(res);
        expect(CourseMaterialService.getCourseMaterialById).not.toHaveBeenCalled();
    });

    test('GET /api/materials/:id returns not found', async () => {
        CourseMaterialService.getCourseMaterialById.mockRejectedValue(
            apiError(404, 'Course Material ID 50 not found')
        );

        const res = await request(app).get('/api/materials/50');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course Material ID 50 not found');
        expect(CourseMaterialService.getCourseMaterialById).toHaveBeenCalledWith('50');
    });

    test('GET /api/materials/:id returns material', async () => {
        CourseMaterialService.getCourseMaterialById.mockResolvedValue({
            materialId: 2,
            ...validMaterialPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app).get('/api/materials/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            materialId: 2,
            ...validMaterialPayload,
            createdAt: '2025-01-01',
        });
        expect(CourseMaterialService.getCourseMaterialById).toHaveBeenCalledWith('2');
    });

    test('POST /api/materials requires authentication', async () => {
        const res = await request(app).post('/api/materials').send(validMaterialPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('POST /api/materials requires instructor role', async () => {
        const res = await request(app)
            .post('/api/materials')
            .set(studentAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.createCourseMaterial).not.toHaveBeenCalled();
    });

    test('POST /api/materials validates payload', async () => {
        const res = await request(app)
            .post('/api/materials')
            .set(instructorAuthHeader())
            .send({
                courseId: 'bad',
                title: '',
                materialType: 'ppt',
                filePath: 'invalid',
            });

        expectValidationError(res);
        expect(CourseMaterialService.createCourseMaterial).not.toHaveBeenCalled();
    });

    test('POST /api/materials handles missing course error', async () => {
        CourseMaterialService.createCourseMaterial.mockRejectedValue(apiError(404, 'Course ID 999 not found'));

        const res = await request(app)
            .post('/api/materials')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 999 not found');
        expect(CourseMaterialService.createCourseMaterial).toHaveBeenCalledWith(validMaterialPayload);
    });

    test('POST /api/materials creates material', async () => {
        CourseMaterialService.createCourseMaterial.mockResolvedValue({
            materialId: 4,
            ...validMaterialPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/materials')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Course material created successfully');
        expect(CourseMaterialService.createCourseMaterial).toHaveBeenCalledWith(validMaterialPayload);
    });

    test('PUT /api/materials/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/materials/1')
            .send(validMaterialPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/materials/:id requires instructor role', async () => {
        const res = await request(app)
            .put('/api/materials/1')
            .set(studentAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.updateCourseMaterial).not.toHaveBeenCalled();
    });

    test('PUT /api/materials/:id validates id', async () => {
        const res = await request(app)
            .put('/api/materials/not-int')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expectValidationError(res);
        expect(CourseMaterialService.updateCourseMaterial).not.toHaveBeenCalled();
    });

    test('PUT /api/materials/:id validates payload', async () => {
        const res = await request(app)
            .put('/api/materials/1')
            .set(instructorAuthHeader())
            .send({
                courseId: 'bad',
                title: '',
                materialType: 'ppt',
                filePath: 'invalid',
            });

        expectValidationError(res);
        expect(CourseMaterialService.updateCourseMaterial).not.toHaveBeenCalled();
    });

    test('PUT /api/materials/:id handles not found', async () => {
        CourseMaterialService.updateCourseMaterial.mockRejectedValue(
            apiError(404, 'Course Material ID 99 not found')
        );

        const res = await request(app)
            .put('/api/materials/99')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course Material ID 99 not found');
        expect(CourseMaterialService.updateCourseMaterial).toHaveBeenCalledWith('99', validMaterialPayload);
    });

    test('PUT /api/materials/:id updates material', async () => {
        CourseMaterialService.updateCourseMaterial.mockResolvedValue({
            materialId: 1,
            ...validMaterialPayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/materials/1')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course material updated successfully');
        expect(CourseMaterialService.updateCourseMaterial).toHaveBeenCalledWith('1', validMaterialPayload);
    });

    test('DELETE /api/materials/:id requires authentication', async () => {
        const res = await request(app).delete('/api/materials/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/materials/:id requires instructor role', async () => {
        const res = await request(app)
            .delete('/api/materials/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.deleteCourseMaterial).not.toHaveBeenCalled();
    });

    test('DELETE /api/materials/:id validates id', async () => {
        const res = await request(app)
            .delete('/api/materials/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(CourseMaterialService.deleteCourseMaterial).not.toHaveBeenCalled();
    });

    test('DELETE /api/materials/:id handles not found', async () => {
        CourseMaterialService.deleteCourseMaterial.mockRejectedValue(
            apiError(404, 'Course Material ID 1 not found')
        );

        const res = await request(app)
            .delete('/api/materials/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course Material ID 1 not found');
        expect(CourseMaterialService.deleteCourseMaterial).toHaveBeenCalledWith('1');
    });

    test('DELETE /api/materials/:id deletes material', async () => {
        CourseMaterialService.deleteCourseMaterial.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/materials/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course material deleted successfully');
        expect(CourseMaterialService.deleteCourseMaterial).toHaveBeenCalledWith('1');
    });
});
