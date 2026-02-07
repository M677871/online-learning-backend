const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const authenticate = require('../middleware/auth/authenticate');
const authorize = require('../middleware/auth/authorize');
const { validateStudent, validateStudentId } = require('../validators/student.dto');

// All student routes require authentication
router.get('/', authenticate, StudentController.getAll);
router.get('/:id', authenticate, validateStudentId, StudentController.getById);
router.get('/studentCourses/:id', authenticate, validateStudentId, StudentController.getCourses);
router.post('/', authenticate, validateStudent, StudentController.create);
router.put('/:id', authenticate, validateStudentId, validateStudent, StudentController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateStudentId, StudentController.remove);

module.exports = router;
