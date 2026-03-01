const express = require('express');
const router = express.Router();
const QuizAnswerController = require('../controllers/QuizAnswerController');
const authenticate = require('../middlewares/auth/authenticate');
const authorize = require('../middlewares/auth/authorize');
const { validateAnswer, validateAnswerId } = require('../validators/answerValidators');

// Public: anyone can view answers
router.get('/', QuizAnswerController.getAll);
router.get('/:id', validateAnswerId, QuizAnswerController.getById);

// Protected: instructors manage answers, students can submit
router.post('/', authenticate, validateAnswer, QuizAnswerController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateAnswerId, validateAnswer, QuizAnswerController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateAnswerId, QuizAnswerController.remove);

module.exports = router;
