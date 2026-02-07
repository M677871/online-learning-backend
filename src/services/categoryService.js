const categoryRepository = require('../repositories/categoryRepository');
const ApiError = require('../utils/ApiError');

class CategoryService {
  static async getAllCategories() {
    return categoryRepository.getAllCategories();
  }

  static async getCategoryById(id) {
    const cat = await categoryRepository.getCategoryById(id);
    if (!cat) throw ApiError.notFound(`Category ID ${id} not found`);
    return cat;
  }

  static async createCategory(data) {
    const id = await categoryRepository.createCategory(data);
    return { categoryId: id, ...data };
  }

  static async updateCategory(id, data) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    await categoryRepository.updateCategory(id, data);
    return { categoryId: id, ...data };
  }

  static async deleteCategory(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    await categoryRepository.deleteCategory(id);
  }

  static async getCategoryCourses(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    return categoryRepository.getCategoryCourses(id);
  }

  static async getCategoryInstructors(id) {
    if (!(await categoryRepository.categoryExists(id))) {
      throw ApiError.notFound(`Category ID ${id} not found`);
    }
    return categoryRepository.getCategoryInstructors(id);
  }
}

module.exports = CategoryService;
