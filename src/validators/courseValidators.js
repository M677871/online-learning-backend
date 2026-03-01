const { body, param, validationResult } = require('express-validator');

const validateCourse = [
    body('instructorId')
        .isInt()
        .withMessage('instructorId must be integer')
        .notEmpty()
        .withMessage('instructorId is required'),
    body('categorieId')
        .isInt()
        .withMessage('categorieId must be integer')
        .notEmpty()
        .withMessage('categorieId is required'),
    body('courseName')
        .isString()
        .withMessage('courseName must be string')
        .notEmpty()
        .withMessage('courseName is required'),
    body('description')
        .isString()
        .withMessage('description must be string')
        .notEmpty()
        .withMessage('description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCourseId = [
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
    validateCourse,
    validateCourseId,
};
