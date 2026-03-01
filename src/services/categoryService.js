const CategoryRepository = require('../domain/repositories/CategoryRepository');
const ApiError = require('../middlewares/ApiError');

class CategoryService {
    static async getAllCategories() {
        try {
            return await CategoryRepository.getAllCategories();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getCategoryById(id) {
        try {
            const category = await CategoryRepository.getCategoryById(id);
            if (!category) throw ApiError.notFound(`Category ID ${id} not found`);
            return category;
        } catch (e) {
            throw e;
        }
    }

    static async createCategory(data) {
        try {
            const id = await CategoryRepository.createCategory(data);
            const category = await CategoryRepository.getCategoryById(id);
            return category;
        } catch (e) {
            throw e;
        }
    }

    static async updateCategory(id, data) {
        try {
            if (!(await CategoryRepository.categoryExists(id))) {
                throw ApiError.notFound(`Category ID ${id} not found`);
            }
            await CategoryRepository.updateCategory(id, data);
            const category = await CategoryRepository.getCategoryById(id);
            return category;
        } catch (e) {
            throw e;
        }
    }

    static async deleteCategory(id) {
        try {
            if (!(await CategoryRepository.categoryExists(id))) {
                throw ApiError.notFound(`Category ID ${id} not found`);
            }
            await CategoryRepository.deleteCategory(id);
        } catch (e) {
            throw e;
        }
    }

    static async getCategoryCourses(id) {
        try {
            if (!(await CategoryRepository.categoryExists(id))) {
                throw ApiError.notFound(`Category ID ${id} not found`);
            }
            return await CategoryRepository.getCategoryCourses(id);
        } catch (e) {
            throw e;
        }
    }

    static async getCategoryInstructors(id) {
        try {
            if (!(await CategoryRepository.categoryExists(id))) {
                throw ApiError.notFound(`Category ID ${id} not found`);
            }
            return await CategoryRepository.getCategoryInstructors(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = CategoryService;
