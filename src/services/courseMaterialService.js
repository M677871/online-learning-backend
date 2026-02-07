const courseMaterialRepository = require('../repositories/courseMaterialRepository');
const courseRepository = require('../repositories/courseRepository');
const ApiError = require('../utils/ApiError');

class CourseMaterialService {
  static async getAllCourseMaterials() {
    return courseMaterialRepository.getAllCourseMaterials();
  }

  static async getCourseMaterialById(id) {
    const mat = await courseMaterialRepository.getCourseMaterialById(id);
    if (!mat) throw ApiError.notFound(`Course Material ID ${id} not found`);
    return mat;
  }

  static async createCourseMaterial(data) {
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    const id = await courseMaterialRepository.createCourseMaterial(data);
    return { materialId: id, ...data };
  }

  static async updateCourseMaterial(id, data) {
    if (!(await courseMaterialRepository.materialExists(id))) {
      throw ApiError.notFound(`Course Material ID ${id} not found`);
    }
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    await courseMaterialRepository.updateCourseMaterial(id, data);
    return { materialId: id, ...data };
  }

  static async deleteCourseMaterial(id) {
    if (!(await courseMaterialRepository.materialExists(id))) {
      throw ApiError.notFound(`Course Material ID ${id} not found`);
    }
    await courseMaterialRepository.deleteCourseMaterial(id);
  }
}

module.exports = CourseMaterialService;
