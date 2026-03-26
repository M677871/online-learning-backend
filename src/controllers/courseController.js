const CourseService = require('../services/CourseService');
const CourseDTO = require('../domain/dto/CourseDTO');

/**
 * Controller class to handle course-related HTTP requests.
 */
class CourseController {
    /**
     * Retrieves all courses.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the array of courses.
     */
    static async getAll(req, res) {
        try {
            const courses = await CourseService.getAllCourses();
            const result = courses.map(c => CourseDTO.fromEntity(c));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in CourseController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a single course by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the course data.
     */
    static async getById(req, res) {
        try {
            const course = await CourseService.getCourseById(req.params.id);
            res.status(200).json({ success: true, data: CourseDTO.fromEntity(course) });
        } catch (e) {
            console.error('Error in CourseController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Creates a new course.
     * @param {import('express').Request} req - The Express request object containing course details in body.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the created course data.
     */
    static async create(req, res) {
        try {
            const { instructorId, categorieId, courseName, description } = req.body;
            const course = await CourseService.createCourse({ instructorId, categorieId, courseName, description });
            res.status(201).json({ success: true, data: CourseDTO.fromEntity(course), message: 'Course created successfully' });
        } catch (e) {
            console.error('Error in CourseController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Updates an existing course.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response with the updated course data.
     */
    static async update(req, res) {
        try {
            const { instructorId, categorieId, courseName, description } = req.body;
            const course = await CourseService.updateCourse(req.params.id, { instructorId, categorieId, courseName, description });
            res.status(200).json({ success: true, data: CourseDTO.fromEntity(course), message: 'Course updated successfully' });
        } catch (e) {
            console.error('Error in CourseController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Deletes a course by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response confirming deletion.
     */
    static async remove(req, res) {
        try {
            await CourseService.deleteCourse(req.params.id);
            res.status(200).json({ success: true, message: 'Course deleted successfully' });
        } catch (e) {
            console.error('Error in CourseController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves the instructor associated with a specific course.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing the instructor data.
     */
    static async getInstructorByCourseId(req, res) {
        try {
            const instructor = await CourseService.getInstructorByCourseId(req.params.id);
            res.status(200).json({ success: true, data: instructor });
        } catch (e) {
            console.error('Error in CourseController.getInstructorByCourseId', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a list of students enrolled in a specific course.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends JSON response containing an array of student data.
     */
    static async getStudentsOfCourse(req, res) {
        try {
            const students = await CourseService.getStudentsOfCourse(req.params.id);
            res.status(200).json({ success: true, data: students });
        } catch (e) {
            console.error('Error in CourseController.getStudentsOfCourse', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = CourseController;
