const CourseMaterialService = require('../services/CourseMaterialService');
const CourseMaterialDTO = require('../domain/dto/CourseMaterialDTO');

class CourseMaterialController {
    static async getAll(req, res) {
        try {
            const materials = await CourseMaterialService.getAllCourseMaterials();
            const result = materials.map(m => CourseMaterialDTO.fromEntity(m));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in CourseMaterialController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const material = await CourseMaterialService.getCourseMaterialById(req.params.id);
            res.status(200).json({ success: true, data: CourseMaterialDTO.fromEntity(material) });
        } catch (e) {
            console.error('Error in CourseMaterialController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { courseId, title, materialType, filePath } = req.body;
            const material = await CourseMaterialService.createCourseMaterial({ courseId, title, materialType, filePath });
            res.status(201).json({ success: true, data: CourseMaterialDTO.fromEntity(material), message: 'Course material created successfully' });
        } catch (e) {
            console.error('Error in CourseMaterialController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { courseId, title, materialType, filePath } = req.body;
            const material = await CourseMaterialService.updateCourseMaterial(req.params.id, { courseId, title, materialType, filePath });
            res.status(200).json({ success: true, data: CourseMaterialDTO.fromEntity(material), message: 'Course material updated successfully' });
        } catch (e) {
            console.error('Error in CourseMaterialController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await CourseMaterialService.deleteCourseMaterial(req.params.id);
            res.status(200).json({ success: true, message: 'Course material deleted successfully' });
        } catch (e) {
            console.error('Error in CourseMaterialController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = CourseMaterialController;
