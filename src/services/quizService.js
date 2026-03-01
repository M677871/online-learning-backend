const QuizRepository = require('../domain/repositories/QuizRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

class QuizService {
    static async getAllQuizzes() {
        try {
            return await QuizRepository.getAllQuizzes();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getQuizById(id) {
        try {
            const quiz = await QuizRepository.getQuizById(id);
            if (!quiz) throw ApiError.notFound(`Quiz ID ${id} not found`);
            return quiz;
        } catch (e) {
            throw e;
        }
    }

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
