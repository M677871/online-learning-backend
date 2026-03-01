const express = require('express');
const router = express.Router();
const QuizQuestionController = require('../controllers/QuizQuestionController');
const authenticate = require('../middlewares/auth/authenticate');
const authorize = require('../middlewares/auth/authorize');
const { validateQuestion, validateQuestionId } = require('../validators/questionValidators');

// Public: anyone can view questions
router.get('/', QuizQuestionController.getAll);
router.get('/:id', validateQuestionId, QuizQuestionController.getById);

// Protected: only instructors can manage questions
router.post('/', authenticate, authorize(['instructor']), validateQuestion, QuizQuestionController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateQuestionId, validateQuestion, QuizQuestionController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateQuestionId, QuizQuestionController.remove);

module.exports = router;
