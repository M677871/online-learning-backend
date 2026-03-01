const CourseRepository = require('../domain/repositories/CourseRepository');
const InstructorRepository = require('../domain/repositories/InstructorRepository');
const CategoryRepository = require('../domain/repositories/CategoryRepository');
const ApiError = require('../middlewares/ApiError');

class CourseService {
    static async getAllCourses() {
        try {
            return await CourseRepository.getAllCourses();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getCourseById(id) {
        try {
            const course = await CourseRepository.getCourseById(id);
            if (!course) throw ApiError.notFound(`Course ID ${id} not found`);
            return course;
        } catch (e) {
            throw e;
        }
    }

    static async createCourse(data) {
        try {
            if (!(await InstructorRepository.instructorExists(data.instructorId))) {
                throw ApiError.notFound(`Instructor ID ${data.instructorId} not found`);
            }
            if (!(await CategoryRepository.categoryExists(data.categorieId))) {
                throw ApiError.notFound(`Category ID ${data.categorieId} not found`);
            }
            const id = await CourseRepository.createCourse(data);
            return await CourseRepository.getCourseById(id);
        } catch (e) {
            throw e;
        }
    }

    static async updateCourse(id, data) {
        try {
            if (!(await CourseRepository.courseExistsById(id))) {
                throw ApiError.notFound(`Course ID ${id} not found`);
            }
            if (!(await InstructorRepository.instructorExists(data.instructorId))) {
                throw ApiError.notFound(`Instructor ID ${data.instructorId} not found`);
            }
            if (!(await CategoryRepository.categoryExists(data.categorieId))) {
                throw ApiError.notFound(`Category ID ${data.categorieId} not found`);
            }
            await CourseRepository.updateCourse(id, data);
            return await CourseRepository.getCourseById(id);
        } catch (e) {
            throw e;
        }
    }

    static async deleteCourse(id) {
        try {
            if (!(await CourseRepository.courseExistsById(id))) {
                throw ApiError.notFound(`Course ID ${id} not found`);
            }
            await CourseRepository.deleteCourse(id);
        } catch (e) {
            throw e;
        }
    }

    static async getInstructorByCourseId(courseId) {
        try {
            if (!(await CourseRepository.courseExistsById(courseId))) {
                throw ApiError.notFound(`Course ID ${courseId} not found`);
            }
            return await CourseRepository.getInstructorByCourseId(courseId);
        } catch (e) {
            throw e;
        }
    }

    static async getStudentsOfCourse(courseId) {
        try {
            if (!(await CourseRepository.courseExistsById(courseId))) {
                throw ApiError.notFound(`Course ID ${courseId} not found`);
            }
            return await CourseRepository.getStudentsOfCourse(courseId);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = CourseService;
