jest.mock('../../src/domain/repositories/CategoryRepository', () => ({
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    categoryExists: jest.fn(),
    getCategoryCourses: jest.fn(),
    getCategoryInstructors: jest.fn(),
}));

const CategoryService = require('../../src/services/CategoryService');
const CategoryRepository = require('../../src/domain/repositories/CategoryRepository');

describe('CategoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all categories', async () => {
        const categories = [{ categoryId: 1, categoryName: 'Programming', description: 'Courses' }];
        CategoryRepository.getAllCategories.mockResolvedValue(categories);

        const result = await CategoryService.getAllCategories();

        expect(result).toEqual(categories);
    });

    it('should wrap getAllCategories repository errors', async () => {
        CategoryRepository.getAllCategories.mockRejectedValue(new Error('db down'));

        await expect(CategoryService.getAllCategories()).rejects.toThrow('db down');
    });

    it('should return 404 when category by id is not found', async () => {
        CategoryRepository.getCategoryById.mockResolvedValue(null);

        await expect(CategoryService.getCategoryById(99)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 99 not found',
        });
    });

    it('should return category by id when found', async () => {
        const category = { categoryId: 1, categoryName: 'Programming', description: 'Courses' };
        CategoryRepository.getCategoryById.mockResolvedValue(category);

        const result = await CategoryService.getCategoryById(1);

        expect(result).toEqual(category);
    });

    it('should create and return a category', async () => {
        const payload = { categoryName: 'Programming', description: 'Courses' };
        const category = { categoryId: 5, ...payload };

        CategoryRepository.createCategory.mockResolvedValue(5);
        CategoryRepository.getCategoryById.mockResolvedValue(category);

        const result = await CategoryService.createCategory(payload);

        expect(CategoryRepository.createCategory).toHaveBeenCalledWith(payload);
        expect(CategoryRepository.getCategoryById).toHaveBeenCalledWith(5);
        expect(result).toEqual(category);
    });

    it('should rethrow errors from createCategory', async () => {
        CategoryRepository.createCategory.mockRejectedValue(new Error('insert failed'));

        await expect(
            CategoryService.createCategory({ categoryName: 'Programming', description: 'Courses' })
        ).rejects.toThrow('insert failed');
    });

    it('should return 404 when updating a missing category', async () => {
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(
            CategoryService.updateCategory(10, { categoryName: 'Updated', description: 'Desc' })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 10 not found',
        });
    });

    it('should update and return category', async () => {
        const payload = { categoryName: 'Updated', description: 'Desc' };
        const updated = { categoryId: 1, ...payload };

        CategoryRepository.categoryExists.mockResolvedValue(true);
        CategoryRepository.updateCategory.mockResolvedValue(1);
        CategoryRepository.getCategoryById.mockResolvedValue(updated);

        const result = await CategoryService.updateCategory(1, payload);

        expect(CategoryRepository.updateCategory).toHaveBeenCalledWith(1, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting a missing category', async () => {
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(CategoryService.deleteCategory(7)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 7 not found',
        });
    });

    it('should delete category when it exists', async () => {
        CategoryRepository.categoryExists.mockResolvedValue(true);

        await CategoryService.deleteCategory(7);

        expect(CategoryRepository.deleteCategory).toHaveBeenCalledWith(7);
    });

    it('should return 404 when getting category courses for missing category', async () => {
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(CategoryService.getCategoryCourses(4)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 4 not found',
        });
    });

    it('should return category courses', async () => {
        const courses = [{ course_id: 1 }];
        CategoryRepository.categoryExists.mockResolvedValue(true);
        CategoryRepository.getCategoryCourses.mockResolvedValue(courses);

        const result = await CategoryService.getCategoryCourses(4);

        expect(CategoryRepository.getCategoryCourses).toHaveBeenCalledWith(4);
        expect(result).toEqual(courses);
    });

    it('should return 404 when getting category instructors for missing category', async () => {
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(CategoryService.getCategoryInstructors(3)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 3 not found',
        });
    });

    it('should return category instructors', async () => {
        const instructors = [{ instructor_id: 2 }];
        CategoryRepository.categoryExists.mockResolvedValue(true);
        CategoryRepository.getCategoryInstructors.mockResolvedValue(instructors);

        const result = await CategoryService.getCategoryInstructors(3);

        expect(CategoryRepository.getCategoryInstructors).toHaveBeenCalledWith(3);
        expect(result).toEqual(instructors);
    });
});
