const QuizAnswerRepository = require('../domain/repositories/QuizAnswerRepository');
const QuizQuestionRepository = require('../domain/repositories/QuizQuestionRepository');
const ApiError = require('../middlewares/ApiError');

class QuizAnswerService {
    static async getAllQuizAnswers() {
        try {
            return await QuizAnswerRepository.getAllQuizAnswers();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getQuizAnswerById(id) {
        try {
            const a = await QuizAnswerRepository.getQuizAnswerById(id);
            if (!a) throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
            return a;
        } catch (e) {
            throw e;
        }
    }

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
