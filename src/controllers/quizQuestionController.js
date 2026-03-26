const QuizQuestionService = require('../services/QuizQuestionService');
const QuizQuestionDTO = require('../domain/dto/QuizQuestionDTO');

const QuizQuestionService = require('../services/QuizQuestionService');
const QuizQuestionDTO = require('../domain/dto/QuizQuestionDTO');

/**
 * Controller class managing HTTP requests for quiz questions.
 */
class QuizQuestionController {
    /**
     * Retrieves all quiz questions.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response with an array of questions.
     */
    static async getAll(req, res) {
        try {
            const questions = await QuizQuestionService.getAllQuizQuestions();
            const result = questions.map(q => QuizQuestionDTO.fromEntity(q));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in QuizQuestionController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a single quiz question by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response containing the quiz question.
     */
    static async getById(req, res) {
        try {
            const question = await QuizQuestionService.getQuizQuestionById(req.params.id);
            res.status(200).json({ success: true, data: QuizQuestionDTO.fromEntity(question) });
        } catch (e) {
            console.error('Error in QuizQuestionController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Creates a new quiz question.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming creation.
     */
    static async create(req, res) {
        try {
            const { quizId, questionText } = req.body;
            const question = await QuizQuestionService.createQuizQuestion({ quizId, questionText });
            res.status(201).json({ success: true, data: QuizQuestionDTO.fromEntity(question), message: 'Quiz question created successfully' });
        } catch (e) {
            console.error('Error in QuizQuestionController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Updates an existing quiz question.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming the update.
     */
    static async update(req, res) {
        try {
            const { quizId, questionText } = req.body;
            const question = await QuizQuestionService.updateQuizQuestion(req.params.id, { quizId, questionText });
            res.status(200).json({ success: true, data: QuizQuestionDTO.fromEntity(question), message: 'Quiz question updated successfully' });
        } catch (e) {
            console.error('Error in QuizQuestionController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Deletes a quiz question by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming deletion.
     */
    static async remove(req, res) {
        try {
            await QuizQuestionService.deleteQuizQuestion(req.params.id);
            res.status(200).json({ success: true, message: 'Quiz question deleted successfully' });
        } catch (e) {
            console.error('Error in QuizQuestionController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = QuizQuestionController;
