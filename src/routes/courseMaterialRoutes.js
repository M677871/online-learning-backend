const express = require('express');
const router = express.Router();
const CourseMaterialController = require('../controllers/courseMaterialController');
const authenticate = require('../middleware/auth/authenticate');
const authorize = require('../middleware/auth/authorize');
const { validateMaterial, validateMaterialId } = require('../validators/material.dto');

// Public: anyone can browse materials
router.get('/', CourseMaterialController.getAll);
router.get('/:id', validateMaterialId, CourseMaterialController.getById);

// Protected: only instructors can manage materials
router.post('/', authenticate, authorize(['instructor']), validateMaterial, CourseMaterialController.create);
router.put('/:id', authenticate, authorize(['instructor']), validateMaterialId, validateMaterial, CourseMaterialController.update);
router.delete('/:id', authenticate, authorize(['instructor']), validateMaterialId, CourseMaterialController.remove);

module.exports = router;
