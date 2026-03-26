const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const ApiError = require('../middlewares/ApiError');

const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling logic for quiz questions.
 */
class QuizQuestionService {
    /**
     * Retrieves all quiz questions.
     * @returns {Promise<Array<Object>>} List of question objects.
     * @throws {Error} If retrieval fails.
     */
    static async getAllQuizQuestions() {
        try {
            return await QuizQuestionRepository.getAllQuizQuestions();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a quiz question by ID.
     * @param {number|string} id - The ID of the question.
     * @returns {Promise<Object>} The question object.
     * @throws {ApiError} 404 if not found.
     */
    static async getQuizQuestionById(id) {
        try {
            const q = await QuizQuestionRepository.getQuizQuestionById(id);
            if (!q) throw ApiError.notFound(`Quiz Question ID ${id} not found`);
            return q;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new quiz question.
     * @param {Object} data - Question details.
     * @param {number|string} data.quizId - Associated quiz ID.
     * @param {string} data.questionText - The text for the question.
     * @returns {Promise<Object>} The newly created question.
     * @throws {ApiError} 404 if the associated quiz does not exist.
     */
    static async createQuizQuestion(data) {
        try {
            if (!(await QuizRepository.quizExists(data.quizId))) {
                throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
            }
            const id = await QuizQuestionRepository.createQuizQuestion(data);
            return await QuizQuestionRepository.getQuizQuestionById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing quiz question.
     * @param {number|string} id - The question ID.
     * @param {Object} data - Update details.
     * @param {string} [data.questionText] - The new text for the question.
     * @returns {Promise<Object>} The updated question.
     * @throws {ApiError} 404 if the question is not found.
     */
    static async updateQuizQuestion(id, data) {
        try {
            if (!(await QuizQuestionRepository.questionExists(id))) {
                throw ApiError.notFound(`Quiz Question ID ${id} not found`);
            }
            await QuizQuestionRepository.updateQuizQuestion(id, data);
            return await QuizQuestionRepository.getQuizQuestionById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a quiz question by ID.
     * @param {number|string} id - The question ID.
     * @returns {Promise<void>} Resolves when deleted.
     * @throws {ApiError} 404 if the question is not found.
     */
    static async deleteQuizQuestion(id) {
        try {
            if (!(await QuizQuestionRepository.questionExists(id))) {
                throw ApiError.notFound(`Quiz Question ID ${id} not found`);
            }
            await QuizQuestionRepository.deleteQuizQuestion(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = QuizQuestionService;
