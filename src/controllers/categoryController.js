const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');
const categorySerializer = require('../serializers/categorySerializer');

class CategoryController {
  static getAll = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categorySerializer.serializeList(categories) });
  });

  static getById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data: categorySerializer.serialize(category) });
  });

  static create = asyncHandler(async (req, res) => {
    const { categoryName, description } = req.body;
    const category = await categoryService.createCategory({ categoryName, description });
    res.status(201).json({ success: true, data: categorySerializer.serialize(category), message: 'Category created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { categoryName, description } = req.body;
    const category = await categoryService.updateCategory(req.params.id, { categoryName, description });
    res.json({ success: true, data: categorySerializer.serialize(category), message: 'Category updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  });

  static getCourses = asyncHandler(async (req, res) => {
    const courses = await categoryService.getCategoryCourses(req.params.id);
    res.json({ success: true, data: courses });
  });

  static getInstructors = asyncHandler(async (req, res) => {
    const instructors = await categoryService.getCategoryInstructors(req.params.id);
    res.json({ success: true, data: instructors });
  });
}

module.exports = CategoryController;
