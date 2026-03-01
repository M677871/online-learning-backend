const StudentService = require('../services/StudentService');
const StudentDTO = require('../domain/dto/StudentDTO');

class StudentController {
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
