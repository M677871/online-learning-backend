const QuizResultService = require('../services/QuizResultService');
const QuizResultDTO = require('../domain/dto/QuizResultDTO');

class QuizResultController {
    static async getAll(req, res) {
        try {
            const results = await QuizResultService.getAllQuizResults();
            const data = results.map(r => QuizResultDTO.fromEntity(r));
            res.status(200).json({ success: true, data });
        } catch (e) {
            console.error('Error in QuizResultController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const result = await QuizResultService.getQuizResultById(req.params.id);
            res.status(200).json({ success: true, data: QuizResultDTO.fromEntity(result) });
        } catch (e) {
            console.error('Error in QuizResultController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { quizId, studentId, score } = req.body;
            const result = await QuizResultService.createQuizResult({ quizId, studentId, score });
            res.status(201).json({ success: true, data: QuizResultDTO.fromEntity(result), message: 'Quiz result created successfully' });
        } catch (e) {
            console.error('Error in QuizResultController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { quizId, studentId, score } = req.body;
            const result = await QuizResultService.updateQuizResult(req.params.id, { quizId, studentId, score });
            res.status(200).json({ success: true, data: QuizResultDTO.fromEntity(result), message: 'Quiz result updated successfully' });
        } catch (e) {
            console.error('Error in QuizResultController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await QuizResultService.deleteQuizResult(req.params.id);
            res.status(200).json({ success: true, message: 'Quiz result deleted successfully' });
        } catch (e) {
            console.error('Error in QuizResultController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = QuizResultController;
