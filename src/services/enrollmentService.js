const enrollmentRepository = require('../repositories/enrollmentRepository');
const studentRepository = require('../repositories/studentRepository');
const courseRepository = require('../repositories/courseRepository');
const ApiError = require('../utils/ApiError');

class EnrollmentService {
  static async getAllEnrollments() {
    return enrollmentRepository.getAllEnrollments();
  }

  static async getEnrollmentById(id) {
    const enrollment = await enrollmentRepository.getEnrollmentById(id);
    if (!enrollment) throw ApiError.notFound(`Enrollment ID ${id} not found`);
    return enrollment;
  }

  static async createEnrollment(data) {
    if (!(await studentRepository.studentExists(data.studentId))) {
      throw ApiError.notFound(`Student ID ${data.studentId} not found`);
    }
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    if (await enrollmentRepository.enrollmentExistsByStudentAndCourse(data.studentId, data.courseId)) {
      throw ApiError.conflict('Student is already enrolled in this course');
    }
    const id = await enrollmentRepository.createEnrollment(data);
    return { enrollmentId: id, ...data };
  }

  static async updateEnrollment(id, data) {
    if (!(await enrollmentRepository.enrollmentExists(id))) {
      throw ApiError.notFound(`Enrollment ID ${id} not found`);
    }
    if (!(await studentRepository.studentExists(data.studentId))) {
      throw ApiError.notFound(`Student ID ${data.studentId} not found`);
    }
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    await enrollmentRepository.updateEnrollment(id, data);
    return { enrollmentId: id, ...data };
  }

  static async deleteEnrollment(id) {
    if (!(await enrollmentRepository.enrollmentExists(id))) {
      throw ApiError.notFound(`Enrollment ID ${id} not found`);
    }
    await enrollmentRepository.deleteEnrollment(id);
  }
}

module.exports = EnrollmentService;
