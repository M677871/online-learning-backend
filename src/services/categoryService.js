const CategoryRepository = require('../domain/repositories/CategoryRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling all category-related business logic.
 */
class CategoryService {
    /**
     * Retrieves all categories.
     * @returns {Promise<Category[]>} Array of Category domain entities.
     * @throws {Error} If a database or underlying repository error occurs.
     */
    static async getAllCategories() {
        try {
            return await CategoryRepository.getAllCategories();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a single category by its ID.
     * @param {number|string} id - The category ID.
     * @returns {Promise<Category>} The requested category.
     * @throws {ApiError} If the category does not exist.
     */
    static async getCategoryById(id) {
        try {
            const category = await CategoryRepository.getCategoryById(id);
            if (!category) throw ApiError.notFound(`Category ID ${id} not found`);
            return category;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new category.
     * @param {Object} data - Category creation input.
     * @param {string} data.categoryName - The name of the category.
     * @param {string} data.description - The category's description.
     * @returns {Promise<Category>} The created category entity.
     */
    static async createCategory(data) {
        try {
            const id = await CategoryRepository.createCategory(data);
            const category = await CategoryRepository.getCategoryById(id);
            return category;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing category.
     * @param {number|string} id - The ID of the category to update.
     * @param {Object} data - Category update parameters.
     * @param {string} [data.categoryName] - Updated category name.
     * @param {string} [data.description] - Updated description.
     * @returns {Promise<Category>} The updated category entity.
     * @throws {ApiError} If the category does not exist.
     */
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

    /**
     * Deletes a category by its ID.
     * @param {number|string} id - The category ID.
     * @returns {Promise<void>}
     * @throws {ApiError} If the category does not exist.
     */
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

    /**
     * Retrieves all courses grouped under a specific category.
     * @param {number|string} id - The category ID.
     * @returns {Promise<Object[]>} Array of course records linked to the category.
     * @throws {ApiError} If the category does not exist.
     */
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

    /**
     * Retrieves all instructors associated with courses inside a given category.
     * @param {number|string} id - The category ID.
     * @returns {Promise<Object[]>} Array of instructor records linked to the category.
     * @throws {ApiError} If the category does not exist.
     */
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
