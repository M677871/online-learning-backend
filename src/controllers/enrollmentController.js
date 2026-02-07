const enrollmentService = require('../services/enrollmentService');
const asyncHandler = require('../utils/asyncHandler');

class EnrollmentController {
  static getAll = asyncHandler(async (req, res) => {
    const enrollments = await enrollmentService.getAllEnrollments();
    res.json({ success: true, data: enrollments });
  });

  static getById = asyncHandler(async (req, res) => {
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id);
    res.json({ success: true, data: enrollment });
  });

  static create = asyncHandler(async (req, res) => {
    const { studentId, courseId, status } = req.body;
    const enrollment = await enrollmentService.createEnrollment({ studentId, courseId, status });
    res.status(201).json({ success: true, data: enrollment, message: 'Enrollment created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { studentId, courseId, status } = req.body;
    const enrollment = await enrollmentService.updateEnrollment(req.params.id, { studentId, courseId, status });
    res.json({ success: true, data: enrollment, message: 'Enrollment updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await enrollmentService.deleteEnrollment(req.params.id);
    res.json({ success: true, message: 'Enrollment deleted successfully' });
  });
}

module.exports = EnrollmentController;
