const instructorRepository = require('../repositories/instructorRepository');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

class InstructorService {
  static async getAllInstructors() {
    return instructorRepository.getAllInstructors();
  }

  static async getInstructorById(id) {
    const inst = await instructorRepository.getInstructorById(id);
    if (!inst) throw ApiError.notFound(`Instructor ID ${id} not found`);
    return inst;
  }

  static async createInstructor(data) {
    if (!(await userRepository.userExistsById(data.userId))) {
      throw ApiError.notFound(`User ID ${data.userId} not found`);
    }
    if (await instructorRepository.instructorExistsByUserId(data.userId)) {
      throw ApiError.conflict(`Instructor profile for user ID ${data.userId} already exists`);
    }
    const user = await userRepository.getUserById(data.userId);
    if (user.user_type !== 'instructor') {
      throw ApiError.badRequest('User is not an instructor type');
    }
    const id = await instructorRepository.createInstructor(data);
    return { instructorId: id, ...data };
  }

  static async updateInstructor(id, data) {
    if (!(await instructorRepository.instructorExists(id))) {
      throw ApiError.notFound(`Instructor ID ${id} not found`);
    }
    if (!(await userRepository.userExistsById(data.userId))) {
      throw ApiError.notFound(`User ID ${data.userId} not found`);
    }
    await instructorRepository.updateInstructor(id, data);
    return { instructorId: id, ...data };
  }

  static async deleteInstructor(id) {
    if (!(await instructorRepository.instructorExists(id))) {
      throw ApiError.notFound(`Instructor ID ${id} not found`);
    }
    await instructorRepository.deleteInstructor(id);
  }

  static async getInstructorCourses(id) {
    if (!(await instructorRepository.instructorExists(id))) {
      throw ApiError.notFound(`Instructor ID ${id} not found`);
    }
    return instructorRepository.getInstructorCourses(id);
  }
}

module.exports = InstructorService;
