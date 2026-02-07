const studentService = require('../services/studentService');
const asyncHandler = require('../utils/asyncHandler');

class StudentController {
  static getAll = asyncHandler(async (req, res) => {
    const students = await studentService.getAllStudents();
    res.json({ success: true, data: students });
  });

  static getById = asyncHandler(async (req, res) => {
    const student = await studentService.getStudentById(req.params.id);
    res.json({ success: true, data: student });
  });

  static create = asyncHandler(async (req, res) => {
    const { userId, stuFName, stuLName, dob, profilePicture } = req.body;
    const student = await studentService.createStudent({ userId, stuFName, stuLName, dob, profilePicture });
    res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { userId, stuFName, stuLName, dob, profilePicture } = req.body;
    const student = await studentService.updateStudent(req.params.id, { userId, stuFName, stuLName, dob, profilePicture });
    res.json({ success: true, data: student, message: 'Student updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await studentService.deleteStudent(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  });

  static getCourses = asyncHandler(async (req, res) => {
    const courses = await studentService.getStudentCourses(req.params.id);
    res.json({ success: true, data: courses });
  });
}

module.exports = StudentController;
