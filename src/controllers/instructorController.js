const InstructorService = require('../services/InstructorService');
const InstructorDTO = require('../domain/dto/InstructorDTO');

class InstructorController {
    static async getAll(req, res) {
        try {
            const instructors = await InstructorService.getAllInstructors();
            const result = instructors.map(i => InstructorDTO.fromEntity(i));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in InstructorController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const instructor = await InstructorService.getInstructorById(req.params.id);
            res.status(200).json({ success: true, data: InstructorDTO.fromEntity(instructor) });
        } catch (e) {
            console.error('Error in InstructorController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { userId, insFName, insLName, bio, profilePicture } = req.body;
            const instructor = await InstructorService.createInstructor({ userId, insFName, insLName, bio, profilePicture });
            res.status(201).json({ success: true, data: InstructorDTO.fromEntity(instructor), message: 'Instructor created successfully' });
        } catch (e) {
            console.error('Error in InstructorController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { userId, insFName, insLName, bio, profilePicture } = req.body;
            const instructor = await InstructorService.updateInstructor(req.params.id, { userId, insFName, insLName, bio, profilePicture });
            res.status(200).json({ success: true, data: InstructorDTO.fromEntity(instructor), message: 'Instructor updated successfully' });
        } catch (e) {
            console.error('Error in InstructorController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await InstructorService.deleteInstructor(req.params.id);
            res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
        } catch (e) {
            console.error('Error in InstructorController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async getCourses(req, res) {
        try {
            const courses = await InstructorService.getInstructorCourses(req.params.id);
            res.status(200).json({ success: true, data: courses });
        } catch (e) {
            console.error('Error in InstructorController.getCourses', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = InstructorController;
