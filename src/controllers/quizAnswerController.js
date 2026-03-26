const QuizAnswerService = require('../services/QuizAnswerService');
const QuizAnswerDTO = require('../domain/dto/QuizAnswerDTO');

const QuizAnswerService = require('../services/QuizAnswerService');
const QuizAnswerDTO = require('../domain/dto/QuizAnswerDTO');

/**
 * Controller class managing HTTP requests for quiz answers.
 */
class QuizAnswerController {
    /**
     * Retrieves all quiz answers.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response with an array of answers.
     */
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

    /**
     * Retrieves a single quiz answer by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response containing the quiz answer.
     */
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

    /**
     * Creates a new quiz answer.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming creation.
     */
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

    /**
     * Updates an existing quiz answer.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming the update.
     */
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

    /**
     * Deletes a quiz answer by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming deletion.
     */
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
