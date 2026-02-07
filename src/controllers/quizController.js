const quizService = require('../services/quizService');
const asyncHandler = require('../utils/asyncHandler');

class QuizController {
  static getAll = asyncHandler(async (req, res) => {
    const quizzes = await quizService.getAllQuizzes();
    res.json({ success: true, data: quizzes });
  });

  static getById = asyncHandler(async (req, res) => {
    const quiz = await quizService.getQuizById(req.params.id);
    res.json({ success: true, data: quiz });
  });

  static create = asyncHandler(async (req, res) => {
    const { courseId, quizName, quizDescription } = req.body;
    const quiz = await quizService.createQuiz({ courseId, quizName, quizDescription });
    res.status(201).json({ success: true, data: quiz, message: 'Quiz created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { courseId, quizName, quizDescription } = req.body;
    const quiz = await quizService.updateQuiz(req.params.id, { courseId, quizName, quizDescription });
    res.json({ success: true, data: quiz, message: 'Quiz updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await quizService.deleteQuiz(req.params.id);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  });
}

module.exports = QuizController;
