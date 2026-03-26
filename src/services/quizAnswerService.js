const QuizAnswerRepository = require('../domain/repositories/QuizAnswerRepository');
const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const ApiError = require('../middlewares/ApiError');

const QuizAnswerRepository = require('../domain/repositories/QuizAnswerRepository');
const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling logic for quiz answers.
 */
class QuizAnswerService {
    /**
     * Retrieves all quiz answers.
     * @returns {Promise<Array<Object>>} List of answer objects.
     * @throws {Error} If retrieval fails.
     */
    static async getAllQuizAnswers() {
        try {
            return await QuizAnswerRepository.getAllQuizAnswers();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a quiz answer by ID.
     * @param {number|string} id - The ID of the quiz answer.
     * @returns {Promise<Object>} The quiz answer object.
     * @throws {ApiError} 404 if not found.
     */
    static async getQuizAnswerById(id) {
        try {
            const a = await QuizAnswerRepository.getQuizAnswerById(id);
            if (!a) throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
            return a;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new quiz answer.
     * @param {Object} data - Answer details.
     * @param {number|string} data.questionId - Associated question ID.
     * @param {string} data.answerText - The text for the answer.
     * @param {string} [data.answerType] - The type of answer.
     * @param {boolean} [data.isCorrect] - Indicates if the answer is correct.
     * @returns {Promise<Object>} The newly created answer.
     * @throws {ApiError} 404 if the associated question does not exist.
     */
    static async createQuizAnswer(data) {
        try {
            if (!(await QuizQuestionRepository.questionExists(data.questionId))) {
                throw ApiError.notFound(`Quiz Question ID ${data.questionId} not found`);
            }
            const id = await QuizAnswerRepository.createQuizAnswer(data);
            return await QuizAnswerRepository.getQuizAnswerById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing quiz answer.
     * @param {number|string} id - The answer ID.
     * @param {Object} data - Update details.
     * @param {number|string} [data.questionId] - Associated question ID.
     * @param {string} [data.answerText] - The new text for the answer.
     * @param {string} [data.answerType] - The new type of answer.
     * @param {boolean} [data.isCorrect] - Updated correct status.
     * @returns {Promise<Object>} The updated answer.
     * @throws {ApiError} 404 if the answer is not found.
     */
    static async updateQuizAnswer(id, data) {
        try {
            if (!(await QuizAnswerRepository.answerExists(id))) {
                throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
            }
            await QuizAnswerRepository.updateQuizAnswer(id, data);
            return await QuizAnswerRepository.getQuizAnswerById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a quiz answer by ID.
     * @param {number|string} id - The answer ID.
     * @returns {Promise<void>} Resolves when deleted.
     * @throws {ApiError} 404 if the answer is not found.
     */
    static async deleteQuizAnswer(id) {
        try {
            if (!(await QuizAnswerRepository.answerExists(id))) {
                throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
            }
            await QuizAnswerRepository.deleteQuizAnswer(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = QuizAnswerService;
