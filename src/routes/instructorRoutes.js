const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/instructorController');
const authenticate = require('../middleware/auth/authenticate');
const authorize = require('../middleware/auth/authorize');
const { validateInstructor, validateInstructorId } = require('../validators/instructor.dto');

// Public: anyone can see instructors
router.get('/', InstructorController.getAll);
router.get('/:id', validateInstructorId, InstructorController.getById);
router.get('/courses/:id', validateInstructorId, InstructorController.getCourses);

// Protected: only instructors can manage instructor profiles
router.post('/', authenticate, authorize(['instructor']), validateInstructor, InstructorController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateInstructorId, validateInstructor, InstructorController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateInstructorId, InstructorController.remove);

module.exports = router;
