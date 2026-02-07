const {body , param, validationResult} = require('express-validator');

const validateResult = [
    body('quizId')
        .isInt()
        .withMessage('Quiz Id must be integer')
        .notEmpty()
        .withMessage('Quiz Id is required'),
    body('studentId')
        .isInt()
        .withMessage('Student Id must be integer')
        .notEmpty()
        .withMessage('Student Id is required'),
    body('score')
        .isInt()
        .withMessage('Score must be integer')
        .notEmpty()
        .withMessage('Score is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]
const validateResultId = [
    param('id')
        .isInt()
        .withMessage('ID must be integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next();
    }
]
module.exports = {
    validateResult,
    validateResultId
}
