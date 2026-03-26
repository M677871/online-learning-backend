const StudentService = require('../services/StudentService');
const StudentDTO = require('../domain/dto/StudentDTO');

const StudentService = require('../services/StudentService');
const StudentDTO = require('../domain/dto/StudentDTO');

/**
 * Controller class to handle student profiling HTTP requests.
 */
class StudentController {
    /**
     * Retrieves all student profiles.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the array of students.
     */
    static async getAll(req, res) {
        try {
            const students = await StudentService.getAllStudents();
            const result = students.map(s => StudentDTO.fromEntity(s));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in StudentController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a single student profile by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the student data.
     */
    static async getById(req, res) {
        try {
            const student = await StudentService.getStudentById(req.params.id);
            res.status(200).json({ success: true, data: StudentDTO.fromEntity(student) });
        } catch (e) {
            console.error('Error in StudentController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Creates a new student profile.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the created student data.
     */
    static async create(req, res) {
        try {
            const { userId, stuFName, stuLName, dob, profilePicture } = req.body;
            const student = await StudentService.createStudent({ userId, stuFName, stuLName, dob, profilePicture });
            res.status(201).json({ success: true, data: StudentDTO.fromEntity(student), message: 'Student created successfully' });
        } catch (e) {
            console.error('Error in StudentController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Updates an existing student profile.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the updated student data.
     */
    static async update(req, res) {
        try {
            const { userId, stuFName, stuLName, dob, profilePicture } = req.body;
            const student = await StudentService.updateStudent(req.params.id, { userId, stuFName, stuLName, dob, profilePicture });
            res.status(200).json({ success: true, data: StudentDTO.fromEntity(student), message: 'Student updated successfully' });
        } catch (e) {
            console.error('Error in StudentController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Deletes a student profile by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming deletion.
     */
    static async remove(req, res) {
        try {
            await StudentService.deleteStudent(req.params.id);
            res.status(200).json({ success: true, message: 'Student deleted successfully' });
        } catch (e) {
            console.error('Error in StudentController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a list of courses a student is enrolled in.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the enriched course list.
     */
    static async getCourses(req, res) {
        try {
            const courses = await StudentService.getStudentCourses(req.params.id);
            res.status(200).json({ success: true, data: courses });
        } catch (e) {
            console.error('Error in StudentController.getCourses', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = StudentController;
