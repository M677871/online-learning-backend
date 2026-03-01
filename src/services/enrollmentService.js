const EnrollmentRepository = require('../domain/repositories/EnrollmentRepository');
const StudentRepository = require('../domain/repositories/StudentRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

class EnrollmentService {
    static async getAllEnrollments() {
        try {
            return await EnrollmentRepository.getAllEnrollments();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getEnrollmentById(id) {
        try {
            const enrollment = await EnrollmentRepository.getEnrollmentById(id);
            if (!enrollment) throw ApiError.notFound(`Enrollment ID ${id} not found`);
            return enrollment;
        } catch (e) {
            throw e;
        }
    }

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
