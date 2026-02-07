const quizRepository = require('../repositories/quizRepository');
const courseRepository = require('../repositories/courseRepository');
const ApiError = require('../utils/ApiError');

class QuizService {
  static async getAllQuizzes() {
    return quizRepository.getAllQuizzes();
  }

  static async getQuizById(id) {
    const quiz = await quizRepository.getQuizById(id);
    if (!quiz) throw ApiError.notFound(`Quiz ID ${id} not found`);
    return quiz;
  }

  static async createQuiz(data) {
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    const id = await quizRepository.createQuiz(data);
    return { quizId: id, ...data };
  }

  static async updateQuiz(id, data) {
    if (!(await quizRepository.quizExists(id))) {
      throw ApiError.notFound(`Quiz ID ${id} not found`);
    }
    if (!(await courseRepository.courseExistsById(data.courseId))) {
      throw ApiError.notFound(`Course ID ${data.courseId} not found`);
    }
    await quizRepository.updateQuiz(id, data);
    return { quizId: id, ...data };
  }

  static async deleteQuiz(id) {
    if (!(await quizRepository.quizExists(id))) {
      throw ApiError.notFound(`Quiz ID ${id} not found`);
    }
    await quizRepository.deleteQuiz(id);
  }
}

module.exports = QuizService;
