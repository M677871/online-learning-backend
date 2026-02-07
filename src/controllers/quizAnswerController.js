const quizAnswerService = require('../services/quizAnswerService');
const asyncHandler = require('../utils/asyncHandler');

class QuizAnswerController {
  static getAll = asyncHandler(async (req, res) => {
    const answers = await quizAnswerService.getAllQuizAnswers();
    res.json({ success: true, data: answers });
  });

  static getById = asyncHandler(async (req, res) => {
    const answer = await quizAnswerService.getQuizAnswerById(req.params.id);
    res.json({ success: true, data: answer });
  });

  static create = asyncHandler(async (req, res) => {
    const { questionId, answerText, answerType, isCorrect } = req.body;
    const answer = await quizAnswerService.createQuizAnswer({ questionId, answerText, answerType, isCorrect });
    res.status(201).json({ success: true, data: answer, message: 'Quiz answer created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { questionId, answerText, answerType, isCorrect } = req.body;
    const answer = await quizAnswerService.updateQuizAnswer(req.params.id, { questionId, answerText, answerType, isCorrect });
    res.json({ success: true, data: answer, message: 'Quiz answer updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await quizAnswerService.deleteQuizAnswer(req.params.id);
    res.json({ success: true, message: 'Quiz answer deleted successfully' });
  });
}

module.exports = QuizAnswerController;
