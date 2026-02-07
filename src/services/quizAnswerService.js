const quizAnswerRepository = require('../repositories/quizAnswerRepository');
const quizQuestionRepository = require('../repositories/quizQuestionRepository');
const ApiError = require('../utils/ApiError');

class QuizAnswerService {
  static async getAllQuizAnswers() {
    return quizAnswerRepository.getAllQuizAnswers();
  }

  static async getQuizAnswerById(id) {
    const a = await quizAnswerRepository.getQuizAnswerById(id);
    if (!a) throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
    return a;
  }

  static async createQuizAnswer(data) {
    if (!(await quizQuestionRepository.questionExists(data.questionId))) {
      throw ApiError.notFound(`Quiz Question ID ${data.questionId} not found`);
    }
    const id = await quizAnswerRepository.createQuizAnswer(data);
    return { answerId: id, ...data };
  }

  static async updateQuizAnswer(id, data) {
    if (!(await quizAnswerRepository.answerExists(id))) {
      throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
    }
    await quizAnswerRepository.updateQuizAnswer(id, data);
    return { answerId: id, ...data };
  }

  static async deleteQuizAnswer(id) {
    if (!(await quizAnswerRepository.answerExists(id))) {
      throw ApiError.notFound(`Quiz Answer ID ${id} not found`);
    }
    await quizAnswerRepository.deleteQuizAnswer(id);
  }
}

module.exports = QuizAnswerService;
