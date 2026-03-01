const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/QuizController');
const authenticate = require('../middlewares/auth/authenticate');
const authorize = require('../middlewares/auth/authorize');
const { validateQuiz, validateQuizId } = require('../validators/quizValidators');

// Public: anyone can browse quizzes
router.get('/', QuizController.getAll);
router.get('/:id', validateQuizId, QuizController.getById);

// Protected: only instructors can manage quizzes
router.post('/', authenticate, authorize(['instructor']), validateQuiz, QuizController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateQuizId, validateQuiz, QuizController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateQuizId, QuizController.remove);

module.exports = router;
