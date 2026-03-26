const InstructorRepository = require('../domain/repositories/InstructorRepository');
const UserRepository = require('../domain/repositories/UserRepository');
const ApiError = require('../middlewares/ApiError');

class InstructorService {
    /**
     * Retrieves all instructors.
     * @returns {Promise<Array<Object>>} A list of all instructor objects.
     * @throws {Error} If retrieving instructors fails.
     */
    static async getAllInstructors() {
        try {
            return await InstructorRepository.getAllInstructors();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a specific instructor by ID.
     * @param {number|string} id - The ID of the instructor.
     * @returns {Promise<Object>} The instructor object.
     * @throws {ApiError} 404 if the instructor profile is not found.
     */
    static async getInstructorById(id) {
        try {
            const inst = await InstructorRepository.getInstructorById(id);
            if (!inst) throw ApiError.notFound(`Instructor ID ${id} not found`);
            return inst;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new instructor profile.
     * @param {Object} data - The instructor creation data.
     * @param {number} data.userId - The associated user ID.
     * @param {string} data.insFName - Instructor's first name.
     * @param {string} data.insLName - Instructor's last name.
     * @param {string} [data.bio] - Short biography.
     * @param {string} [data.profilePicture] - URL to profile picture.
     * @returns {Promise<Object>} The created instructor object.
     * @throws {ApiError} 404 if user not found, 409 if profile already exists, 400 if wrong user type.
     */
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

    /**
     * Updates an existing instructor profile.
     * @param {number|string} id - The ID of the instructor.
     * @param {Object} data - The instructor update data.
     * @param {number} data.userId - The associated user ID.
     * @param {string} data.insFName - Instructor's first name.
     * @param {string} data.insLName - Instructor's last name.
     * @param {string} [data.bio] - Short biography.
     * @param {string} [data.profilePicture] - URL to profile picture.
     * @returns {Promise<Object>} The updated instructor object.
     * @throws {ApiError} 404 if the instructor profile or user is not found.
     */
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

    /**
     * Deletes an instructor profile completely.
     * @param {number|string} id - The ID of the instructor.
     * @returns {Promise<void>} Resolves when the delete completes.
     * @throws {ApiError} 404 if the instructor profile does not exist.
     */
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

    /**
     * Retrieves all courses associated with a specific instructor.
     * @param {number|string} id - The ID of the instructor.
     * @returns {Promise<Array<Object>>} A list of courses for the instructor.
     * @throws {ApiError} 404 if the instructor profile does not exist.
     */
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
