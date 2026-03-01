const CourseService = require('../services/CourseService');
const CourseDTO = require('../domain/dto/CourseDTO');

class CourseController {
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
