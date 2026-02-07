const studentRepository = require('../repositories/studentRepository');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

class StudentService {
  static async getAllStudents() {
    return studentRepository.getAllStudents();
  }

  static async getStudentById(id) {
    const student = await studentRepository.getStudentById(id);
    if (!student) throw ApiError.notFound(`Student ID ${id} not found`);
    return student;
  }

  static async createStudent(data) {
    if (!(await userRepository.userExistsById(data.userId))) {
      throw ApiError.notFound(`User ID ${data.userId} not found`);
    }
    if (await studentRepository.studentExistsByUserId(data.userId)) {
      throw ApiError.conflict(`Student profile for user ID ${data.userId} already exists`);
    }
    const user = await userRepository.getUserById(data.userId);
    if (user.user_type !== 'student') {
      throw ApiError.badRequest('User is not a student type');
    }
    const id = await studentRepository.createStudent(data);
    return { studentId: id, ...data };
  }

  static async updateStudent(id, data) {
    if (!(await studentRepository.studentExists(id))) {
      throw ApiError.notFound(`Student ID ${id} not found`);
    }
    if (!(await userRepository.userExistsById(data.userId))) {
      throw ApiError.notFound(`User ID ${data.userId} not found`);
    }
    await studentRepository.updateStudent(id, data);
    return { studentId: id, ...data };
  }

  static async deleteStudent(id) {
    if (!(await studentRepository.studentExists(id))) {
      throw ApiError.notFound(`Student ID ${id} not found`);
    }
    await studentRepository.deleteStudent(id);
  }

  static async getStudentCourses(id) {
    if (!(await studentRepository.studentExists(id))) {
      throw ApiError.notFound(`Student ID ${id} not found`);
    }
    return studentRepository.getStudentCourses(id);
  }
}

module.exports = StudentService;
