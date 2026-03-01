const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/EnrollmentController');
const authenticate = require('../middlewares/auth/authenticate');
const { validateEnrollment, validateEnrollmentId } = require('../validators/enrollmentValidators');

// All enrollment routes require authentication
router.get('/', authenticate, EnrollmentController.getAll);
router.get('/:id', authenticate, validateEnrollmentId, EnrollmentController.getById);
router.post('/', authenticate, validateEnrollment, EnrollmentController.create);
router.put('/:id', authenticate, validateEnrollmentId, validateEnrollment, EnrollmentController.update);
router.delete('/:id', authenticate, validateEnrollmentId, EnrollmentController.remove);

module.exports = router;
