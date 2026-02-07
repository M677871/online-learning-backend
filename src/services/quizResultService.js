const quizResultRepository = require('../repositories/quizResultRepository');
const quizRepository = require('../repositories/quizRepository');
const studentRepository = require('../repositories/studentRepository');
const ApiError = require('../utils/ApiError');

class QuizResultService {
  static async getAllQuizResults() {
    return quizResultRepository.getAllQuizResults();
  }

  static async getQuizResultById(id) {
    const r = await quizResultRepository.getQuizResultById(id);
    if (!r) throw ApiError.notFound(`Quiz Result ID ${id} not found`);
    return r;
  }

  static async createQuizResult(data) {
    if (!(await quizRepository.quizExists(data.quizId))) {
      throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
    }
    if (!(await studentRepository.studentExists(data.studentId))) {
      throw ApiError.notFound(`Student ID ${data.studentId} not found`);
    }
    if (await quizResultRepository.resultExistsByStudentAndQuiz(data.studentId, data.quizId)) {
      throw ApiError.conflict('Result already exists for this student and quiz');
    }
    const id = await quizResultRepository.createQuizResult(data);
    return { resultId: id, ...data };
  }

  static async updateQuizResult(id, data) {
    if (!(await quizResultRepository.resultExists(id))) {
      throw ApiError.notFound(`Quiz Result ID ${id} not found`);
    }
    if (!(await quizRepository.quizExists(data.quizId))) {
      throw ApiError.notFound(`Quiz ID ${data.quizId} not found`);
    }
    if (!(await studentRepository.studentExists(data.studentId))) {
      throw ApiError.notFound(`Student ID ${data.studentId} not found`);
    }
    await quizResultRepository.updateQuizResult(id, data);
    return { resultId: id, ...data };
  }

  static async deleteQuizResult(id) {
    if (!(await quizResultRepository.resultExists(id))) {
      throw ApiError.notFound(`Quiz Result ID ${id} not found`);
    }
    await quizResultRepository.deleteQuizResult(id);
  }
}

module.exports = QuizResultService;
