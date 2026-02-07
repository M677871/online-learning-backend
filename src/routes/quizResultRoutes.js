const express = require('express');
const router = express.Router();
const QuizResultController = require('../controllers/quizResultController');
const authenticate = require('../middleware/auth/authenticate');
const { validateResult, validateResultId } = require('../validators/results.dto');

// All result routes require authentication
router.get('/', authenticate, QuizResultController.getAll);
router.get('/:id', authenticate, validateResultId, QuizResultController.getById);
router.post('/', authenticate, validateResult, QuizResultController.create);
router.put('/:id', authenticate, validateResultId, validateResult, QuizResultController.update);
router.delete('/:id', authenticate, validateResultId, QuizResultController.remove);

module.exports = router;
