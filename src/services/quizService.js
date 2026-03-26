const QuizRepository = require('../domain/repositories/QuizRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

const QuizRepository = require('../domain/repositories/QuizRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling quiz business logic.
 */
class QuizService {
    /**
     * Retrieves all quizzes.
     * @returns {Promise<Array<Object>>} List of quizzes.
     * @throws {Error} If retrieval fails.
     */
    static async getAllQuizzes() {
        try {
            return await QuizRepository.getAllQuizzes();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a quiz by its ID.
     * @param {number|string} id - The ID of the quiz.
     * @returns {Promise<Object>} The quiz object.
     * @throws {ApiError} 404 if the quiz is not found.
     */
    static async getQuizById(id) {
        try {
            const quiz = await QuizRepository.getQuizById(id);
            if (!quiz) throw ApiError.notFound(`Quiz ID ${id} not found`);
            return quiz;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new quiz.
     * @param {Object} data - The quiz data.
     * @param {number|string} data.courseId - Associated course ID.
     * @param {string} data.quizName - Name of the quiz.
     * @param {string} [data.quizDescription] - Optional description.
     * @returns {Promise<Object>} The newly created quiz.
     * @throws {ApiError} 404 if the associated course does not exist.
     */
    static async createQuiz(data) {
        try {
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            const id = await QuizRepository.createQuiz(data);
            return await QuizRepository.getQuizById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing quiz.
     * @param {number|string} id - The ID of the quiz to update.
     * @param {Object} data - The updated quiz data.
     * @param {number|string} data.courseId - Associated course ID.
     * @param {string} data.quizName - Updated name.
     * @param {string} [data.quizDescription] - Updated description.
     * @returns {Promise<Object>} The updated quiz.
     * @throws {ApiError} 404 if the quiz or the associated course is not found.
     */
    static async updateQuiz(id, data) {
        try {
            if (!(await QuizRepository.quizExists(id))) {
                throw ApiError.notFound(`Quiz ID ${id} not found`);
            }
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            await QuizRepository.updateQuiz(id, data);
            return await QuizRepository.getQuizById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a quiz.
     * @param {number|string} id - The ID of the quiz to delete.
     * @returns {Promise<void>} Resolves when the quiz is deleted.
     * @throws {ApiError} 404 if the quiz is not found.
     */
    static async deleteQuiz(id) {
        try {
            if (!(await QuizRepository.quizExists(id))) {
                throw ApiError.notFound(`Quiz ID ${id} not found`);
            }
            await QuizRepository.deleteQuiz(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = QuizService;
