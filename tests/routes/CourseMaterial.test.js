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


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Course Material routes – GET /api/materials', () => {
    it('should return materials', async () => {
        CourseMaterialService.getAllCourseMaterials.mockResolvedValue([
            { materialId: 1, ...validMaterialPayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/materials');

        expect(res.status).toBe(200);
        expect(res.body.data[0].materialId).toBe(1);
        expect(CourseMaterialService.getAllCourseMaterials).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        CourseMaterialService.getAllCourseMaterials.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/materials');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Course Material routes – GET /api/materials/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/materials/not-int');
        expectValidationError(res);
        expect(CourseMaterialService.getCourseMaterialById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseMaterialService.getCourseMaterialById.mockRejectedValue(
            apiError(404, 'Course Material ID 50 not found')
        );

        const res = await request(app).get('/api/materials/50');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course Material ID 50 not found');
        expect(CourseMaterialService.getCourseMaterialById).toHaveBeenCalledWith('50');
    });

    it('should return material', async () => {
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
});

describe('Course Material routes – POST /api/materials', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/materials').send(validMaterialPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/materials')
            .set(studentAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.createCourseMaterial).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
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

    it('should handle missing course error', async () => {
        CourseMaterialService.createCourseMaterial.mockRejectedValue(apiError(404, 'Course ID 999 not found'));

        const res = await request(app)
            .post('/api/materials')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 999 not found');
        expect(CourseMaterialService.createCourseMaterial).toHaveBeenCalledWith(validMaterialPayload);
    });

    it('should create material', async () => {
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
});

describe('Course Material routes – PUT /api/materials/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/materials/1')
            .send(validMaterialPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/materials/1')
            .set(studentAuthHeader())
            .send(validMaterialPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.updateCourseMaterial).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .put('/api/materials/not-int')
            .set(instructorAuthHeader())
            .send(validMaterialPayload);

        expectValidationError(res);
        expect(CourseMaterialService.updateCourseMaterial).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
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

    it('should return 404 when resource is not found', async () => {
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

    it('should update material', async () => {
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
});

describe('Course Material routes – DELETE /api/materials/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/materials/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/materials/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseMaterialService.deleteCourseMaterial).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/materials/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(CourseMaterialService.deleteCourseMaterial).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
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

    it('should delete material', async () => {
        CourseMaterialService.deleteCourseMaterial.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/materials/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course material deleted successfully');
        expect(CourseMaterialService.deleteCourseMaterial).toHaveBeenCalledWith('1');
    });
});
