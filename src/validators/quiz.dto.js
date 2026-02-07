const {body , param ,validationResult} = require("express-validator");

const validateQuiz = [
    body('courseId')
        .isInt()
        .withMessage('Course ID must be integer')
        .notEmpty()
        .withMessage('Course ID is required'),
    body('quizName')
        .isString()
        .withMessage('Quiz name must be string')
        .notEmpty()
        .withMessage('Quiz name is required'),
    body('quizDescription')
        .isString()
        .withMessage('Quiz description must be string')
        .notEmpty()
        .withMessage('Quiz description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
]
const validateQuizId = [
    param('id')
        .isInt()
        .withMessage('ID must be integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
]
module.exports = {
    validateQuiz,
    validateQuizId,
}
