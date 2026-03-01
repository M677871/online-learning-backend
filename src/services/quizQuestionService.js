const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const ApiError = require('../middlewares/ApiError');

class QuizQuestionService {
    static async getAllQuizQuestions() {
        try {
            return await QuizQuestionRepository.getAllQuizQuestions();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getQuizQuestionById(id) {
        try {
            const q = await QuizQuestionRepository.getQuizQuestionById(id);
            if (!q) throw ApiError.notFound(`Quiz Question ID ${id} not found`);
            return q;
        } catch (e) {
            throw e;
        }
    }

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
