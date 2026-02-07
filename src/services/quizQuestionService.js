const quizQuestionRepository = require('../repositories/quizQuestionRepository');
const quizRepository = require('../repositories/quizRepository');
const ApiError = require('../utils/ApiError');

class QuizQuestionService {
  static async getAllQuizQuestions() {
    return quizQuestionRepository.getAllQuizQuestions();
  }

  static async getQuizQuestionById(id) {
    const q = await quizQuestionRepository.getQuizQuestionById(id);
    if (!q) throw ApiError.notFound(`Quiz Question ID ${id} not found`);
    return q;
  }

  static async createQuizQuestion(data) {
    if (!(await quizRepository.quizExists(data.quizId))) {
      throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
    }
    const id = await quizQuestionRepository.createQuizQuestion(data);
    return { questionId: id, ...data };
  }

  static async updateQuizQuestion(id, data) {
    if (!(await quizQuestionRepository.questionExists(id))) {
      throw ApiError.notFound(`Quiz Question ID ${id} not found`);
    }
    await quizQuestionRepository.updateQuizQuestion(id, data);
    return { questionId: id, ...data };
  }

  static async deleteQuizQuestion(id) {
    if (!(await quizQuestionRepository.questionExists(id))) {
      throw ApiError.notFound(`Quiz Question ID ${id} not found`);
    }
    await quizQuestionRepository.deleteQuizQuestion(id);
  }
}

module.exports = QuizQuestionService;
