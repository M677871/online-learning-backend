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

jest.mock('../../src/services/CategoryService', () => ({
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getCategoryCourses: jest.fn(),
    getCategoryInstructors: jest.fn(),
}));

const CategoryService = require('../../src/services/CategoryService');
const app = require('../../src/app');

const validCategoryPayload = {
    categoryName: 'Programming',
    description: 'Programming courses',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Category routes – GET /api/categories', () => {
    it('should return categories', async () => {
        CategoryService.getAllCategories.mockResolvedValue([
            { categoryId: 1, ...validCategoryPayload },
        ]);

        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].categoryName).toBe('Programming');
        expect(CategoryService.getAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        CategoryService.getAllCategories.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Category routes – GET /api/categories/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/categories/not-int');
        expectValidationError(res);
        expect(CategoryService.getCategoryById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CategoryService.getCategoryById.mockRejectedValue(apiError(404, 'Category ID 88 not found'));

        const res = await request(app).get('/api/categories/88');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Category ID 88 not found');
        expect(CategoryService.getCategoryById).toHaveBeenCalledWith('88');
    });

    it('should return category', async () => {
        CategoryService.getCategoryById.mockResolvedValue({
            categoryId: 1,
            ...validCategoryPayload,
        });

        const res = await request(app).get('/api/categories/1');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            categoryId: 1,
            ...validCategoryPayload,
        });
        expect(CategoryService.getCategoryById).toHaveBeenCalledWith('1');
    });
});

describe('Category routes – GET /api/categories/courses/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/categories/courses/not-int');

        expectValidationError(res);
        expect(CategoryService.getCategoryCourses).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CategoryService.getCategoryCourses.mockRejectedValue(apiError(404, 'Category ID 99 not found'));

        const res = await request(app).get('/api/categories/courses/99');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Category ID 99 not found');
        expect(CategoryService.getCategoryCourses).toHaveBeenCalledWith('99');
    });

    it('should return category courses', async () => {
        CategoryService.getCategoryCourses.mockResolvedValue([{ course_id: 3, course_name: 'Node' }]);

        const res = await request(app).get('/api/categories/courses/1');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(CategoryService.getCategoryCourses).toHaveBeenCalledWith('1');
    });
});

describe('Category routes – GET /api/categories/instructor/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/categories/instructor/abc');

        expectValidationError(res);
        expect(CategoryService.getCategoryInstructors).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CategoryService.getCategoryInstructors.mockRejectedValue(apiError(404, 'Category ID 42 not found'));

        const res = await request(app).get('/api/categories/instructor/42');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Category ID 42 not found');
        expect(CategoryService.getCategoryInstructors).toHaveBeenCalledWith('42');
    });

    it('should return category instructors', async () => {
        CategoryService.getCategoryInstructors.mockResolvedValue([{ instructor_id: 2 }]);

        const res = await request(app).get('/api/categories/instructor/1');

        expect(res.status).toBe(200);
        expect(res.body.data[0].instructor_id).toBe(2);
        expect(CategoryService.getCategoryInstructors).toHaveBeenCalledWith('1');
    });
});

describe('Category routes – POST /api/categories', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/categories').send(validCategoryPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set(studentAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CategoryService.createCategory).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set(instructorAuthHeader())
            .send({ categoryName: '', description: '' });

        expectValidationError(res);
        expect(CategoryService.createCategory).not.toHaveBeenCalled();
    });

    it('should create category', async () => {
        CategoryService.createCategory.mockResolvedValue({
            categoryId: 5,
            ...validCategoryPayload,
        });

        const res = await request(app)
            .post('/api/categories')
            .set(instructorAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Category created successfully');
        expect(res.body.data.categoryId).toBe(5);
        expect(CategoryService.createCategory).toHaveBeenCalledWith(validCategoryPayload);
    });

    it('should return 500 when creation fails unexpectedly', async () => {
        CategoryService.createCategory.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .post('/api/categories')
            .set(instructorAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Category routes – PUT /api/categories/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/categories/1')
            .send(validCategoryPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/categories/1')
            .set(studentAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CategoryService.updateCategory).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .put('/api/categories/abc')
            .set(instructorAuthHeader())
            .send(validCategoryPayload);

        expectValidationError(res);
        expect(CategoryService.updateCategory).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/categories/1')
            .set(instructorAuthHeader())
            .send({ categoryName: '', description: '' });

        expectValidationError(res);
        expect(CategoryService.updateCategory).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CategoryService.updateCategory.mockRejectedValue(apiError(404, 'Category ID 50 not found'));

        const res = await request(app)
            .put('/api/categories/50')
            .set(instructorAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Category ID 50 not found');
        expect(CategoryService.updateCategory).toHaveBeenCalledWith('50', validCategoryPayload);
    });

    it('should update category', async () => {
        CategoryService.updateCategory.mockResolvedValue({
            categoryId: 1,
            ...validCategoryPayload,
        });

        const res = await request(app)
            .put('/api/categories/1')
            .set(instructorAuthHeader())
            .send(validCategoryPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Category updated successfully');
        expect(CategoryService.updateCategory).toHaveBeenCalledWith('1', validCategoryPayload);
    });
});

describe('Category routes – DELETE /api/categories/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/categories/1');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/categories/1')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CategoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/categories/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(CategoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CategoryService.deleteCategory.mockRejectedValue(apiError(404, 'Category ID 1 not found'));

        const res = await request(app)
            .delete('/api/categories/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Category ID 1 not found');
        expect(CategoryService.deleteCategory).toHaveBeenCalledWith('1');
    });

    it('should delete category', async () => {
        CategoryService.deleteCategory.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/categories/1')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Category deleted successfully');
        expect(CategoryService.deleteCategory).toHaveBeenCalledWith('1');
    });
});
