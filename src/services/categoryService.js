const categoryRepository = require('../repositories/categoryRepository');
const ApiError = require('../utils/ApiError');
const categoryMapper = require('../mappers/categoryMapper');

class CategoryService {
  /**
   * @returns {object[]} Array of domain category objects
   */
  static async getAllCategories() {
    const rows = await categoryRepository.getAllCategories();
    return categoryMapper.toDomainList(rows);
  }

  /**
   * @param {number} id
   * @returns {object} Domain category object
   */
  static async getCategoryById(id) {
    const row = await categoryRepository.getCategoryById(id);
    if (!row) throw ApiError.notFound(`Category ID ${id} not found`);
    return categoryMapper.toDomain(row);
  }

  /**
   * @param {{ categoryName: string, description: string }} data
   * @returns {object} Domain category object
   */
  static async createCategory(data) {
    const id = await categoryRepository.createCategory(data);
    const row = await categoryRepository.getCategoryById(id);
    return categoryMapper.toDomain(row);
  }

  /**
   * @param {number} id
   * @param {{ categoryName: string, description: string }} data
   * @returns {object} Updated domain category object
   */
  static async updateCategory(id, data) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    await categoryRepository.updateCategory(id, data);
    const row = await categoryRepository.getCategoryById(id);
    return categoryMapper.toDomain(row);
  }

  /**
   * @param {number} id
   */
  static async deleteCategory(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    await categoryRepository.deleteCategory(id);
  }

  /**
   * Returns raw course rows (course mapper would be applied by courseService).
   * @param {number} id
   * @returns {object[]} Raw course rows
   */
  static async getCategoryCourses(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    return categoryRepository.getCategoryCourses(id);
  }

  /**
   * Returns raw instructor rows (instructor mapper would be applied by instructorService).
   * @param {number} id
   * @returns {object[]} Raw instructor rows
   */
  static async getCategoryInstructors(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    return categoryRepository.getCategoryInstructors(id);
  }
}

module.exports = CategoryService;
