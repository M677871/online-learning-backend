const { body, param, validationResult } = require('express-validator');

const allowedAnswerTypes = ['MCQ', 'short answer', 'true or false']; 

const validateAnswer = [
    body('questionId')
        .isInt()
        .withMessage('Question ID must be an integer')
        .notEmpty()
        .withMessage('Question ID is required'),

    body('answerText')
        .isString()
        .withMessage('Answer text must be a string')
        .notEmpty()
        .withMessage('Answer text is required'),

    body('answerType')
        .isString()
        .withMessage('Answer type must be a string')
        .notEmpty()
        .withMessage('Answer type is required')
        .isIn(allowedAnswerTypes)
        .withMessage(`Answer type must be one of the following: ${allowedAnswerTypes.join(', ')}`),

    body('isCorrect')
        .isBoolean()
        .withMessage('isCorrect must be a boolean')
        .notEmpty()
        .withMessage('isCorrect is required'),

  
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateAnswerId = [
    param('id')
        .isInt()
        .withMessage('ID must be an integer'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateAnswer,
    validateAnswerId,
};
