const { param, body, validationResult } = require('express-validator');

const validateQuestion = [
    body('quizId')
        .isInt()
        .withMessage('Must be integer')
        .notEmpty()
        .withMessage('quizId is required'),
    body('questionText')
        .notEmpty()
        .withMessage('questionText is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateQuestionId = [
    param('id').isInt().withMessage('ID must be integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateQuestion,
    validateQuestionId,
};
