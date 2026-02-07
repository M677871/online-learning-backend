const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/enrollmentController');
const authenticate = require('../middleware/auth/authenticate');
const { validateEnrollement, validateEnrollementId } = require('../validators/enrollement.dto');

// All enrollment routes require authentication
router.get('/', authenticate, EnrollmentController.getAll);
router.get('/:id', authenticate, validateEnrollementId, EnrollmentController.getById);
router.post('/', authenticate, validateEnrollement, EnrollmentController.create);
router.put('/:id', authenticate, validateEnrollementId, validateEnrollement, EnrollmentController.update);
router.delete('/:id', authenticate, validateEnrollementId, EnrollmentController.remove);

module.exports = router;
