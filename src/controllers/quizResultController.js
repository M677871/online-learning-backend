const QuizResultService = require('../services/QuizResultService');
const QuizResultDTO = require('../domain/dto/QuizResultDTO');

const QuizResultService = require('../services/QuizResultService');
const QuizResultDTO = require('../domain/dto/QuizResultDTO');

/**
 * Controller class handling HTTP requests for quiz results.
 */
class QuizResultController {
    /**
     * Retrieves all quiz results.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response with an array of results.
     */
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

    /**
     * Retrieves a single quiz result by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response containing the quiz result.
     */
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

    /**
     * Creates a new quiz result record.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response with the created result.
     */
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

    /**
     * Updates an existing quiz result.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming the update.
     */
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

    /**
     * Deletes a quiz result by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming deletion.
     */
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
