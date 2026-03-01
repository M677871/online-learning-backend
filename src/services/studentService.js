const StudentRepository = require('../domain/repositories/StudentRepository');
const UserRepository = require('../domain/repositories/UserRepository');
const ApiError = require('../middlewares/ApiError');

class StudentService {
    static async getAllStudents() {
        try {
            return await StudentRepository.getAllStudents();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getStudentById(id) {
        try {
            const student = await StudentRepository.getStudentById(id);
            if (!student) throw ApiError.notFound(`Student ID ${id} not found`);
            return student;
        } catch (e) {
            throw e;
        }
    }

    static async createStudent(data) {
        try {
            if (!(await UserRepository.userExistsById(data.userId))) {
                throw ApiError.notFound(`User ID ${data.userId} not found`);
            }
            if (await StudentRepository.studentExistsByUserId(data.userId)) {
                throw ApiError.conflict(`Student profile for user ID ${data.userId} already exists`);
            }
            const user = await UserRepository.getUserById(data.userId);
            if (user.userType !== 'student') {
                throw ApiError.badRequest('User is not a student type');
            }
            const id = await StudentRepository.createStudent(data);
            return await StudentRepository.getStudentById(id);
        } catch (e) {
            throw e;
        }
    }

    static async updateStudent(id, data) {
        try {
            if (!(await StudentRepository.studentExists(id))) {
                throw ApiError.notFound(`Student ID ${id} not found`);
            }
            if (!(await UserRepository.userExistsById(data.userId))) {
                throw ApiError.notFound(`User ID ${data.userId} not found`);
            }
            await StudentRepository.updateStudent(id, data);
            return await StudentRepository.getStudentById(id);
        } catch (e) {
            throw e;
        }
    }

    static async deleteStudent(id) {
        try {
            if (!(await StudentRepository.studentExists(id))) {
                throw ApiError.notFound(`Student ID ${id} not found`);
            }
            await StudentRepository.deleteStudent(id);
        } catch (e) {
            throw e;
        }
    }

    static async getStudentCourses(id) {
        try {
            if (!(await StudentRepository.studentExists(id))) {
                throw ApiError.notFound(`Student ID ${id} not found`);
            }
            return await StudentRepository.getStudentCourses(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = StudentService;
