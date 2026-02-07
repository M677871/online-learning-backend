const quizQuestionService = require('../services/quizQuestionService');
const asyncHandler = require('../utils/asyncHandler');

class QuizQuestionController {
  static getAll = asyncHandler(async (req, res) => {
    const questions = await quizQuestionService.getAllQuizQuestions();
    res.json({ success: true, data: questions });
  });

  static getById = asyncHandler(async (req, res) => {
    const question = await quizQuestionService.getQuizQuestionById(req.params.id);
    res.json({ success: true, data: question });
  });

  static create = asyncHandler(async (req, res) => {
    const { quizId, questionText } = req.body;
    const question = await quizQuestionService.createQuizQuestion({ quizId, questionText });
    res.status(201).json({ success: true, data: question, message: 'Quiz question created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { quizId, questionText } = req.body;
    const question = await quizQuestionService.updateQuizQuestion(req.params.id, { quizId, questionText });
    res.json({ success: true, data: question, message: 'Quiz question updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await quizQuestionService.deleteQuizQuestion(req.params.id);
    res.json({ success: true, message: 'Quiz question deleted successfully' });
  });
}

module.exports = QuizQuestionController;
