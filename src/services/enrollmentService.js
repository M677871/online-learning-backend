const EnrollmentRepository = require('../domain/repositories/EnrollmentRepository');
const StudentRepository = require('../domain/repositories/StudentRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling enrollment-related business logic.
 */
class EnrollmentService {
    /**
     * Retrieves all student enrollments.
     * @returns {Promise<Enrollment[]>} Array of Enrollment entities.
     * @throws {Error} If a database error occurs.
     */
    static async getAllEnrollments() {
        try {
            return await EnrollmentRepository.getAllEnrollments();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves an enrollment record by its ID.
     * @param {number|string} id - The enrollment ID.
     * @returns {Promise<Enrollment>} The enrollment entity.
     * @throws {ApiError} If the enrollment is not found.
     */
    static async getEnrollmentById(id) {
        try {
            const enrollment = await EnrollmentRepository.getEnrollmentById(id);
            if (!enrollment) throw ApiError.notFound(`Enrollment ID ${id} not found`);
            return enrollment;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new enrollment record.
     * @param {Object} data - Enrollment parameters.
     * @param {number|string} data.studentId - Student ID.
     * @param {number|string} data.courseId - Course ID.
     * @param {string} [data.status] - Enrollment status.
     * @returns {Promise<Enrollment>} The newly created enrollment entity.
     * @throws {ApiError} If student or course is missing, or if student is already enrolled.
     */
    static async createEnrollment(data) {
        try {
            if (!(await StudentRepository.studentExists(data.studentId))) {
                throw ApiError.notFound(`Student ID ${data.studentId} not found`);
            }
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            if (await EnrollmentRepository.enrollmentExistsByStudentAndCourse(data.studentId, data.courseId)) {
                throw ApiError.conflict('Student is already enrolled in this course');
            }
            const id = await EnrollmentRepository.createEnrollment(data);
            return await EnrollmentRepository.getEnrollmentById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing enrollment record.
     * @param {number|string} id - The enrollment ID.
     * @param {Object} data - The update payload.
     * @param {number|string} data.studentId - Updated student ID.
     * @param {number|string} data.courseId - Updated course ID.
     * @param {string} data.status - Updated status.
     * @returns {Promise<Enrollment>} The updated enrollment entity.
     * @throws {ApiError} If enrollment, student, or course does not exist.
     */
    static async updateEnrollment(id, data) {
        try {
            if (!(await EnrollmentRepository.enrollmentExists(id))) {
                throw ApiError.notFound(`Enrollment ID ${id} not found`);
            }
            if (!(await StudentRepository.studentExists(data.studentId))) {
                throw ApiError.notFound(`Student ID ${data.studentId} not found`);
            }
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            await EnrollmentRepository.updateEnrollment(id, data);
            return await EnrollmentRepository.getEnrollmentById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes an enrollment record.
     * @param {number|string} id - The enrollment ID to delete.
     * @returns {Promise<void>}
     * @throws {ApiError} If the enrollment does not exist.
     */
    static async deleteEnrollment(id) {
        try {
            if (!(await EnrollmentRepository.enrollmentExists(id))) {
                throw ApiError.notFound(`Enrollment ID ${id} not found`);
            }
            await EnrollmentRepository.deleteEnrollment(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = EnrollmentService;
