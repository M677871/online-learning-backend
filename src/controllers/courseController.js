const courseService = require('../services/courseService');
const asyncHandler = require('../utils/asyncHandler');

class CourseController {
  static getAll = asyncHandler(async (req, res) => {
    const courses = await courseService.getAllCourses();
    res.json({ success: true, data: courses });
  });

  static getById = asyncHandler(async (req, res) => {
    const course = await courseService.getCourseById(req.params.id);
    res.json({ success: true, data: course });
  });

  static create = asyncHandler(async (req, res) => {
    const { instructorId, categorieId, courseName, description } = req.body;
    const course = await courseService.createCourse({ instructorId, categorieId, courseName, description });
    res.status(201).json({ success: true, data: course, message: 'Course created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { instructorId, categorieId, courseName, description } = req.body;
    const course = await courseService.updateCourse(req.params.id, { instructorId, categorieId, courseName, description });
    res.json({ success: true, data: course, message: 'Course updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await courseService.deleteCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  });

  static getInstructorByCourseId = asyncHandler(async (req, res) => {
    const instructor = await courseService.getInstructorByCourseId(req.params.id);
    res.json({ success: true, data: instructor });
  });

  static getStudentsOfCourse = asyncHandler(async (req, res) => {
    const students = await courseService.getStudentsOfCourse(req.params.id);
    res.json({ success: true, data: students });
  });
}

module.exports = CourseController;
