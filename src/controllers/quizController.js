const QuizService = require('../services/QuizService');
const QuizDTO = require('../domain/dto/QuizDTO');

const QuizService = require('../services/QuizService');
const QuizDTO = require('../domain/dto/QuizDTO');

/**
 * Controller class to handle quiz entities and operations via HTTP.
 */
class QuizController {
    /**
     * Retrieves all available quizzes.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response with an array of quizzes.
     */
    static async getAll(req, res) {
        try {
            const quizzes = await QuizService.getAllQuizzes();
            const result = quizzes.map(q => QuizDTO.fromEntity(q));
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.error('Error in QuizController.getAll', e.message);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    /**
     * Retrieves a single quiz by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response containing the quiz object.
     */
    static async getById(req, res) {
        try {
            const quiz = await QuizService.getQuizById(req.params.id);
            res.status(200).json({ success: true, data: QuizDTO.fromEntity(quiz) });
        } catch (e) {
            console.error('Error in QuizController.getById', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Creates a new quiz.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming creation.
     */
    static async create(req, res) {
        try {
            const { courseId, quizName, quizDescription } = req.body;
            const quiz = await QuizService.createQuiz({ courseId, quizName, quizDescription });
            res.status(201).json({ success: true, data: QuizDTO.fromEntity(quiz), message: 'Quiz created successfully' });
        } catch (e) {
            console.error('Error in QuizController.create', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Updates an existing quiz.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming the update.
     */
    static async update(req, res) {
        try {
            const { courseId, quizName, quizDescription } = req.body;
            const quiz = await QuizService.updateQuiz(req.params.id, { courseId, quizName, quizDescription });
            res.status(200).json({ success: true, data: QuizDTO.fromEntity(quiz), message: 'Quiz updated successfully' });
        } catch (e) {
            console.error('Error in QuizController.update', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }

    /**
     * Deletes a quiz by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} Sends a JSON response confirming deletion.
     */
    static async remove(req, res) {
        try {
            await QuizService.deleteQuiz(req.params.id);
            res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
        } catch (e) {
            console.error('Error in QuizController.remove', e.message);
            const status = e.statusCode || 500;
            res.status(status).json({ success: false, message: e.message });
        }
    }
}

module.exports = QuizController;
