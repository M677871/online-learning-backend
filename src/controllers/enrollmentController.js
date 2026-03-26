const EnrollmentService = require('../services/EnrollmentService');
const EnrollmentDTO = require('../domain/dto/EnrollmentDTO');

const EnrollmentService = require('../services/EnrollmentService');
const EnrollmentDTO = require('../domain/dto/EnrollmentDTO');

/**
 * Controller class to handle student enrollment HTTP requests.
 */
class EnrollmentController {
    /**
     * Retrieves all enrollments.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with array of enrollments.
     */
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

    /**
     * Retrieves a single enrollment by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the enrollment data.
     */
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

    /**
     * Creates a new course enrollment for a student.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming creation.
     */
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

    /**
     * Updates an existing enrollment status.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with updated data.
     */
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

    /**
     * Removes an enrollment record.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming removal.
     */
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
