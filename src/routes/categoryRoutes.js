const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth/authenticate');
const authorize = require('../middleware/auth/authorize');
const { validateCategory, validateCategoryId } = require('../validators/category.dto');

// Public: anyone can browse categories
router.get('/', CategoryController.getAll);
router.get('/:id', validateCategoryId, CategoryController.getById);
router.get('/courses/:id', validateCategoryId, CategoryController.getCourses);
router.get('/instructor/:id', validateCategoryId, CategoryController.getInstructors);

// Protected: only instructors can manage categories
router.post('/', authenticate, authorize(['instructor']), validateCategory, CategoryController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateCategoryId, validateCategory, CategoryController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateCategoryId, CategoryController.remove);

module.exports = router;
