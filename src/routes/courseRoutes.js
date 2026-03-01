const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const authenticate = require('../middlewares/auth/authenticate');
const authorize = require('../middlewares/auth/authorize');
const { validateCourse, validateCourseId } = require('../validators/courseValidators');

// Public: anyone can browse courses
router.get('/', CourseController.getAll);
router.get('/:id', validateCourseId, CourseController.getById);
router.get('/instructorByCourseId/:id', validateCourseId, CourseController.getInstructorByCourseId);
router.get('/stdOfCourse/:id', validateCourseId, CourseController.getStudentsOfCourse);

// Protected: only instructors can manage courses
router.post('/', authenticate, authorize(['instructor']), validateCourse, CourseController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateCourseId, validateCourse, CourseController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateCourseId, CourseController.remove);

module.exports = router;
