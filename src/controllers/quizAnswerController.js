const QuizAnswerService = require('../services/QuizAnswerService');
const QuizAnswerDTO = require('../domain/dto/QuizAnswerDTO');

class QuizAnswerController {
    static async getAll(req, res) {
        try {
            const answers = await QuizAnswerService.getAllQuizAnswers();
            const result = answers.map(a => QuizAnswerDTO.fromEntity(a));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in QuizAnswerController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    static async getById(req, res) {
        try {
            const answer = await QuizAnswerService.getQuizAnswerById(req.params.id);
            res.status(200).json({ success: true, data: QuizAnswerDTO.fromEntity(answer) });
        } catch (e) {
            console.error('Error in QuizAnswerController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async create(req, res) {
        try {
            const { questionId, answerText, answerType, isCorrect } = req.body;
            const answer = await QuizAnswerService.createQuizAnswer({ questionId, answerText, answerType, isCorrect });
            res.status(201).json({ success: true, data: QuizAnswerDTO.fromEntity(answer), message: 'Quiz answer created successfully' });
        } catch (e) {
            console.error('Error in QuizAnswerController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async update(req, res) {
        try {
            const { questionId, answerText, answerType, isCorrect } = req.body;
            const answer = await QuizAnswerService.updateQuizAnswer(req.params.id, { questionId, answerText, answerType, isCorrect });
            res.status(200).json({ success: true, data: QuizAnswerDTO.fromEntity(answer), message: 'Quiz answer updated successfully' });
        } catch (e) {
            console.error('Error in QuizAnswerController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    static async remove(req, res) {
        try {
            await QuizAnswerService.deleteQuizAnswer(req.params.id);
            res.status(200).json({ success: true, message: 'Quiz answer deleted successfully' });
        } catch (e) {
            console.error('Error in QuizAnswerController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = QuizAnswerController;
