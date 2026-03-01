const QuizResultRepository = require('../domain/repositories/QuizResultRepository');
const QuizRepository = require('../domain/repositories/QuizRepository');
const StudentRepository = require('../domain/repositories/StudentRepository');
const ApiError = require('../middlewares/ApiError');

class QuizResultService {
    static async getAllQuizResults() {
        try {
            return await QuizResultRepository.getAllQuizResults();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getQuizResultById(id) {
        try {
            const r = await QuizResultRepository.getQuizResultById(id);
            if (!r) throw ApiError.notFound(`Quiz Result ID ${id} not found`);
            return r;
        } catch (e) {
            throw e;
        }
    }

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
