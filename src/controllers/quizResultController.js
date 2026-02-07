const quizResultService = require('../services/quizResultService');
const asyncHandler = require('../utils/asyncHandler');

class QuizResultController {
  static getAll = asyncHandler(async (req, res) => {
    const results = await quizResultService.getAllQuizResults();
    res.json({ success: true, data: results });
  });

  static getById = asyncHandler(async (req, res) => {
    const result = await quizResultService.getQuizResultById(req.params.id);
    res.json({ success: true, data: result });
  });

  static create = asyncHandler(async (req, res) => {
    const { quizId, studentId, score } = req.body;
    const result = await quizResultService.createQuizResult({ quizId, studentId, score });
    res.status(201).json({ success: true, data: result, message: 'Quiz result created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { quizId, studentId, score } = req.body;
    const result = await quizResultService.updateQuizResult(req.params.id, { quizId, studentId, score });
    res.json({ success: true, data: result, message: 'Quiz result updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await quizResultService.deleteQuizResult(req.params.id);
    res.json({ success: true, message: 'Quiz result deleted successfully' });
  });
}

module.exports = QuizResultController;
