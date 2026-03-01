const InstructorRepository = require('../domain/repositories/InstructorRepository');
const UserRepository = require('../domain/repositories/UserRepository');
const ApiError = require('../middlewares/ApiError');

class InstructorService {
    static async getAllInstructors() {
        try {
            return await InstructorRepository.getAllInstructors();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getInstructorById(id) {
        try {
            const inst = await InstructorRepository.getInstructorById(id);
            if (!inst) throw ApiError.notFound(`Instructor ID ${id} not found`);
            return inst;
        } catch (e) {
            throw e;
        }
    }

    static async createInstructor(data) {
        try {
            if (!(await UserRepository.userExistsById(data.userId))) {
                throw ApiError.notFound(`User ID ${data.userId} not found`);
            }
            if (await InstructorRepository.instructorExistsByUserId(data.userId)) {
                throw ApiError.conflict(`Instructor profile for user ID ${data.userId} already exists`);
            }
            const user = await UserRepository.getUserById(data.userId);
            if (user.userType !== 'instructor') {
                throw ApiError.badRequest('User is not an instructor type');
            }
            const id = await InstructorRepository.createInstructor(data);
            return await InstructorRepository.getInstructorById(id);
        } catch (e) {
            throw e;
        }
    }

    static async updateInstructor(id, data) {
        try {
            if (!(await InstructorRepository.instructorExists(id))) {
                throw ApiError.notFound(`Instructor ID ${id} not found`);
            }
            if (!(await UserRepository.userExistsById(data.userId))) {
                throw ApiError.notFound(`User ID ${data.userId} not found`);
            }
            await InstructorRepository.updateInstructor(id, data);
            return await InstructorRepository.getInstructorById(id);
        } catch (e) {
            throw e;
        }
    }

    static async deleteInstructor(id) {
        try {
            if (!(await InstructorRepository.instructorExists(id))) {
                throw ApiError.notFound(`Instructor ID ${id} not found`);
            }
            await InstructorRepository.deleteInstructor(id);
        } catch (e) {
            throw e;
        }
    }

    static async getInstructorCourses(id) {
        try {
            if (!(await InstructorRepository.instructorExists(id))) {
                throw ApiError.notFound(`Instructor ID ${id} not found`);
            }
            return await InstructorRepository.getInstructorCourses(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = InstructorService;
