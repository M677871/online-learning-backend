const courseRepository = require('../repositories/courseRepository');
const instructorRepository = require('../repositories/instructorRepository');
const categoryRepository = require('../repositories/categoryRepository');
const ApiError = require('../utils/ApiError');

class CourseService {
  static async getAllCourses() {
    return courseRepository.getAllCourses();
  }

  static async getCourseById(id) {
    const course = await courseRepository.getCourseById(id);
    if (!course) throw ApiError.notFound(`Course ID ${id} not found`);
    return course;
  }

  static async createCourse(data) {
    if (!(await instructorRepository.instructorExists(data.instructorId))) {
      throw ApiError.notFound(`Instructor ID ${data.instructorId} not found`);
    }
    if (!(await categoryRepository.categoryExists(data.categorieId))) {
      throw ApiError.notFound(`Category ID ${data.categorieId} not found`);
    }
    const id = await courseRepository.createCourse(data);
    return { courseId: id, ...data };
  }

  static async updateCourse(id, data) {
    if (!(await courseRepository.courseExistsById(id))) {
      throw ApiError.notFound(`Course ID ${id} not found`);
    }
    if (!(await instructorRepository.instructorExists(data.instructorId))) {
      throw ApiError.notFound(`Instructor ID ${data.instructorId} not found`);
    }
    if (!(await categoryRepository.categoryExists(data.categorieId))) {
      throw ApiError.notFound(`Category ID ${data.categorieId} not found`);
    }
    await courseRepository.updateCourse(id, data);
    return { courseId: id, ...data };
  }

  static async deleteCourse(id) {
    if (!(await courseRepository.courseExistsById(id))) {
      throw ApiError.notFound(`Course ID ${id} not found`);
    }
    await courseRepository.deleteCourse(id);
  }

  static async getInstructorByCourseId(courseId) {
    if (!(await courseRepository.courseExistsById(courseId))) {
      throw ApiError.notFound(`Course ID ${courseId} not found`);
    }
    return courseRepository.getInstructorByCourseId(courseId);
  }

  static async getStudentsOfCourse(courseId) {
    if (!(await courseRepository.courseExistsById(courseId))) {
      throw ApiError.notFound(`Course ID ${courseId} not found`);
    }
    return courseRepository.getStudentsOfCourse(courseId);
  }
}

module.exports = CourseService;
