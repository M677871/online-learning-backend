const CourseRepository = require('../domain/repositories/CourseRepository');
const InstructorRepository = require('../domain/repositories/InstructorRepository');
const CategoryRepository = require('../domain/repositories/CategoryRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling course-related business logic.
 */
class CourseService {
    /**
     * Retrieves all courses.
     * @returns {Promise<Course[]>} A promise resolving to an array of course entities.
     * @throws {Error} If a database error occurs.
     */
    static async getAllCourses() {
        try {
            return await CourseRepository.getAllCourses();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a single course by its ID.
     * @param {number|string} id - The course ID.
     * @returns {Promise<Course>} A promise resolving to the course entity.
     * @throws {ApiError} If the course is not found.
     */
    static async getCourseById(id) {
        try {
            const course = await CourseRepository.getCourseById(id);
            if (!course) throw ApiError.notFound(`Course ID ${id} not found`);
            return course;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new course after validating instructor and category existence.
     * @param {Object} data - The course data.
     * @param {number|string} data.instructorId - The ID of the instructor teaching the course.
     * @param {number|string} data.categorieId - The ID of the primary category.
     * @param {string} data.courseName - Name of the course.
     * @param {string} data.description - Description of the course.
     * @returns {Promise<Course>} A promise resolving to the created course entity.
     * @throws {ApiError} If the instructor or category does not exist.
     */
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

    /**
     * Updates an existing course after validating its ID, instructor, and category.
     * @param {number|string} id - The course ID to update.
     * @param {Object} data - The updated course data.
     * @param {number|string} data.instructorId - The ID of the instructor.
     * @param {number|string} data.categorieId - The ID of the category.
     * @param {string} data.courseName - Updated course name.
     * @param {string} data.description - Updated course description.
     * @returns {Promise<Course>} A promise resolving to the updated course entity.
     * @throws {ApiError} If the course, instructor, or category does not exist.
     */
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

    /**
     * Deletes a course.
     * @param {number|string} id - The course ID.
     * @returns {Promise<void>}
     * @throws {ApiError} If the course does not exist.
     */
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

    /**
     * Retrieves the instructor details associated with a course.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Object>} Instructor details.
     * @throws {ApiError} If the course does not exist.
     */
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

    /**
     * Retrieves all students enrolled in a specific course.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Object[]>} List of students enrolled in the course.
     * @throws {ApiError} If the course does not exist.
     */
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
