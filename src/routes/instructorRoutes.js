const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/InstructorController');
const authenticate = require('../middlewares/auth/authenticate');
const authorize = require('../middlewares/auth/authorize');
const { validateInstructor, validateInstructorId } = require('../validators/instructorValidators');

// Public: anyone can see instructors
router.get('/', InstructorController.getAll);
router.get('/:id', validateInstructorId, InstructorController.getById);
router.get('/courses/:id', validateInstructorId, InstructorController.getCourses);

// Protected: only instructors can manage instructor profiles
router.post('/', authenticate, authorize(['instructor']), validateInstructor, InstructorController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateInstructorId, validateInstructor, InstructorController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateInstructorId, InstructorController.remove);

module.exports = router;
