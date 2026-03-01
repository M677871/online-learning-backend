const EnrollmentService = require('../services/EnrollmentService');
const EnrollmentDTO = require('../domain/dto/EnrollmentDTO');

class EnrollmentController {
    static async getAll(req, res) {
        try {
            const enrollments = await EnrollmentService.getAllEnrollments();
            const result = enrollments.map(e => EnrollmentDTO.fromEntity(e));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in EnrollmentController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const enrollment = await EnrollmentService.getEnrollmentById(req.params.id);
            res.status(200).json({ success: true, data: EnrollmentDTO.fromEntity(enrollment) });
        } catch (e) {
            console.error('Error in EnrollmentController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { studentId, courseId, status } = req.body;
            const enrollment = await EnrollmentService.createEnrollment({ studentId, courseId, status });
            res.status(201).json({ success: true, data: EnrollmentDTO.fromEntity(enrollment), message: 'Enrollment created successfully' });
        } catch (e) {
            console.error('Error in EnrollmentController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { studentId, courseId, status } = req.body;
            const enrollment = await EnrollmentService.updateEnrollment(req.params.id, { studentId, courseId, status });
            res.status(200).json({ success: true, data: EnrollmentDTO.fromEntity(enrollment), message: 'Enrollment updated successfully' });
        } catch (e) {
            console.error('Error in EnrollmentController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await EnrollmentService.deleteEnrollment(req.params.id);
            res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
        } catch (e) {
            console.error('Error in EnrollmentController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = EnrollmentController;
