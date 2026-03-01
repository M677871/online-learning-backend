const { body, param, validationResult } = require('express-validator');

const validateEnrollment = [
    body('studentId')
        .isInt()
        .withMessage('Must be integer')
        .notEmpty()
        .withMessage('studentId is required'),
    body('courseId')
        .isInt()
        .withMessage('Must be integer')
        .notEmpty()
        .withMessage('courseId is required'),
    body('status')
        .isIn(['enrolled', 'in_progress', 'completed'])
        .withMessage('Invalid status')
        .notEmpty()
        .withMessage('status is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateEnrollmentId = [
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
    validateEnrollment,
    validateEnrollmentId,
};
