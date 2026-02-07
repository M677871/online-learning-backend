const instructorService = require('../services/instructorService');
const asyncHandler = require('../utils/asyncHandler');

class InstructorController {
  static getAll = asyncHandler(async (req, res) => {
    const instructors = await instructorService.getAllInstructors();
    res.json({ success: true, data: instructors });
  });

  static getById = asyncHandler(async (req, res) => {
    const instructor = await instructorService.getInstructorById(req.params.id);
    res.json({ success: true, data: instructor });
  });

  static create = asyncHandler(async (req, res) => {
    const { userId, insFName, insLName, bio, profilePicture } = req.body;
    const instructor = await instructorService.createInstructor({ userId, insFName, insLName, bio, profilePicture });
    res.status(201).json({ success: true, data: instructor, message: 'Instructor created successfully' });
  });

  static update = asyncHandler(async (req, res) => {
    const { userId, insFName, insLName, bio, profilePicture } = req.body;
    const instructor = await instructorService.updateInstructor(req.params.id, { userId, insFName, insLName, bio, profilePicture });
    res.json({ success: true, data: instructor, message: 'Instructor updated successfully' });
  });

  static remove = asyncHandler(async (req, res) => {
    await instructorService.deleteInstructor(req.params.id);
    res.json({ success: true, message: 'Instructor deleted successfully' });
  });

  static getCourses = asyncHandler(async (req, res) => {
    const courses = await instructorService.getInstructorCourses(req.params.id);
    res.json({ success: true, data: courses });
  });
}

module.exports = InstructorController;
