const QuizResultRepository = require('../domain/repositories/QuizResultRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const StudentRepository = require('../domain/repositories/StudentRepository');
const ApiError = require('../middlewares/ApiError');

const QuizResultRepository = require('../domain/repositories/QuizResultRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const StudentRepository = require('../domain/repositories/StudentRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling quiz result business logic.
 */
class QuizResultService {
    /**
     * Retrieves all quiz results.
     * @returns {Promise<Array<Object>>} List of quiz results.
     * @throws {Error} If retrieval fails.
     */
    static async getAllQuizResults() {
        try {
            return await QuizResultRepository.getAllQuizResults();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a quiz result by ID.
     * @param {number|string} id - The ID of the quiz result.
     * @returns {Promise<Object>} The quiz result object.
     * @throws {ApiError} 404 if not found.
     */
    static async getQuizResultById(id) {
        try {
            const r = await QuizResultRepository.getQuizResultById(id);
            if (!r) throw ApiError.notFound(`Quiz Result ID ${id} not found`);
            return r;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new quiz result.
     * @param {Object} data - Quiz result details.
     * @param {number|string} data.quizId - Associated quiz ID.
     * @param {number|string} data.studentId - Associated student ID.
     * @param {number} data.score - The score achieved.
     * @returns {Promise<Object>} The newly created quiz result.
     * @throws {ApiError} 404 if quiz/student not found, 409 if result already exists.
     */
    static async createQuizResult(data) {
        try {
            if (!(await QuizRepository.quizExists(data.quizId))) {
                throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
            }
            if (!(await StudentRepository.studentExists(data.studentId))) {
                throw ApiError.notFound(`Student ID ${data.studentId} not found`);
            }
            if (await QuizResultRepository.resultExistsByStudentAndQuiz(data.studentId, data.quizId)) {
                throw ApiError.conflict('Result already exists for this student and quiz');
            }
            const id = await QuizResultRepository.createQuizResult(data);
            return await QuizResultRepository.getQuizResultById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing quiz result.
     * @param {number|string} id - The quiz result ID.
     * @param {Object} data - Update details.
     * @param {number|string} data.quizId - Associated quiz ID.
     * @param {number|string} data.studentId - Associated student ID.
     * @param {number} data.score - The updated score.
     * @returns {Promise<Object>} The updated quiz result.
     * @throws {ApiError} 404 if result, quiz, or student is not found.
     */
    static async updateQuizResult(id, data) {
        try {
            if (!(await QuizResultRepository.resultExists(id))) {
                throw ApiError.notFound(`Quiz Result ID ${id} not found`);
            }
            if (!(await QuizRepository.quizExists(data.quizId))) {
                throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
            }
            if (!(await StudentRepository.studentExists(data.studentId))) {
                throw ApiError.notFound(`Student ID ${data.studentId} not found`);
            }
            await QuizResultRepository.updateQuizResult(id, data);
            return await QuizResultRepository.getQuizResultById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a quiz result by ID.
     * @param {number|string} id - The quiz result ID.
     * @returns {Promise<void>} Resolves when deleted.
     * @throws {ApiError} 404 if the result is not found.
     */
    static async deleteQuizResult(id) {
        try {
            if (!(await QuizResultRepository.resultExists(id))) {
                throw ApiError.notFound(`Quiz Result ID ${id} not found`);
            }
            await QuizResultRepository.deleteQuizResult(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = QuizResultService;
