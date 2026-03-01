const CategoryService = require('../services/CategoryService');
const CategoryDTO = require('../domain/dto/CategoryDTO');

class CategoryController {
    static async getAll(req, res) {
        try {
            const categories = await CategoryService.getAllCategories();
            const result = categories.map(c => CategoryDTO.fromEntity(c));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in CategoryController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            res.status(200).json({ success: true, data: CategoryDTO.fromEntity(category) });
        } catch (e) {
            console.error('Error in CategoryController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { categoryName, description } = req.body;
            const category = await CategoryService.createCategory({ categoryName, description });
            res.status(201).json({ success: true, data: CategoryDTO.fromEntity(category), message: 'Category created successfully' });
        } catch (e) {
            console.error('Error in CategoryController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { categoryName, description } = req.body;
            const category = await CategoryService.updateCategory(req.params.id, { categoryName, description });
            res.status(200).json({ success: true, data: CategoryDTO.fromEntity(category), message: 'Category updated successfully' });
        } catch (e) {
            console.error('Error in CategoryController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await CategoryService.deleteCategory(req.params.id);
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        } catch (e) {
            console.error('Error in CategoryController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async getCourses(req, res) {
        try {
            const courses = await CategoryService.getCategoryCourses(req.params.id);
            res.status(200).json({ success: true, data: courses });
        } catch (e) {
            console.error('Error in CategoryController.getCourses', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async getInstructors(req, res) {
        try {
            const instructors = await CategoryService.getCategoryInstructors(req.params.id);
            res.status(200).json({ success: true, data: instructors });
        } catch (e) {
            console.error('Error in CategoryController.getInstructors', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = CategoryController;
