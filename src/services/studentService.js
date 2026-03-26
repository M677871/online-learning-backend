const StudentRepository = require('../domain/repositories/StudentRepository');
const UserRepository = require('../domain/repositories/UserRepository');
const ApiError = require('../middlewares/ApiError');

class StudentService {
    /**
     * Retrieves a list of all students.
     * @returns {Promise<Array<Object>>} An array of student objects.
     * @throws {Error} If a repository error occurs.
     */
    static async getAllStudents() {
        try {
            return await StudentRepository.getAllStudents();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a specific student by their associated User ID.
     * @param {number|string} id - The User ID associated with the student profile.
     * @returns {Promise<Object>} The student object.
     * @throws {ApiError} 404 if the student is not found.
     */
    static async getStudentById(id) {
        try {
            const student = await StudentRepository.getStudentById(id);
            if (!student) throw ApiError.notFound(`Student ID ${id} not found`);
            return student;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new student profile.
     * @param {Object} data - Data for the new student.
     * @param {number} data.userId - The ID of the associated user.
     * @param {string} data.stuFName - The student's first name.
     * @param {string} data.stuLName - The student's last name.
     * @param {string|Date} data.dob - The student's date of birth.
     * @param {string} [data.profilePicture] - URL or path to the student's profile picture.
     * @returns {Promise<Object>} Detailed student object after creation.
     * @throws {ApiError} 404 if user not found, 409 if conflict, 400 if wrong type.
     */
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

    /**
     * Updates an existing student profile.
     * @param {number|string} id - The ID of the student to update.
     * @param {Object} data - Data to update the student with.
     * @param {number} data.userId - The ID of the associated user.
     * @param {string} data.stuFName - The student's first name.
     * @param {string} data.stuLName - The student's last name.
     * @param {string|Date} data.dob - The student's date of birth.
     * @param {string} [data.profilePicture] - URL or path to the student's profile picture.
     * @returns {Promise<Object>} The updated student object.
     * @throws {ApiError} 404 if the student or user is not found.
     */
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

    /**
     * Deletes a student profile.
     * @param {number|string} id - The ID of the student to delete.
     * @returns {Promise<void>} Resolves when the student is deleted.
     * @throws {ApiError} 404 if the student doesn't exist.
     */
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

    /**
     * Retrieves courses for which a specific student is enrolled.
     * @param {number|string} id - The ID of the student.
     * @returns {Promise<Array<Object>>} List of course records associated with the student.
     * @throws {ApiError} 404 if the student does not exist.
     */
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
