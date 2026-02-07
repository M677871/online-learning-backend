const courseMaterialService = require('../services/courseMaterialService');
const asyncHandler = require('../utils/asyncHandler');

class CourseMaterialController {
  static getAll = asyncHandler(async (req, res) => {
    const materials = await courseMaterialService.getAllCourseMaterials();
    res.json({ success: true, data: materials });
  });

  static getById = asyncHandler(async (req, res) => {
    const material = await courseMaterialService.getCourseMaterialById(req.params.id);
    res.json({ success: true, data: material });
  });

  static create = asyncHandler(async (req, res) => {
    const { courseId, title, materialType, filePath } = req.body;
    const material = await courseMaterialService.createCourseMaterial({ courseId, title, materialType, filePath });
    res.status(201).json({ success: true, data: material, message: 'Course material created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { courseId, title, materialType, filePath } = req.body;
    const material = await courseMaterialService.updateCourseMaterial(req.params.id, { courseId, title, materialType, filePath });
    res.json({ success: true, data: material, message: 'Course material updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await courseMaterialService.deleteCourseMaterial(req.params.id);
    res.json({ success: true, message: 'Course material deleted successfully' });
  });
}

module.exports = CourseMaterialController;
